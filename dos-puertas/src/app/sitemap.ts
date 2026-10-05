import type { MetadataRoute } from "next";
import { LOCALES, localePath } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((l) => ["/", "/barra", "/historia", "/visita"].map((p) => ({ url: `${SITE_URL}${localePath(l, p)}` })));
}
