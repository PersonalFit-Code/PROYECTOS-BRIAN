import type { MetadataRoute } from "next";
import { LEGAL_DOC_KEYS } from "@/data/legal";
import { LOCALES, LOCALE_META, localePath } from "@/i18n/config";
import legal from "@/i18n/messages/es/legal";
import { SITE_URL } from "@/lib/seo";

type ChangeFrequency = "weekly" | "monthly" | "yearly";

const PATHS: Array<{ path: string; priority: number; changeFrequency: ChangeFrequency }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/carta", priority: 0.9, changeFrequency: "weekly" },
  /* Páginas legales: los slugs son los del español (compartidos por todos los idiomas, ver legal/[slug]/page.tsx) */
  ...LEGAL_DOC_KEYS.map((key) => ({ path: `/legal/${legal[key].slug}`, priority: 0.3, changeFrequency: "yearly" as const })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency,
      priority: locale === "es" ? priority : Math.max(0.1, priority - 0.1),
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].hreflang, `${SITE_URL}${localePath(l, path)}`])),
      },
    })),
  );
}
