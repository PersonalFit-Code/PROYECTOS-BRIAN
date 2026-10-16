/**
 * Firmas HMAC para los enlaces que llegan por correo.
 *
 * El enlace de una cita es `cita/<manage_token>?t=<firma>` y el de un bono
 * `bono/<code>?t=<firma>`. El `manage_token` ya es un UUID imposible de
 * adivinar; la firma añade que un enlace solo vale si lo generó este servidor:
 * quien recorra códigos de bono al azar ("AS-AAAA-AAAB"...) no consigue abrir
 * ninguno sin el secreto, aunque acierte uno que existe.
 *
 * El secreto es `TOKEN_SECRET` (32 bytes en hexadecimal, 64 caracteres). Lo
 * lee de `process.env` quien llama, no este módulo: así se prueba con un
 * secreto cualquiera y nunca hay dos sitios que decidan cuál es el bueno. Se
 * usa como clave tal cual (texto), no decodificado: con 64 caracteres
 * aleatorios la clave ya tiene de sobra. Cambiarlo invalida todos los enlaces
 * enviados, que es exactamente lo que se quiere si se filtra.
 *
 * Solo servidor: usa `node:crypto`.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Por debajo de esto el secreto no protege nada; mejor fallar al arrancar
 * que firmar con "cambiame". Los 64 caracteres de `TOKEN_SECRET` lo cumplen.
 */
export const LONGITUD_MINIMA_SECRETO = 32;

/** 64 caracteres hexadecimales: lo que mide un SHA-256. */
const FIRMA_HEX = /^[0-9a-f]{64}$/i;

function secretoUtilizable(secreto: unknown): secreto is string {
  return typeof secreto === "string" && secreto.length >= LONGITUD_MINIMA_SECRETO;
}

/**
 * HMAC-SHA256 de `valor` en hexadecimal (64 caracteres, válidos en una URL
 * sin codificar). Lanza si el secreto falta o es corto: es un error de
 * configuración y tiene que verse en el primer despliegue, no en producción
 * firmando enlaces que cualquiera podría fabricar.
 *
 * Si un mismo valor pudiera firmarse con dos fines distintos, quien llama
 * le pone el ámbito delante ("bono:AS-...") para que una firma no sirva en el
 * otro sitio.
 */
export function firmar(valor: string, secreto: string): string {
  if (!secretoUtilizable(secreto)) {
    throw new Error(
      `TOKEN_SECRET vacío o demasiado corto: hacen falta al menos ${LONGITUD_MINIMA_SECRETO} caracteres (32 bytes en hexadecimal).`,
    );
  }
  return createHmac("sha256", secreto).update(String(valor), "utf8").digest("hex");
}

/**
 * Si `firma` es la firma de `valor`. En tiempo constante, para que comparar
 * una firma casi buena no tarde distinto que una mala. Una firma mal formada
 * (vacía, corta, con letras que no son hexadecimales) devuelve `false`, nunca
 * lanza: esto recibe lo que venga en la URL.
 */
export function verificar(valor: string, firma: string, secreto: string): boolean {
  if (typeof valor !== "string" || typeof firma !== "string" || !secretoUtilizable(secreto)) return false;
  if (!FIRMA_HEX.test(firma)) return false;
  try {
    const esperada = Buffer.from(firmar(valor, secreto), "hex");
    const recibida = Buffer.from(firma.toLowerCase(), "hex");
    return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
  } catch {
    return false;
  }
}
