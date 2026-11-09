import type { ClaseId, Sesion } from "./horario";

/**
 * Plazas por clase (aforo limitado). VALORES DE DEMOSTRACIÓN: se confirman con ellos (cuántos
 * Reformer tienen, tamaño de grupo de cada clase…). Las clases de los clubes no se reservan aquí:
 * las gestiona cada club.
 */
export const capacidad: Partial<Record<ClaseId, number>> = {
  reformer: 6,
  mat: 10,
  hipopresivos: 8,
  yoga: 12,
  crossgym: 12,
  powerlifting: 8,
};

export const esReservable = (c: ClaseId) => capacidad[c] !== undefined;
export const claveSesion = (s: Pick<Sesion, "dia" | "hora" | "clase">) => `${s.dia}|${s.hora}|${s.clase}`;

/** Ocupación de partida (determinista, para que la demo no parezca vacía). */
export function ocupacionBase(s: Pick<Sesion, "dia" | "hora" | "clase">): number {
  const cap = capacidad[s.clase] ?? 0;
  let h = 0;
  for (const ch of claveSesion(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Math.min(cap, Math.round(cap * (0.35 + (h % 60) / 100)));
}
