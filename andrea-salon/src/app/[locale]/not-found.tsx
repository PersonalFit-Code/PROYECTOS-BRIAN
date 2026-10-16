"use client";

import Link from "next/link";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { urlFor } from "@/lib/hosts";

/**
 * 404 dentro de un idioma válido (slug legal desconocido, catch-all `[...rest]`). Se monta dentro
 * de `[locale]/layout.tsx`, así que hay `LocaleProvider`: el texto sale de `m.notFound`.
 */
export default function NotFound() {
  const m = useMessages();
  const lp = useLocalePath();
  const nf = m.notFound;
  return (
    <main id="main" className="container-page flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.35em] text-carmin-suave">{nf.kicker}</p>
      <h1 className="mt-4 font-display text-5xl font-semibold text-tinta">{nf.title}</h1>
      <p className="mt-4 max-w-md text-gris">{nf.text}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={lp("/")} className="pulsable inline-flex min-h-12 items-center rounded-full bg-carmin px-6 font-semibold text-white hover:bg-carmin-oscuro">
          {nf.back}
        </Link>
        <a href={urlFor("reservar", "/")} className="pulsable inline-flex min-h-12 items-center rounded-full border border-carmin/30 bg-white/70 px-6 font-semibold text-carmin hover:border-carmin/60">
          {nf.book}
        </a>
      </div>
    </main>
  );
}
