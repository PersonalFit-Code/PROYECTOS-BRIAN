/**
 * POST /api/asistente — el asistente de dudas del curso.
 *
 * Cuerpo: { messages: [{ role: "user" | "assistant", content }], preguntaId?: string }
 * Respuesta: `text/plain; charset=utf-8` en streaming, con la cabecera `x-asistente`:
 *   - `claude`      → responde el modelo.
 *   - `sin-conexion` → no hay ANTHROPIC_API_KEY, se ha agotado el presupuesto o ha fallado la API:
 *                     responde un buscador sencillo sobre el temario.
 * Petición que no viene de la propia web → 403; cuerpo enorme → 413; mal formada → 400;
 * demasiadas seguidas desde la misma IP → 429.
 *
 * Mismo esquema que el camarero de tixola-taperia (src/app/api/chat/route.ts), recortado a lo que
 * necesita una app que usa una persona.
 */
import Anthropic from "@anthropic-ai/sdk";
import { TODAS_LAS_PREGUNTAS } from "@/data/temario";
import { LIMITES, MODELO_POR_DEFECTO, preguntaComoTexto, promptDelSistema, respuestaSinConexion } from "@/lib/asistente";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ────────────────────────────────────────────────────────────
   Frenos de gasto. Cada pregunta al modelo cuesta dinero.

   Son por instancia (Vercel arranca las que quiera), así que NO son el techo de la factura: el
   techo de verdad es el límite de gasto de la cuenta en la consola de Anthropic, con la recarga
   automática apagada. Esto solo para a quien insiste y evita que un bucle se coma el saldo.
   ──────────────────────────────────────────────────────────── */
const CUOTA_IP = { peticiones: 30, ventanaMs: 10 * 60 * 1000 };
const TOPE_GLOBAL = { peticiones: 150, ventanaMs: 10 * 60 * 1000 };
const MAX_BODY_BYTES = 64 * 1024;

const cuotas = new Map<string, { n: number; hasta: number }>();
let global = { n: 0, hasta: 0 };

function gastaCuota(ip: string, ahora = Date.now()): boolean {
  for (const [k, v] of cuotas) if (v.hasta <= ahora) cuotas.delete(k);
  const c = cuotas.get(ip);
  if (!c) {
    cuotas.set(ip, { n: 1, hasta: ahora + CUOTA_IP.ventanaMs });
    return true;
  }
  if (c.n >= CUOTA_IP.peticiones) return false;
  c.n++;
  return true;
}

function hayPresupuesto(ahora = Date.now()): boolean {
  if (ahora >= global.hasta) global = { n: 0, hasta: ahora + TOPE_GLOBAL.ventanaMs };
  if (global.n >= TOPE_GLOBAL.peticiones) return false;
  global.n++;
  return true;
}

function ipDe(req: Request): string {
  /* El último trozo de x-forwarded-for es el que pone el proxy de confianza (ver tixola). */
  const trozos = (req.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return trozos.at(-1) ?? req.headers.get("x-real-ip") ?? "desconocida";
}

/**
 * Solo la propia web. Un navegador siempre manda `Origin` en un POST; sin él, o desde otra web,
 * es un script intentando gastar la clave.
 */
function esDeLaCasa(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const propios = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean);
  if (propios.includes(host)) return true;
  if (host !== req.headers.get("host")) return false;
  const sinPuerto = host.replace(/:\d+$/, "");
  if (sinPuerto === "localhost" || sinPuerto === "127.0.0.1") return true;
  if (process.env.NODE_ENV !== "production") return true;
  return /\.vercel\.app$/.test(sinPuerto);
}

type Turno = { role: "user" | "assistant"; content: string };

function leerCuerpo(raw: unknown): { mensajes: Anthropic.Beta.BetaMessageParam[]; preguntaId?: string } | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Cuerpo no válido." };
  const { messages, preguntaId } = raw as Record<string, unknown>;
  if (!Array.isArray(messages) || !messages.length) return { error: "Faltan los mensajes." };

  const turnos: Turno[] = [];
  for (const m of messages.slice(-LIMITES.maxMensajes)) {
    const { role, content } = (m ?? {}) as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return { error: "Mensaje no válido." };
    const limpio = content
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .trim()
      .slice(0, LIMITES.maxCaracteres);
    if (!limpio) continue;
    /* Dos turnos seguidos del mismo papel se funden en uno. */
    const ultimo = turnos.at(-1);
    if (ultimo?.role === role) ultimo.content += `\n\n${limpio}`;
    else turnos.push({ role, content: limpio });
  }
  while (turnos.length && turnos[0].role !== "user") turnos.shift();
  if (!turnos.length || turnos.at(-1)!.role !== "user") return { error: "El último mensaje debe ser una pregunta." };

  return {
    mensajes: turnos,
    preguntaId: typeof preguntaId === "string" ? preguntaId : undefined,
  };
}

function texto(t: string, modo: "claude" | "sin-conexion"): Response {
  return new Response(t, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-asistente": modo } });
}

function error(status: number, mensaje: string): Response {
  return Response.json({ error: mensaje }, { status, headers: { "cache-control": "no-store" } });
}

/* `fallbacks: "default"`: si los filtros de seguridad del modelo rechazan una pregunta (pasa a veces
   con falsos positivos, p. ej. al hablar de explosiones o gases), la API la repite en otro modelo en
   la misma llamada en vez de devolver una respuesta vacía. Solo lo admiten estos modelos. */
const ADMITEN_FALLBACK = new Set(["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"]);

let cliente: Anthropic | null = null;

export async function POST(req: Request): Promise<Response> {
  if (!esDeLaCasa(req)) return error(403, "Origen no permitido.");
  if (!req.headers.get("content-type")?.includes("application/json")) return error(415, "Se esperaba JSON.");

  let raw: unknown;
  try {
    const cuerpo = await req.text();
    if (Buffer.byteLength(cuerpo, "utf8") > MAX_BODY_BYTES) return error(413, "Petición demasiado grande.");
    raw = JSON.parse(cuerpo);
  } catch {
    return error(400, "Cuerpo no válido.");
  }
  const leido = leerCuerpo(raw);
  if ("error" in leido) return error(400, leido.error);
  if (!gastaCuota(ipDe(req))) return error(429, "Has hecho muchas preguntas seguidas. Espera unos minutos.");

  const ultimaPregunta = String(leido.mensajes.at(-1)!.content);
  if (!process.env.ANTHROPIC_API_KEY) return texto(respuestaSinConexion(ultimaPregunta, "sin-clave"), "sin-conexion");
  if (!hayPresupuesto()) return texto(respuestaSinConexion(ultimaPregunta, "sin-presupuesto"), "sin-conexion");

  /* La pregunta del test desde la que se abre el chat la pone el SERVIDOR a partir del id, no el
     navegador: así nadie puede colarle al modelo una «solución del curso» inventada. */
  const pregunta = leido.preguntaId ? TODAS_LAS_PREGUNTAS.find((p) => p.id === leido.preguntaId) : undefined;
  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    /* El bloque fijo va primero y cacheado: la caché funciona por prefijo. */
    { type: "text", text: promptDelSistema(), cache_control: { type: "ephemeral" } },
  ];
  if (pregunta) system.push({ type: "text", text: `Pregunta que está mirando Adrián:\n${preguntaComoTexto(pregunta)}` });

  const model = process.env.ASISTENTE_MODEL ?? MODELO_POR_DEFECTO;
  cliente ??= new Anthropic();
  const stream = cliente.beta.messages.stream(
    {
      model,
      max_tokens: 8000,
      /* Dudas de estudio: con esfuerzo bajo responde rápido y bien. */
      output_config: { effort: "low" },
      ...(ADMITEN_FALLBACK.has(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      system,
      messages: leido.mensajes,
    },
    { signal: req.signal },
  );

  /* Se espera al PRIMER trozo de texto antes de responder: si la API falla al empezar (sin saldo,
     429, 5xx) todavía se puede contestar con el buscador del temario. */
  const it = stream[Symbol.asyncIterator]();
  let primero = "";
  try {
    for (;;) {
      const { value, done } = await it.next();
      if (done) break;
      if (value.type === "content_block_delta" && value.delta.type === "text_delta") {
        primero = value.delta.text;
        break;
      }
    }
  } catch (err) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    if (err instanceof Anthropic.APIError) console.error(`[asistente] error de la API (${err.status ?? "sin estado"}): ${err.message}`);
    else console.error("[asistente] error inesperado:", err);
    return texto(respuestaSinConexion(ultimaPregunta, "error"), "sin-conexion");
  }
  /* Sin texto: rechazo de toda la cadena de modelos, o respuesta vacía. */
  if (!primero) return texto(respuestaSinConexion(ultimaPregunta, "error"), "sin-conexion");

  const enc = new TextEncoder();
  const cuerpo = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(enc.encode(primero));
      try {
        for (;;) {
          const { value, done } = await it.next();
          if (done) break;
          if (value.type === "content_block_delta" && value.delta.type === "text_delta") controller.enqueue(enc.encode(value.delta.text));
        }
      } catch (err) {
        if (!req.signal.aborted) console.error("[asistente] corte a mitad de respuesta:", err);
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });
  return new Response(cuerpo, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no", "x-asistente": "claude" },
  });
}
