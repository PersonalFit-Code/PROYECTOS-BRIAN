"use client";

import Link from "next/link";
import { DEFAULT_LOCALE, LOCALE_META, localePath } from "@/i18n/config";
import notFound from "@/i18n/messages/es/notFound";
import { cn } from "@/lib/utils";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * 404 del sitio, por encima de los layouts raíz (no hay `app/layout.tsx`: `[locale]` y `(panel)`
 * pintan cada uno su `<html>`). Next lo pinta en su esqueleto mínimo, sin las clases del `<body>`:
 * de ahí el `<style>` en línea para el fondo y las variables de fuente en el `<main>`.
 *
 * Solo castellano: es el único idioma publicado, y el proxy antepone `/es` a cualquier ruta sin
 * prefijo, así que casi todo 404 real cae en `app/[locale]/not-found.tsx`. Cuando se active el
 * gallego, el idioma se saca del path como hace tixola.
 */
const BODY_STYLE = "body{margin:0;background:#fdf7f9;color:#2e2127}";

export default function NotFound() {
  const nf = notFound;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BODY_STYLE }} />
      <main
        lang={LOCALE_META[DEFAULT_LOCALE].hreflang}
        className={cn(fontVariables, "container-page relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-crema text-center font-sans text-tinta antialiased")}
      >
        <div aria-hidden className="halo absolute left-1/2 top-1/2 -z-10 h-[70vh] w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-carmin-suave">{nf.kicker}</p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.95] md:text-6xl">{nf.title}</h1>
        <p className="mt-4 max-w-md text-gris text-pretty">{nf.text}</p>
        <Link href={localePath(DEFAULT_LOCALE, "/")} className="pulsable mt-8 inline-flex h-12 items-center rounded-full bg-carmin px-6 font-semibold text-white hover:bg-carmin-oscuro">
          {nf.back}
        </Link>
      </main>
    </>
  );
}
