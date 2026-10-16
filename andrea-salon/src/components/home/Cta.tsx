"use client";

import { useRef } from "react";
import { CalendarCheck } from "lucide-react";
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
    <section ref={ref} aria-labelledby="cta-title" className="scroll-mt-24">
      <div className="container-page pb-20 sm:pb-28">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-carmin px-6 py-14 text-center text-white sm:px-10 sm:py-20">
          <div aria-hidden data-depth="0.2" className="halo absolute -top-32 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full [--halo-rgb:255_255_255] [--halo-a:0.14]" />
          <h2 id="cta-title" data-reveal="letterbox" className="font-display text-4xl font-semibold leading-[1.05] text-balance sm:text-5xl lg:text-6xl">
            {c.title} <em className="font-display italic font-normal text-rosa">{c.accent}</em>
          </h2>
          <p data-reveal className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 text-pretty sm:text-lg">
            {c.text}
          </p>
          <div data-reveal className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* Sobre carmín, el botón principal se invierte: blanco con texto carmín. */}
            <Boton href={urlFor("reservar", "/")} size="lg" icon={<CalendarCheck aria-hidden />} className="bg-white! text-carmin! border-white! hover:bg-rosa-niebla! focus-visible:ring-white! focus-visible:ring-offset-carmin!">
              {c.primary}
            </Boton>
            <Boton
              href={BUSINESS.whatsapp.url}
              target="_blank"
              variant="secundario"
              size="lg"
              icon={<WhatsAppGlyph size="size-5" />}
              className="bg-transparent! text-white! border-white/50! hover:bg-white/10! hover:border-white! focus-visible:ring-white! focus-visible:ring-offset-carmin!"
            >
              {c.secondary}
            </Boton>
          </div>
        </div>
      </div>
    </section>
  );
}
