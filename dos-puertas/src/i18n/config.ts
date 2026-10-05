/**
 * Idiomas. Las URLs llevan prefijo (/es, /gl…): añadir otro es sumar un fichero de mensajes, su
 * entrada en `getMessages.ts` y una línea aquí. El selector del menú los lista en este orden.
 */
export const LOCALES = ["es", "gl", "pt"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_META: Record<Locale, { label: string; short: string; hreflang: string; ogLocale: string; intl: string }> = {
  es: { label: "Español", short: "ES", hreflang: "es-ES", ogLocale: "es_ES", intl: "es-ES" },
  gl: { label: "Galego", short: "GL", hreflang: "gl-ES", ogLocale: "gl_ES", intl: "gl-ES" },
  pt: { label: "Português", short: "PT", hreflang: "pt-PT", ogLocale: "pt_PT", intl: "pt-PT" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** localePath("es", "/carta") → "/es/carta" · localePath("es", "/#barra") → "/es#barra" */
export function localePath(locale: Locale, path = "/"): string {
  if (/^(https?:|tel:|mailto:)/.test(path)) return path;
  if (path.startsWith("#")) return `/${locale}${path}`;
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  if (clean.startsWith("/#")) return `/${locale}${clean.slice(1)}`;
  return `/${locale}${clean}`;
}
