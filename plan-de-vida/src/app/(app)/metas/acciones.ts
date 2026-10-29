"use server";

import { revalidatePath } from "next/cache";
import { comprobar, fecha, numeroONull, texto, textoONull } from "@/lib/acciones";
import { getSesion } from "@/lib/sesion";
import type { GoalPeriod, GoalStatus } from "@/lib/tipos";

function refrescar() {
  revalidatePath("/metas");
  revalidatePath("/hoy");
  revalidatePath("/calendario");
  revalidatePath("/");
}

/* ── Tareas ─────────────────────────────────────────────── */

export async function crearTarea(f: FormData) {
  const s = await getSesion();
  const title = texto(f, "title", 200);
  if (!title) return;
  const prioridad = Number(f.get("priority"));
  comprobar(
    await s.db.from("tasks").insert({
      user_id: s.userId,
      title,
      due_date: fecha(f, "due_date"),
      goal_id: texto(f, "goal_id", 40) || null,
      priority: [1, 2, 3].includes(prioridad) ? prioridad : 2,
    }),
    "crear la tarea",
  );
  refrescar();
}

export async function marcarTarea(id: string, done: boolean) {
  const s = await getSesion();
  comprobar(
    await s.db.from("tasks").update({ done, done_at: done ? new Date().toISOString() : null }).eq("id", id).eq("user_id", s.userId),
    "actualizar la tarea",
  );
  refrescar();
}

export async function borrarTarea(id: string) {
  const s = await getSesion();
  comprobar(await s.db.from("tasks").delete().eq("id", id).eq("user_id", s.userId), "borrar la tarea");
  refrescar();
}

/* ── Metas ──────────────────────────────────────────────── */

/** % de avance: con métrica, (actual − inicio) / (objetivo − inicio); sin métrica, el que se ponga a mano. */
function calcularPct(inicio: number | null, objetivo: number | null, actual: number | null, manual: number | null): number {
  if (objetivo != null && actual != null) {
    const base = inicio ?? 0;
    if (objetivo === base) return actual >= objetivo ? 100 : 0;
    return Math.max(0, Math.min(100, (100 * (actual - base)) / (objetivo - base)));
  }
  return Math.max(0, Math.min(100, manual ?? 0));
}

function leerMeta(f: FormData) {
  const title = texto(f, "title", 200);
  if (!title) throw new Error("La meta necesita un título");
  const period = (["anual", "trimestral", "mensual"].includes(String(f.get("period"))) ? f.get("period") : "anual") as GoalPeriod;
  const year = Math.round(numeroONull(f, "year") ?? new Date().getFullYear());
  const start = numeroONull(f, "start_value");
  const target = numeroONull(f, "target_value");
  const current = numeroONull(f, "current_value") ?? start;
  return {
    title,
    description: textoONull(f, "description"),
    start_text: textoONull(f, "start_text", 500),
    target_text: textoONull(f, "target_text", 500),
    area_id: texto(f, "area_id", 40) || null,
    period,
    year,
    quarter: period === "trimestral" ? Math.min(4, Math.max(1, Math.round(numeroONull(f, "quarter") ?? 1))) : null,
    month: period === "mensual" ? Math.min(12, Math.max(1, Math.round(numeroONull(f, "month") ?? 1))) : null,
    unit: textoONull(f, "unit", 30),
    start_value: start,
    target_value: target,
    current_value: target != null ? current : null,
    progress_pct: calcularPct(start, target, current, numeroONull(f, "progress_pct")),
    due_date: fecha(f, "due_date"),
    updated_at: new Date().toISOString(),
  };
}

export async function crearMeta(f: FormData) {
  const s = await getSesion();
  comprobar(await s.db.from("goals").insert({ ...leerMeta(f), user_id: s.userId }), "crear la meta");
  refrescar();
}

export async function editarMeta(id: string, f: FormData) {
  const s = await getSesion();
  comprobar(await s.db.from("goals").update(leerMeta(f)).eq("id", id).eq("user_id", s.userId), "editar la meta");
  refrescar();
}

/** Actualiza solo el avance (valor actual o % a mano). */
export async function avanzarMeta(id: string, valor: number) {
  const s = await getSesion();
  const { data: g } = await s.db.from("goals").select("start_value, target_value").eq("id", id).eq("user_id", s.userId).single();
  if (!g) throw new Error("Esa meta no existe");
  const conMetrica = g.target_value != null;
  const pct = conMetrica ? calcularPct(g.start_value != null ? Number(g.start_value) : null, Number(g.target_value), valor, null) : calcularPct(null, null, null, valor);
  comprobar(
    await s.db
      .from("goals")
      .update({ ...(conMetrica ? { current_value: valor } : {}), progress_pct: pct, ...(pct >= 100 ? { status: "hecha" } : {}), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", s.userId),
    "actualizar el avance",
  );
  refrescar();
}

export async function estadoMeta(id: string, status: GoalStatus) {
  const s = await getSesion();
  comprobar(await s.db.from("goals").update({ status, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", s.userId), "cambiar el estado");
  refrescar();
}

export async function borrarMeta(id: string) {
  const s = await getSesion();
  comprobar(await s.db.from("goals").delete().eq("id", id).eq("user_id", s.userId), "borrar la meta");
  refrescar();
}

export async function guardarVision(areaId: string, vision: string) {
  const s = await getSesion();
  comprobar(await s.db.from("areas").update({ vision: vision.trim().slice(0, 2000) || null }).eq("id", areaId).eq("user_id", s.userId), "guardar la visión");
  refrescar();
}
