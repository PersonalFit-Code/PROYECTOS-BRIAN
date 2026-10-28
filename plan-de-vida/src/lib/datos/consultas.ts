import "server-only";

import type { Sesion } from "@/lib/sesion";
import type {
  Account,
  Area,
  Category,
  Goal,
  Habit,
  HabitLog,
  JournalEntry,
  RecurringItem,
  SavingsGoal,
  Settings,
  Task,
  Transaction,
} from "@/lib/tipos";

/**
 * Lecturas comunes. Todas filtran por user_id aunque RLS ya lo haga: en el modo sin login (desarrollo)
 * y en el cron se lee con la clave de servicio, que se salta RLS.
 */

function lanzar<T>(r: { data: T | null; error: { message: string } | null }, que: string): T {
  if (r.error) throw new Error(`No se pudo leer ${que}: ${r.error.message}`);
  return (r.data ?? []) as T;
}

export async function getAjustes({ db, userId }: Sesion): Promise<Settings> {
  const r = await db.from("settings").select("*").eq("user_id", userId).single();
  if (r.error) throw new Error(`No se pudieron leer los ajustes: ${r.error.message}`);
  return r.data as Settings;
}

export async function getAreas({ db, userId }: Sesion): Promise<Area[]> {
  return lanzar(await db.from("areas").select("*").eq("user_id", userId).order("position"), "las áreas");
}

export async function getHabitos({ db, userId }: Sesion, soloActivos = true): Promise<Habit[]> {
  let q = db.from("habits").select("*").eq("user_id", userId);
  if (soloActivos) q = q.eq("active", true);
  const lista = lanzar<Habit[]>(await q.order("position").order("created_at"), "los hábitos");
  // mañana → día → noche (el orden alfabético de la columna no sirve)
  const orden: Record<string, number> = { manana: 0, dia: 1, noche: 2 };
  return lista.sort((a, b) => orden[a.routine] - orden[b.routine]);
}

export async function getLogs({ db, userId }: Sesion, desde: string, hasta: string): Promise<HabitLog[]> {
  return lanzar(
    await db.from("habit_logs").select("habit_id, day, done, value, note").eq("user_id", userId).gte("day", desde).lte("day", hasta),
    "los registros de hábitos",
  );
}

export async function getDiario({ db, userId }: Sesion, desde: string, hasta: string): Promise<JournalEntry[]> {
  return lanzar(
    await db.from("journal_entries").select("*").eq("user_id", userId).gte("day", desde).lte("day", hasta).order("day", { ascending: false }),
    "el diario",
  );
}

export async function getCategorias({ db, userId }: Sesion): Promise<Category[]> {
  return lanzar(await db.from("categories").select("*").eq("user_id", userId).order("kind").order("position"), "las categorías");
}

export async function getMovimientos({ db, userId }: Sesion, desde: string, hasta: string): Promise<Transaction[]> {
  return lanzar(
    await db
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("day", desde)
      .lte("day", hasta)
      .order("day", { ascending: false })
      .order("created_at", { ascending: false }),
    "los movimientos",
  );
}

export async function getRecurrentes({ db, userId }: Sesion): Promise<RecurringItem[]> {
  return lanzar(await db.from("recurring_items").select("*").eq("user_id", userId).order("next_date"), "los fijos");
}

export async function getHuchas({ db, userId }: Sesion): Promise<SavingsGoal[]> {
  return lanzar(await db.from("savings_goals").select("*").eq("user_id", userId).order("done").order("created_at"), "las huchas");
}

export async function getCuentas({ db, userId }: Sesion): Promise<Account[]> {
  return lanzar(await db.from("accounts").select("*").eq("user_id", userId).eq("active", true).order("kind").order("position"), "las cuentas");
}

/** Con `anio`: las metas de ese año y las activas de años anteriores cuya fecha límite cae en él o después. */
export async function getMetas({ db, userId }: Sesion, anio?: number): Promise<Goal[]> {
  const metas: Goal[] = lanzar(await db.from("goals").select("*").eq("user_id", userId).order("status").order("created_at"), "las metas");
  if (!anio) return metas;
  return metas.filter((m) => m.year === anio || (m.year < anio && m.status === "activa" && m.due_date != null && m.due_date >= `${anio}-01-01`));
}

export async function getTareas({ db, userId }: Sesion, opciones: { pendientes?: boolean; hasta?: string } = {}): Promise<Task[]> {
  let q = db.from("tasks").select("*").eq("user_id", userId);
  if (opciones.pendientes) q = q.eq("done", false);
  if (opciones.hasta) q = q.or(`due_date.is.null,due_date.lte.${opciones.hasta}`);
  return lanzar(await q.order("done").order("priority").order("due_date", { nullsFirst: false }).order("created_at"), "las tareas");
}
