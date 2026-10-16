import "server-only";

import { desplazarFechaLocal, diaSemanaIso, fechaLocal, minutosDeHhMm } from "@/lib/booking";
import { ZONA_SALON } from "@/lib/fechas";
import type { ColumnaRejilla } from "@/components/panel/agenda/Rejilla";
import { createClient } from "@/lib/supabase/server";
import { rangoDias, type Agenda } from "./agenda";

const DIAS = ["", "lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

/** Vista día: una columna por profesional. */
export function columnasDia(agenda: Agenda, fecha: string): ColumnaRejilla[] {
  const { desde, hasta } = rangoDias(fecha);
  return agenda.columnas.map((c) => ({
    id: c.id,
    titulo: c.nombre,
    color: c.color,
    franjas: c.franjas,
    citas: agenda.citas.filter((x) => x.staffId === c.id),
    ausencias: agenda.ausencias.filter((a) => a.staffId === null || a.staffId === c.id),
    diaDesde: desde.toISOString(),
    diaHasta: hasta.toISOString(),
  }));
}

/** Vista semana de UNA profesional: una columna por día, de lunes a domingo. */
export async function columnasSemana(agenda: Agenda, lunes: string, staffId: string): Promise<ColumnaRejilla[]> {
  const db = await createClient();
  const { data: horas } = await db.from("staff_hours").select("*").eq("staff_id", staffId);
  const col = agenda.columnas.find((c) => c.id === staffId);
  return Array.from({ length: 7 }, (_, i) => {
    const fecha = desplazarFechaLocal(lunes, i);
    const { desde, hasta } = rangoDias(fecha);
    const dia = diaSemanaIso(fecha);
    return {
      id: fecha,
      titulo: `${DIAS[dia]} ${Number(fecha.slice(8))}`,
      color: col?.color ?? "#8E0E33",
      franjas: (horas ?? [])
        .filter((h) => h.weekday === dia)
        .map((h) => ({ desde: minutosDeHhMm(h.start_time.slice(0, 5)), hasta: minutosDeHhMm(h.end_time.slice(0, 5)) })),
      citas: agenda.citas.filter((x) => x.staffId === staffId && fechaLocal(new Date(x.inicio), ZONA_SALON) === fecha),
      ausencias: agenda.ausencias.filter(
        (a) => (a.staffId === null || a.staffId === staffId) && a.inicio < hasta.toISOString() && a.fin > desde.toISOString(),
      ),
      diaDesde: desde.toISOString(),
      diaHasta: hasta.toISOString(),
    };
  });
}

/** Lunes de la semana de una fecha. */
export function lunesDe(fecha: string): string {
  return desplazarFechaLocal(fecha, 1 - diaSemanaIso(fecha));
}

export function hoyLocal(): string {
  return fechaLocal(new Date(), ZONA_SALON);
}

export function fechaValida(v: string | undefined | null): string | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  try {
    diaSemanaIso(v);
    return v;
  } catch {
    return null;
  }
}
