import "server-only";

import type { Locale } from "@/i18n/config";
import { urlFor } from "@/lib/hosts";
import { firmar, verificar } from "@/lib/tokens";

/**
 * El enlace de un bono (el que va en el QR y en el correo): `/<locale>/bono/<code>?t=<firma>`.
 * El ámbito "bono:" en lo firmado hace que una firma de cita no sirva para un bono, ni al revés.
 * Sin la firma, quien pruebe códigos al azar no ve ningún bono aunque acierte uno.
 */
function secreto(): string {
  const s = process.env.TOKEN_SECRET;
  if (!s || s.length < 32) throw new Error("Falta TOKEN_SECRET (32 bytes en hex) en el entorno.");
  return s;
}

export function firmaBono(code: string): string {
  return firmar(`bono:${code}`, secreto());
}

export function firmaBonoValida(code: string, firma: string | null | undefined): boolean {
  if (!firma) return false;
  return verificar(`bono:${code}`, firma, secreto());
}

export function urlBono(code: string, locale: Locale = "es"): string {
  return urlFor("web", `/bono/${code}?t=${firmaBono(code)}`, locale);
}
