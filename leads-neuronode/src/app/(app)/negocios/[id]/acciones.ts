"use server";

import { revalidatePath } from "next/cache";
import { comprobar, fecha, texto, textoONull } from "@/lib/acciones";
import { getSesion } from "@/lib/sesion";
import { CANALES, RESULTADOS, type Canal } from "@/lib/tipos";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Apunta un contacto y deja el negocio en el estado que corresponde.
 * Si el negocio ha pedido la propuesta por correo, se guarda el consentimiento: sin él, no se le
 * puede enviar nada.
 */
export async function registrarContacto(form: FormData): Promise<void> {
  const { db, userId } = await getSesion();
  const negocioId = texto(form, "negocio_id", 36);
  const canal = texto(form, "canal", 20) as Canal;
  const resultado = texto(form, "resultado", 30) as (typeof RESULTADOS)[number];
  if (!UUID.test(negocioId) || !CANALES.includes(canal) || !RESULTADOS.includes(resultado)) {
    throw new Error("Faltan datos del contacto.");
  }

  comprobar(
    await db.from("contactos").insert({
      negocio_id: negocioId,
      canal,
      resultado,
      nota: textoONull(form, "nota", 1000),
      proxima_fecha: resultado === "volver" ? fecha(form, "proxima_fecha") : null,
      usuario: userId,
    }),
    "guardar el contacto",
  );
  comprobar(await db.from("negocios").update({ estado: resultado, responsable: userId }).eq("id", negocioId), "actualizar el negocio");

  if (form.get("consentimiento") === "on") {
    comprobar(
      await db.from("consentimientos").insert({
        negocio_id: negocioId,
        canal_pedido: canal,
        detalle: textoONull(form, "nota", 500),
        usuario: userId,
      }),
      "guardar el consentimiento",
    );
  }

  revalidatePath(`/negocios/${negocioId}`);
  revalidatePath("/");
  revalidatePath("/panel");
}

export async function guardarNotas(form: FormData): Promise<void> {
  const { db } = await getSesion();
  const negocioId = texto(form, "negocio_id", 36);
  if (!UUID.test(negocioId)) throw new Error("Negocio no válido.");
  comprobar(await db.from("negocios").update({ notas: textoONull(form, "notas", 600) }).eq("id", negocioId), "guardar las notas");
  revalidatePath(`/negocios/${negocioId}`);
}

/** Canales por los que se le escribe a alguien (no la llamada, que tiene resultado inmediato). */
const CANALES_ESCRITO = ["instagram", "whatsapp", "formulario"] as const;

/** «Ya le he escrito»: apunta el contacto y deja el negocio esperando respuesta, sin rellenar nada más. */
export async function yaEscrito(negocioId: string, canal: string): Promise<void> {
  const { db, userId } = await getSesion();
  if (!UUID.test(negocioId) || !(CANALES_ESCRITO as readonly string[]).includes(canal)) throw new Error("Datos no válidos.");
  comprobar(await db.from("contactos").insert({ negocio_id: negocioId, canal, resultado: "esperando", usuario: userId }), "guardar el contacto");
  comprobar(await db.from("negocios").update({ estado: "esperando", responsable: userId }).eq("id", negocioId), "actualizar el negocio");
  revalidatePath(`/negocios/${negocioId}`);
  revalidatePath("/pipeline");
  revalidatePath("/");
  revalidatePath("/panel");
}
