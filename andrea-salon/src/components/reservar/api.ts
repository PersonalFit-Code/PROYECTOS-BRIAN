import type { ErrorApi } from "./tipos";

/**
 * `fetch` a la API de reservas con una forma única de error: o vuelve `{ ok: true, datos }` o un
 * código que el asistente traduce. Un fallo de red es el código `RED`.
 */
export type Respuesta<T> = { ok: true; datos: T } | { ok: false; status: number; error: ErrorApi };

export async function llamar<T>(url: string, init?: RequestInit): Promise<Respuesta<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
    const cuerpo = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      const error = (cuerpo && typeof cuerpo === "object" && "codigo" in cuerpo ? cuerpo : { codigo: "ERROR_INTERNO" }) as ErrorApi;
      return { ok: false, status: res.status, error };
    }
    return { ok: true, datos: cuerpo as T };
  } catch {
    return { ok: false, status: 0, error: { codigo: "RED" } };
  }
}

/** "11:15" en la hora del salón, sin depender del idioma del navegador. */
export function horaSalon(iso: string): string {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const h = partes.find((p) => p.type === "hour")?.value ?? "00";
  const m = partes.find((p) => p.type === "minute")?.value ?? "00";
  return `${h === "24" ? "00" : h}:${m}`;
}

export function duracionTexto(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
