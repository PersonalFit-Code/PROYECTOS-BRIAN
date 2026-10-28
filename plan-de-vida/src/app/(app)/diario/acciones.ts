"use server";

import { revalidatePath } from "next/cache";
import { comprobar, textoONull } from "@/lib/acciones";
import { getSesion } from "@/lib/sesion";

function escala(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

function refrescar() {
  revalidatePath("/diario");
  revalidatePath("/hoy");
}

export async function guardarDiario(day: string, f: FormData) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Fecha no válida");
  const s = await getSesion();
  comprobar(
    await s.db.from("journal_entries").upsert(
      {
        user_id: s.userId,
        day,
        mood: escala(f.get("mood")),
        energy: escala(f.get("energy")),
        gratitude: textoONull(f, "gratitude", 1000),
        body: textoONull(f, "body", 20000),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,day" },
    ),
    "guardar el diario",
  );
  refrescar();
}

/**
 * Check-in rápido de la pantalla Hoy: ánimo, energía y una línea. No pisa lo que ya hubiera escrito
 * en el diario: la línea se añade al final.
 */
export async function guardarCheckin(day: string, mood: number | null, energy: number | null, linea: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Fecha no válida");
  const s = await getSesion();
  const { data: actual } = await s.db.from("journal_entries").select("body, mood, energy").eq("user_id", s.userId).eq("day", day).maybeSingle();
  const limpia = linea.trim().slice(0, 1000);
  const body = limpia ? [actual?.body, limpia].filter(Boolean).join("\n") : (actual?.body ?? null);
  comprobar(
    await s.db.from("journal_entries").upsert(
      {
        user_id: s.userId,
        day,
        mood: escala(mood) ?? actual?.mood ?? null,
        energy: escala(energy) ?? actual?.energy ?? null,
        body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,day" },
    ),
    "guardar el check-in",
  );
  refrescar();
}

export async function borrarEntrada(id: string) {
  const s = await getSesion();
  comprobar(await s.db.from("journal_entries").delete().eq("id", id).eq("user_id", s.userId), "borrar la entrada");
  refrescar();
}

