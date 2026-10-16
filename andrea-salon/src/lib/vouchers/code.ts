/**
 * Códigos de bono: "AS-7K3M-Q9ZD".
 *
 * Se leen en voz alta en el mostrador y se teclean a mano cuando la cámara no
 * lee el QR, así que el alfabeto no tiene 0/O ni 1/I: con la letra de Andrea
 * o en la pantalla de un móvil no se distinguen. Quedan 32 símbolos, cinco
 * bits cada uno; ocho símbolos son 40 bits, más de un billón de códigos.
 * Con los bonos que vende un salón en toda su vida, la probabilidad de que
 * dos coincidan es despreciable, y `vouchers.code` es único por si acaso.
 *
 * Puro: el azar entra por parámetro (por defecto `crypto.getRandomValues`,
 * que existe en Node y en el navegador), y así la prueba fija los bytes.
 */

/** 32 símbolos, sin 0/O ni 1/I. */
export const ALFABETO_BONO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const PREFIJO = "AS";
const LONGITUD = 8;

/** Devuelve `n` bytes aleatorios. */
export type GeneradorAleatorio = (n: number) => Uint8Array;

function aleatorioPorDefecto(n: number): Uint8Array {
  const api = globalThis.crypto;
  if (!api || typeof api.getRandomValues !== "function") {
    throw new Error("No hay crypto.getRandomValues en este entorno.");
  }
  return api.getRandomValues(new Uint8Array(n));
}

function conGuiones(cuerpo: string): string {
  return `${PREFIJO}-${cuerpo.slice(0, 4)}-${cuerpo.slice(4)}`;
}

/** Un código nuevo, "AS-XXXX-XXXX". */
export function generarCodigoBono(aleatorio: GeneradorAleatorio = aleatorioPorDefecto): string {
  const bytes = aleatorio(LONGITUD);
  if (!(bytes instanceof Uint8Array) || bytes.length < LONGITUD) {
    throw new Error(`El generador aleatorio tiene que devolver al menos ${LONGITUD} bytes.`);
  }
  let cuerpo = "";
  for (const byte of bytes.subarray(0, LONGITUD)) {
    // 256 = 8 × 32: el resto reparte los bytes entre los símbolos sin sesgo.
    cuerpo += ALFABETO_BONO[byte % ALFABETO_BONO.length];
  }
  return conGuiones(cuerpo);
}

/**
 * Lo que teclea alguien, al código canónico: minúsculas, espacios, guiones de
 * cualquier tipo y puntos dan igual, y el "AS" de delante es opcional.
 * Devuelve `null` si no puede ser un código de bono; nunca lanza.
 */
export function normalizarCodigoBono(texto: string): string | null {
  if (typeof texto !== "string") return null;
  let limpio = texto.toUpperCase().replace(/[\s \-‐‑‒–—_.·]/g, "");
  // El prefijo solo se quita si sobra: un cuerpo puede empezar por "AS".
  if (limpio.length === PREFIJO.length + LONGITUD && limpio.startsWith(PREFIJO)) {
    limpio = limpio.slice(PREFIJO.length);
  }
  if (limpio.length !== LONGITUD) return null;
  for (const simbolo of limpio) {
    if (!ALFABETO_BONO.includes(simbolo)) return null;
  }
  return conGuiones(limpio);
}

/** Si el texto, normalizado, es un código de bono con buena pinta (no si existe). */
export function esCodigoBonoValido(texto: string): boolean {
  return normalizarCodigoBono(texto) !== null;
}
