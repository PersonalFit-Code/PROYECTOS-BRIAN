import { Router, type Request, type Response } from "express";

import { buildAssistant } from "../assistant";
import { buildAssistantCitas } from "../assistantCitas";
import {
  TOOL_BUSCAR_HUECOS,
  TOOL_RESERVAR_CITA,
  buscarHuecos,
  reservarCita,
} from "../citas/herramientas";
import { config } from "../config";
import { getNegocio, type Negocio } from "../db/businesses";
import { pideCitas } from "../db/validarClinica";
import { calendarioDeGoogle } from "../google/cliente";
import { guardarResumenLlamada } from "../db/calls";
import {
  DatosIncompletosError,
  PedidoNoGuardadoError,
  guardarPedido,
} from "../db/orders";
import type { Clinica } from "../db/clinica";
import type { Business } from "../db/types";
import { formatearEuros } from "../util/format";
import {
  TOOL_CALCULAR_TOTAL,
  TOOL_REGISTRAR_PEDIDO,
} from "../tools/names";
import { normalizarLlamadas, parseArgs } from "../tools/normalizar";
import {
  articulosDe,
  describirLlegada,
  pedidoParaRegistrar,
  recordarPedido,
} from "../tools/memoriaPedido";
import { conLimite } from "../util/espera";
import {
  PedidoInvalidoError,
  calcularTotal,
  describirTotal,
} from "../pedido";
import {
  telefonoDelCliente,
  type VapiAssistantResponse,
  type VapiMessage,
  type VapiToolCallsResponse,
  type VapiWebhookBody,
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

/**
 * Punto unico donde se resuelven las herramientas del agente de voz. El
 * resultado vuelve al modelo como texto, asi que se devuelve una frase legible
 * tambien cuando hay error: el agente debe poder leerla en voz alta.
 */
async function ejecutarHerramienta(
  negocio: Negocio,
  nombre: string,
  argumentos: Record<string, unknown>,
  callId: string,
  telefonoLlamada = "",
): Promise<string> {
  if (pideCitas(negocio)) {
    return ejecutarHerramientaCita(negocio, nombre, argumentos, callId);
  }
  return ejecutarHerramientaPedido(negocio, nombre, argumentos, callId, telefonoLlamada);
}

/** Las dos herramientas de una clinica. */
async function ejecutarHerramientaCita(
  clinica: Clinica,
  nombre: string,
  argumentos: Record<string, unknown>,
  callId: string,
): Promise<string> {
  const contexto = {
    clinica,
    calendario: calendarioDeGoogle(),
    callId,
    ahora: new Date(),
  };

  switch (nombre) {
    case TOOL_BUSCAR_HUECOS:
      return buscarHuecos(contexto, argumentos);
    case TOOL_RESERVAR_CITA:
      return reservarCita(contexto, argumentos);
    default:
      console.warn(`[voice-webhook] herramienta sin implementar: ${nombre}`, argumentos);
      return `La herramienta "${nombre}" no esta disponible.`;
  }
}

async function ejecutarHerramientaPedido(
  business: Business,
  nombre: string,
  argumentos: Record<string, unknown>,
  callId: string,
  telefonoLlamada: string,
): Promise<string> {
  switch (nombre) {
    case TOOL_CALCULAR_TOTAL: {
      try {
        const articulos = articulosDe(argumentos, business.carta.map((p) => p.id));
        if (articulos.length === 0) {
          console.warn(`[calcular_total] sin platos: ${describirLlegada(argumentos)}`);
        }
        const total = calcularTotal(business, articulos, argumentos.entrega);
        recordarPedido(callId, articulos, argumentos.entrega);
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
        const { articulos, entrega, deMemoria } = pedidoParaRegistrar(
          callId,
          argumentos,
          business.carta.map((p) => p.id),
        );
        if (deMemoria) {
          console.warn(
            `[registrar_pedido] llego sin platos; se usa lo calculado en esta llamada. ${describirLlegada(argumentos)}`,
          );
        } else if (articulos.length === 0) {
          console.warn(`[registrar_pedido] sin platos: ${describirLlegada(argumentos)}`);
        }
        const { pedido, yaExistia } = await guardarPedido(business, {
          articulos,
          entrega,
          direccion: argumentos.direccion as string | undefined,
          nombre: argumentos.nombre as string | undefined,
          telefono: argumentos.telefono as string | undefined,
          notas: argumentos.notas as string | undefined,
          callId,
          telefonoLlamada,
        });

        // Separado, para que el agente lo diga cifra a cifra.
        const codigo = pedido.codigo.split("").join(" ");
        const total = formatearEuros(pedido.totalCentimos);

        return yaExistia
          ? `Este pedido ya estaba registrado, no se ha duplicado. El codigo sigue siendo ${codigo} y el total ${total}. Leeselo al cliente y no vuelvas a registrarlo.`
          : `Pedido registrado. El codigo es ${codigo}. Total: ${total}.`;
      } catch (error) {
        // Nada de esto puede sonar a "ya esta hecho". Pero no todo es igual:
        // si falta un dato o un plato no cuadra, el agente lo arregla con el
        // cliente y vuelve a intentarlo, sin mandarle a llamar a nadie. Asi se
        // perdio un pedido de 97 euros en una prueba: el cliente seguia al
        // telefono y se le dijo que llamase "en horario de apertura".
        if (
          error instanceof DatosIncompletosError ||
          error instanceof PedidoInvalidoError
        ) {
          console.warn(`[registrar_pedido] corregible: ${error.message}`);
          return `Todavia NO esta registrado: ${error.message.replace(/\.+$/, "")}. Arreglalo con el cliente (preguntale lo que falte o corrige el plato) y vuelve a llamar a registrar_pedido. No le digas que llame a nadie.`;
        }
        if (error instanceof PedidoNoGuardadoError) {
          return `NO se ha podido registrar el pedido por un fallo del sistema (${error.message}). Pide disculpas y dile que llame ahora al restaurante para hacerlo con una persona. No le digas que esta cerrado.`;
        }
        console.error("[registrar_pedido] error inesperado", error);
        return "NO se ha podido registrar el pedido por un fallo del sistema. Pide disculpas y dile que llame ahora al restaurante para hacerlo con una persona. No le digas que esta cerrado.";
      }
    }

    default:
      console.warn(`[voice-webhook] herramienta sin implementar: ${nombre}`, argumentos);
      return `La herramienta "${nombre}" no esta disponible.`;
  }
}

/**
 * Lo maximo que se deja tardar a una herramienta. Vapi corta la peticion por
 * su cuenta y entonces el agente se queda callado hasta que la llamada muere
 * por silencio: mas vale contestar tarde pero contestar, con una frase que el
 * agente pueda leer, que dejar al cliente oyendo nada.
 */
const MAX_HERRAMIENTA_MS = 8_000;

function mensajeDeTardanza(nombre: string): string {
  if (nombre === TOOL_BUSCAR_HUECOS) {
    return "No he podido mirar la agenda a tiempo. Pidele el nombre y un telefono, dile que le llaman en seguida, y no le des ninguna hora.";
  }
  if (nombre === TOOL_RESERVAR_CITA) {
    return "NO se ha podido poner la cita: el sistema ha tardado demasiado. Pide disculpas y dile que le llaman en seguida para confirmarsela. NO se la des por hecha.";
  }
  if (nombre === TOOL_REGISTRAR_PEDIDO) {
    return "NO se ha podido registrar el pedido: el sistema ha tardado demasiado. Pide disculpas y dile que llame ahora al restaurante para confirmarlo con una persona. No le digas que esta cerrado.";
  }
  if (nombre === TOOL_CALCULAR_TOTAL) {
    return "No se ha podido calcular el total ahora mismo. Dile al cliente que el importe exacto se lo confirman al entregar el pedido, y sigue adelante.";
  }
  return `La herramienta "${nombre}" ha tardado demasiado y no ha dado respuesta.`;
}

/**
 * Ejecuta una herramienta con tope de tiempo y deja en el log cuanto ha
 * tardado y que se ha contestado. Nunca lanza: siempre sale una frase.
 */
async function ejecutarConLimite(
  negocio: Negocio,
  llamada: { nombre: string; argumentos: Record<string, unknown> },
  callId: string,
  telefonoLlamada: string,
): Promise<string> {
  const inicio = Date.now();
  let texto: string;

  try {
    const resultado = await conLimite(
      ejecutarHerramienta(negocio, llamada.nombre, llamada.argumentos, callId, telefonoLlamada),
      MAX_HERRAMIENTA_MS,
    );
    texto = resultado ?? mensajeDeTardanza(llamada.nombre);
  } catch (error) {
    console.error(`[herramienta] ${llamada.nombre} ha fallado`, error);
    texto = mensajeDeTardanza(llamada.nombre);
  }

  console.log(
    `[herramienta] ${llamada.nombre} (${Date.now() - inicio} ms) -> ${texto}`,
  );
  return texto;
}

async function handleToolCalls(
  message: VapiMessage,
  negocio: Negocio,
): Promise<VapiToolCallsResponse> {
  const callId = message.call?.id ?? "";
  const telefonoLlamada = telefonoDelCliente(message);
  const llamadas = normalizarLlamadas(message);

  // Si Vapi cambia otra vez la forma del mensaje, que el log lo diga claro en
  // lugar de un "herramienta sin implementar: undefined".
  if (llamadas.length === 0 || llamadas.some((l) => !l.nombre)) {
    console.warn(
      "[voice-webhook] tool-calls con un formato que no se reconoce:",
      JSON.stringify({
        toolCallList: message.toolCallList,
        toolCalls: message.toolCalls,
      }).slice(0, 2000),
    );
  }

  // En paralelo: Vapi puede mandar varias herramientas en el mismo mensaje y
  // no hay motivo para encadenarlas.
  const results = await Promise.all(
    llamadas.map(async (llamada) => ({
      toolCallId: llamada.id,
      name: llamada.nombre,
      result: await ejecutarConLimite(negocio, llamada, callId, telefonoLlamada),
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
  const inicio = Date.now();

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
  const negocio = await getNegocio(businessId);

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
        assistant: pideCitas(negocio)
          ? buildAssistantCitas(negocio, businessId)
          : buildAssistant(negocio, businessId, telefonoDelCliente(message)),
      };
      res.json(respuesta);
      return;
    }

    case "tool-calls": {
      const respuesta = await handleToolCalls(message, negocio);
      res.json(respuesta);
      console.log(
        `[voice-webhook] tool-calls respondido en ${Date.now() - inicio} ms`,
      );
      return;
    }

    case "function-call": {
      // Formato antiguo de Vapi: una sola funcion por peticion.
      const call = message.functionCall;
      if (!call) {
        res.status(400).json({ error: 'Falta "functionCall" en el mensaje.' });
        return;
      }
      res.json({
        result: await ejecutarHerramienta(
          negocio,
          call.name,
          parseArgs(call.parameters),
          message.call?.id ?? "",
        ),
      });
      return;
    }

    case "end-of-call-report":
      // Se archiva la llamada, pero la respuesta no espera a Firestore: Vapi
      // solo necesita el 200 y el archivo no debe retrasarlo.
      void guardarResumenLlamada(negocio, message as Record<string, unknown>);
      res.json({ received: true, type: message.type });
      return;

    case "status-update":
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
