/**
 * Reservas de mesa y recados, en /businesses/{id}/reservas y /recados.
 *
 * Para la demo basta con que queden apuntados y se vean en el panel; no se
 * conectan todavia al programa de reservas del restaurante.
 *
 * Una llamada, una reserva: el documento lleva el identificador de la llamada
 * como clave, asi que si el cliente corrige la hora y el agente vuelve a
 * llamar a la herramienta, se sobrescribe la misma reserva en lugar de dejar
 * dos. Con los recados igual.
 *
 * Sin Firestore se guardan en memoria, para que la demo funcione tambien sin
 * base de datos. Se pierden al reiniciar el servidor, y el log lo dice.
 */

import { FieldValue } from "firebase-admin/firestore";

import { firestore } from "./firebase";

/** "confirmada": hasta el maximo de personas. "pendiente": la confirma el restaurante. */
export type EstadoReserva = "confirmada" | "pendiente";

export interface Reserva {
  businessId: string;
  /** Fecha local, "2026-11-28". */
  fecha: string;
  /** Hora local, "19:30". */
  hora: string;
  personas: number;
  nombre: string;
  telefono: string;
  notas: string;
  /** Idioma en el que hablo el cliente, para que el restaurante le llame en ese. */
  idioma: string;
  estado: EstadoReserva;
  callId: string;
  creadoEnIso: string;
}

export interface Recado {
  businessId: string;
  nombre: string;
  telefono: string;
  mensaje: string;
  idioma: string;
  callId: string;
  creadoEnIso: string;
}

export type ConId<T> = T & { docId: string };

const RESERVAS = "reservas";
const RECADOS = "recados";

/** Lo que se guarda en memoria cuando no hay Firestore, por negocio. */
const enMemoria = {
  reservas: new Map<string, Map<string, Reserva>>(),
  recados: new Map<string, Map<string, Recado>>(),
};

let contador = 0;

/** El identificador del documento: la llamada, o uno nuevo si no la hay. */
function claveDe(callId: string): string {
  const limpia = callId.trim().replace(/[/\s]/g, "_").slice(0, 200);
  if (limpia) return limpia;
  contador += 1;
  return `sin-llamada-${Date.now()}-${contador}`;
}

async function guardar<T extends { businessId: string; callId: string }>(
  subcoleccion: typeof RESERVAS | typeof RECADOS,
  memoria: Map<string, Map<string, T>>,
  dato: T,
): Promise<string> {
  const clave = claveDe(dato.callId);

  if (!firestore) {
    const delNegocio = memoria.get(dato.businessId) ?? new Map<string, T>();
    delNegocio.set(clave, dato);
    memoria.set(dato.businessId, delNegocio);
    console.warn(
      `[${subcoleccion}] sin Firebase: guardado solo en memoria (se pierde al reiniciar): ${JSON.stringify(dato)}`,
    );
    return clave;
  }

  await firestore
    .collection("businesses")
    .doc(dato.businessId)
    .collection(subcoleccion)
    .doc(clave)
    .set({ ...dato, creadoEn: FieldValue.serverTimestamp() });
  console.log(`[${subcoleccion}] guardado ${clave} para ${dato.businessId}`);
  return clave;
}

export function guardarReserva(reserva: Reserva): Promise<string> {
  return guardar(RESERVAS, enMemoria.reservas, reserva);
}

export function guardarRecado(recado: Recado): Promise<string> {
  return guardar(RECADOS, enMemoria.recados, recado);
}

async function listar<T extends { creadoEnIso: string }>(
  subcoleccion: typeof RESERVAS | typeof RECADOS,
  memoria: Map<string, Map<string, T>>,
  businessId: string,
): Promise<ConId<T>[]> {
  if (!firestore) {
    return [...(memoria.get(businessId)?.entries() ?? [])]
      .map(([docId, dato]) => ({ ...dato, docId }))
      .sort((a, b) => b.creadoEnIso.localeCompare(a.creadoEnIso));
  }
  try {
    const resultado = await firestore
      .collection("businesses")
      .doc(businessId)
      .collection(subcoleccion)
      .orderBy("creadoEn", "desc")
      .limit(200)
      .get();
    return resultado.docs.map((d) => ({ ...(d.data() as T), docId: d.id }));
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(`[${subcoleccion}] no se han podido leer los de ${businessId}: ${motivo}`);
    return [];
  }
}

/** Reservas del negocio, de la mas reciente a la mas antigua. */
export function listarReservas(businessId: string): Promise<ConId<Reserva>[]> {
  return listar(RESERVAS, enMemoria.reservas, businessId);
}

/** Recados del negocio, del mas reciente al mas antiguo. */
export function listarRecados(businessId: string): Promise<ConId<Recado>[]> {
  return listar(RECADOS, enMemoria.recados, businessId);
}

/** Para los tests: vacia lo guardado en memoria. */
export function olvidarReservasEnMemoria(): void {
  enMemoria.reservas.clear();
  enMemoria.recados.clear();
}
