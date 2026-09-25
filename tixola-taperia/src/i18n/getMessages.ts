import es from "./messages/es";
import { deepMerge, type DeepPartial, type Messages } from "./types";
import type { Locale } from "./config";

const loaders: Record<Locale, () => Promise<DeepPartial<Messages>>> = {
  es: async () => ({}),
  gl: () => import("./messages/gl").then((m) => m.default),
  en: () => import("./messages/en").then((m) => m.default),
  pt: () => import("./messages/pt").then((m) => m.default),
};

/** Mensajes completos para un idioma (con fallback al español clave a clave). */
export async function getMessages(locale: Locale): Promise<Messages> {
  const partial = await loaders[locale]();
  return deepMerge(es, partial);
}

/** Interpolación sencilla: format("Abre en {minutes} min", { minutes: 5 }) */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
