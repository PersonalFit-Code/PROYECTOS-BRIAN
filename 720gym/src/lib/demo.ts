"use client";

/**
 * ALMACÉN DE LA DEMO (en el navegador). Reservas, solicitudes del formulario y conversaciones del
 * asistente se guardan en localStorage para que, en la reunión, lo que se hace en la web aparezca
 * al momento en el panel de gestión (/panel) del mismo dispositivo.
 *
 * En la versión de producción esto vive en una base de datos (Supabase, como en Andrea Salón) con
 * acceso protegido: las funciones de aquí son la misma interfaz, cambiando el almacenamiento.
 */
import { useSyncExternalStore } from "react";

export interface Reserva {
  id: string;
  clave: string; // dia|hora|clase
  clase: string;
  dia: string;
  hora: string;
  nombre: string;
  telefono: string;
  creada: string;
}
export interface Solicitud {
  id: string;
  tipo: "prueba" | "inscripcion" | "entrada";
  nombre: string;
  telefono: string;
  email?: string;
  actividad?: string;
  plan?: string;
  fecha?: string;
  hora?: string;
  comentario?: string;
  creada: string;
}
export interface Pago {
  id: string;
  planId: string;
  concepto: string;
  importe: number;
  mensual: boolean;
  nombre: string;
  telefono: string;
  email?: string;
  metodo: string;
  creada: string;
}
export interface MensajeChat {
  rol: "usuario" | "asistente";
  texto: string;
}
export interface Conversacion {
  id: string;
  inicio: string;
  mensajes: MensajeChat[];
}

/** Ficha que el asistente rellena solo con lo que cuenta el cliente (salida estructurada). */
export interface FichaLead {
  id: string;
  conversacion: string;
  nombre?: string;
  telefono?: string;
  objetivo: string;
  disponibilidad?: string;
  plan_recomendado?: string;
  temperatura: "frio" | "templado" | "caliente";
  siguiente_paso: string;
  idioma: string;
  resumen: string;
  creada: string;
}
/** Aviso del asistente a la gerencia (duda seria, queja, venta grande). */
export interface AlertaGerente {
  id: string;
  conversacion: string;
  motivo: "venta_grande" | "queja" | "duda_compleja" | "lesion_o_salud" | "otro";
  urgencia: "normal" | "alta";
  resumen: string;
  nombre?: string;
  telefono?: string;
  creada: string;
}
/** Plan de 4 semanas generado por el asistente (imán de clientes potenciales). */
export interface PlanSemanas {
  id: string;
  conversacion: string;
  nombre: string;
  telefono: string;
  objetivo: string;
  nivel: string;
  dias_por_semana: number;
  semanas: { semana: number; enfoque: string; sesiones: { dia: string; titulo: string; ejercicios: string[] }[] }[];
  consejos: string[];
  creada: string;
}

const CLAVES = {
  reservas: "720demo:reservas",
  solicitudes: "720demo:solicitudes",
  chats: "720demo:chats",
  pagos: "720demo:pagos",
  fichas: "720demo:fichas",
  alertas: "720demo:alertas",
  planes: "720demo:planes",
} as const;
type Clave = keyof typeof CLAVES;
const EVENTO = "720demo";

const cache = new Map<string, { crudo: string | null; valor: unknown[] }>();
const VACIO: unknown[] = [];

function leer<T>(clave: Clave): T[] {
  let crudo: string | null = null;
  try {
    crudo = localStorage.getItem(CLAVES[clave]);
  } catch {}
  const c = cache.get(clave);
  if (c && c.crudo === crudo) return c.valor as T[];
  let valor: unknown[] = VACIO;
  try {
    valor = crudo ? (JSON.parse(crudo) as unknown[]) : VACIO;
  } catch {}
  cache.set(clave, { crudo, valor });
  return valor as T[];
}

function escribir<T>(clave: Clave, lista: T[]) {
  try {
    localStorage.setItem(CLAVES[clave], JSON.stringify(lista.slice(-200)));
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

function suscribir(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(EVENTO, aviso);
    window.removeEventListener("storage", aviso);
  };
}

export function useDemo<T>(clave: Clave): T[] {
  return useSyncExternalStore(
    suscribir,
    () => leer<T>(clave),
    () => VACIO as T[],
  );
}

export const nuevoId = () => Math.random().toString(36).slice(2, 10);

export function guardarReserva(r: Omit<Reserva, "id" | "creada">): Reserva {
  const completa = { ...r, id: nuevoId(), creada: new Date().toISOString() };
  escribir("reservas", [...leer<Reserva>("reservas"), completa]);
  return completa;
}
export function anularReserva(id: string) {
  escribir("reservas", leer<Reserva>("reservas").filter((r) => r.id !== id));
}
export function guardarSolicitud(s: Omit<Solicitud, "id" | "creada">) {
  escribir("solicitudes", [...leer<Solicitud>("solicitudes"), { ...s, id: nuevoId(), creada: new Date().toISOString() }]);
}
export function guardarConversacion(c: Conversacion) {
  const resto = leer<Conversacion>("chats").filter((x) => x.id !== c.id);
  escribir("chats", [...resto, c]);
}
export function guardarPago(p: Omit<Pago, "id" | "creada">): Pago {
  const completo = { ...p, id: nuevoId(), creada: new Date().toISOString() };
  escribir("pagos", [...leer<Pago>("pagos"), completo]);
  return completo;
}
/** Una ficha por conversación: cada vez que el asistente sabe algo más, la actualiza. */
export function guardarFicha(f: Omit<FichaLead, "id" | "creada">): FichaLead {
  const lista = leer<FichaLead>("fichas");
  const previa = lista.find((x) => x.conversacion === f.conversacion);
  const completa: FichaLead = { ...previa, ...f, id: previa?.id ?? nuevoId(), creada: new Date().toISOString() };
  escribir("fichas", [...lista.filter((x) => x.conversacion !== f.conversacion), completa]);
  return completa;
}
export function guardarAlerta(a: Omit<AlertaGerente, "id" | "creada">): AlertaGerente {
  const completa = { ...a, id: nuevoId(), creada: new Date().toISOString() };
  escribir("alertas", [...leer<AlertaGerente>("alertas"), completa]);
  return completa;
}
export function guardarPlan(p: Omit<PlanSemanas, "id" | "creada">): PlanSemanas {
  const completo = { ...p, id: nuevoId(), creada: new Date().toISOString() };
  escribir("planes", [...leer<PlanSemanas>("planes"), completo]);
  return completo;
}
export const leerPlanes = () => leer<PlanSemanas>("planes");
export const leerReservas = () => leer<Reserva>("reservas");

export function borrarDemo() {
  for (const k of Object.keys(CLAVES) as Clave[]) escribir(k, []);
}
