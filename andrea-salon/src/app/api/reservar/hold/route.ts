import { z } from "zod";
import { codigoDeRaise, comprobarCuota, error, esChoqueDeHorario, leerJson, ok } from "@/lib/api";
import { AgendaInvalidaError } from "@/lib/booking";
import { crearLimitador } from "@/lib/rateLimit";
import { ReservaInvalidaError, resolverHueco } from "@/lib/reservas/disponibilidad";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/reservar/hold  { servicios, staffId | null, inicio }
 *
 * Reserva la hora durante `hold_minutes` mientras la clienta rellena sus datos. Se vuelve a
 * comprobar que el hueco existe (el que vio en pantalla puede haberse ocupado) y se elige la
 * profesional si dijo "me da igual". `book_slot()` inserta el hold bajo la restricción de exclusión:
 * si justo ahora alguien cogió esa hora, Postgres devuelve 23P01 y aquí 409 HORA_OCUPADA.
 *
 * DELETE /api/reservar/hold  { holdId }  → libera el hold al momento (la clienta vuelve atrás).
 */
export const dynamic = "force-dynamic";

const limitador = crearLimitador({ maximo: 20, ventanaMs: 10 * 60_000 });

const Cuerpo = z.object({
  servicios: z.array(z.uuid()).min(1).max(6),
  staffId: z.uuid().nullable().default(null),
  inicio: z.iso.datetime({ offset: true }),
});

export async function POST(req: Request) {
  const cuota = comprobarCuota(limitador, req);
  if (cuota) return cuota;

  const lectura = await leerJson(req, Cuerpo);
  if (!lectura.ok) return lectura.respuesta;
  const { servicios, staffId, inicio } = lectura.datos;

  try {
    const hueco = await resolverHueco({ servicios, staffId }, inicio);
    if (!hueco) return error(409, "HORA_OCUPADA", "Esa hora ya no está disponible");

    const db = getAdminClient();
    const { data: holdId, error: e } = await db.rpc("book_slot", {
      p_staff: hueco.staffId,
      p_starts: hueco.inicio.toISOString(),
      p_ends: hueco.fin.toISOString(),
      p_items: hueco.ctx.servicios.map((s) => ({
        service_id: s.id,
        name: s.name,
        duration_min: s.duration_min,
        price_cents: s.price_cents,
      })),
      p_any_staff: staffId === null,
      p_source: "web",
    });
    if (e || !holdId) {
      if (esChoqueDeHorario(e)) return error(409, "HORA_OCUPADA", "Esa hora acaba de ocuparse");
      console.error("[hold] book_slot:", e?.message, codigoDeRaise(e));
      return error(500, "ERROR_INTERNO");
    }

    const { data: fila } = await db.from("bookings").select("expires_at").eq("id", holdId).maybeSingle();
    const expiraEn = fila?.expires_at ?? new Date(Date.now() + hueco.ctx.ajustes.holdMinutes * 60_000).toISOString();

    return ok({
      holdId,
      expiraEn,
      inicio: hueco.inicio.toISOString(),
      salida: new Date(hueco.inicio.getTime() + hueco.totalMin * 60_000).toISOString(),
      duracionMin: hueco.totalMin,
      profesional: { id: hueco.staffId, nombre: hueco.ctx.nombres[hueco.staffId] ?? "" },
      servicios: hueco.ctx.servicios.map((s) => ({ id: s.id, nombre: s.name, precioCents: s.price_cents, precioDesde: s.price_is_from })),
      totalCents: hueco.ctx.servicios.reduce((t, s) => t + s.price_cents, 0),
    });
  } catch (e) {
    if (e instanceof ReservaInvalidaError) return error(400, e.codigo);
    if (e instanceof AgendaInvalidaError) return error(500, "AGENDA_INVALIDA", e.message);
    console.error("[hold]", e);
    return error(500, "ERROR_INTERNO");
  }
}

const CuerpoBorrar = z.object({ holdId: z.uuid() });

export async function DELETE(req: Request) {
  const lectura = await leerJson(req, CuerpoBorrar);
  if (!lectura.ok) return lectura.respuesta;
  // Solo holds: una cita confirmada nunca se borra por aquí aunque alguien conozca su id.
  const { error: e } = await getAdminClient().from("bookings").delete().eq("id", lectura.datos.holdId).eq("status", "hold");
  if (e) {
    console.error("[hold] delete:", e.message);
    return error(500, "ERROR_INTERNO");
  }
  return ok({ ok: true });
}
