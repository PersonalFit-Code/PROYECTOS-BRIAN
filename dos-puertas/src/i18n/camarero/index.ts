import es, { type CamareroTexts } from "./es";
import gl from "./gl";
import en from "./en";
import pt from "./pt";

/**
 * Los idiomas del camarero virtual: los mismos que los de la web, que es quien decide (selector del
 * menú). Para añadir uno: un fichero con las mismas claves y una entrada aquí.
 */
export const CAMARERO_LANGS = ["es", "gl", "en", "pt"] as const;
export type CamareroLang = (typeof CAMARERO_LANGS)[number];

export const CAMARERO_TEXTS: Record<CamareroLang, CamareroTexts> = { es, gl, en, pt };

export function isCamareroLang(v: string): v is CamareroLang {
  return (CAMARERO_LANGS as readonly string[]).includes(v);
}

export type { CamareroTexts };
