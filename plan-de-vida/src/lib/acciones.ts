import "server-only";

/** Utilidades de las Server Actions: leer el formulario sin sorpresas y avisar del error. */

export function texto(f: FormData, campo: string, max = 500): string {
  return String(f.get(campo) ?? "").trim().slice(0, max);
}

export function textoONull(f: FormData, campo: string, max = 2000): string | null {
  const v = texto(f, campo, max);
  return v ? v : null;
}

/** Acepta "12,50" o "12.50". NaN si no es un número. */
export function numero(f: FormData, campo: string): number {
  const v = String(f.get(campo) ?? "").trim().replace(/\s/g, "").replace(",", ".");
  return v === "" ? Number.NaN : Number(v);
}

export function numeroONull(f: FormData, campo: string): number | null {
  const v = numero(f, campo);
  return Number.isFinite(v) ? v : null;
}

export function fecha(f: FormData, campo: string): string | null {
  const v = texto(f, campo, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

export function comprobar(r: { error: { message: string } | null }, que: string): void {
  if (r.error) throw new Error(`No se pudo ${que}: ${r.error.message}`);
}
