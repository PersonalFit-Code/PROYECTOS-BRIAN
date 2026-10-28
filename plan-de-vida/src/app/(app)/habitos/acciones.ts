"use server";

import { revalidatePath } from "next/cache";
import { comprobar, numeroONull, texto } from "@/lib/acciones";
import { getSesion } from "@/lib/sesion";
import type { HabitKind, Routine } from "@/lib/tipos";

function refrescar() {
  revalidatePath("/hoy");
  revalidatePath("/habitos");
  revalidatePath("/");
}

/** Marca o desmarca la casilla de un día. `value` solo para hábitos de cantidad. */
export async function registrarHabito(habitId: string, day: string, cambios: { done?: boolean; value?: number | null }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Fecha no válida");
  const s = await getSesion();
  const { data: habito } = await s.db.from("habits").select("kind, target").eq("id", habitId).eq("user_id", s.userId).single();
  if (!habito) throw new Error("Ese hábito no existe");

  const fila: Record<string, unknown> = { habit_id: habitId, user_id: s.userId, day, updated_at: new Date().toISOString() };
  if (cambios.value !== undefined) {
    fila.value = cambios.value;
    // cantidad: la casilla se marca sola al llegar al objetivo
    if (habito.kind === "cantidad" && habito.target != null) fila.done = (cambios.value ?? 0) >= Number(habito.target);
  }
  if (cambios.done !== undefined) fila.done = cambios.done;
  comprobar(await s.db.from("habit_logs").upsert(fila, { onConflict: "habit_id,day" }), "guardar el hábito");
  refrescar();
}

const DIAS_TODOS = [0, 1, 2, 3, 4, 5, 6];

function leerHabito(f: FormData) {
  const kind = (["check", "cantidad", "dejar"].includes(String(f.get("kind"))) ? f.get("kind") : "check") as HabitKind;
  const routine = (["manana", "dia", "noche"].includes(String(f.get("routine"))) ? f.get("routine") : "dia") as Routine;
  const frecuencia = String(f.get("frecuencia") ?? "diario");
  let weekdays = DIAS_TODOS;
  let weekly_target: number | null = null;
  if (frecuencia === "laborables") weekdays = [0, 1, 2, 3, 4];
  else if (frecuencia === "dias") {
    const elegidos = f.getAll("weekdays").map(Number).filter((d) => d >= 0 && d <= 6);
    weekdays = elegidos.length ? elegidos : DIAS_TODOS;
  } else if (frecuencia === "semana") {
    const veces = Math.round(numeroONull(f, "weekly_target") ?? 3);
    weekly_target = Math.min(7, Math.max(1, veces));
  }
  const nombre = texto(f, "name", 80);
  if (!nombre) throw new Error("El hábito necesita un nombre");
  return {
    name: nombre,
    emoji: texto(f, "emoji", 8) || "✅",
    kind,
    routine,
    target: kind === "cantidad" ? numeroONull(f, "target") : null,
    unit: kind === "cantidad" ? texto(f, "unit", 20) || null : null,
    weekdays,
    weekly_target,
    area_id: texto(f, "area_id", 40) || null,
  };
}

export async function crearHabito(f: FormData) {
  const s = await getSesion();
  comprobar(await s.db.from("habits").insert({ ...leerHabito(f), user_id: s.userId, start_date: texto(f, "start_date", 10) || undefined }), "crear el hábito");
  refrescar();
}

export async function editarHabito(id: string, f: FormData) {
  const s = await getSesion();
  comprobar(await s.db.from("habits").update(leerHabito(f)).eq("id", id).eq("user_id", s.userId), "editar el hábito");
  refrescar();
}

/** Archivar conserva el historial (cuenta en informes pasados); borrar lo elimina todo. */
export async function archivarHabito(id: string, activo: boolean) {
  const s = await getSesion();
  comprobar(await s.db.from("habits").update({ active: activo }).eq("id", id).eq("user_id", s.userId), "archivar el hábito");
  refrescar();
}

export async function borrarHabito(id: string) {
  const s = await getSesion();
  comprobar(await s.db.from("habits").delete().eq("id", id).eq("user_id", s.userId), "borrar el hábito");
  refrescar();
}
