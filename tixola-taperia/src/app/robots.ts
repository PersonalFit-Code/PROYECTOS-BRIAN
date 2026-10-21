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
    /* `/_og.html` sigue en la lista por costumbre barata: la plantilla de la miniatura ya no se
       despliega (vive en `scripts/og/`, fuera de `public/`), pero si alguien la copia a `public/`
       para regenerar la imagen y se olvida de borrarla, esto al menos la mantiene fuera de Google
       mientras tanto. Un `Disallow` es un ruego, no un candado: el candado es que no esté. */
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/_og.html"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
