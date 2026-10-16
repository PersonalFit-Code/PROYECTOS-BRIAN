"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCALES } from "@/i18n/config";
import { eurosACentimos } from "@/lib/money";
import { requireOwner } from "@/lib/panel/sesion";
import { getAdminClient } from "@/lib/supabase/admin";
import type { VoucherProductRow } from "@/lib/supabase/types";
import { esDuplicado, marcado, primerError, SLUG_VALIDO, textoOpcional, type EstadoAccion } from "../_comun/estado";

/**
 * Catálogo de bonos (lo que se vende en la web y en el mostrador). Solo la dueña: cada acción
 * empieza con `requireOwner()` y escribe con el cliente de servicio después de comprobarlo.
 *
 * No hay borrado: `vouchers.product_id` apunta aquí. Además, cambiar un bono del catálogo NO toca
 * los ya vendidos: cada bono guarda congelados su nombre, sesiones, saldo, precio y caducidad.
 */

const RUTA = "/panel/bonos-catalogo";

/** Lo que se escribe en `voucher_products` (la posición, solo si se sabe). */
type Fila = Omit<VoucherProductRow, "id" | "position" | "created_at" | "updated_at"> & { position?: number };

/** La tienda pública se regenera cada 5 minutos; así el cambio se ve ya. */
function refrescar() {
  revalidatePath(RUTA);
  revalidatePath("/panel/bonos/nuevo");
  for (const l of LOCALES) revalidatePath(`/${l}/bonos`);
}

const entero = (min: number, max: number, nombre: string) =>
  z.coerce
    .number({ error: `${nombre}: escribe un número.` })
    .int(`${nombre}: sin decimales.`)
    .min(min, `${nombre} tiene que ser al menos ${min}.`)
    .max(max, `${nombre} no puede pasar de ${max}.`);

const importe = (nombre: string) =>
  z
    .number({ error: `No entiendo ${nombre}. Escríbelo así: 50 o 49,90.` })
    .int()
    .min(1, `${nombre[0]!.toUpperCase()}${nombre.slice(1)} tiene que ser mayor que cero.`)
    .max(1_000_000, `Ese importe para ${nombre} parece un error.`);

const Producto = z
  .object({
    id: z.uuid().nullable(),
    name: z.string().trim().min(2, "Ponle un nombre al bono.").max(120, "El nombre es demasiado largo."),
    slug: z
      .string()
      .trim()
      .min(2, "Falta la dirección (slug) del bono.")
      .max(80, "La dirección (slug) es demasiado larga.")
      .regex(SLUG_VALIDO, "La dirección (slug) solo puede llevar minúsculas, números y guiones."),
    description: z.string().max(1000, "La descripción es demasiado larga (máximo 1000 caracteres).").nullable(),
    kind: z.enum(["sessions", "gift"], { error: "Elige si es un bono de sesiones o una tarjeta regalo." }),
    sessions: entero(1, 100, "Las sesiones").nullable(),
    service_id: z.uuid("Elige un servicio válido.").nullable(),
    value_cents: importe("el saldo").nullable(),
    price_cents: importe("el precio"),
    validity_months: entero(1, 120, "La validez").nullable(),
    active: z.boolean(),
    position: entero(0, 9999, "La posición").nullable(),
  })
  // Lo mismo que la restricción `voucher_products_shape`, pero con un mensaje que Andrea entienda.
  .refine((d) => d.kind !== "sessions" || d.sessions !== null, { message: "¿Cuántas sesiones incluye el bono?" })
  .refine((d) => d.kind !== "gift" || d.value_cents !== null, { message: "¿Qué saldo tiene la tarjeta regalo?" });

/** Un importe tecleado: vacío = null; algo que no se entiende = NaN, para que zod diga qué pasa. */
function centimosDe(form: FormData, nombre: string): number | null {
  const t = textoOpcional(form, nombre);
  if (t === null) return null;
  return eurosACentimos(t) ?? Number.NaN;
}

export async function guardarProducto(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();

  const datos = Producto.safeParse({
    id: textoOpcional(form, "id"),
    name: form.get("name") ?? "",
    slug: form.get("slug") ?? "",
    description: textoOpcional(form, "description"),
    kind: form.get("kind"),
    sessions: textoOpcional(form, "sessions"),
    service_id: textoOpcional(form, "service_id"),
    value_cents: centimosDe(form, "value"),
    price_cents: centimosDe(form, "price") ?? undefined,
    validity_months: textoOpcional(form, "validity_months"),
    active: marcado(form, "active"),
    position: textoOpcional(form, "position"),
  });
  if (!datos.success) return primerError(datos.error);
  const { id, position, ...d } = datos.data;

  // Cada tipo solo guarda lo suyo: una tarjeta regalo no tiene sesiones ni servicio, y un bono de
  // sesiones no tiene saldo. Si se cambia de tipo, lo que sobraba del otro no se queda colgando.
  const campos: Fila = d.kind === "sessions" ? { ...d, value_cents: null } : { ...d, sessions: null, service_id: null };

  const db = getAdminClient();
  let posicionFinal = position;
  if (posicionFinal === null && !id) {
    const { data } = await db.from("voucher_products").select("position").order("position", { ascending: false }).limit(1);
    posicionFinal = (data?.[0]?.position ?? -1) + 1;
  }
  const fila: Fila = posicionFinal === null ? campos : { ...campos, position: posicionFinal };

  if (id) {
    const { error } = await db.from("voucher_products").update(fila).eq("id", id);
    if (esDuplicado(error)) return { ok: false, error: "Ya hay otro bono con esa dirección (slug). Cámbiala un poco." };
    if (error) {
      console.error("[panel/bonos-catalogo] guardar:", error.message);
      return { ok: false, error: "No se pudo guardar el bono. Inténtalo otra vez." };
    }
  } else {
    const { error } = await db.from("voucher_products").insert(fila);
    if (esDuplicado(error)) return { ok: false, error: "Ya hay otro bono con esa dirección (slug). Cámbiala un poco." };
    if (error) {
      console.error("[panel/bonos-catalogo] crear:", error.message);
      return { ok: false, error: "No se pudo crear el bono. Inténtalo otra vez." };
    }
  }

  refrescar();
  const aviso = d.validity_months ? " Ojo: caduca, y la web lo enseña en grande antes de pagar." : "";
  return { ok: true, mensaje: (id ? "Bono guardado." : "Bono creado.") + aviso };
}

const IdYActivo = z.object({ id: z.uuid(), active: z.enum(["true", "false"]) });

/** Activar o desactivar: el desactivado deja de venderse; los ya vendidos siguen valiendo igual. */
export async function cambiarActivoProducto(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();
  const datos = IdYActivo.safeParse({ id: form.get("id"), active: form.get("active") });
  if (!datos.success) return { ok: false, error: "No se encontró el bono." };

  const activo = datos.data.active === "true";
  const { error } = await getAdminClient().from("voucher_products").update({ active: activo }).eq("id", datos.data.id);
  if (error) return { ok: false, error: "No se pudo cambiar el bono. Inténtalo otra vez." };

  refrescar();
  return { ok: true, mensaje: activo ? "Bono a la venta otra vez." : "Bono retirado de la venta." };
}
