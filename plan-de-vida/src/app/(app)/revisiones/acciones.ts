"use server";

import { revalidatePath } from "next/cache";
import { comprobar } from "@/lib/acciones";
import { PREGUNTAS, type TipoRevision } from "@/lib/revisiones";
import { getSesion } from "@/lib/sesion";

export async function guardarRevision(tipo: TipoRevision, clave: string, f: FormData) {
  if (!["semanal", "mensual"].includes(tipo) || !/^\d{4}-(W\d{2}|\d{2})$/.test(clave)) throw new Error("Revisión no válida");
  const s = await getSesion();
  const answers: Record<string, string> = {};
  for (const p of PREGUNTAS[tipo]) answers[p.id] = String(f.get(p.id) ?? "").trim().slice(0, 4000);
  comprobar(
    await s.db
      .from("reviews")
      .upsert({ user_id: s.userId, kind: tipo, period: clave, answers, updated_at: new Date().toISOString() }, { onConflict: "user_id,kind,period" }),
    "guardar la revisión",
  );
  revalidatePath("/revisiones");
}
