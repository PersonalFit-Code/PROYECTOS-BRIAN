import type { z } from "zod";

/**
 * Lo que devuelve cada Server Action de las secciones de la dueña. Siempre el mismo molde para que
 * un único componente (`Resultado`) sepa pintarlo, y siempre en castellano de persona: Andrea lo lee
 * en el móvil con una clienta delante, no le sirve un «violates check constraint».
 */
export interface EstadoAccion {
  ok: boolean;
  error?: string;
  mensaje?: string;
}

export const ESTADO_INICIAL: EstadoAccion = { ok: false };

/** El primer fallo de zod, que ya lleva su mensaje en castellano desde el esquema. */
export function primerError(error: z.ZodError): EstadoAccion {
  return { ok: false, error: error.issues[0]?.message ?? "Revisa los datos del formulario." };
}

/** Un checkbox de formulario llega como "on" si está marcado y no llega si no. */
export function marcado(form: FormData, nombre: string): boolean {
  return form.get(nombre) === "on";
}

/** Texto de formulario recortado; `null` si viene vacío (para columnas opcionales). */
export function textoOpcional(form: FormData, nombre: string): string | null {
  const v = form.get(nombre);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

/** Postgres dice 23505 cuando choca un `unique`: aquí casi siempre es el slug repetido. */
export function esDuplicado(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

/** Slug a partir del nombre: «Semipermanente francesa» → «semipermanente-francesa». */
export function slugDe(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
