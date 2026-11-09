/** URL pública. En Vercel se toma la del despliegue; con dominio propio, poner NEXT_PUBLIC_SITE_URL. */
export const URL_SITIO =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/**
 * Indexación: APAGADA mientras sea URL de prueba (fotos de Instagram sin permiso todavía, datos por
 * confirmar). Al publicar con su dominio, poner NEXT_PUBLIC_INDEXAR=1 en Vercel.
 */
export const INDEXAR = process.env.NEXT_PUBLIC_INDEXAR === "1";
