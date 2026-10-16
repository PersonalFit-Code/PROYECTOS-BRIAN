import "server-only";

import { ZONA_SALON } from "@/lib/fechas";
import { getAdminClient } from "@/lib/supabase/admin";
import { limites, type Entrada, type Periodo } from "./calcular";

/**
 * Lee de la base de datos lo que necesita `calcular.ts` para un periodo. Con la clave de servicio:
 * SOLO se llama desde páginas y rutas de la dueña, que ya han pasado `requireOwner()` — las
 * métricas por empleada no las ve nadie más (LEGAL.md §2).
 */
export async function cargarEntrada(periodo: Periodo): Promise<Entrada> {
  const { desde, hasta } = limites(periodo, ZONA_SALON);
  const db = getAdminClient();
  const [citas, pagos, franjas, ausencias, staff] = await Promise.all([
    db
      .from("bookings")
      .select("starts_at, ends_at, status, staff_id, client_id, booking_items(name, price_cents)")
      .neq("status", "hold")
      .gte("starts_at", desde.toISOString())
      .lt("starts_at", hasta.toISOString()),
    db
      .from("payments")
      .select("paid_at, kind, method, amount_cents, tip_cents, bookings(staff_id)")
      .gte("paid_at", desde.toISOString())
      .lt("paid_at", hasta.toISOString()),
    db.from("staff_hours").select("staff_id, weekday, start_time, end_time"),
    db
      .from("time_off")
      .select("staff_id, starts_at, ends_at")
      .lt("starts_at", hasta.toISOString())
      .gt("ends_at", desde.toISOString()),
    db.from("staff").select("id, name, active").order("position"),
  ]);
  for (const r of [citas, pagos, franjas, ausencias, staff]) {
    if (r.error) throw new Error(`No se pudo cargar la analítica: ${r.error.message}`);
  }

  const activas = new Set((staff.data ?? []).filter((s) => s.active).map((s) => s.id));
  return {
    periodo,
    zona: ZONA_SALON,
    citas: (citas.data ?? []).map((c) => ({
      inicio: c.starts_at,
      fin: c.ends_at,
      estado: c.status,
      staffId: c.staff_id,
      clientaId: c.client_id,
      servicios: ((c.booking_items as { name: string; price_cents: number }[] | null) ?? []).map((i) => ({ nombre: i.name, precioCents: i.price_cents })),
    })),
    pagos: (pagos.data ?? []).map((p) => ({
      fecha: p.paid_at,
      tipo: p.kind,
      metodo: p.method,
      importeCents: p.amount_cents,
      propinaCents: p.tip_cents,
      staffId: (p.bookings as { staff_id: string } | null)?.staff_id ?? null,
    })),
    // La capacidad solo cuenta a quien sigue activa; una que se fue no "deja horas libres".
    franjas: (franjas.data ?? [])
      .filter((f) => activas.has(f.staff_id))
      .map((f) => ({ staffId: f.staff_id, dia: f.weekday, desde: f.start_time.slice(0, 5), hasta: f.end_time.slice(0, 5) })),
    ausencias: (ausencias.data ?? []).map((a) => ({ staffId: a.staff_id, inicio: a.starts_at, fin: a.ends_at })),
    // Las inactivas siguen apareciendo si tuvieron citas en el periodo (sus cifras son reales).
    staff: (staff.data ?? [])
      .filter((s) => activas.has(s.id) || (citas.data ?? []).some((c) => c.staff_id === s.id))
      .map((s) => ({ id: s.id, nombre: s.name })),
  };
}
