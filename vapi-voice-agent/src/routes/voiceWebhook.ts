import { Router, type Request, type Response } from "express";

import { buildAssistant } from "../assistant";
import { config } from "../config";
import { getBusiness } from "../db/businesses";
import { PedidoNoGuardadoError, guardarPedido } from "../db/orders";
import type { Business } from "../db/types";
import { formatearEuros } from "../util/format";
import {
  TOOL_CALCULAR_TOTAL,
  TOOL_REGISTRAR_PEDIDO,
} from "../tools/names";
import {
  PedidoInvalidoError,
  calcularTotal,
  describirTotal,
  type LineaPedido,
} from "../pedido";
import type {
  VapiAssistantResponse,
  VapiMessage,
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

/** Los argumentos pueden llegar como objeto o como JSON en texto. */
function parseArgs(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

interface LlamadaHerramienta {
  id: string;
  nombre: string;
  argumentos: Record<string, unknown>;
}

/**
 * Vapi manda las llamadas a herramientas en dos formatos segun la
 * configuracion: el plano (toolCallList) y el estilo OpenAI (toolCalls). Aqui
 * se normalizan los dos a una sola forma, sin duplicar por id.
 */
function normalizarLlamadas(message: VapiMessage): LlamadaHerramienta[] {
  const porId = new Map<string, LlamadaHerramienta>();

  for (const item of message.toolCallList ?? []) {
    if (!item?.id) continue;
    porId.set(item.id, {
      id: item.id,
      nombre: item.name,
      argumentos: parseArgs(item.parameters),
    });
  }

  for (const item of message.toolCalls ?? []) {
    if (!item?.id || porId.has(item.id)) continue;
    porId.set(item.id, {
      id: item.id,
      nombre: item.function?.name ?? "",
      argumentos: parseArgs(item.function?.arguments),
    });
  }

  return [...porId.values()];
}

/**
 * Punto unico donde se resuelven las herramientas del agente de voz. El
 * resultado vuelve al modelo como texto, asi que se devuelve una frase legible
 * tambien cuando hay error: el agente debe poder leerla en voz alta.
 */
async function ejecutarHerramienta(
  business: Business,
  nombre: string,
  argumentos: Record<string, unknown>,
  callId: string,
): Promise<string> {
  switch (nombre) {
    case TOOL_CALCULAR_TOTAL: {
      try {
        const articulos = argumentos.articulos as LineaPedido[] | undefined;
        const total = calcularTotal(business, articulos ?? [], argumentos.entrega);
        return describirTotal(business, total);
      } catch (error) {
        if (error instanceof PedidoInvalidoError) {
          return `No se ha podido calcular el total: ${error.message}`;
        }
        console.error("[calcular_total] error inesperado", error);
        return "No se ha podido calcular el total ahora mismo.";
      }
    }

    case TOOL_REGISTRAR_PEDIDO: {
      try {
        const articulos = argumentos.articulos as LineaPedido[] | undefined;
        const { pedido, yaExistia } = await guardarPedido(business, {
          articulos: articulos ?? [],
          entrega: argumentos.entrega,
          direccion: argumentos.direccion as string | undefined,
          telefono: argumentos.telefono as string | undefined,
          notas: argumentos.notas as string | undefined,
          callId,
        });

        // Deletreado: el agente lo lee letra a letra por telefono.
        const codigo = pedido.codigo.split("").join(" ");
        const total = formatearEuros(pedido.totalCentimos);

        return yaExistia
          ? `Este pedido ya estaba registrado, no se ha duplicado. El codigo sigue siendo ${codigo} y el total ${total}. Leeselo al cliente y no vuelvas a registrarlo.`
          : `Pedido registrado. El codigo es ${codigo}. Total: ${total}.`;
      } catch (error) {
        // Ni PedidoInvalido ni PedidoNoGuardado deben sonar a "ya esta hecho":
        // el agente tiene instrucciones de no confirmar si esto falla.
        if (
          error instanceof PedidoNoGuardadoError ||
          error instanceof PedidoInvalidoError
        ) {
          return `NO se ha podido registrar el pedido: ${error.message}. Pide disculpas y dile al cliente que llame al restaurante para confirmarlo.`;
        }
        console.error("[registrar_pedido] error inesperado", error);
        return "NO se ha podido registrar el pedido. Pide disculpas y dile al cliente que llame al restaurante para confirmarlo.";
      }
    }

    default:
      console.warn(`[voice-webhook] herramienta sin implementar: ${nombre}`, argumentos);
      return `La herramienta "${nombre}" no esta disponible.`;
  }
}

async function handleToolCalls(
  message: VapiMessage,
  business: Business,
): Promise<VapiToolCallsResponse> {
  const callId = message.call?.id ?? "";

  // En paralelo: Vapi puede mandar varias herramientas en el mismo mensaje y
  // no hay motivo para encadenarlas.
  const results = await Promise.all(
    normalizarLlamadas(message).map(async (llamada) => ({
      toolCallId: llamada.id,
      name: llamada.nombre,
      result: await ejecutarHerramienta(
        business,
        llamada.nombre,
        llamada.argumentos,
        callId,
      ),
    })),
  );

  return { results };
}

/**
 * Negocio al que va dirigida la peticion. Vapi lo trae en el query de la URL
 * del webhook (?business=tixola), que es la que se le dio al construir el
 * asistente. Si no viene, se usa el de la configuracion.
 */
function leerBusinessId(req: Request): string {
  const businessIdRaw = req.query.business;
  return typeof businessIdRaw === "string" && businessIdRaw.trim() !== ""
    ? businessIdRaw.trim()
    : config.defaultBusinessId;
}

voiceWebhookRouter.post(
  "/voice-webhook",
  async (req: Request, res: Response) => {
    // El handler es async y Express 4 no recoge las promesas rechazadas: sin
    // este try/catch un fallo inesperado dejaria la peticion colgada y Vapi
    // esperando hasta el timeout.
    try {
      await atender(req, res);
    } catch (error) {
      console.error("[voice-webhook] error inesperado", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error interno del servidor." });
      }
    }
  },
);

async function atender(req: Request, res: Response): Promise<void> {
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

  const businessId = leerBusinessId(req);
  const business = await getBusiness(businessId);

  console.log(
    `[voice-webhook] ${message.type} (` +
      (message.call?.id ? `call ${message.call.id}, ` : "") +
      `business=${businessId || "(por defecto)"})`,
  );

  switch (message.type) {
    case "assistant-request": {
      // Vapi corta esta peticion a los 7,5 segundos, asi que la respuesta se
      // construye en memoria: sin consultas a disco, red ni base de datos.
      const respuesta: VapiAssistantResponse = {
        assistant: buildAssistant(business, businessId),
      };
      res.json(respuesta);
      return;
    }

    case "tool-calls":
      res.json(await handleToolCalls(message, business));
      return;

    case "function-call": {
      // Formato antiguo de Vapi: una sola funcion por peticion.
      const call = message.functionCall;
      if (!call) {
        res.status(400).json({ error: 'Falta "functionCall" en el mensaje.' });
        return;
      }
      res.json({
        result: await ejecutarHerramienta(
          business,
          call.name,
          parseArgs(call.parameters),
          message.call?.id ?? "",
        ),
      });
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
}
