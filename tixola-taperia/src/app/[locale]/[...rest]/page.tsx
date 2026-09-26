import { notFound } from "next/navigation";

/**
 * Catch-all dentro del idioma: cualquier ruta que no exista bajo `/es`, `/gl`, `/en` o `/pt`
 * (`/es/carta2`, `/gl/lo-que-sea`, …) cae aquí y dispara `notFound()`.
 *
 * Sin este segmento, Next resolvía esas URLs con su 404 interno (`/_not-found`): fondo blanco,
 * system-ui, «404: This page could not be found.», sin marca, sin idioma y sin enlace de vuelta.
 * Con él, el boundary que se monta es `src/app/[locale]/not-found.tsx`, dentro del layout de
 * idioma (Navbar, fuentes, `<LocaleProvider>` y textos traducidos).
 *
 * `generateStaticParams` devuelve `[]` a propósito: no hay nada que prerenderizar, las rutas
 * desconocidas se resuelven bajo demanda y siempre acaban en 404.
 */

export const dynamicParams = true;

export function generateStaticParams(): Array<{ rest: string[] }> {
  return [];
}

export default function CatchAllNotFound() {
  notFound();
}
