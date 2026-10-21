/**
 * POST /api/chat — camarero virtual.
 *
 * Cuerpo: { messages: [{ role: "user" | "assistant", content }], locale?: "es"|"gl"|"en"|"pt", page?: "home"|"carta"|"legal" }
 * Respuesta: `text/plain; charset=utf-8` en streaming (deltas de texto del modelo) con la cabecera
 * `x-waiter-mode`:
 *   - `claude`   → respuesta del modelo (SDK oficial, prompt de sistema cacheado).
 *   - `offline`  → no hay ANTHROPIC_API_KEY: responde el motor determinista (offlineEngine).
 *   - `fallback` → el modelo ha fallado (429, 5xx, red…): responde el motor determinista.
 * Petición que no viene de la propia web → 403; cuerpo enorme → 413; errores de validación → 400 JSON; cuota por IP superada (30 peticiones / 10 min) → 429 JSON.
 */
import Anthropic from "@anthropic-ai/sdk";
import { isLocale, type Locale } from "@/i18n/config";
import { answerOffline } from "@/lib/waiter/offlineEngine";
import { SITE_URL } from "@/lib/siteUrl";
import { buildContextSuffix, getSystemPrompt, supportsEffort, WAITER_DEFAULT_MODEL } from "@/lib/waiter/systemPrompt";
import { CHAT_LIMITS, isWaiterPage, WAITER_MODE_HEADER, type ChatRole, type WaiterMode, type WaiterPage } from "@/lib/waiter/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ────────────────────────────────────────────────────────────
   Cuota por IP, en la memoria de CADA instancia

   LO QUE ESTO ES Y LO QUE NO ES. Vercel no corre un proceso, corre los que haga falta: cada
   instancia que arranca en frío empieza con el mapa vacío, así que un chorro de peticiones en
   paralelo se reparte entre instancias nuevas y ninguna llega a su cuenta de 30. Esto frena a quien
   insiste desde un navegador; NO pone techo a la factura. El techo de la factura son tres cosas, y
   dos no están en este fichero: el presupuesto global por instancia de más abajo (que degrada al
   camarero sin conexión en vez de seguir gastando), una regla de límite de tasa en el cortafuegos
   de Vercel —la única que vive delante de todas las instancias— y el tope de gasto de la consola de
   Anthropic con la recarga automática apagada.
   ──────────────────────────────────────────────────────────── */
interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();
const MAX_TRACKED_IPS = 5000;
/* Cada cuánto se barren las IP caducadas, como mucho. Ver `takeToken`. */
const BARRIDO_MS = 60_000;
let ultimoBarrido = 0;

/* ────────────────────────────────────────────────────────────
   Presupuesto global de la instancia

   La cuota de arriba es por IP: cien direcciones distintas la esquivan sin romper ninguna regla, y
   cada pregunta al modelo cuesta dinero de verdad. Esto es el freno de mano: pasado el tope, la
   instancia deja de llamar a Anthropic y contesta con el motor sin conexión, que sabe la carta, el
   horario y los alérgenos. Nadie ve un error —el chat sigue respondiendo, algo más seco— y el gasto
   de esa instancia se queda donde está.

   EL NÚMERO. 300 preguntas cada diez minutos es, para una tapería, un disparate: son 30 personas
   por minuto preguntando a la vez, sin parar, durante diez minutos. Un día bueno de verdad no se
   acerca. Si algún día la web se hace famosa y esto empieza a saltar, se sube el número — pero que
   salte es la señal, que es justo lo que hoy no existe.
   ──────────────────────────────────────────────────────────── */
const TOPE_GLOBAL = 300;
const TOPE_GLOBAL_VENTANA_MS = 10 * 60 * 1000;
let gastoGlobal = 0;
let gastoGlobalResetAt = 0;

/** `true` si a esta instancia todavía le queda presupuesto para llamar al modelo. */
function hayPresupuesto(now = Date.now()): boolean {
  if (now >= gastoGlobalResetAt) {
    gastoGlobal = 0;
    gastoGlobalResetAt = now + TOPE_GLOBAL_VENTANA_MS;
  }
  if (gastoGlobal >= TOPE_GLOBAL) return false;
  gastoGlobal++;
  return true;
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    /* EL ÚLTIMO TROZO, NO EL PRIMERO. `x-forwarded-for` es una lista que crece por la derecha: lo
       que trae la petición va delante y lo que añade el proxy de confianza va detrás. Quedarse con
       el primero es quedarse justo con el único trozo que puede inventar quien llama — rotándolo se
       reinicia la cuota a voluntad, y poniendo la IP de otro se le agota la suya. En Vercel hoy no
       es alcanzable (la plataforma reescribe la cabecera entera «to prevent IP spoofing», su
       documentación, así que el primero y el último son el mismo), pero el día que esto corra
       detrás de otra cosa, el último sigue siendo el que no se puede falsificar. */
    const trozos = forwarded
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (trozos.length) return trozos[trozos.length - 1];
  }
  return req.headers.get("x-real-ip") ?? req.headers.get("cf-connecting-ip") ?? "unknown";
}

/**
 * Consume una petición de la cuota; devuelve los segundos de espera si se ha superado.
 *
 * EL BARRIDO ES LO QUE HACE VERDAD LO QUE DICE LA POLÍTICA. La dirección IP es un dato personal
 * (considerando 30 del RGPD y la sentencia Breyer del TJUE, C-582/14), y la política de privacidad
 * promete que solo se cuenta "durante diez minutos". Antes, la limpieza estaba condicionada a que
 * el mapa pasara de 5.000 entradas: por debajo de esa cifra —es decir, siempre, en una web de un
 * bar— una IP que entraba una vez se quedaba ahí mientras viviera el proceso. Ahora se barre cada
 * minuto como mucho, y la entrada caducada se borra antes de crear la nueva, así que el plazo
 * declarado y el real coinciden (art. 5.1.c y 5.1.e RGPD).
 */
function takeToken(ip: string, now = Date.now()): { ok: true } | { ok: false; retryAfter: number } {
  if (now - ultimoBarrido > BARRIDO_MS || buckets.size > MAX_TRACKED_IPS) {
    ultimoBarrido = now;
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    /* Si había una entrada caducada, fuera del mapa antes de poner la nueva: así la IP no "revive"
       arrastrando el registro anterior. */
    buckets.delete(ip);
    buckets.set(ip, { count: 1, resetAt: now + CHAT_LIMITS.rateWindowMs });
    return { ok: true };
  }
  if (bucket.count >= CHAT_LIMITS.rateLimit) return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  bucket.count++;
  return { ok: true };
}

/* ────────────────────────────────────────────────────────────
   Filtro anti-bots: solo la propia web, y con un cuerpo de tamaño razonable
   ──────────────────────────────────────────────────────────── */

/** Tope del cuerpo en bytes: 20 mensajes × 1000 caracteres caben de sobra (hasta 4 bytes por letra). */
const MAX_BODY_BYTES = 96 * 1024;

/**
 * Cada pregunta al camarero cuesta dinero (la API de Anthropic se paga por uso). Un navegador SIEMPRE
 * manda `Origin` en un `fetch` POST, así que una petición sin él, o desde otra web, no viene del chat:
 * es un script o una página ajena intentando gastar la clave. Se rechaza antes de leer nada.
 * No es infalible (un script puede falsificar la cabecera), pero quita de en medio a los bots
 * genéricos y a cualquier web que quiera usar nuestro camarero como API gratis; la cuota por IP de
 * arriba y el tope de gasto de la cuenta de Anthropic cubren el resto.
 */
const HOSTS_DE_LA_CASA = new Set(
  [
    /* El dominio con el que la web se declara al mundo (canónicas, sitemap, OG). */
    new URL(SITE_URL).host,
    `www.${new URL(SITE_URL).host}`,
    /* Las direcciones que Vercel rellena en cada despliegue: la del despliegue concreto y la del
       alias de la rama. Sirven para poder probar el camarero en una vista previa. */
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].filter((h): h is string => Boolean(h)),
);

function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  if (HOSTS_DE_LA_CASA.has(host)) return true;
  /* NUNCA `x-forwarded-host`, que es lo que había aquí: esa cabecera la pone quien pide, así que
     comparar el `Origin` contra ella era dejar que el visitante pusiera las dos mitades de la
     comparación — bastaba mandar `origin: https://evil.com` + `x-forwarded-host: evil.com` para
     pasar el filtro sin saber siquiera cuál es el dominio de la web.

     El `Host` tampoco es de fiar por sí solo (medido: con `next start` a pelo, `Host: evil.com` +
     `origin: https://evil.com` también pasaba), así que fuera de desarrollo solo se acepta para las
     direcciones que reparte la propia plataforma: los alias `*.vercel.app` del proyecto, que es lo
     único que `HOSTS_DE_LA_CASA` no puede saber en tiempo de construcción porque los crea Vercel
     cuando le parece. Y para llegar hasta aquí con uno de esos nombres hay que usarlo de verdad: en
     Vercel el enrutado va por el `Host`, un nombre que no sea alias del proyecto ni entra. */
  if (host !== req.headers.get("host")) return false;
  if (process.env.NODE_ENV !== "production") return true; // en local: localhost, 127.0.0.1 o la IP de la red para probar en el móvil
  return /\.vercel\.app$/.test(host.replace(/:\d+$/, ""));
}

/* ────────────────────────────────────────────────────────────
   Validación del cuerpo
   ──────────────────────────────────────────────────────────── */
interface ParsedRequest {
  messages: Anthropic.MessageParam[];
  locale: Locale;
  page: WaiterPage;
}

/** Quita caracteres de control (salvo saltos de línea y tabulador), normaliza saltos y recorta. */
function sanitize(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u2028\u2029]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isRole(value: unknown): value is ChatRole {
  return value === "user" || value === "assistant";
}

function parseBody(raw: unknown): ParsedRequest | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Cuerpo JSON no válido." };
  const body = raw as Record<string, unknown>;
  if (!Array.isArray(body.messages) || body.messages.length === 0) return { error: "Faltan los mensajes." };
  if (body.messages.length > CHAT_LIMITS.maxMessages) return { error: `Máximo ${CHAT_LIMITS.maxMessages} mensajes por petición.` };

  const turnos: { role: ChatRole; content: string }[] = [];
  let bytesTotales = 0;
  for (const entry of body.messages) {
    if (!entry || typeof entry !== "object") return { error: "Mensaje no válido." };
    const { role, content } = entry as Record<string, unknown>;
    if (!isRole(role) || typeof content !== "string") return { error: "Cada mensaje necesita role (user/assistant) y content (texto)." };
    if (content.length > CHAT_LIMITS.maxChars * 2) return { error: `Cada mensaje debe tener como máximo ${CHAT_LIMITS.maxChars} caracteres.` };
    const clean = sanitize(content);
    if (clean.length > CHAT_LIMITS.maxChars) return { error: `Cada mensaje debe tener como máximo ${CHAT_LIMITS.maxChars} caracteres.` };
    const bytes = Buffer.byteLength(clean, "utf8");
    if (bytes > CHAT_LIMITS.maxBytesPerMessage) return { error: `Cada mensaje debe tener como máximo ${CHAT_LIMITS.maxChars} caracteres.` };
    bytesTotales += bytes;
    if (bytesTotales > CHAT_LIMITS.maxBytesTotal) return { error: "La conversación es demasiado larga. Empieza una nueva." };
    if (!clean) continue; // los mensajes vacíos se descartan sin error
    /* EL HISTORIAL LO MANDA EL NAVEGADOR, TAMBIÉN LOS TURNOS DEL CAMARERO. No hay nada que
       demuestre que una respuesta de "assistant" la escribió de verdad el modelo: quien quiera
       puede mandar un turno suyo inventado y pedirle luego que lo confirme. Probado: un turno de
       "assistant" con un bloque "[Contexto …]" diciendo que toda la carta es sin gluten certificada
       entraba tal cual. Eso es información alimentaria que induce a error (art. 7.1 del Reglamento
       (UE) 1169/2011) con el nombre del local debajo. Aquí se tira el disfraz concreto que
       funciona —el bloque de contexto, que el prompt del sistema ORDENA creerse—; lo demás lo
       sostiene la regla del prompt que dice que los turnos anteriores pueden estar manipulados.
       Si algún día esto deja de bastar, lo que lo cierra de verdad es firmar cada respuesta con un
       HMAC del servidor y verificarla al volver. */
    if (role === "assistant" && /\[\s*contexto/i.test(clean)) continue;
    /* DOS TURNOS SEGUIDOS DEL MISMO PAPEL SE FUNDEN EN UNO. Pasa siempre que se descarta un turno
       —uno vacío, o uno de "assistant" con el disfraz de arriba— y dejaría un `user, user` en la
       petición. Puede que la API lo tolere; esto es para no tener que apostar. */
    const ultimo = turnos[turnos.length - 1];
    if (ultimo && ultimo.role === role) ultimo.content = `${ultimo.content}\n\n${clean}`;
    else turnos.push({ role, content: clean });
  }

  const messages: Anthropic.MessageParam[] = turnos.map((t) => ({ role: t.role, content: t.content }));

  // El historial debe empezar por el usuario y terminar con su pregunta actual.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return { error: "El último mensaje debe ser del usuario." };

  return {
    messages,
    locale: isLocale(typeof body.locale === "string" ? body.locale : undefined) ? (body.locale as Locale) : "es",
    page: isWaiterPage(body.page) ? body.page : "home",
  };
}

/* ────────────────────────────────────────────────────────────
   Respuestas
   ──────────────────────────────────────────────────────────── */
function textResponse(text: string, mode: WaiterMode): Response {
  return new Response(text, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      [WAITER_MODE_HEADER]: mode,
    },
  });
}

function jsonError(status: number, error: string, extraHeaders: Record<string, string> = {}): Response {
  return Response.json({ error }, { status, headers: { "cache-control": "no-store", ...extraHeaders } });
}

function isTextDelta(event: Anthropic.MessageStreamEvent): event is Anthropic.RawContentBlockDeltaEvent & { delta: Anthropic.TextDelta } {
  return event.type === "content_block_delta" && event.delta.type === "text_delta";
}

function logModelError(err: unknown): void {
  if (err instanceof Anthropic.RateLimitError) {
    console.error("[waiter] límite de uso de la API de Anthropic (429); respondemos con el motor sin conexión.");
  } else if (err instanceof Anthropic.APIError) {
    console.error(`[waiter] error de la API de Anthropic (${err.status ?? "sin estado"}): ${err.message}`);
  } else {
    console.error("[waiter] error inesperado al consultar el modelo:", err);
  }
}

let anthropicClient: Anthropic | null = null;

/** Cliente del SDK, creado una sola vez por proceso y solo si hay clave. */
function getClient(): Anthropic {
  if (!anthropicClient) anthropicClient = new Anthropic();
  return anthropicClient;
}

export async function POST(req: Request): Promise<Response> {
  /* EL ORDEN IMPORTA, Y NO POR RENDIMIENTO. Lo barato va primero —cabeceras— y la cuota por IP
     después: apuntar la dirección de alguien cuya petición vamos a rechazar de todos modos es
     guardar un dato personal que no hace falta (art. 5.1.c RGPD, minimización). Así, de un bot que
     ni se molesta en poner el `Origin` correcto no se registra nada. */
  if (!isSameOrigin(req)) return jsonError(403, "Origen no permitido.");
  if (!req.headers.get("content-type")?.includes("application/json")) return jsonError(415, "Se esperaba JSON.");
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return jsonError(413, "Petición demasiado grande.");

  const quota = takeToken(clientIp(req));
  if (!quota.ok) {
    return jsonError(429, "Has hecho demasiadas peticiones seguidas. Inténtalo en unos minutos.", {
      "retry-after": String(quota.retryAfter),
    });
  }

  let raw: unknown;
  try {
    /* Se lee como texto y se mide: `content-length` puede faltar (envío por trozos) o mentir. */
    const body = await req.text();
    /* `.length` son unidades UTF-16, no bytes: el mismo texto en un alfabeto de tres bytes por letra
       pasaba este tope ocupando el triple de lo que la constante dice. Se mide de verdad. */
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) return jsonError(413, "Petición demasiado grande.");
    raw = JSON.parse(body);
  } catch {
    return jsonError(400, "Cuerpo JSON no válido.");
  }
  const parsed = parseBody(raw);
  if ("error" in parsed) return jsonError(400, parsed.error);
  const { messages, locale, page } = parsed;
  const now = new Date();

  // Sin clave → motor determinista (modo offline).
  if (!process.env.ANTHROPIC_API_KEY) {
    return textResponse(answerOffline(messages, locale, { now, page }), "offline");
  }

  /* Freno de mano: si esta instancia ya ha gastado su presupuesto de la ventana, contesta el motor
     sin conexión en vez de seguir llamando al modelo. Va DESPUÉS de la comprobación de la clave
     para que el modo se llame igual que siempre cuando no la hay. */
  if (!hayPresupuesto()) {
    return textResponse(answerOffline(messages, locale, { now, page }), "fallback");
  }

  const fallback = () => textResponse(answerOffline(messages, locale, { now, page }), "fallback");
  const model = process.env.CHAT_MODEL ?? WAITER_DEFAULT_MODEL;
  const stream = getClient().messages.stream(
    {
      model,
      max_tokens: 1200,
      /* `effort` solo donde el modelo lo admite: ver `supportsEffort`. Con Haiku, mandarlo es un 400
         silencioso que degrada el chat al motor sin conexión para siempre. */
      ...(supportsEffort(model) ? { output_config: { effort: "low" as const } } : {}),
      /* EL CONTEXTO VOLÁTIL VA EN EL SISTEMA, NO DENTRO DEL MENSAJE DE LA PERSONA.
         Hasta el 14-10-2026 el bloque "[Contexto — ...]" (idioma, página, día, hora y si el local
         está abierto) se pegaba al final del último mensaje del usuario. El problema no era de
         estilo: el prompt del sistema ORDENA fiarse de ese bloque para el idioma y para el horario,
         así que lo convertía en el único texto del turno del cliente en el que el modelo debía
         creer — y cualquiera podía escribir su propio "[Contexto ...]" detrás de su pregunta y
         dictarle al camarero que el local está abierto, o que hoy cierra. Lo que el asistente
         afirma sobre el horario es información que el cliente puede dar por buena (art. 61.2
         TRLGDCU), y alguien plantado en la puerta un lunes a mediodía no tiene la culpa.
         Como segundo bloque de `system` el contenido es idéntico pero el origen ya no: viene del
         servidor y no del mensaje. El bloque cacheado se queda PRIMERO para que la caché de prompts
         —que funciona por prefijo— siga acertando; este va detrás y sin `cache_control`, porque
         cambia con la hora y cachearlo no tendría sentido. */
      system: [
        { type: "text", text: getSystemPrompt(), cache_control: { type: "ephemeral" } },
        { type: "text", text: buildContextSuffix({ locale, page, now }) },
      ],
      messages,
    },
    { signal: req.signal },
  );

  // Esperamos al PRIMER delta de texto antes de responder: así, si la API falla al conectar
  // (429, 5xx, red), todavía podemos contestar con el motor sin conexión y la cabecera correcta.
  const iterator = stream[Symbol.asyncIterator]();
  let firstText = "";
  try {
    for (;;) {
      const { value, done } = await iterator.next();
      if (done) break;
      if (isTextDelta(value)) {
        firstText = value.delta.text;
        break;
      }
    }
  } catch (err) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    logModelError(err);
    return fallback();
  }
  if (!firstText) {
    // Respuesta sin texto (p. ej. rechazo del modelo): mejor una respuesta útil que un bocadillo vacío.
    return fallback();
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(firstText));
      try {
        for (;;) {
          const { value, done } = await iterator.next();
          if (done) break;
          if (isTextDelta(value)) controller.enqueue(encoder.encode(value.delta.text));
        }
      } catch (err) {
        // Corte a mitad de respuesta: cerramos con lo recibido; el widget conserva el texto parcial.
        if (!req.signal.aborted) logModelError(err);
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
      [WAITER_MODE_HEADER]: "claude",
    },
  });
}
