/**
 * Traducción de DATOS (carta, platos estrella, alérgenos, etiquetas) por idioma.
 * Los ficheros src/data/*.ts siguen en español; cada idioma aporta overrides por id en src/i18n/data/{locale}.ts
 * y estas funciones devuelven los datos ya localizados (con fallback al español).
 */
import { ALLERGENS, type Allergen, type AllergenId } from "@/data/allergens";
import { DIET_TAG_LABELS, MENU_CATEGORIES, MENU_ITEMS, type DietTag, type MenuCategory, type MenuCategoryId, type MenuItem, type MenuItemId } from "@/data/menu";
import { STAR_DISHES, type StarDish } from "@/data/dishes";
import { PHOTOS, type Photo } from "@/data/photos";
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
