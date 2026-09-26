"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_META, isLocale, localePath, type Locale } from "@/i18n/config";
import esCommon from "@/i18n/messages/es/common";
import glCommon from "@/i18n/messages/gl/common";
import enCommon from "@/i18n/messages/en/common";
import ptCommon from "@/i18n/messages/pt/common";
import { cn } from "@/lib/utils";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * 404 del sitio.
 *
 * `app/[locale]/layout.tsx` es el layout RAÍZ (no hay `app/layout.tsx`), así que este boundary vive
 * por encima de él y Next lo pinta dentro de su propio esqueleto mínimo, sin el `<html>`/`<body>`
 * del layout de idioma. De ahí las dos peculiaridades: un `<style>` en línea para el fondo hierro
 * del `body` (el mismo truco que usa el 404 interno de Next) y las variables de fuente declaradas
 * en el `<main>`, que es de donde heredan `font-display` y `font-caps`.
 *
 * Es donde acaban TODAS las rutas inexistentes: `src/proxy.ts` antepone un idioma válido a
 * cualquier petición sin prefijo, así que `/lo-que-sea` llega como `/es/lo-que-sea`, y de ahí al
 * catch-all `app/[locale]/[...rest]` o al `notFound()` de `legal/[slug]`. Sin este fichero, Next
 * respondía con su 404 interno: fondo blanco, system-ui, «404: This page could not be found.», sin
 * marca, sin idioma y sin enlace de vuelta.
 *
 * El idioma sale del propio path (`/gl/…` → gallego), con el español como respaldo.
 * `app/[locale]/not-found.tsx` sigue existiendo para los `notFound()` que ocurren durante una
 * navegación por el router, ya dentro del layout de idioma.
 */

interface NotFoundCopy {
  readonly kicker: string;
  readonly title: string;
  readonly text: string;
  readonly back: string;
}

/* El `<body>` de este esqueleto no lleva las clases del layout de idioma: sin esto saldría blanco. */
const BODY_STYLE = "body{margin:0;background:#121212;color:#f9f6f0}";

const COPY: Record<Locale, NotFoundCopy> = {
  es: esCommon.notFound,
  gl: glCommon.notFound,
  en: enCommon.notFound,
  pt: ptCommon.notFound,
};

export default function NotFound() {
  const pathname = usePathname() ?? "/";
  const first = pathname.split("/")[1];
  const locale: Locale = isLocale(first) ? first : DEFAULT_LOCALE;
  const nf = COPY[locale];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BODY_STYLE }} />
      <main
        lang={LOCALE_META[locale].hreflang}
        className={cn(
          fontVariables,
          "container-page relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-iron text-center text-cream antialiased",
        )}
      >
        {/* Brasa de fondo, como en el resto de la web */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vh] w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(178,30,39,0.28),transparent_100%)] blur-3xl"
        />
        <p className="font-caps text-xs uppercase tracking-[0.35em] text-pimenton-a11y">{nf.kicker}</p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] text-cream md:text-6xl">{nf.title}</h1>
        <p className="mt-4 max-w-md text-cream-muted text-pretty">{nf.text}</p>
        <Link
          href={localePath(locale, "/")}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-pimenton px-6 font-sans font-semibold text-cream transition-colors duration-300 hover:bg-pimenton-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light focus-visible:ring-offset-2 focus-visible:ring-offset-iron"
        >
          {nf.back}
        </Link>
      </main>
    </>
  );
}
