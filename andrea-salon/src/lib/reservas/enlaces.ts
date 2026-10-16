import "server-only";

import { urlFor } from "@/lib/hosts";
import { firmar, verificar } from "@/lib/tokens";
import type { Locale } from "@/i18n/config";

/**
 * Enlaces que recibe la clienta por correo: ver, cancelar o cambiar su cita. Llevan el
 * `manage_token` de la cita (un uuid que no se adivina) Y una firma HMAC con `TOKEN_SECRET`:
 * así un token filtrado en un log no vale sin el secreto, y un enlace manipulado se rechaza
 * antes de tocar la base de datos.
 */
function secreto(): string {
  const s = process.env.TOKEN_SECRET;
  if (!s || s.length < 32) {
    throw new Error("Falta TOKEN_SECRET (32 bytes en hex) en el entorno.");
  }
  return s;
}

export function firmarToken(token: string): string {
  return firmar(token, secreto());
}

export function tokenValido(token: string, firma: string | null | undefined): boolean {
  if (!firma) return false;
  return verificar(token, firma, secreto());
}

export function urlCita(token: string, locale: Locale = "es"): string {
  return urlFor("reservar", `/cita/${token}?t=${firmarToken(token)}`, locale);
}

export function urlCambiarCita(token: string, locale: Locale = "es"): string {
  return urlFor("reservar", `/?cambiar=${token}&t=${firmarToken(token)}`, locale);
}

export function urlAccionCita(token: string, accion: "cancelar" | "si-voy" | "no-puedo", locale: Locale = "es"): string {
  return urlFor("reservar", `/cita/${token}?t=${firmarToken(token)}&accion=${accion}`, locale);
}
