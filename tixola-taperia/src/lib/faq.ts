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
