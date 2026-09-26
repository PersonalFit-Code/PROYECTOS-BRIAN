/**
 * Formateo determinista e independiente de los datos ICU del navegador.
 *
 * ¿Por qué no usar `Intl` directamente? Porque el servidor (Node con ICU completo) y el navegador
 * pueden tener datos distintos para un idioma: Chromium sin datos de gallego formatea `gl-ES`
 * como inglés ("Jul 2026", "€9.50") mientras Node devuelve "xul. 2026" y "9,50 €". Al renderizar
 * en servidor y volver a formatear en cliente, React detecta textos distintos y lanza un error de
 * hidratación (#418), dejando además la página en inglés para ese usuario.
 *
 * Estas tablas garantizan el mismo resultado en ambos lados y en cualquier navegador.
 */
import type { Locale } from "@/i18n/config";

/** Abreviaturas de mes (enero → índice 0). */
const MONTHS_SHORT: Record<Locale, readonly string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  gl: ["xan", "feb", "mar", "abr", "mai", "xuñ", "xul", "ago", "set", "out", "nov", "dec"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
};

/** Nombres de mes completos (para fechas largas). */
const MONTHS_LONG: Record<Locale, readonly string[]> = {
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  gl: ["xaneiro", "febreiro", "marzo", "abril", "maio", "xuño", "xullo", "agosto", "setembro", "outubro", "novembro", "decembro"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  pt: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
};

interface NumberStyle {
  /** separador decimal */
  decimal: string;
  /** separador de millares */
  group: string;
  /** cómo se coloca el símbolo de euro */
  currency: (amount: string) => string;
}

const NUMBER_STYLE: Record<Locale, NumberStyle> = {
  es: { decimal: ",", group: ".", currency: (a) => `${a} €` },
  gl: { decimal: ",", group: ".", currency: (a) => `${a} €` },
  en: { decimal: ".", group: ",", currency: (a) => `€${a}` },
  pt: { decimal: ",", group: " ", currency: (a) => `${a} €` },
};

const asLocale = (locale: string): Locale =>
  (["es", "gl", "en", "pt"] as const).includes(locale as Locale) ? (locale as Locale) : "es";

/** Agrupa los millares: 1234 → "1.234" (es) / "1,234" (en). */
function groupDigits(intPart: string, group: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, group);
}

/**
 * Número con separadores del idioma.
 * `formatNumber(4.4, "gl", { decimals: 1 })` → "4,4"
 */
export function formatNumber(
  value: number,
  locale: string,
  { decimals, grouping = true }: { decimals?: number; grouping?: boolean } = {},
): string {
  const style = NUMBER_STYLE[asLocale(locale)];
  const fixed = typeof decimals === "number" ? Math.abs(value).toFixed(decimals) : String(Math.abs(value));
  const [int, dec] = fixed.split(".");
  const head = grouping ? groupDigits(int, style.group) : int;
  const sign = value < 0 ? "-" : "";
  return sign + (dec ? `${head}${style.decimal}${dec}` : head);
}

/**
 * Importe en euros: `formatCurrency(9.5, "es")` → "9,50 €"; en inglés → "€9.50".
 * Los enteros se muestran sin decimales ("6 €"), como en la carta impresa.
 */
export function formatCurrency(value: number, locale: string): string {
  const l = asLocale(locale);
  const decimals = Number.isInteger(value) ? 0 : 2;
  return NUMBER_STYLE[l].currency(formatNumber(value, l, { decimals }));
}

/**
 * Mes y año a partir de "YYYY-MM" (o "YYYY"): `formatMonthYear("2026-07", "gl")` → "xul 2026".
 */
export function formatMonthYear(value: string, locale: string): string {
  const l = asLocale(locale);
  const [yearRaw, monthRaw] = value.split("-");
  const year = yearRaw?.trim() ?? "";
  if (!monthRaw) return year;
  const idx = Number(monthRaw) - 1;
  const month = MONTHS_SHORT[l][idx];
  return month ? `${month} ${year}` : year;
}

/**
 * Fecha larga a partir de "YYYY-MM-DD": `formatLongDate("2026-09-26", "gl")` → "26 de setembro de 2026".
 */
export function formatLongDate(value: string, locale: string): string {
  const l = asLocale(locale);
  const [y, m, d] = value.split("-").map((p) => Number(p));
  const month = MONTHS_LONG[l][(m ?? 1) - 1] ?? "";
  if (!y || !m || !d) return value;
  if (l === "en") return `${month} ${d}, ${y}`;
  return `${d} de ${month} de ${y}`;
}
