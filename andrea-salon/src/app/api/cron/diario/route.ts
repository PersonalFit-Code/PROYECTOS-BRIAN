import { timingSafeEqual } from "node:crypto";
import { error, ok } from "@/lib/api";
import { desplazarFechaLocal, fechaLocal, instanteEnZona } from "@/lib/booking";
import { getAjustes } from "@/lib/reservas/ajustes";
import { enviarRecordatorio, reenviarNotificacion } from "@/lib/reservas/correos";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/diario — lo lanza Vercel Cron (ver vercel.json: 5 9 * * * UTC ≈ 10:05/11:05 hora de
 * Ourense) con `Authorization: Bearer $CRON_SECRET`. Se puede lanzar a mano con curl para probar.
 *
 * Es idempotente de punta a punta: `queue_notification()` no apunta dos veces el mismo
 * recordatorio, así que ejecutarlo dos veces el mismo día no manda dos correos.
 *
 * Tareas:
 *  1. Borrar holds caducados (book_slot ya lo hace al reservar; esto limpia los días sin reservas).
 *  2. Recordatorio de las citas confirmadas de MAÑANA (día civil del salón).
 *  3. Reintentar las notificaciones que quedaron en `failed` (menos de 3 intentos, última semana).
 *  4. Marcar como caducados los bonos vencidos. (Los avisos de "caduca en 30 días" llegan en la
 *     fase 2 con la plantilla BonoCaduca.)
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function autorizado(req: Request): boolean {
  const secreto = process.env.CRON_SECRET;
  const cabecera = req.headers.get("authorization") ?? "";
  if (!secreto || !cabecera.startsWith("Bearer ")) return false;
  const a = Buffer.from(cabecera.slice(7));
  const b = Buffer.from(secreto);
  return a.length === b.length && timingSafeEqual(a, b);
}

interface Recuento {
  enviados: number;
  duplicados: number;
  fallidos: number;
  errores: string[];
}

function anotar(r: Recuento, resultado: { ok: true; duplicado?: boolean } | { ok: false; error: string }) {
  if (resultado.ok) {
    if (resultado.duplicado) r.duplicados++;
    else r.enviados++;
  } else {
    r.fallidos++;
    if (r.errores.length < 10) r.errores.push(resultado.error);
  }
}

export async function GET(req: Request) {
  if (!autorizado(req)) return error(401, "NO_AUTORIZADO");

  const db = getAdminClient();
  const ahora = new Date();
  const ajustes = await getAjustes();
  const zona = ajustes.timezone;

  // 1. Holds caducados.
  const { data: holds, error: eHolds } = await db
    .from("bookings")
    .delete()
    .eq("status", "hold")
    .lt("expires_at", ahora.toISOString())
    .select("id");
  if (eHolds) console.error("[cron] holds:", eHolds.message);

  // 2. Recordatorios de mañana: de las 00:00 de mañana a las 00:00 de pasado, en hora local.
  const hoy = fechaLocal(ahora, zona);
  const manana = desplazarFechaLocal(hoy, 1);
  const pasado = desplazarFechaLocal(hoy, 2);
  const [am, mm, dm] = manana.split("-").map(Number);
  const [ap, mp, dp] = pasado.split("-").map(Number);
  const desde = instanteEnZona(am, mm, dm, 0, 0, zona);
  const hasta = instanteEnZona(ap, mp, dp, 0, 0, zona);

  const recordatorios: Recuento = { enviados: 0, duplicados: 0, fallidos: 0, errores: [] };
  const { data: citas, error: eCitas } = await db
    .from("bookings")
    .select("id")
    .eq("status", "confirmed")
    .gte("starts_at", desde.toISOString())
    .lt("starts_at", hasta.toISOString());
  if (eCitas) console.error("[cron] citas de mañana:", eCitas.message);
  for (const cita of citas ?? []) {
    anotar(recordatorios, await enviarRecordatorio(cita.id));
  }

  // 3. Reintentos.
  const reintentos: Recuento = { enviados: 0, duplicados: 0, fallidos: 0, errores: [] };
  const haceUnaSemana = new Date(ahora.getTime() - 7 * 86_400_000).toISOString();
  const { data: fallidas, error: eFallidas } = await db
    .from("notifications")
    .select("*")
    .eq("status", "failed")
    .lt("attempts", 3)
    .gte("created_at", haceUnaSemana)
    .order("created_at")
    .limit(50);
  if (eFallidas) console.error("[cron] fallidas:", eFallidas.message);
  for (const n of fallidas ?? []) {
    anotar(reintentos, await reenviarNotificacion(n));
  }

  // 4. Bonos vencidos.
  const { data: vencidos, error: eBonos } = await db
    .from("vouchers")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("expires_at", ahora.toISOString())
    .select("id");
  if (eBonos) console.error("[cron] bonos:", eBonos.message);

  return ok({
    ejecutado: ahora.toISOString(),
    dia: manana,
    holdsBorrados: holds?.length ?? 0,
    recordatorios,
    reintentos,
    bonosVencidos: vencidos?.length ?? 0,
  });
}
