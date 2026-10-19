/**
 * Configuración de idiomas. Las URLs llevan prefijo de idioma (/es, /gl, /en, /pt)
 * para que cada versión sea indexable con hreflang.
 */
export const LOCALES = ["es", "gl", "en", "pt"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

/**
 * Cabecera de petición con el idioma de la URL, que escribe el proxy (`src/proxy.ts`) y lee el 404
 * global (`src/app/global-not-found.tsx`). Existe porque ese 404 se resuelve FUERA de `[locale]`:
 * no recibe `params` y no hay otra forma de que sepa en qué idioma hablarle a quien ha llegado ahí.
 * Vive aquí y no en el proxy para que la página no tenga que importar `next/server`.
 *
 * Quien la lea valida con `isLocale()` sin excepción: en las rutas que el proxy no mira (las que
 * llevan punto, ver su `matcher`) la cabecera llega tal cual la mande el cliente.
 */
export const LOCALE_HEADER = "x-tixola-locale";

export const LOCALE_META: Record<
  Locale,
  { label: string; native: string; short: string; hreflang: string; ogLocale: string; intl: string }
> = {
  es: { label: "Español", native: "Español", short: "ES", hreflang: "es-ES", ogLocale: "es_ES", intl: "es-ES" },
  gl: { label: "Galego", native: "Galego", short: "GL", hreflang: "gl-ES", ogLocale: "gl_ES", intl: "gl-ES" },
  en: { label: "English", native: "English", short: "EN", hreflang: "en", ogLocale: "en_GB", intl: "en-GB" },
  pt: { label: "Português", native: "Português", short: "PT", hreflang: "pt-PT", ogLocale: "pt_PT", intl: "pt-PT" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Construye una ruta con prefijo de idioma. Acepta "/", "/carta", "/#platos", "#platos".
 *   localePath("es", "/carta")   → "/es/carta"
 *   localePath("gl", "/#platos") → "/gl#platos"
 *   localePath("en", "/")        → "/en"
 */
export function localePath(locale: Locale, path = "/"): string {
  if (/^(https?:|tel:|mailto:)/.test(path)) return path;
  if (path.startsWith("#")) return `/${locale}${path}`;
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  if (clean.startsWith("/#")) return `/${locale}${clean.slice(1)}`;
  return `/${locale}${clean}`;
}

/** Quita el prefijo de idioma de un pathname: "/gl/carta" → "/carta" */
export function stripLocale(pathname: string): { locale: Locale | null; path: string } {
  const m = pathname.match(/^\/([a-z]{2})(?=\/|$)(.*)$/);
  if (m && isLocale(m[1])) return { locale: m[1], path: m[2] || "/" };
  return { locale: null, path: pathname || "/" };
}
