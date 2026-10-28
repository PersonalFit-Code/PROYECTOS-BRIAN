/**
 * Fechas de calendario en la zona de Brian. Todo lo "de hoy" (hábitos, gastos, diario) se decide en
 * Madrid, no en UTC: a las 00:30 en España el servidor de Vercel aún está en "ayer".
 * Las fechas viajan como texto 'YYYY-MM-DD' y se operan en UTC puro para no pelear con los cambios
 * de hora.
 */
export const ZONA = "Europe/Madrid";

export function hoy(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
}

function aUtc(dia: string): Date {
  const [y, m, d] = dia.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function aTexto(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export function sumarDias(dia: string, n: number): string {
  const f = aUtc(dia);
  f.setUTCDate(f.getUTCDate() + n);
  return aTexto(f);
}

/** Suma meses sin desbordar: 31 de enero + 1 mes = 28/29 de febrero. */
export function sumarMeses(dia: string, n: number): string {
  const f = aUtc(dia);
  const diaMes = f.getUTCDate();
  f.setUTCDate(1);
  f.setUTCMonth(f.getUTCMonth() + n);
  const ultimo = new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth() + 1, 0)).getUTCDate();
  f.setUTCDate(Math.min(diaMes, ultimo));
  return aTexto(f);
}

export function diasEntre(desde: string, hasta: string): number {
  return Math.round((aUtc(hasta).getTime() - aUtc(desde).getTime()) / 86_400_000);
}

/** 0 = lunes … 6 = domingo (como en la columna habits.weekdays). */
export function diaSemana(dia: string): number {
  return (aUtc(dia).getUTCDay() + 6) % 7;
}

export const NOMBRES_DIA = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
export const NOMBRES_DIA_PLURAL = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábados", "domingos"];
export const INICIALES_DIA = ["L", "M", "X", "J", "V", "S", "D"];
export const NOMBRES_MES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** '2026-10' → { desde: '2026-10-01', hasta: '2026-10-31' } */
export function rangoMes(mes: string): { desde: string; hasta: string } {
  const desde = `${mes}-01`;
  return { desde, hasta: sumarDias(sumarMeses(desde, 1), -1) };
}

export function mesDe(dia: string): string {
  return dia.slice(0, 7);
}

export function mesAnterior(mes: string): string {
  return mesDe(sumarMeses(`${mes}-01`, -1));
}

export function nombreMes(mes: string): string {
  const [y, m] = mes.split("-").map(Number);
  return `${NOMBRES_MES[m - 1]} ${y}`;
}

/** Lunes de la semana del día. */
export function lunesDe(dia: string): string {
  return sumarDias(dia, -diaSemana(dia));
}

/** Semana ISO: '2026-W44'. */
export function semanaIso(dia: string): string {
  const f = aUtc(dia);
  const jueves = new Date(f);
  jueves.setUTCDate(f.getUTCDate() + 3 - ((f.getUTCDay() + 6) % 7));
  const anio = jueves.getUTCFullYear();
  const primero = new Date(Date.UTC(anio, 0, 4));
  const semana = 1 + Math.round(((jueves.getTime() - primero.getTime()) / 86_400_000 - 3 + ((primero.getUTCDay() + 6) % 7)) / 7);
  return `${anio}-W${String(semana).padStart(2, "0")}`;
}

/** Lista de días [desde, hasta], ambos incluidos. */
export function diasDelRango(desde: string, hasta: string): string[] {
  const out: string[] = [];
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) out.push(d);
  return out;
}

/** "Miércoles, 28 de octubre" (solo la primera letra en mayúscula). */
export function fechaLarga(dia: string): string {
  const t = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(aUtc(dia));
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function fechaCorta(dia: string): string {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(aUtc(dia));
}

/** '2026-W44' → lunes de esa semana ISO. */
export function lunesDeSemanaIso(clave: string): string {
  const [anio, w] = clave.split("-W").map(Number);
  const cuatroEnero = `${anio}-01-04`;
  return sumarDias(lunesDe(cuatroEnero), (w - 1) * 7);
}

/** Instante (ISO, UTC) en que empieza el día `dia` en Madrid, con su horario de verano o invierno. */
export function inicioDia(dia: string): string {
  const [y, m, d] = dia.split("-").map(Number);
  const mediodia = new Date(Date.UTC(y, m - 1, d, 12));
  const nombre = new Intl.DateTimeFormat("en-US", { timeZone: ZONA, timeZoneName: "shortOffset" }).formatToParts(mediodia).find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const horas = Number(nombre.replace("GMT", "") || 0);
  return new Date(Date.UTC(y, m - 1, d) - horas * 3_600_000).toISOString();
}
