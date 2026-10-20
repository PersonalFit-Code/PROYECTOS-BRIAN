/**
 * Traducción de DATOS (carta, platos estrella, alérgenos, etiquetas) por idioma.
 * Los ficheros src/data/*.ts siguen en español; cada idioma aporta overrides por id en src/i18n/data/{locale}.ts
 * y estas funciones devuelven los datos ya localizados (con fallback al español).
 */
import { ALLERGENS, type Allergen, type AllergenId } from "@/data/allergens";
import { DIET_TAG_LABELS, MENU_CATEGORIES, MENU_ITEMS, type DietTag, type MenuCategory, type MenuCategoryId, type MenuItem, type MenuItemId } from "@/data/menu";
import { STAR_DISHES, type StarDish } from "@/data/dishes";
import { PHOTOS, type Photo } from "@/data/photos";
import { WINES, type Wine } from "@/data/wines";
import { BUSINESS } from "@/data/business";
import type { Locale } from "./config";

export interface DataTranslations {
  /* Las claves van TIPADAS con los ids reales: una traducción que hable de un plato o de una
     categoría que ya no existe es un error de compilación, no un texto que se queda en castellano
     sin que nadie lo note. Es el fallo típico al cambiar la carta. */
  categories?: Partial<Record<MenuCategoryId, Partial<Pick<MenuCategory, "label" | "kicker" | "description">>>>;
  menuItems?: Partial<
    Record<MenuItemId, Partial<Pick<MenuItem, "name" | "description" | "unit" | "pairing">> & { variants?: string[] }>
  >;
  starDishes?: Partial<
    Record<
      string,
      Partial<Pick<StarDish, "name" | "kicker" | "headline" | "description" | "unit" | "badge">> & {
        ingredients?: string[];
        pairingWhy?: string;
      }
    >
  >;
  allergens?: Partial<Record<AllergenId, Partial<Pick<Allergen, "label" | "description">>>>;
  dietTags?: Partial<Record<DietTag, string>>;
  features?: string[];
  /** `alt` y `caption` de las fotos (src/data/photos.ts) por id. */
  photos?: Partial<Record<string, Partial<Pick<Photo, "alt" | "caption">>>>;
  /**
   * La PROSA de las fichas de vino (src/data/wines.ts) por id de vino.
   *
   * Solo estos seis campos, y no el resto del vino, porque los demás no se traducen: el nombre de
   * la botella es el de la etiqueta, la bodega y el enólogo son nombres propios, las uvas son
   * nombres de variedad y el precio es un número. Lo que sí es prosa —la nota de cata, la historia,
   * el terreno, la elaboración y la crianza— estaba saliendo EN CASTELLANO bajo encabezados
   * traducidos en /gl, /en y /pt.
   *
   * `subzone` entra en la lista porque casi siempre es un topónimo que no se toca (Amandi, Gomariz,
   * Sablet) pero alguna vez lleva una palabra común delante: "Valle del Salnés" es "Val do Salnés"
   * en gallego. Traducir solo esas; las demás no hace falta repetirlas.
   *
   * La clave es `string` y no un tipo de ids porque `Wine.id` tampoco lo es; lo que impide traducir
   * un vino que ya no está en la carta es `assertTranslationIntegrity()`, que rompe el build.
   */
  wines?: Partial<Record<string, Partial<Pick<Wine, "notes" | "story" | "terroir" | "winemaking" | "ageing" | "subzone">>>>;
}

import { assertTranslationIntegrity } from "@/data/integrity";
import gl from "./data/gl";
import en from "./data/en";
import pt from "./data/pt";

const TRANSLATIONS: Record<Locale, DataTranslations> = { es: {}, gl, en, pt };

/* Rompe el build si una traducción declara un número de variantes distinto del de la carta. El tipo
   `MenuItemId` ya impide traducir un plato inexistente, pero `variants?: string[]` no tiene longitud:
   una lista de 1 o de 3 compilaría y cambiaría las etiquetas de sitio EN SILENCIO —las variantes se
   emparejan por posición—, de modo que la media ración acabaría anunciando el precio de la entera. */
assertTranslationIntegrity(TRANSLATIONS);

export function localizeCategories(locale: Locale): MenuCategory[] {
  const t = TRANSLATIONS[locale].categories ?? {};
  return MENU_CATEGORIES.map((c) => ({ ...c, ...(t[c.id] ?? {}) }));
}

export function localizeMenuItems(locale: Locale): MenuItem[] {
  const t = TRANSLATIONS[locale].menuItems ?? {};
  return MENU_ITEMS.map((item) => {
    const o = t[item.id];
    if (!o) return item;
    const { variants, ...rest } = o;
    return {
      ...item,
      ...rest,
      variants:
        item.variants && variants
          ? item.variants.map((v, i) => ({ ...v, label: variants[i] ?? v.label }))
          : item.variants,
    };
  });
}

export function localizeStarDishes(locale: Locale): StarDish[] {
  const t = TRANSLATIONS[locale].starDishes ?? {};
  return STAR_DISHES.map((d) => {
    const o = t[d.id];
    if (!o) return d;
    const { ingredients, pairingWhy, ...rest } = o;
    return {
      ...d,
      ...rest,
      ingredients: ingredients ?? d.ingredients,
      pairing: pairingWhy ? { ...d.pairing, why: pairingWhy } : d.pairing,
    };
  });
}

export function localizeAllergens(locale: Locale): Allergen[] {
  const t = TRANSLATIONS[locale].allergens ?? {};
  return ALLERGENS.map((a) => ({ ...a, ...(t[a.id] ?? {}) }));
}

export function localizeAllergenMap(locale: Locale): Record<AllergenId, Allergen> {
  return Object.fromEntries(localizeAllergens(locale).map((a) => [a.id, a])) as Record<AllergenId, Allergen>;
}

export function localizeDietTags(locale: Locale): Record<DietTag, string> {
  return { ...DIET_TAG_LABELS, ...(TRANSLATIONS[locale].dietTags ?? {}) };
}

export function localizeFeatures(locale: Locale): string[] {
  return TRANSLATIONS[locale].features ?? [...BUSINESS.features];
}

/** Fotos con `alt` y `caption` en el idioma activo (fallback al español). */
export function localizePhotos(locale: Locale): Photo[] {
  const t = TRANSLATIONS[locale].photos ?? {};
  return PHOTOS.map((p) => ({ ...p, ...(t[p.id] ?? {}) }));
}

/** Una foto concreta ya localizada (o `undefined` si el id no existe). */
export function localizePhotoById(locale: Locale, id: string): Photo | undefined {
  const photo = PHOTOS.find((p) => p.id === id);
  if (!photo) return undefined;
  return { ...photo, ...(TRANSLATIONS[locale].photos?.[id] ?? {}) };
}

/**
 * Vinos con la PROSA en el idioma activo (fallback al español, campo a campo).
 *
 * Toma una lista en vez de devolver la carta entera a propósito: los componentes ya eligen sus
 * vinos con `winesByOrigin()`, `winesForDish()` o `winesByKind()`, y duplicar aquí esa selección
 * para cada idioma sería dos sitios donde equivocarse. Así se envuelve lo que ya tienen.
 *
 * En español devuelve EL MISMO array, sin copiar: es el caso más frecuente y así los `useMemo` que
 * dependen de él no se invalidan por una identidad nueva.
 */
export function localizeWines(locale: Locale, wines: readonly Wine[]): Wine[] {
  const t = TRANSLATIONS[locale].wines;
  if (!t) return wines as Wine[];
  return wines.map((w) => {
    const o = t[w.id];
    return o ? { ...w, ...o } : w;
  });
}

/** Un vino suelto, ya localizado (o `undefined` si el id no existe). */
export function localizeWineById(locale: Locale, id: string): Wine | undefined {
  const wine = WINES.find((w) => w.id === id);
  if (!wine) return undefined;
  return { ...wine, ...(TRANSLATIONS[locale].wines?.[id] ?? {}) };
}
