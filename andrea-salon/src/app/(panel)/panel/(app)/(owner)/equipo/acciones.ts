"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/panel/sesion";
import { TAG_CATALOGO } from "@/lib/reservas/catalogo";
import { getAdminClient } from "@/lib/supabase/admin";
import { esDuplicado, marcado, primerError, SLUG_VALIDO, textoOpcional, type EstadoAccion } from "../_comun/estado";
import { HORA_HHMM, problemaFranjas } from "../_comun/franjas";
import { NOMBRES_DIA } from "./dias";

/**
 * Equipo del salón y su horario semanal. Solo la dueña (`requireOwner()` en cada acción: el layout
 * no protege las Server Actions). Los usuarios para entrar al panel NO se crean aquí: los crea Brian
 * con `scripts/crear-usuario.ts`, que es quien decide quién es dueña y quién empleada.
 *
 * Tampoco hay borrado de profesionales: sus citas pasadas la nombran. Se desactiva.
 */

const RUTA = "/panel/equipo";

/**
 * Instagram como lo teclee Andrea («@andrea», «instagram.com/andrea» o el enlace entero) → enlace
 * completo. `undefined` si no es de Instagram: preferimos avisar a guardar un enlace roto en la web.
 */
function normalizarInstagram(texto: string | null): string | null | undefined {
  if (!texto) return null;
  const usuario = /^@?([A-Za-z0-9._]{1,30})$/.exec(texto);
  if (usuario) return `https://www.instagram.com/${usuario[1]}/`;
  try {
    const url = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return undefined;
    url.protocol = "https:";
    return url.toString();
  } catch {
    return undefined;
  }
}

const Profesional = z.object({
  id: z.uuid().nullable(),
  name: z.string().trim().min(2, "Escribe su nombre.").max(80, "El nombre es demasiado largo."),
  slug: z
    .string()
    .trim()
    .min(2, "Falta la dirección (slug).")
    .max(80, "La dirección (slug) es demasiado larga.")
    .regex(SLUG_VALIDO, "La dirección (slug) solo puede llevar minúsculas, números y guiones."),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "El color tiene que ser un código como #B8365A.")
    .transform((c) => c.toUpperCase()),
  bio: z.string().max(1000, "La presentación es demasiado larga (máximo 1000 caracteres).").nullable(),
  specialties: z
    .array(z.string().max(40, "Cada especialidad, como mucho 40 caracteres."))
    .max(12, "Como mucho 12 especialidades."),
  instagram: z.string().nullable(),
  active: z.boolean(),
  bookable_online: z.boolean(),
  position: z.coerce
    .number({ error: "La posición tiene que ser un número." })
    .int("La posición, sin decimales.")
    .min(0, "La posición no puede ser negativa.")
    .max(9999, "La posición no puede pasar de 9999."),
});

export async function guardarProfesional(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();

  const instagram = normalizarInstagram(textoOpcional(form, "instagram"));
  if (instagram === undefined) {
    return { ok: false, error: "Pon el enlace de Instagram (instagram.com/…) o el usuario con @." };
  }
  const especialidades = String(form.get("specialties") ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter((e, i, todas) => e !== "" && todas.indexOf(e) === i);

  const datos = Profesional.safeParse({
    id: textoOpcional(form, "id"),
    name: form.get("name") ?? "",
    slug: form.get("slug") ?? "",
    color: form.get("color") ?? "",
    bio: textoOpcional(form, "bio"),
    specialties: especialidades,
    instagram,
    active: marcado(form, "active"),
    bookable_online: marcado(form, "bookable_online"),
    position: form.get("position") || "0",
  });
  if (!datos.success) return primerError(datos.error);
  const { id, ...fila } = datos.data;

  const db = getAdminClient();
  const { error } = id ? await db.from("staff").update(fila).eq("id", id) : await db.from("staff").insert(fila);
  if (esDuplicado(error)) return { ok: false, error: "Ya hay otra profesional con esa dirección (slug). Cámbiala un poco." };
  if (error) return { ok: false, error: "No se pudo guardar. Inténtalo otra vez." };

  // El equipo sale en la web (página de equipo, «quién te atiende»): fuera la caché del catálogo.
  revalidateTag(TAG_CATALOGO, "max");
  revalidatePath(RUTA);
  return {
    ok: true,
    mensaje: id ? "Datos guardados." : "Profesional creada. Ahora ponle su horario y asígnale servicios.",
  };
}

// `partialRecord`: un día que no venga es un día libre (`record` con enum los exigiría todos).
const Semana = z.partialRecord(
  z.enum(["1", "2", "3", "4", "5", "6", "7"]),
  z
    .array(
      z.object({
        inicio: z.string().regex(HORA_HHMM, "Alguna hora no tiene el formato HH:MM."),
        fin: z.string().regex(HORA_HHMM, "Alguna hora no tiene el formato HH:MM."),
      }),
    )
    .max(6, "Como mucho seis franjas por día."),
);

/**
 * Sustituye el horario semanal entero de una profesional. Se inserta el nuevo ANTES de borrar el
 * viejo (y solo las filas viejas, por id): si la inserción falla, el horario anterior sigue intacto
 * en vez de quedarse vacío y cerrar su agenda online. Durante ese instante conviven los dos, que
 * como mucho suma huecos un segundo; nunca los quita.
 */
export async function guardarHorario(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();

  const staffId = z.uuid().safeParse(form.get("staff_id"));
  if (!staffId.success) return { ok: false, error: "No se encontró a la profesional." };

  let crudo: unknown;
  try {
    crudo = JSON.parse(String(form.get("semana") ?? "{}"));
  } catch {
    return { ok: false, error: "No se pudo leer el horario. Recarga la página." };
  }
  const semana = Semana.safeParse(crudo);
  if (!semana.success) return primerError(semana.error);

  const filas: { staff_id: string; weekday: number; start_time: string; end_time: string }[] = [];
  for (const [dia, franjas] of Object.entries(semana.data)) {
    if (!franjas) continue;
    const problema = problemaFranjas(franjas, NOMBRES_DIA[Number(dia) - 1] ?? "Ese día");
    if (problema) return { ok: false, error: problema };
    for (const f of franjas) {
      filas.push({ staff_id: staffId.data, weekday: Number(dia), start_time: f.inicio, end_time: f.fin });
    }
  }

  const db = getAdminClient();
  const { data: existe } = await db.from("staff").select("id").eq("id", staffId.data).maybeSingle();
  if (!existe) return { ok: false, error: "No se encontró a la profesional." };

  const { data: viejas, error: errorLeer } = await db.from("staff_hours").select("id").eq("staff_id", staffId.data);
  if (errorLeer) return { ok: false, error: "No se pudo guardar el horario. Inténtalo otra vez." };

  if (filas.length > 0) {
    const { error } = await db.from("staff_hours").insert(filas);
    if (error) return { ok: false, error: "No se pudo guardar el horario; sigue el anterior. Inténtalo otra vez." };
  }
  const ids = (viejas ?? []).map((v) => v.id);
  if (ids.length > 0) {
    const { error } = await db.from("staff_hours").delete().in("id", ids);
    if (error) return { ok: false, error: "El horario nuevo se guardó, pero quedó parte del viejo. Vuelve a guardar." };
  }

  revalidatePath(RUTA);
  return {
    ok: true,
    mensaje: filas.length === 0 ? "Horario vacío guardado: no se le podrán reservar citas online." : "Horario guardado.",
  };
}
