import es from "./messages/es";
import { deepMerge, type DeepPartial, type Messages } from "./types";
import type { KnownLocale, Locale } from "./config";

/**
 * Cargadores por idioma. El español es la fuente de verdad y no carga nada; los demás son parciales
 * y caen al español clave a clave (`deepMerge`), así que se pueden traducir por partes sin romper
 * el build. La tabla va por `KnownLocale` y no por `Locale` a propósito: el gallego ya tiene su
 * entrada aunque todavía no esté publicado, de modo que activarlo es tocar SOLO `LOCALES` en
 * `config.ts`. El `import()` es dinámico: mientras nadie pida `gl`, su paquete no se descarga.
 */
const loaders: Record<KnownLocale, () => Promise<DeepPartial<Messages>>> = {
  es: async () => ({}),
  gl: () => import("./messages/gl").then((m) => m.default),
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
