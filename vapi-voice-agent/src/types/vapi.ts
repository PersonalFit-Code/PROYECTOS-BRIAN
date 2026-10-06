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

/** Formato plano, el que documenta Vapi para "tool-calls". */
export interface VapiToolCallListItem {
  id: string;
  name: string;
  parameters?: Record<string, unknown> | string;
}

/** Formato estilo OpenAI, que Vapi tambien envia segun la configuracion. */
export interface VapiToolCall {
  id: string;
  type?: "function";
  function: {
    name: string;
    /** Puede llegar como objeto o como JSON en texto, segun el modelo. */
    arguments?: Record<string, unknown> | string;
  };
}

export interface VapiMessage {
  type: VapiMessageType | string;
  timestamp?: number;
  call?: { id?: string; orgId?: string; [key: string]: unknown };
  /** "tool-calls", formato plano documentado. */
  toolCallList?: VapiToolCallListItem[];
  /** "tool-calls", formato estilo OpenAI. */
  toolCalls?: VapiToolCall[];
  /** "function-call" (formato antiguo, una sola funcion). */
  functionCall?: { name: string; parameters?: Record<string, unknown> | string };
  [key: string]: unknown;
}

export interface VapiWebhookBody {
  message?: VapiMessage;
}

/** Respuesta a un "tool-calls": un resultado por cada llamada recibida. */
export interface VapiToolCallsResponse {
  results: Array<{ toolCallId: string; name: string; result: string }>;
}

/**
 * Respuesta a un "assistant-request". Ademas de un asistente transitorio,
 * Vapi acepta { assistantId }, { destination } o { error } para que el motivo
 * se le diga en voz alta a quien llama.
 */
export interface VapiAssistantResponse {
  assistant: Record<string, unknown>;
}
