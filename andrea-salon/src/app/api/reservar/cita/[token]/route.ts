import { after } from "next/server";
import { z } from "zod";
import { comprobarCuota, error, leerJson, ok } from "@/lib/api";
import { crearLimitador } from "@/lib/rateLimit";
import { getAjustes } from "@/lib/reservas/ajustes";
import { cargarCitaPorToken, enPlazo, esFutura, resumen } from "@/lib/reservas/citas";
import { enviarCancelacion } from "@/lib/reservas/correos";
import { tokenValido } from "@/lib/reservas/enlaces";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * La cita de la clienta, por el enlace del correo: `cita/<manage_token>?t=<firma>`.
 *
 *   GET  ?t=…                      → resumen (lo usa la página y el asistente en modo "cambiar")
 *   POST { t, accion }             → "si-voy" | "cancelar" | "no-puedo"
 *
 * Un token sin firma válida es un 404, no un 403: no se confirma ni que exista. Las acciones van
 * por POST a propósito: los escáneres de enlaces del correo (Outlook, Gmail) ABREN los enlaces, y
 * si cancelar fuera un GET, una cita se cancelaría sola al llegar el correo. La página pide un toque.
 *
 * "cancelar" respeta el plazo (`cancel_hours`). "no puedo ir", el botón del recordatorio del día
 * antes, NO: siempre es mejor que el salón se entere a tiempo que una falta sin aviso. Queda
 * registrado con su motivo para que Andrea lo vea.
 */
export const dynamic = "force-dynamic";

const limitador = crearLimitador({ maximo: 30, ventanaMs: 10 * 60_000 });
const UUID = z.uuid();
const Cuerpo = z.object({
  t: z.string().min(1).max(128),
  accion: z.enum(["si-voy", "cancelar", "no-puedo"]),
});

type Params = { params: Promise<{ token: string }> };

async function citaDe(token: string, firma: string | null) {
  if (!UUID.safeParse(token).success || !tokenValido(token, firma)) return null;
  return cargarCitaPorToken(token);
}

export async function GET(req: Request, { params }: Params) {
  const cuota = comprobarCuota(limitador, req);
  if (cuota) return cuota;
  const { token } = await params;
  try {
    const c = await citaDe(token, new URL(req.url).searchParams.get("t"));
    if (!c) return error(404, "ENLACE_INVALIDO");
    return ok({ cita: resumen(c, await getAjustes()) });
  } catch (e) {
    console.error("[cita] GET", e);
    return error(500, "ERROR_INTERNO");
  }
}

export async function POST(req: Request, { params }: Params) {
  const cuota = comprobarCuota(limitador, req);
  if (cuota) return cuota;
  const { token } = await params;
  const lectura = await leerJson(req, Cuerpo);
  if (!lectura.ok) return lectura.respuesta;
  const { t, accion } = lectura.datos;

  try {
    const c = await citaDe(token, t);
    if (!c) return error(404, "ENLACE_INVALIDO");
    const ajustes = await getAjustes();
    const db = getAdminClient();

    if (c.cita.status !== "confirmed" || !esFutura(c)) {
      return error(409, "CITA_NO_MODIFICABLE", `La cita está ${c.cita.status}`, { cita: resumen(c, ajustes) });
    }

    if (accion === "si-voy") {
      if (!c.cita.client_confirmed_at) {
        const { error: e } = await db.from("bookings").update({ client_confirmed_at: new Date().toISOString() }).eq("id", c.cita.id);
        if (e) throw new Error(e.message);
      }
      const actual = await cargarCitaPorToken(token);
      return ok({ ok: true, cita: actual ? resumen(actual, ajustes) : null });
    }

    if (accion === "cancelar" && !enPlazo(c, ajustes)) {
      return error(409, "FUERA_DE_PLAZO", `Se puede cancelar hasta ${ajustes.cancelHours} h antes`, { cita: resumen(c, ajustes) });
    }

    const { error: e } = await db
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: "client",
        cancel_reason: accion === "no-puedo" ? "no_puedo_recordatorio" : "cancelada_por_la_clienta",
      })
      .eq("id", c.cita.id)
      .eq("status", "confirmed");
    if (e) throw new Error(e.message);

    const bookingId = c.cita.id;
    after(async () => {
      const r = await enviarCancelacion(bookingId, false);
      if (!r.ok) console.error("[cita] correo cancelación:", r.error);
    });

    const actual = await cargarCitaPorToken(token);
    return ok({ ok: true, cita: actual ? resumen(actual, ajustes) : null });
  } catch (e) {
    console.error("[cita] POST", e);
    return error(500, "ERROR_INTERNO");
  }
}
