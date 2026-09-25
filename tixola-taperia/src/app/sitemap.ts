import type { MetadataRoute } from "next";
import { LOCALES, LOCALE_META, localePath } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo";

const PATHS: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/carta", priority: 0.9, changeFrequency: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency,
      priority: locale === "es" ? priority : priority - 0.1,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].hreflang, `${SITE_URL}${localePath(l, path)}`])),
      },
    })),
  );
}
