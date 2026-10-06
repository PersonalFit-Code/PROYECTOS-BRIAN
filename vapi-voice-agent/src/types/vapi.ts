/**
 * Tipos minimos del webhook de Vapi. Solo se declara lo que este servidor usa:
 * Vapi envia muchos mas campos y conviene leerlos del payload cuando se
 * necesiten, en lugar de intentar copiar aqui todo el contrato.
 *
 * Referencia: https://docs.vapi.ai/server-url/events
 */

export type VapiMessageType =
  | "assistant-request"
  | "conversation-update"
  | "end-of-call-report"
  | "function-call"
  | "hang"
  | "speech-update"
  | "status-update"
  | "tool-calls"
  | "transcript"
  | "user-interrupted";

export interface VapiToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    /** Vapi lo manda como objeto, pero algunos modelos envian un JSON en texto. */
    arguments: Record<string, unknown> | string;
  };
}

export interface VapiMessage {
  type: VapiMessageType | string;
  timestamp?: number;
  call?: { id?: string; orgId?: string; [key: string]: unknown };
  /** Presente en los mensajes de tipo "tool-calls". */
  toolCalls?: VapiToolCall[];
  /** Presente en los mensajes de tipo "function-call" (formato antiguo). */
  functionCall?: { name: string; parameters?: Record<string, unknown> };
  [key: string]: unknown;
}

export interface VapiWebhookBody {
  message?: VapiMessage;
}

/** Respuesta a un "tool-calls": un resultado por cada llamada recibida. */
export interface VapiToolCallsResponse {
  results: Array<{ toolCallId: string; result: string }>;
}
