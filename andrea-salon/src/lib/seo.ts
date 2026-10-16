import type { Metadata } from "next";
import { BUSINESS } from "@/data/business";
import { LOCALES, LOCALE_META, localePath, type KnownLocale, type Locale } from "@/i18n/config";

import { SITE_URL } from "@/lib/siteUrl";

export { SITE_URL };

/** URL absoluta de una ruta sin prefijo ("/servicios") en un idioma. */
export function absoluteUrl(locale: Locale, path = "/"): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** hreflang alternates para una ruta sin prefijo ("/", "/servicios"). */
export function buildAlternates(locale: Locale, path = "/"): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[LOCALE_META[l].hreflang] = `${SITE_URL}${localePath(l, path)}`;
  languages["x-default"] = `${SITE_URL}${localePath("es", path)}`;
  return { canonical: `${SITE_URL}${localePath(locale, path)}`, languages };
}

/**
 * Metadata base de una página (título, descripción, OG, hreflang).
 * `ogImage` por defecto es `/og.jpg` (1200×630), PENDIENTE de generar con el logo y el claim cuando
 * lleguen las fotos: hasta entonces las tarjetas de WhatsApp/Instagram saldrán sin imagen.
 */
export function pageMetadata(
  locale: Locale,
  path: string,
  { title, description, ogImage = "/og.jpg" }: { title: string; description: string; ogImage?: string },
): Metadata {
  const url = `${SITE_URL}${localePath(locale, path)}`;
  return {
    // Si el título ya lleva la marca, `absolute`: la plantilla del layout («%s · Andrea Salón») la
    // pondría otra vez y la pestaña diría «… Andrea Salón, Ourense · Andrea Salón».
    title: title.includes(BUSINESS.name) ? { absolute: title } : title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: "website",
      locale: LOCALE_META[locale].ogLocale,
      /* Por `KnownLocale`: con un solo idioma publicado, `Locale` menos ese idioma es `never` y
         TypeScript no sabe indexar la tabla. */
      alternateLocale: (LOCALES as readonly KnownLocale[]).filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
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
 * Unicode: el JSON sigue siendo válido y ningún texto (reseña, servicio, respuesta) puede cerrar el script.
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
