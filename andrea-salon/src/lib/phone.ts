/**
 * Teléfonos españoles en E.164.
 *
 * `clients.phone` es único y es la clave con la que `confirm_hold()` reconoce a
 * una clienta que ya vino: si "646 77 13 56", "+34646771356" y "0034 646771356"
 * se guardaran tal cual, serían tres clientas distintas con el mismo historial
 * repartido. Por eso todo teléfono se normaliza aquí antes de tocar la base
 * de datos, y se guarda siempre como `+34XXXXXXXXX`.
 *
 * Solo números españoles: el salón está en Ourense y sus clientas también. Un
 * número extranjero devuelve `null` y el formulario lo explica; no se lanza
 * nunca, porque esto se usa con lo que teclea la gente.
 */

/** Espacios (también los que pega el móvil: NBSP, finos), puntos, guiones y paréntesis. */
const SEPARADORES = /[\s   ().\-‐‑‒–—]/g;

/**
 * Prefijo internacional opcional (+34, 0034 o 34) seguido de los nueve dígitos.
 * Los móviles empiezan por 6 o 7, los fijos por 8 o 9; nada español empieza
 * por 3, así que "34" delante nunca se confunde con el principio del número.
 */
const NUMERO_ES = /^(?:\+34|0034|34)?([6789]\d{8})$/;

/** "646 77 13 56" -> "+34646771356"; cualquier cosa que no sea un número español -> `null`. */
export function normalizarTelefonoES(entrada: string): string | null {
  if (typeof entrada !== "string") return null;
  const limpio = entrada.replace(SEPARADORES, "");
  const encaje = NUMERO_ES.exec(limpio);
  return encaje ? `+34${encaje[1]}` : null;
}

/**
 * "+34646771356" -> "646 77 13 56", que es como se lee un teléfono en España.
 * Si no es un número español válido se devuelve lo que vino, recortado: mejor
 * enseñar un teléfono raro que romper una ficha.
 */
export function formatearTelefonoES(telefono: string): string {
  const e164 = normalizarTelefonoES(telefono);
  if (!e164) return typeof telefono === "string" ? telefono.trim() : "";
  const n = e164.slice(3);
  return `${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7, 9)}`;
}

/** Si es un móvil (6 o 7): solo a esos tiene sentido pedir consentimiento de WhatsApp. */
export function esMovilES(telefono: string): boolean {
  const e164 = normalizarTelefonoES(telefono);
  return e164 !== null && /^\+34[67]/.test(e164);
}
