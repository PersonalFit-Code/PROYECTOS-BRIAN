import { autorizado } from "@/lib/cron/tareas";
import { diaSemana, hoy } from "@/lib/fechas";
import { cumplido, indexar, toca } from "@/lib/habitos/metricas";
import { enviarPush, pushConfigurado } from "@/lib/push";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Habit, HabitLog } from "@/lib/tipos";

/**
 * GET /api/cron/tarde — recordatorio de la tarde: qué hábitos quedan por marcar hoy. Los domingos,
 * además, la revisión semanal. Sin claves VAPID no hace nada.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  if (!autorizado(req)) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!pushConfigurado()) return Response.json({ ok: true, omitido: "sin claves VAPID" });
  const db = getAdminClient();
  const dia = hoy();
  const { data: usuarios } = await db.from("push_subscriptions").select("user_id");
  const ids = [...new Set((usuarios ?? []).map((u) => u.user_id as string))];
  let enviados = 0;

  for (const userId of ids) {
    const [{ data: habitos }, { data: logs }] = await Promise.all([
      db.from("habits").select("*").eq("user_id", userId).eq("active", true),
      db.from("habit_logs").select("habit_id, day, done, value").eq("user_id", userId).eq("day", dia),
    ]);
    const porHabito = indexar((logs ?? []) as HabitLog[]);
    const pendientes = ((habitos ?? []) as Habit[]).filter((h) => !h.weekly_target && toca(h, dia) && !cumplido(h, porHabito.get(h.id)?.get(dia)));
    if (pendientes.length) {
      enviados += await enviarPush(db, userId, {
        title: `Te quedan ${pendientes.length} ${pendientes.length === 1 ? "hábito" : "hábitos"} hoy`,
        body: pendientes.slice(0, 4).map((h) => h.name).join(" · "),
        url: "/hoy",
      });
    }
    if (diaSemana(dia) === 6) {
      enviados += await enviarPush(db, userId, { title: "Revisión semanal", body: "10 minutos para mirar la semana y decidir las 3 prioridades de la siguiente.", url: "/revisiones" });
    }
  }
  return Response.json({ ok: true, enviados });
}
