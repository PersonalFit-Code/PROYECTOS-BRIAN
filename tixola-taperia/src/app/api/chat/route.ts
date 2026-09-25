/**
 * POST /api/chat — camarero virtual.
 *
 * Cuerpo: { messages: [{ role: "user" | "assistant", content }], locale?: "es"|"gl"|"en"|"pt", page?: "home"|"carta"|"legal" }
 * Respuesta: `text/plain; charset=utf-8` en streaming (deltas de texto del modelo) con la cabecera
 * `x-waiter-mode`:
 *   - `claude`   → respuesta del modelo (SDK oficial, prompt de sistema cacheado).
 *   - `offline`  → no hay ANTHROPIC_API_KEY: responde el motor determinista (offlineEngine).
 *   - `fallback` → el modelo ha fallado (429, 5xx, red…): responde el motor determinista.
 * Errores de validación → 400 JSON; cuota por IP superada (30 peticiones / 10 min) → 429 JSON.
 */
import Anthropic from "@anthropic-ai/sdk";
import { isLocale, type Locale } from "@/i18n/config";
import { answerOffline } from "@/lib/waiter/offlineEngine";
import { buildContextSuffix, getSystemPrompt, WAITER_DEFAULT_MODEL } from "@/lib/waiter/systemPrompt";
import { CHAT_LIMITS, isWaiterPage, WAITER_MODE_HEADER, type ChatRole, type WaiterMode, type WaiterPage } from "@/lib/waiter/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ────────────────────────────────────────────────────────────
   Cuota ligera por IP (en memoria; suficiente para un único proceso)
   ──────────────────────────────────────────────────────────── */
interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();
const MAX_TRACKED_IPS = 5000;

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? req.headers.get("cf-connecting-ip") ?? "unknown";
}

/** Consume una petición de la cuota; devuelve los segundos de espera si se ha superado. */
function takeToken(ip: string, now = Date.now()): { ok: true } | { ok: false; retryAfter: number } {
  if (buckets.size > MAX_TRACKED_IPS) {
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + CHAT_LIMITS.rateWindowMs });
    return { ok: true };
  }
  if (bucket.count >= CHAT_LIMITS.rateLimit) return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  bucket.count++;
  return { ok: true };
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

  const messages: Anthropic.MessageParam[] = [];
  for (const entry of body.messages) {
    if (!entry || typeof entry !== "object") return { error: "Mensaje no válido." };
    const { role, content } = entry as Record<string, unknown>;
    if (!isRole(role) || typeof content !== "string") return { error: "Cada mensaje necesita role (user/assistant) y content (texto)." };
    if (content.length > CHAT_LIMITS.maxChars * 2) return { error: `Cada mensaje debe tener como máximo ${CHAT_LIMITS.maxChars} caracteres.` };
    const clean = sanitize(content);
    if (clean.length > CHAT_LIMITS.maxChars) return { error: `Cada mensaje debe tener como máximo ${CHAT_LIMITS.maxChars} caracteres.` };
    if (!clean) continue; // los mensajes vacíos se descartan sin error
    messages.push({ role, content: clean });
  }

  // El historial debe empezar por el usuario y terminar con su pregunta actual.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return { error: "El último mensaje debe ser del usuario." };

  return {
    messages,
    locale: isLocale(typeof body.locale === "string" ? body.locale : undefined) ? (body.locale as Locale) : "es",
    page: isWaiterPage(body.page) ? body.page : "home",
  };
}

/** Añade el bloque de contexto volátil al final del último mensaje del usuario (nunca al bloque de sistema). */
function withContextSuffix(messages: Anthropic.MessageParam[], suffix: string): Anthropic.MessageParam[] {
  const last = messages[messages.length - 1];
  const content = typeof last.content === "string" ? `${last.content}\n\n${suffix}` : [...last.content, { type: "text" as const, text: suffix }];
  return [...messages.slice(0, -1), { role: last.role, content }];
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
  const quota = takeToken(clientIp(req));
  if (!quota.ok) {
    return jsonError(429, "Has hecho demasiadas peticiones seguidas. Inténtalo en unos minutos.", {
      "retry-after": String(quota.retryAfter),
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
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

  const fallback = () => textResponse(answerOffline(messages, locale, { now, page }), "fallback");
  const model = process.env.CHAT_MODEL ?? WAITER_DEFAULT_MODEL;
  const stream = getClient().messages.stream(
    {
      model,
      max_tokens: 1200,
      output_config: { effort: "low" },
      system: [{ type: "text", text: getSystemPrompt(), cache_control: { type: "ephemeral" } }],
      messages: withContextSuffix(messages, buildContextSuffix({ locale, page, now })),
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
