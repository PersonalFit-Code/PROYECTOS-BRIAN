import es from "./messages/es";
import gl from "./messages/gl";
import pt from "./messages/pt";
import type { Locale } from "./config";

export type Messages = typeof es;

const MESSAGES: Record<Locale, Messages> = { es, gl, pt };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

/** format("Abre a las {time}", { time: "19:30" }) */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
