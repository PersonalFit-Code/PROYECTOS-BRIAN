/**
 * Fechas para enseñar a personas, siempre en la zona del salón. Todo lo que se guarda y se
 * compara va en instantes absolutos (timestamptz / Date); solo al pintar se pasa a hora local.
 */
export const ZONA_SALON = "Europe/Madrid";

type Entrada = Date | string;

function aDate(valor: Entrada): Date {
  return valor instanceof Date ? valor : new Date(valor);
}

/** "jueves, 16 de octubre" (sin año si es el actual; con año si no). */
export function fechaLarga(valor: Entrada, zona = ZONA_SALON, locale = "es-ES"): string {
  const d = aDate(valor);
  const mismoAnio = new Intl.DateTimeFormat("en", { timeZone: zona, year: "numeric" }).format(d)
    === new Intl.DateTimeFormat("en", { timeZone: zona, year: "numeric" }).format(new Date());
  return new Intl.DateTimeFormat(locale, {
    timeZone: zona,
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(mismoAnio ? {} : { year: "numeric" }),
  }).format(d);
}

/** "16 oct" */
export function fechaCorta(valor: Entrada, zona = ZONA_SALON, locale = "es-ES"): string {
  return new Intl.DateTimeFormat(locale, { timeZone: zona, day: "numeric", month: "short" }).format(aDate(valor));
}

/** "11:15" */
export function hora(valor: Entrada, zona = ZONA_SALON, locale = "es-ES"): string {
  return new Intl.DateTimeFormat(locale, { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false })
    .format(aDate(valor));
}

/** "jueves, 16 de octubre a las 11:15" */
export function fechaYHora(valor: Entrada, zona = ZONA_SALON, locale = "es-ES"): string {
  return `${fechaLarga(valor, zona, locale)} a las ${hora(valor, zona, locale)}`;
}

/** "YYYY-MM-DD" del instante en la zona (el "día civil" del salón). */
export function fechaLocalISO(valor: Entrada, zona = ZONA_SALON): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(aDate(valor));
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Suma días a una fecha "YYYY-MM-DD" por el calendario civil (sin tocar horas). */
export function sumarDias(fechaISO: string, dias: number): string {
  const [a, m, d] = fechaISO.split("-").map(Number);
  const civil = new Date(Date.UTC(a, m - 1, d + dias));
  return civil.toISOString().slice(0, 10);
}

/** Minutos entre dos instantes, redondeados. */
export function minutosEntre(a: Entrada, b: Entrada): number {
  return Math.round((aDate(b).getTime() - aDate(a).getTime()) / 60_000);
}
