/**
 * Idiomas. Las URLs llevan prefijo (/es) para que añadir gallego o inglés después sea solo sumar
 * un fichero de mensajes y una entrada aquí.
 */
export const LOCALES = ["es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_META: Record<Locale, { label: string; short: string; hreflang: string; ogLocale: string; intl: string }> = {
  es: { label: "Español", short: "ES", hreflang: "es-ES", ogLocale: "es_ES", intl: "es-ES" },
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
