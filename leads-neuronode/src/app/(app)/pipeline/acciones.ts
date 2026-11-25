"use server";

import { revalidatePath } from "next/cache";
import { comprobar } from "@/lib/acciones";
import { getSesion } from "@/lib/sesion";
import { COLUMNAS, ESTADO_TXT, type ColumnaId } from "@/lib/tipos";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Mueve un negocio a otra columna del pipeline y lo deja apuntado en su historial. */
export async function moverNegocio(negocioId: string, columna: ColumnaId): Promise<void> {
  const { db, userId } = await getSesion();
  const col = COLUMNAS.find((c) => c.id === columna);
  if (!UUID.test(negocioId) || !col) throw new Error("Datos no válidos.");

  // «No contactar» se respeta: si ya lo pidió, moverlo a «Descartado» no lo convierte en «No le interesa».
  const { data: actual } = await db.from("negocios").select("estado").eq("id", negocioId).maybeSingle();
  if (!actual) throw new Error("No existe ese negocio.");
  if ((col.estados as readonly string[]).includes(actual.estado)) return;

  comprobar(await db.from("negocios").update({ estado: col.destino, responsable: userId }).eq("id", negocioId), "mover el negocio");
  comprobar(
    await db.from("contactos").insert({
      negocio_id: negocioId,
      canal: "pipeline",
      resultado: col.destino,
      nota: `Movido a «${col.titulo}» desde «${ESTADO_TXT[actual.estado as keyof typeof ESTADO_TXT]}».`,
      usuario: userId,
    }),
    "apuntar el movimiento",
  );
  revalidatePath("/pipeline");
  revalidatePath(`/negocios/${negocioId}`);
  revalidatePath("/");
  revalidatePath("/hoy");
  revalidatePath("/panel");
}
