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

/**
 * `true` mientras la web viva en una dirección PRESTADA: el subdominio que regala Vercel
 * (`tixola-taperia.vercel.app`) o localhost. Es decir, mientras no haya dominio propio.
 *
 * POR QUÉ IMPORTA, Y NO ES UNA MANÍA DE SEO. Si Google indexa la web en el subdominio de Vercel,
 * el día que se compre el dominio hay dos direcciones con el mismo contenido: la vieja es la que
 * Google conoce y la nueva empieza de cero. Vercel redirige, sí, pero lo que se indexa estos días
 * es una web a medio terminar —sin correo de contacto, con los alérgenos sin firmar— y no hay nada
 * que ganar enseñándosela a Google antes de tiempo. Quien tenga el enlace la ve igual: esto no
 * esconde la web, solo le pide a los buscadores que esperen.
 *
 * SE ABRE SOLA. En cuanto `NEXT_PUBLIC_SITE_URL` tenga el dominio propio —o el dominio se marque
 * como principal en Vercel, que es lo que rellena `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`—,
 * esto pasa a `false` en el siguiente despliegue y la web vuelve a ser indexable sin tocar código.
 * No hay ninguna casilla que recordar.
 */
export const SITE_URL_IS_PROVISIONAL =
  !process.env.NEXT_PUBLIC_SITE_URL && (!vercelProduction || vercelProduction.endsWith(".vercel.app"));
