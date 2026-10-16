import { BUSINESS, type DayKey, type TimeRange } from "@/data/business";
import type { Messages } from "@/i18n/types";

/**
 * Marcadores de las respuestas de `data/faq.ts` ({hours}, {phone}, {address}, {whatsapp}).
 *
 * Fuente única para las dos caras del FAQ de la portada: el bloque visible (`<Faq />`) y el
 * `FAQPage` de JSON-LD (`<HomeJsonLd />`). Google exige que el texto marcado esté presente en la
 * página tal cual, así que ambos tienen que interpolar EXACTAMENTE las mismas variables.
 */
export interface FaqVars extends Record<string, string> {
  hours: string;
  phone: string;
  address: string;
  whatsapp: string;
}

const WEEK: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const HOURS = BUSINESS.hours as Record<DayKey, TimeRange[]>;

/** "Lunes: 09:30–13:30 / 15:30–19:30 · … · Domingo: Cerrado" (desde business.ts). */
export function faqVars(m: Messages): FaqVars {
  const hours = WEEK.map((day) => {
    const ranges = HOURS[day];
    const label = ranges.length ? ranges.map((r) => `${r.open}–${r.close}`).join(" / ") : m.common.status.closed;
    return `${m.common.days[day]}: ${label}`;
  }).join(" · ");

  return { hours, phone: BUSINESS.phone.display, address: BUSINESS.address.full, whatsapp: BUSINESS.whatsapp.display };
}

/**
 * Las respuestas llevan `**negrita**`: `<Faq />` la convierte en `<strong>` y el `FAQPage` de
 * JSON-LD le quita las marcas. No se le mete HTML al JSON-LD: el texto plano es lo que Google
 * compara con lo que ve en la página.
 */
export const FAQ_BOLD_PATTERN = /\*\*([^*]+)\*\*/g;

/** Quita las marcas de negrita dejando el texto: para el JSON-LD y para cualquier uso en texto plano. */
export function stripFaqMarks(text: string): string {
  return text.replace(FAQ_BOLD_PATTERN, "$1");
}
