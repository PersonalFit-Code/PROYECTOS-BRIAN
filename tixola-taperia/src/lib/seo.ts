import type { Metadata } from "next";
import { BUSINESS } from "@/data/business";
import type { DietTag, MenuCategory, MenuItem } from "@/data/menu";
import { LOCALES, LOCALE_META, localePath, type Locale } from "@/i18n/config";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tixola.restaurantesourense.com").replace(/\/$/, "");

/** URL absoluta de una ruta sin prefijo ("/carta") en un idioma. */
export function absoluteUrl(locale: Locale, path = "/"): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** hreflang alternates para una ruta sin prefijo ("/", "/carta"). */
export function buildAlternates(locale: Locale, path = "/"): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[LOCALE_META[l].hreflang] = `${SITE_URL}${localePath(l, path)}`;
  languages["x-default"] = `${SITE_URL}${localePath("es", path)}`;
  return { canonical: `${SITE_URL}${localePath(locale, path)}`, languages };
}

/** Metadata base de una página (título, descripción, OG, hreflang). */
export function pageMetadata(
  locale: Locale,
  path: string,
  { title, description, ogImage = "/og.jpg" }: { title: string; description: string; ogImage?: string },
): Metadata {
  const url = `${SITE_URL}${localePath(locale, path)}`;
  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: "website",
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
      siteName: BUSINESS.name,
      title,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${BUSINESS.name} — ${BUSINESS.address.city}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

/* ──────────────────────────────────────────────────────────────
   JSON-LD (schema.org)
   ────────────────────────────────────────────────────────────── */

/** Valor serializable en JSON-LD. */
export type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
export interface JsonLdObject {
  [key: string]: JsonLdValue | undefined;
}

/**
 * Serializa para `<script type="application/ld+json">`. Escapa `<`, `>` y `&` como secuencias
 * Unicode: el JSON sigue siendo válido y ningún texto (reseña, plato, respuesta) puede cerrar el script.
 */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export interface BreadcrumbItem {
  name: string;
  /** URL absoluta. El último elemento puede omitirla (página actual). */
  url?: string;
}

/** `BreadcrumbList` a partir de migas ordenadas (Inicio → … → página actual). */
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export interface FaqEntry {
  q: string;
  a: string;
}

/** `FAQPage` con preguntas y respuestas en texto plano (ya interpoladas y en el idioma de la página). */
export function faqJsonLd(qa: readonly FaqEntry[], options: { locale?: Locale; url?: string } = {}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(options.url ? { "@id": `${options.url}#faq`, url: options.url } : {}),
    ...(options.locale ? { inLanguage: LOCALE_META[options.locale].hreflang } : {}),
    mainEntity: qa.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Etiquetas dietéticas de la carta → vocabulario `RestrictedDiet` de schema.org. */
const DIET_SCHEMA: Partial<Record<DietTag, string>> = {
  vegano: "https://schema.org/VeganDiet",
  vegetariano: "https://schema.org/VegetarianDiet",
  "sin-gluten": "https://schema.org/GlutenFreeDiet",
};

/**
 * `Menu` → `MenuSection[]` → `MenuItem[]` con precio (EUR) y dietas aptas.
 * Se alimenta de `localizeCategories()` / `localizeMenuItems()` para que salga en el idioma de la página.
 * Las categorías sin platos se omiten; los platos con variantes publican una oferta por variante.
 */
export function menuJsonLd(locale: Locale, categories: readonly MenuCategory[], items: readonly MenuItem[], name: string): JsonLdObject {
  const url = absoluteUrl(locale, "/carta");
  const offer = (price: number, label?: string): JsonLdObject => ({
    "@type": "Offer",
    price: price.toFixed(2),
    priceCurrency: "EUR",
    ...(label ? { name: label } : {}),
  });
  const sections = categories
    .map((category) => {
      const dishes = items.filter((item) => item.category === category.id);
      if (!dishes.length) return null;
      return {
        "@type": "MenuSection",
        name: category.label,
        description: category.description,
        hasMenuItem: dishes.map((item) => {
          const diets = item.tags.map((tag) => DIET_SCHEMA[tag]).filter((d): d is string => typeof d === "string");
          const offers = item.variants?.length ? item.variants.map((v) => offer(v.price, v.label)) : offer(item.price, item.unit);
          return {
            "@type": "MenuItem",
            name: item.name,
            description: item.description,
            ...(item.image ? { image: `${SITE_URL}${item.image}` } : {}),
            offers,
            ...(diets.length ? { suitableForDiet: diets } : {}),
          };
        }),
      };
    })
    .filter((section): section is NonNullable<typeof section> => section !== null);

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${url}#menu`,
    url,
    name,
    inLanguage: LOCALE_META[locale].hreflang,
    hasMenuSection: sections,
  };
}
