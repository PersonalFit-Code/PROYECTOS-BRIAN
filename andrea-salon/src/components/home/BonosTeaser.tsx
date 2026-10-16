"use client";

import { useRef } from "react";
import { ArrowRight, Gift } from "lucide-react";
import Boton from "@/components/ui/Boton";
import SectionHeading from "@/components/ui/SectionHeading";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";

/**
 * Anticipo de los bonos y tarjetas regalo. Sin compra todavía (fase 2): solo cuenta qué va a haber y
 * lleva a /bonos. La etiqueta «Muy pronto» es parte del diseño, no un parche: Andrea ya se los puede
 * enseñar a sus clientas antes de que exista la tienda.
 */
export default function BonosTeaser() {
  const m = useMessages();
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const b = m.home.bonos;

  return (
    <section ref={ref} id="bonos" aria-labelledby="bonos-title" className="scroll-mt-24">
      <div aria-hidden className="filete container-page" />
      <div className="container-page py-20 sm:py-28">
        <div className="glass-rosa relative overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-14">
          <div aria-hidden data-depth="0.3" className="halo absolute -top-20 -right-20 h-72 w-72 rounded-full [--halo-rgb:142_14_51] [--halo-a:0.1]" />
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <span data-reveal="fade" className="inline-flex items-center gap-2 rounded-full bg-carmin px-3 py-1 font-sans text-[11px] font-semibold tracking-[0.2em] text-white uppercase">
                <Gift aria-hidden className="size-3.5" />
                {b.soon}
              </span>
              <div className="mt-5">
                <SectionHeading id="bonos-title" kicker={b.kicker} title={b.title} accent={b.accent} description={b.description} />
              </div>
            </div>
            <div data-reveal className="lg:pl-6">
              <Boton href={lp("/bonos")} variant="secundario" size="lg" iconRight={<ArrowRight aria-hidden />}>
                {b.cta}
              </Boton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
