"use server";

import { revalidatePath } from "next/cache";
import { filasDeCsv } from "@/lib/csv";
import { repartir, type SinDia } from "@/lib/reparto";
import { getSesion } from "@/lib/sesion";

export interface EstadoImportar {
  ok: boolean;
  mensaje: string;
  errores: string[];
}

const MAX_BYTES = 2 * 1024 * 1024;

/** Carga un CSV de negocios. Los que ya existen (mismo nombre y localidad) no se tocan. */
export async function importarCsv(_prev: EstadoImportar, form: FormData): Promise<EstadoImportar> {
  const { db } = await getSesion();
  const fichero = form.get("fichero");
  if (!(fichero instanceof File) || fichero.size === 0) return { ok: false, mensaje: "Elige un fichero CSV.", errores: [] };
  if (fichero.size > MAX_BYTES) return { ok: false, mensaje: "El fichero pesa más de 2 MB.", errores: [] };
  const lote = Math.min(99, Math.max(1, Number(form.get("lote")) || 1));

  const { filas, errores } = filasDeCsv(await fichero.text(), lote);
  if (filas.length === 0) return { ok: false, mensaje: "No se ha podido leer ningún negocio.", errores };

  const { data, error } = await db.from("negocios").upsert(filas, { onConflict: "clave_unica", ignoreDuplicates: true }).select("id");
  if (error) return { ok: false, mensaje: `No se pudo guardar: ${error.message}`, errores };

  const nuevos = data?.length ?? 0;
  const repetidos = filas.length - nuevos;
  revalidatePath("/", "layout");
  return {
    ok: true,
    mensaje: `${nuevos} negocios nuevos guardados.${repetidos ? ` ${repetidos} ya estaban y no se han tocado.` : ""}`,
    errores,
  };
}

/** Asigna día a los negocios que no lo tienen, llenando los días de 100 en 100. */
export async function repartirEnDias(): Promise<void> {
  const { db } = await getSesion();
  const [{ data: sinDia }, { data: conDia }] = await Promise.all([
    db.from("negocios").select("id, sector, comunidad").is("dia", null).order("creado").range(0, 4999),
    db.from("negocios").select("dia").not("dia", "is", null).range(0, 4999),
  ]);
  const ocupados: Record<number, number> = {};
  for (const r of (conDia ?? []) as { dia: number }[]) ocupados[r.dia] = (ocupados[r.dia] ?? 0) + 1;

  for (const [dia, ids] of repartir((sinDia ?? []) as SinDia[], ocupados)) {
    const { error } = await db.from("negocios").update({ dia }).in("id", ids);
    if (error) throw new Error(`No se pudo repartir el día ${dia}: ${error.message}`);
  }
  revalidatePath("/", "layout");
}
