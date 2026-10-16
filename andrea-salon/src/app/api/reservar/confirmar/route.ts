import { after } from "next/server";
import { z } from "zod";
import { LOCALE_META, LOCALES } from "@/i18n/config";
import { comprobarCuota, error, leerJson, ok } from "@/lib/api";
import { normalizarTelefonoES } from "@/lib/phone";
import { crearLimitador } from "@/lib/rateLimit";
import { getAjustes } from "@/lib/reservas/ajustes";
import { cargarCita, resumen } from "@/lib/reservas/citas";
import { enviarConfirmacion } from "@/lib/reservas/correos";
import { urlCita } from "@/lib/reservas/enlaces";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/reservar/confirmar  { holdId, nombre, telefono, email, notas?, condiciones, privacidad, marketing? }
 *
 * Pasa el hold a cita confirmada con los datos de la clienta (`confirm_hold()` crea o reutiliza su
 * ficha por teléfono). Si el hold caducó mientras escribía, 410 HOLD_CADUCADO y el asistente la
 * devuelve al paso de la hora. El correo de confirmación sale DESPUÉS de responder (`after`): la
 * clienta no espera a Resend, y si el correo falla la cita existe igual y queda apuntado en
 * `notifications` para el reintento del cron.
 */
export const dynamic = "force-dynamic";

const limitador = crearLimitador({ maximo: 10, ventanaMs: 10 * 60_000 });

const Cuerpo = z.object({
  holdId: z.uuid(),
  nombre: z.string().trim().min(2).max(80),
  telefono: z.string().trim().min(9).max(24),
  email: z.email().trim().max(120),
  notas: z.string().trim().max(500).optional().default(""),
  // Las dos casillas son obligatorias y no pueden venir marcadas por defecto: literal true.
  condiciones: z.literal(true),
  privacidad: z.literal(true),
  marketing: z.boolean().optional().default(false),
  locale: z.enum(LOCALES).optional().default("es"),
});

export async function POST(req: Request) {
  const cuota = comprobarCuota(limitador, req);
  if (cuota) return cuota;

  const lectura = await leerJson(req, Cuerpo);
  if (!lectura.ok) return lectura.respuesta;
  const d = lectura.datos;

  const telefono = normalizarTelefonoES(d.telefono);
  if (!telefono) return error(400, "TELEFONO_INVALIDO", "Hace falta un móvil o fijo español");

  try {
    const db = getAdminClient();
    const { data, error: e } = await db.rpc("confirm_hold", {
      p_booking: d.holdId,
      p_name: d.nombre,
      p_phone: telefono,
      p_email: d.email.toLowerCase(),
      p_notes: d.notas || null,
      p_marketing: d.marketing,
    });
    if (e) {
      console.error("[confirmar] confirm_hold:", e.message);
      return error(500, "ERROR_INTERNO");
    }
    // Una función que devuelve una fila nula llega como objeto con todo a null.
    if (!data || !data.id) return error(410, "HOLD_CADUCADO", "La reserva temporal ha caducado");

    const bookingId = data.id;
    after(async () => {
      const r = await enviarConfirmacion(bookingId);
      if (!r.ok) console.error("[confirmar] correo:", r.error);
    });

    const [cita, ajustes] = await Promise.all([cargarCita(bookingId), getAjustes()]);
    return ok({
      ok: true,
      cita: cita ? resumen(cita, ajustes, new Date(), LOCALE_META[d.locale].intl) : null,
      urlCita: urlCita(data.manage_token, d.locale),
    });
  } catch (e) {
    console.error("[confirmar]", e);
    return error(500, "ERROR_INTERNO");
  }
}
