/**
 * Resumen de cada llamada atendida, en /businesses/{businessId}/llamadas.
 *
 * Vapi manda un "end-of-call-report" cuando la llamada termina y acaba de
 * procesarla. Guardamos lo util para resolver una discusion del tipo "yo no
 * pedi eso": la transcripcion, cuanto duro, por que acabo y el telefono desde
 * el que llamaron.
 *
 * Sobre la grabacion de audio: solo se guarda la URL si Vapi la genero, y eso
 * depende de GRABAR_LLAMADAS. Viene apagado a proposito (ver README): grabar
 * a un cliente sin avisarle no es una decision tecnica.
 */

import { firestore } from "./firebase";
import type { Business } from "./types";

const SUBCOLECCION = "llamadas";

export interface ResumenLlamada {
  callId: string;
  businessId: string;
  /** Por que acabo: "hangup", "customer-ended-call", un error... */
  motivoFin: string;
  iniciadaEnIso: string;
  finalizadaEnIso: string;
  duracionSegundos: number;
  /** Lo que costo la llamada en dolares, tal como lo da Vapi. */
  costeUsd: number;
  /** Numero desde el que llamaron, si Vapi lo facilita. */
  telefonoCliente: string;
  /** La conversacion entera en texto. */
  transcripcion: string;
  /**
   * URL de la grabacion. Vacia si no se grabo. No es publica: para
   * descargarla hace falta la clave de la API de Vapi.
   */
  grabacionUrl: string;
  guardadoEnIso: string;
}

function texto(valor: unknown): string {
  if (typeof valor === "string") return valor;
  if (typeof valor === "number") return String(valor);
  return "";
}

function numero(valor: unknown): number {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : 0;
}

function objeto(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === "object" && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : {};
}

/**
 * Saca de la maraña del artifact la URL de la grabacion, si la hay.
 *
 * Las presignedUrl no se guardan: caducan, asi que almacenarlas seria guardar
 * un enlace roto.
 */
function urlGrabacion(artifact: Record<string, unknown>): string {
  const grabacion = objeto(artifact.recording);
  const mono = objeto(grabacion.mono);
  return (
    texto(mono.combinedUrl) ||
    texto(grabacion.stereoUrl) ||
    texto(mono.customerUrl) ||
    ""
  );
}

function segundosEntre(inicio: string, fin: string): number {
  const a = Date.parse(inicio);
  const b = Date.parse(fin);
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 1000);
}

/** Construye el resumen a partir del mensaje de Vapi, sin tocar la base. */
export function construirResumen(
  business: Business,
  message: Record<string, unknown>,
): ResumenLlamada {
  const artifact = objeto(message.artifact);
  const llamada = objeto(message.call);
  const cliente = objeto(message.customer);

  const iniciada = texto(message.startedAt) || texto(llamada.startedAt);
  const finalizada = texto(message.endedAt) || texto(llamada.endedAt);

  return {
    callId: texto(llamada.id),
    businessId: business.id,
    motivoFin: texto(message.endedReason),
    iniciadaEnIso: iniciada,
    finalizadaEnIso: finalizada,
    duracionSegundos: segundosEntre(iniciada, finalizada),
    costeUsd: numero(message.cost),
    telefonoCliente: texto(cliente.number) || texto(objeto(llamada.customer).number),
    transcripcion: texto(artifact.transcript),
    grabacionUrl: urlGrabacion(artifact),
    guardadoEnIso: new Date().toISOString(),
  };
}

/**
 * Guarda el resumen. No lanza: que falle el archivo de una llamada que ya ha
 * terminado no debe ensuciar la respuesta a Vapi.
 */
export async function guardarResumenLlamada(
  business: Business,
  message: Record<string, unknown>,
): Promise<boolean> {
  const resumen = construirResumen(business, message);

  if (!firestore) {
    console.warn(
      `[llamada] sin Firebase, no se archiva ${resumen.callId || "(sin id)"}`,
    );
    return false;
  }

  try {
    const clave =
      resumen.callId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 200) ||
      `sin-id-${Date.now()}`;

    await firestore
      .collection("businesses")
      .doc(business.id)
      .collection(SUBCOLECCION)
      .doc(clave)
      .set(resumen);

    console.log(
      `[llamada] archivada ${clave} en ${business.id}: ${resumen.duracionSegundos}s, fin "${resumen.motivoFin}"` +
        (resumen.grabacionUrl ? ", con grabacion" : ""),
    );
    return true;
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(`[llamada] no se ha podido archivar: ${motivo}`);
    return false;
  }
}
