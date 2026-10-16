/**
 * POST /api/chat — asistente de preguntas frecuentes (portado del camarero virtual de tixola).
 *
 * Cuerpo: { messages: [{ role: "user" | "assistant", content }], locale?: "es", page?: "home"|"servicios"|… }
 * Respuesta: `text/plain; charset=utf-8` en streaming (deltas de texto) con la cabecera
 * `x-asistente-mode`:
 *   - `claude`   → respuesta del modelo (SDK oficial, prompt de sistema marcado para la caché).
 *   - `offline`  → no hay ANTHROPIC_API_KEY: responde el motor determinista (`offlineEngine`). Es el
 *                  modo normal hasta que el salón decida «darle cerebro» al asistente.
 *   - `fallback` → hay clave pero el modelo ha fallado (429, 5xx, red…): responde el motor determinista.
 * Petición que no viene de la propia web → 403; sin JSON → 415; cuerpo enorme → 413; validación →
 * 400 JSON; cuota por IP superada (30 peticiones / 10 min) → 429 JSON con `retry-after`.
 *
 * NI EL ASISTENTE NI ESTA RUTA TOCAN LA AGENDA: aquí no hay herramientas ni acceso a Supabase más allá
 * de leer el catálogo público. Reservar, cambiar y cancelar sigue siendo cosa de la reserva online.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { SERVICIOS_FIXTURE } from "@/data/fixtures";
import { isLocale, type Locale } from "@/i18n/config";
import { serviciosDesdeCatalogo, serviciosDesdeFixture } from "@/lib/asistente/knowledge";
import { answerOffline } from "@/lib/asistente/offlineEngine";
import { ASISTENTE_DEFAULT_MODEL, buildContextSuffix, getSystemPrompt, supportsEffort } from "@/lib/asistente/systemPrompt";
import {
  ASISTENTE_MODE_HEADER,
  CHAT_LIMITS,
  isAsistentePage,
  type AsistenteMode,
  type AsistentePage,
  type ServicioAsistente,
} from "@/lib/asistente/types";
import { crearLimitador, ipDePeticion } from "@/lib/rateLimit";
import { getCatalogo } from "@/lib/reservas/catalogo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ────────────────────────────────────────────────────────────
   Filtros: solo la propia web, cuerpo razonable, cuota por IP
   ──────────────────────────────────────────────────────────── */

/** Cuota propia del chat (cada ruta tiene la suya: ver `lib/rateLimit.ts`). */
const limitador = crearLimitador({ maximo: CHAT_LIMITS.rateLimit, ventanaMs: CHAT_LIMITS.rateWindowMs });

/** Tope del cuerpo en bytes: 20 mensajes × 1000 caracteres caben de sobra (hasta 4 bytes por letra). */
const MAX_BODY_BYTES = 96 * 1024;

/**
 * Cada pregunta con la IA activada cuesta dinero (la API de Anthropic se paga por uso). Un navegador
 * SIEMPRE manda `Origin` en un `fetch` POST, así que una petición sin él, o desde otra web, no viene
 * del chat: es un script o una página ajena intentando gastar la clave. Se rechaza antes de leer
 * nada. No es infalible (un script puede falsificar la cabecera), pero quita de en medio a los bots
 * genéricos y a cualquier web que quiera usar nuestro asistente como API gratis; la cuota por IP y
 * el tope de gasto de la cuenta de Anthropic cubren el resto. Se aplica también sin clave: el motor
 * sin IA no cuesta, pero tampoco tiene por qué servir a otras webs.
 */
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/* ────────────────────────────────────────────────────────────
   Validación del cuerpo
   ──────────────────────────────────────────────────────────── */

/* El tope por mensaje va al DOBLE del límite antes de limpiar (los caracteres de control que se
   quitan no cuentan); después de limpiar se exige el límite real. */
const Cuerpo = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(CHAT_LIMITS.maxChars * 2) }))
    .min(1)
    .max(CHAT_LIMITS.maxMessages),
  locale: z.string().optional(),
  page: z.string().optional(),
});

interface ParsedRequest {
  messages: Anthropic.MessageParam[];
  locale: Locale;
  page: AsistentePage;
}

/** Quita caracteres de control (salvo saltos de línea y tabulador), normaliza saltos y recorta. */
function sanitize(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u2028\u2029]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseBody(raw: unknown): ParsedRequest | { error: string } {
  const lectura = Cuerpo.safeParse(raw);
  if (!lectura.success) return { error: "Cada mensaje necesita role (user/assistant) y content (texto), y como mucho 20 mensajes." };

  const messages: Anthropic.MessageParam[] = [];
  for (const { role, content } of lectura.data.messages) {
    const clean = sanitize(content);
    if (clean.length > CHAT_LIMITS.maxChars) return { error: `Cada mensaje debe tener como máximo ${CHAT_LIMITS.maxChars} caracteres.` };
    if (!clean) continue; // los mensajes vacíos se descartan sin error
    messages.push({ role, content: clean });
  }

  // El historial debe empezar por el usuario y terminar con su pregunta actual.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return { error: "El último mensaje debe ser del usuario." };

  const { locale, page } = lectura.data;
  return {
    messages,
    locale: isLocale(locale) ? locale : "es",
    page: isAsistentePage(page) ? page : "otra",
  };
}

/* ────────────────────────────────────────────────────────────
   El catálogo que conoce el asistente
   ──────────────────────────────────────────────────────────── */

/**
 * Servicios para los dos motores. Con base de datos, los de Supabase (`getCatalogo`, cacheado una
 * hora con la etiqueta `catalogo`: cuando Andrea cambia un precio en el panel, el asistente lo sabe
 * en cuanto se revalida). Sin base de datos, el fixture, que va todo marcado `pendiente`.
 *
 * SI LA BASE DE DATOS FALLA, LISTA VACÍA Y NO EL FIXTURE. El fixture son datos de EJEMPLO: con la base
 * conectada, colarlos por un fallo de red sería anunciar precios que quizá ya no son. Vacío, los dos
 * motores dicen que no tienen la lista a mano y mandan a la página de servicios.
 */
async function cargarServicios(): Promise<ServicioAsistente[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return serviciosDesdeFixture(SERVICIOS_FIXTURE);
  }
  try {
    const { categorias, servicios } = await getCatalogo();
    return serviciosDesdeCatalogo(categorias, servicios);
  } catch (err) {
    console.error("[asistente] no se pudo leer el catálogo; respondo sin lista de servicios:", err);
    return [];
  }
}

/* ────────────────────────────────────────────────────────────
   Respuestas
   ──────────────────────────────────────────────────────────── */
function textResponse(text: string, mode: AsistenteMode): Response {
  return new Response(text, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      [ASISTENTE_MODE_HEADER]: mode,
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
    console.error("[asistente] límite de uso de la API de Anthropic (429); respondo con el motor sin IA.");
  } else if (err instanceof Anthropic.AuthenticationError) {
    /* La avería más cara de esta ruta: la clave está puesta pero no vale, y el chat sigue
       contestando con el motor sin IA, así que nadie lo nota desde la web. Que se vea en los logs. */
    console.error("[asistente] la ANTHROPIC_API_KEY no es válida (401): el chat responde sin IA hasta que se corrija.");
  } else if (err instanceof Anthropic.APIError) {
    console.error(`[asistente] error de la API de Anthropic (${err.status ?? "sin estado"}): ${err.message}`);
  } else {
    console.error("[asistente] error inesperado al consultar el modelo:", err);
  }
}

let anthropicClient: Anthropic | null = null;

/**
 * Cliente del SDK, creado una sola vez por proceso y solo si hay clave.
 *
 * `timeout` corto y UN reintento, no los 10 minutos y dos reintentos de serie: aquí hay una persona
 * mirando tres puntitos, y mejor la respuesta del motor sin IA a los 15 segundos que un panel
 * colgado. El plazo cubre hasta que empieza a llegar la respuesta, no el streaming entero.
 */
function getClient(): Anthropic {
  if (!anthropicClient) anthropicClient = new Anthropic({ timeout: 15_000, maxRetries: 1 });
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

  const cuota = limitador.permitir(ipDePeticion(req));
  if (!cuota.ok) {
    return jsonError(429, "Has hecho demasiadas peticiones seguidas. Inténtalo en unos minutos.", {
      "retry-after": String(Math.max(1, Math.ceil(cuota.reintentarEnMs / 1000))),
    });
  }

  let raw: unknown;
  try {
    /* Se lee como texto y se mide: `content-length` puede faltar (envío por trozos) o mentir. */
    const body = await req.text();
    if (body.length > MAX_BODY_BYTES) return jsonError(413, "Petición demasiado grande.");
    raw = JSON.parse(body);
  } catch {
    return jsonError(400, "Cuerpo JSON no válido.");
  }
  const parsed = parseBody(raw);
  if ("error" in parsed) return jsonError(400, parsed.error);
  const { messages, locale, page } = parsed;
  const now = new Date();
  const servicios = await cargarServicios();

  const offline = (mode: AsistenteMode) => textResponse(answerOffline(messages, { servicios, now, page, locale }), mode);

  // Sin clave → motor determinista. Es el asistente «sin cerebro», y funciona igual de bien para lo
  // que está escrito en las preguntas frecuentes.
  if (!process.env.ANTHROPIC_API_KEY) return offline("offline");

  const model = process.env.CHAT_MODEL ?? ASISTENTE_DEFAULT_MODEL;
  let stream: ReturnType<Anthropic["messages"]["stream"]>;
  try {
    stream = getClient().messages.stream(
      {
        model,
        /* Corto a propósito: las respuestas rondan las 100 palabras y la ruta es pública, así que
           el tope también es un techo de gasto por pregunta. Con margen para el razonamiento de los
           modelos que piensan siempre (si alguien cambia `CHAT_MODEL`), que cuenta dentro de este tope. */
        max_tokens: 1500,
        /* `effort` solo donde el modelo lo admite: ver `supportsEffort`. Con Haiku 4.5, mandarlo es un
           400 silencioso que degradaría el chat al motor sin IA para siempre. */
        ...(supportsEffort(model) ? { output_config: { effort: "low" as const } } : {}),
        /* EL CONTEXTO VOLÁTIL VA EN EL SISTEMA, NO DENTRO DEL MENSAJE DE LA PERSONA (lección de
           tixola). El prompt ordena fiarse del bloque [Contexto] para saber la hora y si el salón está
           abierto; si ese bloque fuera pegado al último mensaje del usuario, cualquiera podría escribir
           su propio «[Contexto …]» detrás de su pregunta y dictarle al asistente que hoy se abre el
           domingo. Lo que el asistente afirma sobre el horario es información que la clienta puede dar
           por buena (art. 61.2 TRLGDCU).
           El bloque estable va PRIMERO y con `cache_control`, para que la caché —que funciona por
           prefijo— acierte; el volátil va detrás y sin marcar, porque cambia cada minuto. */
        system: [
          { type: "text", text: getSystemPrompt(servicios), cache_control: { type: "ephemeral" } },
          { type: "text", text: buildContextSuffix({ page, now }) },
        ],
        messages,
      },
      { signal: req.signal },
    );
  } catch (err) {
    logModelError(err);
    return offline("fallback");
  }

  // Esperamos al PRIMER delta de texto antes de responder: así, si la API falla al conectar
  // (429, 5xx, red), todavía podemos contestar con el motor sin IA y la cabecera correcta.
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
    return offline("fallback");
  }
  if (!firstText) {
    // Respuesta sin texto (p. ej. `stop_reason: "refusal"`): mejor una respuesta útil que un bocadillo vacío.
    return offline("fallback");
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
      [ASISTENTE_MODE_HEADER]: "claude",
    },
  });
}
