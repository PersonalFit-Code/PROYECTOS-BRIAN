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

/**
 * Una llamada a herramienta dentro de un "tool-calls". Vapi la manda en mas de
 * una forma (nombre en el primer nivel o dentro de "function", argumentos como
 * "parameters" o "arguments", en objeto o en texto), asi que todo es opcional
 * y se lee con src/tools/normalizar.ts.
 */
export interface VapiToolCallItem {
  id?: string;
  type?: string;
  name?: string;
  parameters?: Record<string, unknown> | string;
  arguments?: Record<string, unknown> | string;
  function?: {
    name?: string;
    arguments?: Record<string, unknown> | string;
    parameters?: Record<string, unknown> | string;
  };
}

export interface VapiMessage {
  type: VapiMessageType | string;
  timestamp?: number;
  call?: { id?: string; orgId?: string; [key: string]: unknown };
  /** "tool-calls": Vapi puede mandar uno, otro o los dos con lo mismo. */
  toolCallList?: VapiToolCallItem[];
  toolCalls?: VapiToolCallItem[];
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
