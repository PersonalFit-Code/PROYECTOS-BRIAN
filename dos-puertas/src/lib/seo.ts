import type { Metadata } from "next";
import { LOCALES, LOCALE_META, localePath, type Locale } from "@/i18n/config";

/* Hasta que haya dominio propio, el de Vercel. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dos-puertas.vercel.app";

/**
 * Metadatos de cada página: título y descripción para Google (de `messages.seo`), canónica, las
 * cuatro versiones de idioma (hreflang + x-default) y la tarjeta para compartir con su imagen.
 */
export function pageMetadata(locale: Locale, path: string, { title, description, imageAlt }: { title: string; description: string; imageAlt: string }): Metadata {
  const languages = {
    ...Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].hreflang, localePath(l, path)])),
    "x-default": localePath("es", path),
  };
  const canonical = localePath(locale, path);
  /* La portada con el logo, una por idioma (public/og). */
  const image = { url: `/og/${locale}.jpg`, width: 1200, height: 630, alt: imageAlt };
  return {
    /* Absoluto: cada título ya lleva la marca donde conviene. */
    title: { absolute: title },
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
      type: "website",
      siteName: "Café Bar Dos Puertas",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

/** Migas de pan para Google: Inicio › página. */
export function breadcrumbLd(locale: Locale, home: string, name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: home, item: `${SITE_URL}${localePath(locale, "/")}` },
      { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${localePath(locale, path)}` },
    ],
  };
}

/** JSON-LD seguro dentro de <script>. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
