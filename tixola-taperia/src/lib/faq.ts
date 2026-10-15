import { BUSINESS, type DayKey, type TimeRange } from "@/data/business";
import type { Messages } from "@/i18n/types";

/**
 * Marcadores de `m.legal.faq.items` ({hours}, {phone}, {address}).
 *
 * Fuente única para las dos caras del FAQ de la portada: el bloque visible (`<Faq />`) y el
 * `FAQPage` de JSON-LD (`<HomeJsonLd />`). Google exige que el texto marcado esté presente en la
 * página tal cual, así que ambos tienen que interpolar EXACTAMENTE las mismas variables.
 */
export interface FaqVars extends Record<string, string> {
  hours: string;
  phone: string;
  address: string;
}

const WEEK: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const HOURS = BUSINESS.hours as Record<DayKey, TimeRange[]>;

/** "Lunes: 19:30–00:00 · Martes: 12:00–16:00 / 20:00–00:00 · … · Domingo: Cerrado" (desde business.ts). */
export function faqVars(m: Messages): FaqVars {
  const hours = WEEK.map((day) => {
    const ranges = HOURS[day];
    const label = ranges.length ? ranges.map((r) => `${r.open}–${r.close}`).join(" / ") : m.common.status.closed;
    return `${m.common.days[day]}: ${label}`;
  }).join(" · ");

  return { hours, phone: BUSINESS.phone.display, address: BUSINESS.address.full };
}

/* ──────────────────────────────────────────────────────────────
   Negritas de las respuestas
   ────────────────────────────────────────────────────────────── */

/**
 * Las respuestas del FAQ llevan `**negrita**` como los documentos legales, pero el bloque de la
 * portada las pintaba en crudo: en pantalla se leía literalmente «as **croquetas sen glute**», con
 * los asteriscos, en los cuatro idiomas. Y justo en la respuesta de celíacos, que es la que más
 * falta hace que se lea bien.
 *
 * Son dos arreglos, porque el texto sale por dos sitios y tienen que seguir diciendo lo mismo:
 * `<Faq />` convierte los tramos en `<strong>` y el `FAQPage` de JSON-LD les quita las marcas. No
 * se le mete HTML al JSON-LD —schema.org admitiría `<strong>`, pero el texto plano es lo que Google
 * compara con lo que ve en la página, y así no hay dos versiones del mismo párrafo.
 */
export const FAQ_BOLD_PATTERN = /\*\*([^*]+)\*\*/g;

/** Quita las marcas de negrita dejando el texto: para el JSON-LD y para cualquier uso en texto plano. */
export function stripFaqMarks(text: string): string {
  return text.replace(FAQ_BOLD_PATTERN, "$1");
}
