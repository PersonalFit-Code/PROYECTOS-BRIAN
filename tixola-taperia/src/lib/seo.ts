import type { Metadata } from "next";
import { BUSINESS } from "@/data/business";
import { LOCALES, LOCALE_META, localePath, type Locale } from "@/i18n/config";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tixola.restaurantesourense.com").replace(/\/$/, "");

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
