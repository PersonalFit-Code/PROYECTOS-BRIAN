import type { MetadataRoute } from "next";
import { LEGAL_DOC_KEYS, LEGAL_IDENTITY_PENDING } from "@/data/legal";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePath } from "@/i18n/config";
import legal from "@/i18n/messages/es/legal";
import { SITE_URL } from "@/lib/seo";

type ChangeFrequency = "weekly" | "monthly" | "yearly";

const PATHS: Array<{ path: string; priority: number; changeFrequency: ChangeFrequency }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/carta", priority: 0.9, changeFrequency: "weekly" },
  /* La vinoteca entra en el sitemap aunque la lista de vinos todavía no esté: la página se
     publica con el aviso de que se está cerrando y con el mapa de las denominaciones, que es
     contenido real. No es el caso de las páginas legales de abajo, que sí se esconden porque lo
     que les falta (los datos del responsable) es justo lo que les da validez. */
  { path: "/vinos", priority: 0.8, changeFrequency: "monthly" },
  /* Páginas legales: los slugs son los del español (compartidos por todos los idiomas, ver legal/[slug]/page.tsx).
     Quedan fuera mientras los datos del responsable sigan sin rellenar — entonces van con `noindex`. */
  ...(LEGAL_IDENTITY_PENDING
    ? []
    : LEGAL_DOC_KEYS.map((key) => ({ path: `/legal/${legal[key].slug}`, priority: 0.3, changeFrequency: "yearly" as const }))),
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
        /* Mismo juego de anotaciones que el `<head>` (`buildAlternates` en @/lib/seo), x-default
           incluido: Google lee el hreflang del sitemap y el de la página por separado y espera
           que coincidan. */
        languages: Object.fromEntries([
          ...LOCALES.map((l) => [LOCALE_META[l].hreflang, `${SITE_URL}${localePath(l, path)}`]),
          ["x-default", `${SITE_URL}${localePath(DEFAULT_LOCALE, path)}`],
        ]),
      },
    })),
  );
}
