import es, { type CamareroTexts } from "./es";
import gl from "./gl";
import en from "./en";
import pt from "./pt";

/**
 * Los idiomas del camarero virtual. El chat arranca en el de la web (o en el del navegador, si es
 * uno de estos) y se cambia con el selector de su cabecera. Para añadir uno: un fichero con las
 * mismas claves y una entrada aquí.
 */
export const CAMARERO_LANGS = ["es", "gl", "en", "pt"] as const;
export type CamareroLang = (typeof CAMARERO_LANGS)[number];

export const CAMARERO_TEXTS: Record<CamareroLang, CamareroTexts> = { es, gl, en, pt };

/* Nombre de cada idioma en su propia lengua (para lectores de pantalla) y la etiqueta corta. */
export const CAMARERO_LANG_NAMES: Record<CamareroLang, { short: string; name: string }> = {
  es: { short: "ES", name: "Español" },
  gl: { short: "GL", name: "Galego" },
  en: { short: "EN", name: "English" },
  pt: { short: "PT", name: "Português" },
};

export function isCamareroLang(v: string): v is CamareroLang {
  return (CAMARERO_LANGS as readonly string[]).includes(v);
}

/** El primero de los idiomas del navegador que hable el camarero, o `null`. */
export function langFromNavigator(): CamareroLang | null {
  for (const l of navigator.languages ?? [navigator.language]) {
    const code = l.toLowerCase().split("-")[0];
    if (isCamareroLang(code)) return code;
  }
  return null;
}

export type { CamareroTexts };
