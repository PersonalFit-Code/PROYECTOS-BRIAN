"use client";

import { useRef } from "react";
import Boton from "@/components/ui/Boton";
import { WhatsAppGlyph } from "@/components/ui/FloatingWhatsApp";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { BUSINESS } from "@/data/business";
import { urlFor } from "@/lib/hosts";

/** Cierre de la portada: la pregunta y las dos salidas (reservar o escribir por WhatsApp). */
export default function Cta() {
  const m = useMessages();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const c = m.home.cta;

  return (
    <section ref={ref} aria-labelledby="cta-title" className="scroll-mt-24 bg-blush">
      <div className="container-page py-20 text-center sm:py-28">
        <p data-reveal="fade" className="etiqueta inline-flex items-center gap-3 text-carmin-suave">
          <span aria-hidden className="h-px w-10 bg-carmin-suave/40" />
          {m.common.brand}
          <span aria-hidden className="h-px w-10 bg-carmin-suave/40" />
        </p>
        <h2 id="cta-title" data-reveal="letterbox" className="titulo-editorial mx-auto mt-6 max-w-3xl text-4xl text-tinta text-balance sm:text-6xl">
          {c.title} <em className="acento-editorial">{c.accent}</em>
        </h2>
        <p data-reveal className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gris text-pretty sm:text-lg">
          {c.text}
        </p>
        <div data-reveal className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Boton href={urlFor("reservar", "/")} size="lg">
            {c.primary}
          </Boton>
          <Boton href={BUSINESS.whatsapp.url} target="_blank" variant="secundario" size="lg" icon={<WhatsAppGlyph size="size-4" />}>
            {c.secondary}
          </Boton>
        </div>
      </div>
    </section>
  );
}
