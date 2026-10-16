/**
 * Formateo determinista e independiente de los datos ICU del navegador.
 *
 * ¿Por qué no usar `Intl` directamente? Porque el servidor (Node con ICU completo) y el navegador
 * pueden tener datos distintos para un idioma: Chromium sin datos de gallego formatea `gl-ES`
 * como inglés ("Oct 2026", "€25.00") mientras Node devuelve "out. 2026" y "25,00 €". Al renderizar
 * en servidor y volver a formatear en cliente, React detecta textos distintos y lanza un error de
 * hidratación (#418). Estas tablas garantizan el mismo resultado en ambos lados.
 *
 * Va por `KnownLocale` y no por `Locale`: el gallego ya tiene su fila para que activarlo no toque
 * este fichero.
 */
import { KNOWN_LOCALES, type KnownLocale } from "@/i18n/config";

/** Nombres de mes completos (enero → índice 0), para fechas largas. */
const MONTHS_LONG: Record<KnownLocale, readonly string[]> = {
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  gl: ["xaneiro", "febreiro", "marzo", "abril", "maio", "xuño", "xullo", "agosto", "setembro", "outubro", "novembro", "decembro"],
};

const asLocale = (locale: string): KnownLocale =>
  (KNOWN_LOCALES as readonly string[]).includes(locale) ? (locale as KnownLocale) : "es";

/** Agrupa los millares: 1234 → "1.234". */
function groupDigits(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Número con separadores del idioma (coma decimal, punto de millar en los dos idiomas).
 * `formatNumber(4.8, "es", { decimals: 1 })` → "4,8"
 */
export function formatNumber(value: number, { decimals, grouping = true }: { decimals?: number; grouping?: boolean } = {}): string {
  const fixed = typeof decimals === "number" ? Math.abs(value).toFixed(decimals) : String(Math.abs(value));
  const [int, dec] = fixed.split(".");
  const head = grouping ? groupDigits(int) : int;
  const sign = value < 0 ? "-" : "";
  return sign + (dec ? `${head},${dec}` : head);
}

/**
 * Importe en euros a partir de CÉNTIMOS (como se guardan en la base de datos): `formatCents(2500)` →
 * "25 €"; `formatCents(1250)` → "12,50 €". Los enteros se muestran sin decimales, como en la lista
 * de precios del salón.
 */
export function formatCents(cents: number): string {
  const euros = cents / 100;
  const decimals = Number.isInteger(euros) ? 0 : 2;
  return `${formatNumber(euros, { decimals })} €`;
}

/**
 * Fecha larga a partir de "YYYY-MM-DD": `formatLongDate("2026-10-15", "gl")` → "15 de outubro de 2026".
 */
export function formatLongDate(value: string, locale: string): string {
  const l = asLocale(locale);
  const [y, m, d] = value.split("-").map((p) => Number(p));
  const month = MONTHS_LONG[l][(m ?? 1) - 1] ?? "";
  if (!y || !m || !d) return value;
  return `${d} de ${month} de ${y}`;
}
