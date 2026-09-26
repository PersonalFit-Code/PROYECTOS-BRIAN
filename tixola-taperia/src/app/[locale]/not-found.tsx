"use client";

import Link from "next/link";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";

/**
 * 404 dentro de un idioma válido (p. ej. un slug legal desconocido).
 * Next monta este segmento dentro de `[locale]/layout.tsx`, así que el `<LocaleProvider>` está
 * disponible: todo el texto sale de `m.common.notFound` y el enlace de vuelta conserva el prefijo
 * de idioma con `useLocalePath()`.
 */
export default function NotFound() {
  const m = useMessages();
  const lp = useLocalePath();
  const nf = m.common.notFound;

  return (
    <main className="container-page flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="font-caps text-xs uppercase tracking-[0.35em] text-pimenton-light">{nf.kicker}</p>
      <h1 className="mt-4 font-display text-5xl text-cream">{nf.title}</h1>
      <p className="mt-4 max-w-md text-cream-muted">{nf.text}</p>
      <Link href={lp("/")} className="mt-8 rounded-full bg-pimenton px-6 py-3 font-semibold text-cream hover:bg-pimenton-light">
        {nf.back}
      </Link>
    </main>
  );
}
