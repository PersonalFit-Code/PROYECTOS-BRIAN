import { autorizado, apuntarRecurrentes, fotoPatrimonio, mesCerrado } from "@/lib/cron/tareas";
import { hoy, diaSemana, nombreMes } from "@/lib/fechas";
import { generarYGuardarInforme } from "@/lib/habitos/informe";
import { actualizarPrecios } from "@/lib/inversion/precios";
import { esDiaDeMercado, evaluarResultados, generarInformeInversion, notaSemanal } from "@/lib/inversion/servicio";
import { enviarPush } from "@/lib/push";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Settings } from "@/lib/tipos";

/**
 * GET /api/cron/diario — Vercel Cron (vercel.json), cada día al cierre de los mercados europeos.
 * También se puede lanzar a mano: curl -H "Authorization: Bearer $CRON_SECRET" …/api/cron/diario
 *
 * Por cada usuario:
 *  1. Apunta los fijos y suscripciones que vencen.
 *  2. Día 1: foto del patrimonio + informe de hábitos del mes cerrado (con ideas del coach) + aviso.
 *  3. Laborables: cotizaciones → puntúa recomendaciones pasadas (7/30/90 días) → informe del día.
 *  4. Lunes: nota de aprendizaje (nuevos pesos por señal).
 * Todo es idempotente: repetirlo el mismo día no duplica nada. Un fallo en un paso no para los demás.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request): Promise<Response> {
  if (!autorizado(req)) return Response.json({ error: "No autorizado" }, { status: 401 });
  const db = getAdminClient();
  const dia = hoy();
  const informe: Record<string, unknown> = { dia };
  const errores: string[] = [];

  const { data: usuarios } = await db.from("settings").select("*");
  const lista = (usuarios ?? []) as Settings[];

  // Cotizaciones una sola vez para todos.
  if (esDiaDeMercado(dia)) {
    const { data: simbolos } = await db.from("watchlist").select("symbol").eq("quoted", true).eq("active", true);
    const todos = new Set((simbolos ?? []).map((s) => s.symbol as string));
    for (const u of lista) todos.add(u.benchmark_symbol);
    informe.precios = await actualizarPrecios(db, [...todos]);
  }
  const fallos = (informe.precios as { fallos?: string[] } | undefined)?.fallos ?? [];

  for (const u of lista) {
    const s = { db, userId: u.user_id };
    const paso = async (nombre: string, fn: () => Promise<unknown>) => {
      try {
        informe[`${nombre}:${u.user_id.slice(0, 8)}`] = await fn();
      } catch (err) {
        errores.push(`${nombre}: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    await paso("recurrentes", () => apuntarRecurrentes(s, dia));

    if (dia.endsWith("-01")) {
      await paso("patrimonio", () => fotoPatrimonio(s, dia));
      await paso("informeHabitos", async () => {
        const mes = mesCerrado(dia);
        const inf = await generarYGuardarInforme(s, mes, u);
        await enviarPush(db, u.user_id, {
          title: `Tu informe de ${nombreMes(mes)}`,
          body: `${Math.round(inf.habitos.pctGlobal)} % de hábitos cumplidos. Mira qué mejorar este mes.`,
          url: `/habitos/informe?mes=${mes}`,
        });
        return Math.round(inf.habitos.pctGlobal);
      });
    }

    if (esDiaDeMercado(dia)) {
      await paso("evaluadas", () => evaluarResultados(s, dia));
      if (diaSemana(dia) === 0) await paso("aprendizaje", () => notaSemanal(s, dia));
      await paso("inversion", () => generarInformeInversion(s, { fallosPrecios: fallos }));
    }
  }

  if (errores.length) console.error("[cron diario]", errores);
  return Response.json({ ok: errores.length === 0, ...informe, errores }, { status: errores.length ? 207 : 200 });
}
