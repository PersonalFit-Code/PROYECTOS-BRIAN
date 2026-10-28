"use server";

import { revalidatePath } from "next/cache";
import { comprobar, numeroONull, texto } from "@/lib/acciones";
import { evaluarResultados, generarInformeInversion, notaSemanal } from "@/lib/inversion/servicio";
import { actualizarPrecios } from "@/lib/inversion/precios";
import { getAdminClient } from "@/lib/supabase/admin";
import { getSesion } from "@/lib/sesion";
import type { AssetClass, Sleeve } from "@/lib/tipos";

function refrescar() {
  revalidatePath("/finanzas/inversion");
}

/** Feedback del usuario sobre una recomendación: alimenta el bucle de aprendizaje. */
export async function darFeedback(id: string, cambios: { feedback?: "util" | "no_util" | null; followed?: boolean | null }) {
  const s = await getSesion();
  const fila: Record<string, unknown> = {};
  if (cambios.feedback !== undefined) fila.feedback = cambios.feedback;
  if (cambios.followed !== undefined) fila.followed = cambios.followed;
  comprobar(await s.db.from("recommendations").update(fila).eq("id", id).eq("user_id", s.userId), "guardar tu valoración");
  refrescar();
}

/** Botón "Actualizar ahora": cotizaciones, evaluación, aprendizaje e informe, sin esperar al cron. */
export async function actualizarAhora() {
  const s = await getSesion();
  const { data: lista } = await s.db.from("watchlist").select("symbol").eq("user_id", s.userId).eq("quoted", true).eq("active", true);
  const { data: ajustes } = await s.db.from("settings").select("benchmark_symbol").eq("user_id", s.userId).single();
  const simbolos = [...new Set([...(lista ?? []).map((l) => l.symbol as string), ajustes?.benchmark_symbol as string].filter(Boolean))];
  // `prices` solo la escribe la clave de servicio (no es un dato personal)
  const { fallos } = await actualizarPrecios(getAdminClient(), simbolos);
  await evaluarResultados(s);
  await notaSemanal(s);
  await generarInformeInversion(s, { forzar: true, fallosPrecios: fallos });
  refrescar();
}

export async function guardarActivo(id: string | null, f: FormData) {
  const s = await getSesion();
  const symbol = texto(f, "symbol", 20).toUpperCase();
  const name = texto(f, "name", 80);
  if (!symbol || !name) throw new Error("Ticker y nombre son obligatorios");
  const asset_class = (["renta_variable", "renta_fija", "liquidez"].includes(String(f.get("asset_class"))) ? f.get("asset_class") : "renta_variable") as AssetClass;
  const sleeve = (f.get("sleeve") === "satelite" ? "satelite" : "nucleo") as Sleeve;
  const fila = {
    symbol,
    name,
    asset_class,
    sleeve,
    target_pct: Math.max(0, Math.min(100, numeroONull(f, "target_pct") ?? 0)),
    quoted: f.get("quoted") === "on",
    yield_pct: numeroONull(f, "yield_pct"),
  };
  const r = id ? await s.db.from("watchlist").update(fila).eq("id", id).eq("user_id", s.userId) : await s.db.from("watchlist").insert({ ...fila, user_id: s.userId, position: 99 });
  comprobar(r, "guardar el activo");
  refrescar();
}

export async function quitarActivo(id: string) {
  const s = await getSesion();
  comprobar(await s.db.from("watchlist").delete().eq("id", id).eq("user_id", s.userId), "quitar el activo");
  refrescar();
}
