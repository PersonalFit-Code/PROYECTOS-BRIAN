import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    /* `_og.html` es la plantilla con la que se genera la imagen que sale al compartir el enlace.
       Vive en `public/` para poder regenerarla abriéndola en el navegador, así que se sirve como
       una página más — pero no es una página del sitio y no tiene que salir en Google. */
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/_og.html"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
