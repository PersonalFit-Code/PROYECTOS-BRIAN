import type { Metadata } from "next";
import { LOCALES, LOCALE_META, localePath, type Locale } from "@/i18n/config";

/* Hasta que haya dominio propio, el de Vercel. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dos-puertas.vercel.app";

export function pageMetadata(locale: Locale, path: string, { title, description }: { title: string; description: string }): Metadata {
  const languages = {
    ...Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].hreflang, localePath(l, path)])),
    "x-default": localePath("es", path),
  };
  return {
    title,
    description,
    alternates: { canonical: localePath(locale, path), languages },
    openGraph: { title, description, locale: LOCALE_META[locale].ogLocale, type: "website", siteName: "Café Bar Dos Puertas" },
  };
}

/** JSON-LD seguro dentro de <script>. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
