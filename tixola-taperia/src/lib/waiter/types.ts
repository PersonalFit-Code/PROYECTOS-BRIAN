/**
 * Tipos compartidos del camarero virtual (widget ⇄ API ⇄ motores de respuesta).
 *
 * - Hacia la API de Anthropic se usa siempre `Anthropic.MessageParam` (ver route.ts).
 * - Entre el widget y `POST /api/chat` viaja un formato mínimo de solo texto (`ChatApiMessage`).
 * - Los motores (`answerOffline`, sufijo de contexto) aceptan `WaiterTurn`, un tipo estructural
 *   al que `Anthropic.MessageParam` es asignable sin conversión.
 */
import type { Locale } from "@/i18n/config";

/** Página desde la que se abre el chat: contexto para el prompt y para las respuestas sin conexión. */
export type WaiterPage = "home" | "carta" | "legal";

export const WAITER_PAGES: readonly WaiterPage[] = ["home", "carta", "legal"];

export function isWaiterPage(value: unknown): value is WaiterPage {
  return typeof value === "string" && (WAITER_PAGES as readonly string[]).includes(value);
}

/** Roles del historial (el prompt del sistema no forma parte de él). */
export type ChatRole = "user" | "assistant";

/** Mensaje tal y como lo envía el widget a `POST /api/chat` (solo texto). */
export interface ChatApiMessage {
  role: ChatRole;
  content: string;
}

/** Cuerpo de `POST /api/chat`. `locale` y `page` llegan sin validar y se normalizan en el servidor. */
export interface ChatRequestBody {
  messages: ChatApiMessage[];
  locale?: Locale | string;
  page?: WaiterPage | string;
}

/**
 * Cómo se ha generado la respuesta (cabecera `x-waiter-mode`):
 *  - `claude`   → respuesta en streaming del modelo.
 *  - `offline`  → no hay `ANTHROPIC_API_KEY`: motor determinista con la carta y el horario.
 *  - `fallback` → el modelo ha fallado (límite de uso, error de red…) y responde el motor determinista.
 */
export type WaiterMode = "claude" | "offline" | "fallback";

export const WAITER_MODE_HEADER = "x-waiter-mode";

export function isWaiterMode(value: unknown): value is WaiterMode {
  return value === "claude" || value === "offline" || value === "fallback";
}

/**
 * Turno mínimo que entienden los motores. `Anthropic.MessageParam` es asignable a este tipo:
 * el contenido es texto o una lista de bloques que se inspeccionan en tiempo de ejecución.
 */
export interface WaiterTurn {
  /** `system` existe en `Anthropic.MessageParam` (mensajes de sistema a mitad de conversación); los motores lo ignoran */
  role: ChatRole | "system";
  content: string | ReadonlyArray<unknown>;
}

function isTextBlock(block: unknown): block is { type: "text"; text: string } {
  if (typeof block !== "object" || block === null) return false;
  const b = block as { type?: unknown; text?: unknown };
  return b.type === "text" && typeof b.text === "string";
}

/** Texto plano de un turno (concatena los bloques de texto; ignora imágenes u otros bloques). */
export function turnText(turn: WaiterTurn): string {
  if (typeof turn.content === "string") return turn.content;
  return turn.content.filter(isTextBlock).map((block) => block.text).join("\n");
}

/** Estado de un mensaje en el widget. */
export type ChatMessageStatus = "done" | "streaming" | "error";

/** Mensaje del widget (persistido en sessionStorage cuando `status === "done"`). */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  status: ChatMessageStatus;
  createdAt: number;
}

/** Límites compartidos por el widget (textarea) y la API (validación y cuota por IP). */
export const CHAT_LIMITS = {
  /** nº máximo de mensajes de historial por petición */
  maxMessages: 20,
  /** caracteres por mensaje */
  maxChars: 1000,
  /** peticiones por IP y ventana */
  rateLimit: 30,
  /** ventana de la cuota en ms (10 min) */
  rateWindowMs: 10 * 60 * 1000,
} as const;
