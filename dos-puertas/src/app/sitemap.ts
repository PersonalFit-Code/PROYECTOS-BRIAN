import type { MetadataRoute } from "next";
import { LOCALES, LOCALE_META, localePath } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo";

const PAGES = ["/", "/carta", "/vinos", "/historia", "/visita", "/preguntas"] as const;

/** Cada página en cada idioma, con sus versiones hermanas (hreflang) y la fecha de esta versión. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return LOCALES.flatMap((l) =>
    PAGES.map((p) => ({
      url: `${SITE_URL}${localePath(l, p)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: p === "/" ? 1 : 0.7,
      alternates: {
        languages: {
          ...Object.fromEntries(LOCALES.map((o) => [LOCALE_META[o].hreflang, `${SITE_URL}${localePath(o, p)}`])),
          "x-default": `${SITE_URL}${localePath("es", p)}`,
        },
      },
    })),
  );
}
