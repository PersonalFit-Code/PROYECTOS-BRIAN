import { z } from "zod";
import { comprobarCuota, error, leerQuery, ok } from "@/lib/api";
import { AgendaInvalidaError } from "@/lib/booking";
import { crearLimitador } from "@/lib/rateLimit";
import { diasDisponibles, huecosDe, ReservaInvalidaError, type Contexto } from "@/lib/reservas/disponibilidad";

/**
 * GET /api/reservar/disponibilidad?servicios=<uuid>,<uuid>&con=<uuid|vacío>[&fecha=YYYY-MM-DD]
 *
 * Sin `fecha`: los días del horizonte con algún hueco (para pintar el calendario) más lo que el
 * asistente necesita enseñar del resumen (duración y precio). Con `fecha`: las horas de ese día.
 * Todo lo calcula el motor puro de `lib/booking` con lo que hay en la base de datos; aquí solo se
 * valida la entrada y se traduce el resultado.
 */
export const dynamic = "force-dynamic";

// Cada cambio de día o de servicio es una petición; una persona normal hace unas decenas por reserva.
const limitador = crearLimitador({ maximo: 120, ventanaMs: 60_000 });

const Query = z.object({
  servicios: z
    .string()
    .transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean))
    .pipe(z.array(z.uuid()).min(1).max(6).refine((l) => new Set(l).size === l.length, "Servicio repetido")),
  con: z.union([z.uuid(), z.literal("")]).optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

function profesionales(ctx: Contexto) {
  return ctx.candidatas.map((p) => ({ id: p.id, nombre: ctx.nombres[p.id] ?? "" }));
}

function resumenServicios(ctx: Contexto) {
  return {
    duracionMin: ctx.servicios.reduce((t, s) => t + s.duration_min, 0),
    totalCents: ctx.servicios.reduce((t, s) => t + s.price_cents, 0),
    precioDesde: ctx.servicios.some((s) => s.price_is_from),
  };
}

export async function GET(req: Request) {
  const cuota = comprobarCuota(limitador, req);
  if (cuota) return cuota;

  const lectura = leerQuery(new URL(req.url), Query);
  if (!lectura.ok) return lectura.respuesta;
  const { servicios, con, fecha } = lectura.datos;
  const peticion = { servicios, staffId: con || null };

  try {
    if (fecha) {
      const { huecos, ctx } = await huecosDe(peticion, fecha);
      return ok({ fecha, huecos, profesionales: profesionales(ctx), ...resumenServicios(ctx) });
    }
    const { dias, ctx } = await diasDisponibles(peticion);
    return ok({
      dias,
      horizonteDias: ctx.ajustes.horizonDays,
      profesionales: profesionales(ctx),
      ...resumenServicios(ctx),
    });
  } catch (e) {
    if (e instanceof ReservaInvalidaError) return error(400, e.codigo);
    if (e instanceof AgendaInvalidaError) {
      // Horario mal metido desde el panel: no es culpa de la clienta, pero hay que verlo en los logs.
      console.error("[disponibilidad] agenda inválida:", e.message);
      return error(500, "AGENDA_INVALIDA", e.message);
    }
    console.error("[disponibilidad]", e);
    return error(500, "ERROR_INTERNO");
  }
}
