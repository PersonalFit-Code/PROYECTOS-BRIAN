import "server-only";

import { fechaLarga, hora as horaDe } from "@/lib/fechas";
import { getAdminClient } from "@/lib/supabase/admin";
import type { BookingItemRow, BookingRow, ClientRow } from "@/lib/supabase/types";
import type { Ajustes } from "./ajustes";

/**
 * Una cita con todo lo que hace falta para enseñarla o enviarla por correo: la fila, sus servicios
 * (con nombre y precio congelados al reservar), la clienta y el nombre de la profesional.
 */
export interface CitaCompleta {
  cita: BookingRow;
  items: BookingItemRow[];
  clienta: ClientRow | null;
  profesional: { id: string; nombre: string; slug: string };
}

async function completar(cita: BookingRow): Promise<CitaCompleta> {
  const db = getAdminClient();
  const [items, clienta, staff] = await Promise.all([
    db.from("booking_items").select("*").eq("booking_id", cita.id).order("position"),
    cita.client_id ? db.from("clients").select("*").eq("id", cita.client_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    db.from("staff").select("id, name, slug").eq("id", cita.staff_id).maybeSingle(),
  ]);
  for (const r of [items, clienta, staff]) {
    if (r.error) throw new Error(`No se pudo cargar la cita: ${r.error.message}`);
  }
  return {
    cita,
    items: items.data ?? [],
    clienta: clienta.data ?? null,
    profesional: staff.data
      ? { id: staff.data.id, nombre: staff.data.name, slug: staff.data.slug }
      : { id: cita.staff_id, nombre: "", slug: "" },
  };
}

export async function cargarCita(id: string): Promise<CitaCompleta | null> {
  const db = getAdminClient();
  const { data, error } = await db.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`No se pudo cargar la cita: ${error.message}`);
  return data ? completar(data) : null;
}

/**
 * La cita VIVA de un enlace. El `manage_token` se conserva al cambiar la hora, así que puede haber
 * varias filas con el mismo token: la buena es la más reciente (la anterior queda cancelada con
 * motivo `rescheduled`).
 */
export async function cargarCitaPorToken(token: string): Promise<CitaCompleta | null> {
  const db = getAdminClient();
  const { data, error } = await db
    .from("bookings")
    .select("*")
    .eq("manage_token", token)
    .neq("status", "hold")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar la cita: ${error.message}`);
  return data ? completar(data) : null;
}

/** Minutos que la clienta pasa en el salón: suma de los servicios, sin el buffer de limpieza. */
export function duracionCliente(items: BookingItemRow[]): number {
  return items.reduce((t, i) => t + i.duration_min, 0);
}

/** Instante de salida de la clienta (lo que se le enseña; `ends_at` lleva además el buffer). */
export function salidaDe(c: CitaCompleta): Date {
  return new Date(new Date(c.cita.starts_at).getTime() + duracionCliente(c.items) * 60_000);
}

/** Hasta cuándo puede cancelar o cambiar ella sola: `cancel_hours` antes de la cita. */
export function limiteCambio(c: CitaCompleta, ajustes: Ajustes): Date {
  return new Date(new Date(c.cita.starts_at).getTime() - ajustes.cancelHours * 3_600_000);
}

export function enPlazo(c: CitaCompleta, ajustes: Ajustes, ahora = new Date()): boolean {
  return c.cita.status === "confirmed" && ahora.getTime() < limiteCambio(c, ajustes).getTime();
}

export function esFutura(c: CitaCompleta, ahora = new Date()): boolean {
  return new Date(c.cita.starts_at).getTime() > ahora.getTime();
}

/** Lo que ve la clienta (y lo que devuelve la API): nada interno, nada de otras clientas. */
export interface ResumenCita {
  id: string;
  token: string;
  estado: BookingRow["status"];
  inicio: string;
  salida: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  servicios: { id: string | null; nombre: string; duracionMin: number; precioCents: number }[];
  profesional: { id: string; nombre: string; slug: string };
  totalCents: number;
  clienta: { nombre: string; email: string | null } | null;
  asistenciaConfirmada: boolean;
  /** Aún no ha empezado (calculado en el servidor: el render del cliente no lee el reloj). */
  esFutura: boolean;
  /** Puede cancelar o cambiar ella misma (está confirmada y dentro del plazo). */
  puedeCambiar: boolean;
  limiteCambio: string;
  horasCancelacion: number;
}

export function resumen(c: CitaCompleta, ajustes: Ajustes, ahora = new Date()): ResumenCita {
  const inicio = new Date(c.cita.starts_at);
  return {
    id: c.cita.id,
    token: c.cita.manage_token,
    estado: c.cita.status,
    inicio: inicio.toISOString(),
    salida: salidaDe(c).toISOString(),
    fecha: fechaLarga(inicio, ajustes.timezone),
    hora: horaDe(inicio, ajustes.timezone),
    duracionMin: duracionCliente(c.items),
    servicios: c.items.map((i) => ({ id: i.service_id, nombre: i.name, duracionMin: i.duration_min, precioCents: i.price_cents })),
    profesional: c.profesional,
    totalCents: c.cita.total_cents ?? c.items.reduce((t, i) => t + i.price_cents, 0),
    clienta: c.clienta ? { nombre: c.clienta.name, email: c.clienta.email } : null,
    asistenciaConfirmada: c.cita.client_confirmed_at !== null,
    esFutura: esFutura(c, ahora),
    puedeCambiar: enPlazo(c, ajustes, ahora),
    limiteCambio: limiteCambio(c, ajustes).toISOString(),
    horasCancelacion: ajustes.cancelHours,
  };
}

/** "María José Pérez" → "María José" no; → "María": el primer nombre, que es como se la llama en el salón. */
export function nombreCorto(nombre: string | null | undefined): string {
  const limpio = (nombre ?? "").trim();
  if (!limpio) return "";
  return limpio.split(/\s+/)[0] ?? limpio;
}
