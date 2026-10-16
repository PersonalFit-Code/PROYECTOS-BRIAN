import "server-only";

import { desplazarFechaLocal, descomponerFechaLocal, diaSemanaIso, instanteEnZona, minutosDeHhMm } from "@/lib/booking";
import { ZONA_SALON } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus, StaffHoursRow } from "@/lib/supabase/types";
import type { Sesion } from "./sesion";

/**
 * Lecturas de la agenda para el panel. Van con el cliente CON SESIÓN: RLS decide qué ve cada una
 * (una empleada solo recibe sus citas aunque se pida el salón entero). Aquí solo se da forma.
 */
export interface CitaAgenda {
  id: string;
  staffId: string;
  inicio: string;
  fin: string;
  estado: BookingStatus;
  fuente: string;
  clienta: { id: string; nombre: string; telefono: string | null } | null;
  servicios: string[];
  totalCents: number;
  asistenciaConfirmada: boolean;
  notas: string | null;
}

export interface ColumnaAgenda {
  id: string;
  nombre: string;
  color: string;
  franjas: { desde: number; hasta: number }[];
}

export interface AusenciaAgenda {
  id: string;
  staffId: string | null;
  inicio: string;
  fin: string;
  motivo: string | null;
}

export interface Agenda {
  desde: string;
  hasta: string;
  columnas: ColumnaAgenda[];
  citas: CitaAgenda[];
  ausencias: AusenciaAgenda[];
  /** Minutos desde medianoche del primer y último borde de horario (para dibujar la rejilla). */
  abre: number;
  cierra: number;
}

/** Inicio (00:00 local) de una fecha civil y del día `dias` después. */
export function rangoDias(fecha: string, dias = 1): { desde: Date; hasta: Date } {
  const a = descomponerFechaLocal(fecha);
  const fin = descomponerFechaLocal(desplazarFechaLocal(fecha, dias));
  return {
    desde: instanteEnZona(a.anio, a.mes, a.dia, 0, 0, ZONA_SALON),
    hasta: instanteEnZona(fin.anio, fin.mes, fin.dia, 0, 0, ZONA_SALON),
  };
}

export async function cargarAgenda(
  sesion: Sesion,
  fecha: string,
  opciones: { dias?: number; staffId?: string | null } = {},
): Promise<Agenda> {
  const dias = opciones.dias ?? 1;
  const { desde, hasta } = rangoDias(fecha, dias);
  const db = await createClient();
  // Una empleada ve su columna; la dueña, todas o la que elija.
  const soloStaff = sesion.role === "owner" ? (opciones.staffId ?? null) : sesion.staffId;

  let qStaff = db.from("staff").select("id, name, color, position").eq("active", true).order("position");
  if (soloStaff) qStaff = qStaff.eq("id", soloStaff);
  let qCitas = db
    .from("bookings")
    .select("id, staff_id, starts_at, ends_at, status, source, client_confirmed_at, total_cents, notes, client_id, booking_items(name, position, price_cents), clients(id, name, phone)")
    .in("status", ["confirmed", "done", "no_show"])
    .gte("starts_at", desde.toISOString())
    .lt("starts_at", hasta.toISOString())
    .order("starts_at");
  if (soloStaff) qCitas = qCitas.eq("staff_id", soloStaff);

  const [staff, citas, horas, ausencias] = await Promise.all([
    qStaff,
    qCitas,
    db.from("staff_hours").select("*"),
    db
      .from("time_off")
      .select("id, staff_id, starts_at, ends_at, reason")
      .lt("starts_at", hasta.toISOString())
      .gt("ends_at", desde.toISOString()),
  ]);
  for (const r of [staff, citas, horas, ausencias]) {
    if (r.error) throw new Error(`No se pudo cargar la agenda: ${r.error.message}`);
  }

  const dia = diaSemanaIso(fecha);
  const horasDe = (id: string) =>
    ((horas.data ?? []) as StaffHoursRow[])
      .filter((h) => h.staff_id === id && (dias > 1 || h.weekday === dia))
      .map((h) => ({ desde: minutosDeHhMm(h.start_time.slice(0, 5)), hasta: minutosDeHhMm(h.end_time.slice(0, 5)) }));

  const columnas: ColumnaAgenda[] = (staff.data ?? []).map((s) => ({ id: s.id, nombre: s.name, color: s.color, franjas: horasDe(s.id) }));
  const bordes = columnas.flatMap((c) => c.franjas);
  const abre = Math.min(9 * 60, ...bordes.map((b) => b.desde));
  const cierra = Math.max(20 * 60, ...bordes.map((b) => b.hasta));

  return {
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
    columnas,
    abre: Math.floor(abre / 60) * 60,
    cierra: Math.ceil(cierra / 60) * 60,
    citas: (citas.data ?? []).map((c) => {
      const items = [...((c.booking_items as { name: string; position: number; price_cents: number }[] | null) ?? [])].sort((a, b) => a.position - b.position);
      const cl = c.clients as { id: string; name: string; phone: string | null } | null;
      return {
        id: c.id,
        staffId: c.staff_id,
        inicio: c.starts_at,
        fin: c.ends_at,
        estado: c.status,
        fuente: c.source,
        clienta: cl ? { id: cl.id, nombre: cl.name, telefono: cl.phone } : null,
        servicios: items.map((i) => i.name),
        totalCents: c.total_cents ?? items.reduce((t, i) => t + i.price_cents, 0),
        asistenciaConfirmada: c.client_confirmed_at !== null,
        notas: c.notes,
      };
    }),
    ausencias: (ausencias.data ?? []).map((a) => ({ id: a.id, staffId: a.staff_id, inicio: a.starts_at, fin: a.ends_at, motivo: a.reason })),
  };
}

/** Lo cobrado en un rango (RLS: la empleada ve lo de sus citas). */
export async function cobradoEntre(desde: Date, hasta: Date): Promise<{ totalCents: number; propinasCents: number; cobros: number }> {
  const db = await createClient();
  const { data, error } = await db
    .from("payments")
    .select("amount_cents, tip_cents, kind")
    .gte("paid_at", desde.toISOString())
    .lt("paid_at", hasta.toISOString());
  if (error) throw new Error(error.message);
  let totalCents = 0;
  let propinasCents = 0;
  for (const p of data ?? []) {
    const signo = p.kind === "refund" ? -1 : 1;
    totalCents += signo * p.amount_cents;
    propinasCents += p.tip_cents;
  }
  return { totalCents, propinasCents, cobros: data?.length ?? 0 };
}
