import { after } from "next/server";
import { z } from "zod";
import { LOCALES } from "@/i18n/config";
import { codigoDeRaise, comprobarCuota, error, esChoqueDeHorario, leerJson, ok } from "@/lib/api";
import { AgendaInvalidaError } from "@/lib/booking";
import { crearLimitador } from "@/lib/rateLimit";
import { getAjustes } from "@/lib/reservas/ajustes";
import { cargarCita, cargarCitaPorToken, enPlazo, resumen } from "@/lib/reservas/citas";
import { enviarCambio } from "@/lib/reservas/correos";
import { ReservaInvalidaError, resolverHueco } from "@/lib/reservas/disponibilidad";
import { tokenValido, urlCita } from "@/lib/reservas/enlaces";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/reservar/cambiar  { token, t, inicio, staffId | null }
 *
 * Mueve una cita confirmada a otra hora con los MISMOS servicios. `reschedule_booking()` cancela
 * la vieja y crea la nueva en una transacción: si la nueva hora choca, no cambia nada y la cita
 * original sigue en pie. El enlace (manage_token) se conserva, así que el correo antiguo sigue
 * abriendo la cita buena.
 */
export const dynamic = "force-dynamic";

const limitador = crearLimitador({ maximo: 15, ventanaMs: 10 * 60_000 });

const Cuerpo = z.object({
  token: z.uuid(),
  t: z.string().min(1).max(128),
  inicio: z.iso.datetime({ offset: true }),
  staffId: z.uuid().nullable().default(null),
  locale: z.enum(LOCALES).optional().default("es"),
});

export async function POST(req: Request) {
  const cuota = comprobarCuota(limitador, req);
  if (cuota) return cuota;

  const lectura = await leerJson(req, Cuerpo);
  if (!lectura.ok) return lectura.respuesta;
  const { token, t, inicio, staffId, locale } = lectura.datos;

  try {
    if (!tokenValido(token, t)) return error(404, "ENLACE_INVALIDO");
    const c = await cargarCitaPorToken(token);
    if (!c) return error(404, "ENLACE_INVALIDO");
    const ajustes = await getAjustes();
    if (c.cita.status !== "confirmed") return error(409, "CITA_NO_MODIFICABLE", undefined, { cita: resumen(c, ajustes) });
    if (!enPlazo(c, ajustes)) return error(409, "FUERA_DE_PLAZO", undefined, { cita: resumen(c, ajustes) });

    // Un servicio que ya no existe en el catálogo no se puede recolocar: que llame al salón.
    const servicios = c.items.map((i) => i.service_id);
    if (servicios.some((s) => s === null)) return error(409, "CITA_NO_MODIFICABLE", "Servicio retirado del catálogo");

    const hueco = await resolverHueco({ servicios: servicios as string[], staffId }, inicio);
    if (!hueco) return error(409, "HORA_OCUPADA");

    const db = getAdminClient();
    const { data, error: e } = await db.rpc("reschedule_booking", {
      p_old: c.cita.id,
      p_staff: hueco.staffId,
      p_starts: hueco.inicio.toISOString(),
      p_ends: hueco.fin.toISOString(),
      p_by: "client",
    });
    if (e || !data) {
      if (esChoqueDeHorario(e)) return error(409, "HORA_OCUPADA", "Esa hora acaba de ocuparse");
      if (codigoDeRaise(e) === "CITA_NO_MODIFICABLE") return error(409, "CITA_NO_MODIFICABLE");
      console.error("[cambiar] reschedule_booking:", e?.message);
      return error(500, "ERROR_INTERNO");
    }

    const nuevaId = data.id;
    after(async () => {
      const r = await enviarCambio(nuevaId);
      if (!r.ok) console.error("[cambiar] correo:", r.error);
    });

    const nueva = await cargarCita(nuevaId);
    return ok({ ok: true, cita: nueva ? resumen(nueva, ajustes) : null, urlCita: urlCita(token, locale) });
  } catch (e) {
    if (e instanceof ReservaInvalidaError) return error(400, e.codigo);
    if (e instanceof AgendaInvalidaError) return error(500, "AGENDA_INVALIDA", e.message);
    console.error("[cambiar]", e);
    return error(500, "ERROR_INTERNO");
  }
}
