import { Router, type Request, type Response } from "express";

import { config } from "../config";
import type {
  VapiMessage,
  VapiToolCall,
  VapiToolCallsResponse,
  VapiWebhookBody,
} from "../types/vapi";

export const voiceWebhookRouter = Router();

/**
 * Comprueba el secreto compartido. Vapi lo envia en la cabecera
 * x-vapi-secret cuando se configura en el servidor del asistente.
 */
function isAuthorized(req: Request): boolean {
  if (!config.vapiServerSecret) return true;
  return req.header("x-vapi-secret") === config.vapiServerSecret;
}

function parseArguments(toolCall: VapiToolCall): Record<string, unknown> {
  const { arguments: args } = toolCall.function;
  if (typeof args !== "string") return args ?? {};
  try {
    const parsed: unknown = JSON.parse(args);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/**
 * Punto unico donde se resuelven las herramientas que el agente de voz puede
 * invocar. Por ahora devuelve un texto de marcador: aqui es donde ira la
 * logica real (consultar reservas, horarios, disponibilidad...).
 */
function runTool(name: string, args: Record<string, unknown>): string {
  switch (name) {
    default:
      console.warn(`[voice-webhook] herramienta sin implementar: ${name}`, args);
      return `La herramienta "${name}" todavia no esta implementada.`;
  }
}

function handleToolCalls(message: VapiMessage): VapiToolCallsResponse {
  const toolCalls = message.toolCalls ?? [];
  return {
    results: toolCalls.map((toolCall) => ({
      toolCallId: toolCall.id,
      result: runTool(toolCall.function.name, parseArguments(toolCall)),
    })),
  };
}

voiceWebhookRouter.post("/voice-webhook", (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Secreto de Vapi invalido o ausente." });
    return;
  }

  const body = req.body as VapiWebhookBody | undefined;
  const message = body?.message;

  if (!message || typeof message.type !== "string") {
    res.status(400).json({ error: 'Se esperaba un objeto "message" con "type".' });
    return;
  }

  console.log(
    `[voice-webhook] ${message.type}` +
      (message.call?.id ? ` (call ${message.call.id})` : ""),
  );

  switch (message.type) {
    case "tool-calls":
      res.json(handleToolCalls(message));
      return;

    case "function-call": {
      // Formato antiguo de Vapi: una sola funcion por peticion.
      const call = message.functionCall;
      if (!call) {
        res.status(400).json({ error: 'Falta "functionCall" en el mensaje.' });
        return;
      }
      res.json({ result: runTool(call.name, call.parameters ?? {}) });
      return;
    }

    case "status-update":
    case "end-of-call-report":
    case "transcript":
    case "speech-update":
    case "conversation-update":
    case "user-interrupted":
    case "hang":
      // Eventos informativos: Vapi no espera contenido, solo un 200.
      res.json({ received: true, type: message.type });
      return;

    default:
      console.warn(`[voice-webhook] tipo de mensaje no manejado: ${message.type}`);
      res.json({ received: true, type: message.type, handled: false });
      return;
  }
});
