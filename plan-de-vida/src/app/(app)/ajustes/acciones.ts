"use server";

import { revalidatePath } from "next/cache";
import { comprobar, numeroONull, texto } from "@/lib/acciones";
import { getSesion } from "@/lib/sesion";

/**
 * Guarda solo los campos que llegan en el formulario. Los apartados de Ajustes son desplegables y, cerrados,
 * no envían sus campos: si se tomaran como vacíos se borrarían la ficha de negocio, la personalidad del coach
 * o la aportación mensual cada vez que se guarda otro apartado.
 */
export async function guardarAjustes(f: FormData) {
  const s = await getSesion();
  const limitar = (v: number | null, min: number, max: number, defecto: number) => (v == null ? defecto : Math.max(min, Math.min(max, v)));
  const cambios: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (f.has("display_name")) cambios.display_name = texto(f, "display_name", 40) || "Tú";
  if (f.has("coach_prompt")) cambios.coach_prompt = String(f.get("coach_prompt") ?? "").trim().slice(0, 8000) || null;
  if (f.has("coach_name")) cambios.coach_name = texto(f, "coach_name", 30) || "Noah";
  if (f.has("negocio")) cambios.negocio = String(f.get("negocio") ?? "").trim().slice(0, 8000) || null;
  if (f.has("monthly_investment")) cambios.monthly_investment = limitar(numeroONull(f, "monthly_investment"), 0, 1_000_000, 0);
  if (f.has("satellite_pct")) cambios.satellite_pct = limitar(numeroONull(f, "satellite_pct"), 0, 100, 20);
  if (f.has("inflation_pct")) cambios.inflation_pct = limitar(numeroONull(f, "inflation_pct"), -5, 30, 2.5);
  if (f.has("benchmark_symbol")) cambios.benchmark_symbol = texto(f, "benchmark_symbol", 20).toUpperCase() || "IWDA.AS";
  comprobar(await s.db.from("settings").update(cambios).eq("user_id", s.userId), "guardar los ajustes");
  revalidatePath("/", "layout");
}
