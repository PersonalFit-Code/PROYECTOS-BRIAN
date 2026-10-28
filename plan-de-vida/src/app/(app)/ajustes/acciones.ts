"use server";

import { revalidatePath } from "next/cache";
import { comprobar, numeroONull, texto } from "@/lib/acciones";
import { getSesion } from "@/lib/sesion";

export async function guardarAjustes(f: FormData) {
  const s = await getSesion();
  const prompt = String(f.get("coach_prompt") ?? "").trim().slice(0, 8000);
  const limitar = (v: number | null, min: number, max: number, defecto: number) => (v == null ? defecto : Math.max(min, Math.min(max, v)));
  comprobar(
    await s.db
      .from("settings")
      .update({
        display_name: texto(f, "display_name", 40) || "Tú",
        coach_prompt: prompt || null,
        monthly_investment: limitar(numeroONull(f, "monthly_investment"), 0, 1_000_000, 0),
        satellite_pct: limitar(numeroONull(f, "satellite_pct"), 0, 100, 20),
        inflation_pct: limitar(numeroONull(f, "inflation_pct"), -5, 30, 2.5),
        benchmark_symbol: texto(f, "benchmark_symbol", 20).toUpperCase() || "IWDA.AS",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", s.userId),
    "guardar los ajustes",
  );
  revalidatePath("/", "layout");
}
