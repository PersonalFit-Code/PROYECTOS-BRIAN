"use server";

import { revalidatePath } from "next/cache";
import { getAjustes } from "@/lib/datos/consultas";
import { generarYGuardarInforme } from "@/lib/habitos/informe";
import { getSesion } from "@/lib/sesion";

export async function generarInforme(mes: string) {
  if (!/^\d{4}-\d{2}$/.test(mes)) throw new Error("Mes no válido");
  const s = await getSesion();
  await generarYGuardarInforme(s, mes, await getAjustes(s));
  revalidatePath("/habitos/informe");
  revalidatePath("/revisiones");
}
