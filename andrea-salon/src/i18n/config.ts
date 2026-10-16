/**
 * Configuración de idiomas. Las URLs llevan prefijo de idioma (/es, /gl) para que cada versión
 * sea indexable con hreflang.
 *
 * DOS LISTAS, Y LA DIFERENCIA IMPORTA. `KNOWN_LOCALES` es todo lo que la web SABE hablar (tiene
 * metadatos, carpeta de mensajes y entrada en el cargador); `LOCALES` es lo que está PUBLICADO. Hoy
 * solo el castellano: el gallego se activa en la fase 3, cuando la traducción esté completa, porque
 * un gallego a medias —la mitad de las frases cayendo al español por el `deepMerge`— se nota más que
 * no tenerlo. Activarlo es añadir `"gl"` a `LOCALES`: el resto (hreflang, sitemap, selector, carga de
 * mensajes) cuelga de esa lista y se enciende solo.
 */
export const KNOWN_LOCALES = ["es", "gl"] as const;
export type KnownLocale = (typeof KNOWN_LOCALES)[number];

/* El gallego se publica en la fase 3 (16/10/2026) con la traducción completa de `messages/gl`.
   Lo que aún sale en castellano en una página gallega: los correos y el aviso legal de datos
   pendientes (`[NIF PENDIENTE]`); está en `docs/lanzamiento.md`. */
export const LOCALES = ["es", "gl"] as const satisfies readonly KnownLocale[];
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_META: Record<
  KnownLocale,
  { label: string; native: string; short: string; hreflang: string; ogLocale: string; intl: string }
> = {
  es: { label: "Español", native: "Español", short: "ES", hreflang: "es-ES", ogLocale: "es_ES", intl: "es-ES" },
  gl: { label: "Galego", native: "Galego", short: "GL", hreflang: "gl-ES", ogLocale: "gl_ES", intl: "gl-ES" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Construye una ruta con prefijo de idioma. Acepta "/", "/servicios", "/#equipo", "#equipo".
 *   localePath("es", "/servicios") → "/es/servicios"
 *   localePath("gl", "/#equipo")   → "/gl#equipo"
 *   localePath("es", "/")          → "/es"
 * Las URL absolutas y los esquemas `tel:`/`mailto:` se devuelven tal cual: así los enlaces que
 * salen de `urlFor` (reserva, panel) pueden pasar por aquí sin que nadie tenga que distinguirlos.
 */
export function localePath(locale: Locale, path = "/"): string {
  if (/^(https?:|tel:|mailto:)/.test(path)) return path;
  if (path.startsWith("#")) return `/${locale}${path}`;
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  if (clean.startsWith("/#")) return `/${locale}${clean.slice(1)}`;
  return `/${locale}${clean}`;
}

/** Quita el prefijo de idioma de un pathname: "/gl/servicios" → "/servicios" */
export function stripLocale(pathname: string): { locale: Locale | null; path: string } {
  const m = pathname.match(/^\/([a-z]{2})(?=\/|$)(.*)$/);
  if (m && isLocale(m[1])) return { locale: m[1], path: m[2] || "/" };
  return { locale: null, path: pathname || "/" };
}
