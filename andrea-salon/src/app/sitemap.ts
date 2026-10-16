import type { MetadataRoute } from "next";
import { LEGAL_DOC_KEYS, LEGAL_IDENTITY_PENDING } from "@/data/legal";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePath } from "@/i18n/config";
import legal from "@/i18n/messages/es/legal";
import { SITE_URL } from "@/lib/seo";

type ChangeFrequency = "weekly" | "monthly" | "yearly";

/* Solo las rutas de `(web)`. La reserva vive (o vivirá) en su subdominio con su propia canónica, y
   el panel y las páginas con token no se indexan nunca. */
const PATHS: Array<{ path: string; priority: number; changeFrequency: ChangeFrequency }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/servicios", priority: 0.9, changeFrequency: "weekly" },
  { path: "/equipo", priority: 0.7, changeFrequency: "monthly" },
  { path: "/galeria", priority: 0.7, changeFrequency: "weekly" },
  { path: "/resenas", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contacto", priority: 0.8, changeFrequency: "monthly" },
  { path: "/bonos", priority: 0.6, changeFrequency: "monthly" },
  /* Las legales, fuera mientras falte el NIF (van con `noindex`). */
  ...(LEGAL_IDENTITY_PENDING ? [] : LEGAL_DOC_KEYS.map((key) => ({ path: `/legal/${legal[key].slug}`, priority: 0.3, changeFrequency: "yearly" as const }))),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries([
          ...LOCALES.map((l) => [LOCALE_META[l].hreflang, `${SITE_URL}${localePath(l, path)}`]),
          ["x-default", `${SITE_URL}${localePath(DEFAULT_LOCALE, path)}`],
        ]),
      },
    })),
  );
}
