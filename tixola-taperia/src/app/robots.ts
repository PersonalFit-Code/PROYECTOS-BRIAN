import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { SITE_URL_IS_PROVISIONAL } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  /* Dirección prestada (el subdominio de Vercel): se pide a los buscadores que no rastreen nada.
     La etiqueta `noindex` del layout dice lo mismo, pero no todos los rastreadores la leen y
     algunos ni llegan a la página. Se levanta solo al poner el dominio propio. */
  if (SITE_URL_IS_PROVISIONAL) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    /* `_og.html` es la plantilla con la que se genera la imagen que sale al compartir el enlace.
       Vive en `public/` para poder regenerarla abriéndola en el navegador, así que se sirve como
       una página más — pero no es una página del sitio y no tiene que salir en Google. */
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/_og.html"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
