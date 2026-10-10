/**
 * La URL pública de la web, sin barra final. De ella salen la canónica, el sitemap, robots, las
 * etiquetas Open Graph, los datos estructurados, los textos legales y lo que contesta el camarero
 * virtual cuando le preguntan por la web.
 *
 * Por orden:
 *  1. `NEXT_PUBLIC_SITE_URL`, si alguien la fija a mano en Vercel.
 *  2. `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`, que Vercel rellena SOLO en cada build con el dominio
 *     de producción del proyecto: hoy `tixola-taperia.vercel.app` y, en cuanto se añada el dominio
 *     propio y se marque como principal, ese dominio. Por eso comprar el dominio no obliga a tocar código.
 *  3. En local, `http://localhost:3000`.
 *
 * ANTES el respaldo era `tixola.restaurantesourense.com`, un dominio que no es de esta web: la canónica de
 * todas las páginas le decía a Google "la página buena está en otro sitio", y Google no indexaba esta.
 */
const vercelProduction = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelProduction ? `https://${vercelProduction}` : "http://localhost:3000")
).replace(/\/$/, "");
