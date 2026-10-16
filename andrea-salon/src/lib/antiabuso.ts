/**
 * Filtro de reservas de broma («jajaja@gmail.com», «666666666»), que según Andrea llegaban a la web
 * antigua. No pretende detectarlo todo, solo lo evidente; los bots los para el CAPTCHA
 * (`lib/turnstile.ts`) y a quien insiste, el tope de tres citas futuras por teléfono de
 * `confirm_hold()`.
 *
 * REGLA: nada de aquí puede rechazar un dato que una clienta real podría tener. Ante la duda, pasa:
 * es mejor una reserva falsa que Andrea cancela que una clienta de verdad a la que no le deja.
 */

/**
 * `+34XXXXXXXXX` ya normalizado (`lib/phone.ts`) → ¿es un número inventado?
 *  · todos los dígitos iguales: 666 666 666;
 *  · seis o más iguales seguidos: 600 000 000, 699 999 999 (no hay numeración así repartida);
 *  · escalera de ocho o más: 612 345 678, 698 765 432.
 */
export function telefonoInventado(e164: string): boolean {
  const n = e164.replace(/^\+34/, "");
  if (!/^\d{9}$/.test(n)) return false;
  if (/^(\d)\1+$/.test(n)) return true;
  if (/(\d)\1{5,}/.test(n)) return true;
  const resto = n.slice(1);
  const sube = "0123456789";
  const baja = "9876543210";
  return sube.includes(resto) || baja.includes(resto);
}

/** Dominios de correo de usar y tirar más comunes (no reciben la confirmación de nadie de verdad). */
const DESECHABLES = new Set([
  "mailinator.com",
  "yopmail.com",
  "yopmail.fr",
  "guerrillamail.com",
  "sharklasers.com",
  "10minutemail.com",
  "temp-mail.org",
  "tempmail.com",
  "trashmail.com",
  "maildrop.cc",
  "getnada.com",
  "dispostable.com",
  "fakeinbox.com",
  "example.com",
  "example.es",
  "test.com",
]);

/**
 * La parte de antes de la @ que nadie usa en serio: risas («jajaja», «jejeje», «xd»), teclado
 * aporreado («asdf», «qwerty»), una sola letra repetida («aaaa») y las palabras de prueba.
 */
const LOCAL_DE_BROMA = /^(?:(?:ja|je|ji|jo|ha|he|xd)+j?|asdf\w*|qwer\w*|(.)\1{2,}|test|prueba|fake|falso|nada|nose|noseque)\d*$/;

export function correoInventado(email: string): boolean {
  const [local, dominio] = email.trim().toLowerCase().split("@");
  if (!local || !dominio) return false;
  if (DESECHABLES.has(dominio)) return true;
  return LOCAL_DE_BROMA.test(local);
}
