import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { SITE_URL_IS_PROVISIONAL } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  /* Dirección prestada (subdominio de Vercel): no se rastrea nada. El `noindex` del layout dice lo
     mismo, pero no todos los rastreadores lo leen. Se levanta solo con el dominio propio. */
  if (SITE_URL_IS_PROVISIONAL) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    /* Fuera: el panel, las API, la página de gestión de cada cita (lleva un token en la URL) y la del
       bono (código + firma). No hay nada que indexar ahí y sí datos de una clienta concreta. */
    rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/api", "/*/reservar/cita/", "/*/bono/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
