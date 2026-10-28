"use server";

import { revalidatePath } from "next/cache";
import { comprobar } from "@/lib/acciones";
import { PREGUNTAS, type TipoRevision } from "@/lib/revisiones";
import { getSesion } from "@/lib/sesion";

export async function guardarRevision(tipo: TipoRevision, clave: string, f: FormData) {
  if (!["semanal", "mensual"].includes(tipo) || !/^\d{4}-(W\d{2}|\d{2})$/.test(clave)) throw new Error("Revisión no válida");
  const s = await getSesion();
  // Se conservan otras claves (p. ej. el «objetivo» del mes que se fija en Hábitos → Libreta).
  const { data: previa } = await s.db.from("reviews").select("answers").eq("user_id", s.userId).eq("kind", tipo).eq("period", clave).maybeSingle();
  const answers: Record<string, string> = { ...(previa?.answers ?? {}) };
  for (const p of PREGUNTAS[tipo]) answers[p.id] = String(f.get(p.id) ?? "").trim().slice(0, 4000);
  comprobar(
    await s.db
      .from("reviews")
      .upsert({ user_id: s.userId, kind: tipo, period: clave, answers, updated_at: new Date().toISOString() }, { onConflict: "user_id,kind,period" }),
    "guardar la revisión",
  );
  revalidatePath("/revisiones");
}
