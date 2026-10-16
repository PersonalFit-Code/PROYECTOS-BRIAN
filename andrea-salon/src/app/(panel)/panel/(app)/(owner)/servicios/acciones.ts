"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { eurosACentimos } from "@/lib/money";
import { requireOwner } from "@/lib/panel/sesion";
import { TAG_CATALOGO } from "@/lib/reservas/catalogo";
import { getAdminClient } from "@/lib/supabase/admin";
import { esDuplicado, marcado, primerError, SLUG_VALIDO, textoOpcional, type EstadoAccion } from "../_comun/estado";

/**
 * Servicios del salón. Solo la dueña: cada acción empieza con `requireOwner()` porque una Server
 * Action es un endpoint público y el layout no la protege. Se escribe con el cliente de servicio
 * DESPUÉS de comprobarlo (RLS ya dejaría a la dueña, pero así no dependemos de la cookie en la
 * escritura).
 *
 * No hay borrado: `booking_items.service_id` apunta aquí y el historial de citas tiene que seguir
 * diciendo qué se hizo. Un servicio que ya no se ofrece se desactiva.
 */

const RUTA = "/panel/servicios";

/** Tras tocar el catálogo: la web pública lo tiene cacheado con la etiqueta `catalogo`. */
function refrescar() {
  revalidateTag(TAG_CATALOGO, "max");
  revalidatePath(RUTA);
}

const entero = (min: number, max: number, nombre: string) =>
  z.coerce
    .number({ error: `${nombre}: escribe un número.` })
    .int(`${nombre}: sin decimales.`)
    .min(min, `${nombre} tiene que ser al menos ${min}.`)
    .max(max, `${nombre} no puede pasar de ${max}.`);

const Servicio = z.object({
  id: z.uuid().nullable(),
  name: z.string().trim().min(2, "Ponle un nombre al servicio.").max(120, "El nombre es demasiado largo."),
  slug: z
    .string()
    .trim()
    .min(2, "Falta la dirección (slug) del servicio.")
    .max(80, "La dirección (slug) es demasiado larga.")
    .regex(SLUG_VALIDO, "La dirección (slug) solo puede llevar minúsculas, números y guiones."),
  description: z.string().max(1000, "La descripción es demasiado larga (máximo 1000 caracteres).").nullable(),
  category_id: z.uuid("Elige una categoría válida.").nullable(),
  duration_min: entero(5, 480, "La duración"),
  buffer_min: entero(0, 120, "El tiempo de recogida"),
  price_cents: z
    .number({ error: "No entiendo el precio. Escríbelo así: 25 o 25,50." })
    .int()
    .min(0, "El precio no puede ser negativo.")
    .max(1_000_000, "Ese precio parece un error."),
  price_is_from: z.boolean(),
  active: z.boolean(),
  bookable_online: z.boolean(),
  position: entero(0, 9999, "La posición").nullable(),
  staff: z.array(z.uuid()).max(50),
});

export async function guardarServicio(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();

  const precio = textoOpcional(form, "price");
  const posicion = textoOpcional(form, "position");
  const datos = Servicio.safeParse({
    id: textoOpcional(form, "id"),
    name: form.get("name") ?? "",
    slug: form.get("slug") ?? "",
    description: textoOpcional(form, "description"),
    category_id: textoOpcional(form, "category_id"),
    duration_min: form.get("duration_min") ?? "",
    buffer_min: form.get("buffer_min") || "0",
    price_cents: precio === null ? undefined : (eurosACentimos(precio) ?? undefined),
    price_is_from: marcado(form, "price_is_from"),
    active: marcado(form, "active"),
    bookable_online: marcado(form, "bookable_online"),
    position: posicion,
    staff: form.getAll("staff").filter((v): v is string => typeof v === "string"),
  });
  if (!datos.success) return primerError(datos.error);
  const { id, staff, position, ...campos } = datos.data;

  const db = getAdminClient();

  // Sin posición escrita, el servicio nuevo va al final de su categoría.
  let posicionFinal = position;
  if (posicionFinal === null && !id) {
    let q = db.from("services").select("position").order("position", { ascending: false }).limit(1);
    q = campos.category_id ? q.eq("category_id", campos.category_id) : q.is("category_id", null);
    const { data } = await q;
    posicionFinal = (data?.[0]?.position ?? -1) + 1;
  }
  const fila = posicionFinal === null ? campos : { ...campos, position: posicionFinal };

  let servicioId = id;
  if (id) {
    const { error } = await db.from("services").update(fila).eq("id", id);
    if (esDuplicado(error)) return { ok: false, error: "Ya hay otro servicio con esa dirección (slug). Cámbiala un poco." };
    if (error) return { ok: false, error: "No se pudo guardar el servicio. Inténtalo otra vez." };
  } else {
    const { data, error } = await db.from("services").insert(fila).select("id").single();
    if (esDuplicado(error)) return { ok: false, error: "Ya hay otro servicio con esa dirección (slug). Cámbiala un poco." };
    if (error || !data) return { ok: false, error: "No se pudo crear el servicio. Inténtalo otra vez." };
    servicioId = data.id;
  }
  if (!servicioId) return { ok: false, error: "No se pudo guardar el servicio." };

  // Quién lo hace: primero se añaden las que faltan y luego se quitan las que sobran. En ese orden,
  // si algo falla a medias el servicio se queda con alguien de más, nunca sin nadie (un servicio
  // sin profesionales desaparece de la reserva online).
  if (staff.length > 0) {
    const { error } = await db
      .from("service_staff")
      .upsert(
        staff.map((staff_id) => ({ service_id: servicioId, staff_id })),
        { onConflict: "service_id,staff_id", ignoreDuplicates: true },
      );
    if (error) return { ok: false, error: "El servicio se guardó, pero no quién lo hace. Vuelve a guardar." };
  }
  let borrar = db.from("service_staff").delete().eq("service_id", servicioId);
  // Los ids ya están validados como uuid por zod: no hay forma de colar nada en la lista.
  if (staff.length > 0) borrar = borrar.not("staff_id", "in", `(${staff.join(",")})`);
  const { error: errorBorrar } = await borrar;
  if (errorBorrar) return { ok: false, error: "El servicio se guardó, pero no quién lo hace. Vuelve a guardar." };

  refrescar();
  const aviso = staff.length === 0 ? " Ojo: nadie lo tiene asignado, así que no se puede reservar online." : "";
  return { ok: true, mensaje: (id ? "Servicio guardado." : "Servicio creado.") + aviso };
}

const IdYActivo = z.object({ id: z.uuid(), active: z.enum(["true", "false"]) });

/** Activar o desactivar: el servicio desactivado sale de la web y de la reserva, no del historial. */
export async function cambiarActivoServicio(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();
  const datos = IdYActivo.safeParse({ id: form.get("id"), active: form.get("active") });
  if (!datos.success) return { ok: false, error: "No se encontró el servicio." };

  const activo = datos.data.active === "true";
  const { error } = await getAdminClient().from("services").update({ active: activo }).eq("id", datos.data.id);
  if (error) return { ok: false, error: "No se pudo cambiar el servicio. Inténtalo otra vez." };

  refrescar();
  return { ok: true, mensaje: activo ? "Servicio activado." : "Servicio desactivado." };
}

const Mover = z.object({ id: z.uuid(), direccion: z.enum(["arriba", "abajo"]) });

/**
 * Sube o baja un servicio dentro de su categoría. Se renumera la categoría entera (0, 1, 2…) en vez
 * de intercambiar dos números: si dos servicios tenían la misma posición, un intercambio no movería
 * nada y Andrea pensaría que el botón no funciona.
 */
export async function moverServicio(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();
  const datos = Mover.safeParse({ id: form.get("id"), direccion: form.get("direccion") });
  if (!datos.success) return { ok: false, error: "No se encontró el servicio." };

  const db = getAdminClient();
  const { data: actual } = await db.from("services").select("id, category_id").eq("id", datos.data.id).maybeSingle();
  if (!actual) return { ok: false, error: "No se encontró el servicio." };

  let q = db.from("services").select("id, position").order("position").order("name");
  q = actual.category_id ? q.eq("category_id", actual.category_id) : q.is("category_id", null);
  const { data: hermanos, error } = await q;
  if (error || !hermanos) return { ok: false, error: "No se pudo mover el servicio." };

  const orden = hermanos.map((s) => s.id);
  const i = orden.indexOf(actual.id);
  const j = datos.data.direccion === "arriba" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= orden.length) return { ok: true };
  [orden[i], orden[j]] = [orden[j]!, orden[i]!];

  const cambios = orden
    .map((id, posicion) => ({ id, posicion }))
    .filter(({ id, posicion }) => hermanos.find((h) => h.id === id)?.position !== posicion);
  const resultados = await Promise.all(
    cambios.map(({ id, posicion }) => db.from("services").update({ position: posicion }).eq("id", id)),
  );
  if (resultados.some((r) => r.error)) return { ok: false, error: "No se pudo mover el servicio del todo. Revisa el orden." };

  refrescar();
  return { ok: true };
}
