"use client";

import { useRef } from "react";
import { ArrowRight, Gift } from "lucide-react";
import Boton from "@/components/ui/Boton";
import FotoEditorial from "@/components/ui/FotoEditorial";
import SectionHeading from "@/components/ui/SectionHeading";
import { FOTO_BONO } from "@/data/fotos";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";

/**
 * Anticipo de los bonos y tarjetas regalo, a dos columnas: la foto (una tarjeta regalo) y el texto. Sin compra todavía (fase 2): solo cuenta qué va a haber y
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
    <section ref={ref} id="bonos" aria-labelledby="bonos-title" className="scroll-mt-24 bg-white">
      <div className="container-page grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-20">
        <div data-reveal className="order-2 lg:order-1">
          <FotoEditorial foto={FOTO_BONO} sizes="(min-width: 1024px) 560px, 100vw" rotulo={b.kicker} className="aspect-[4/5] w-full" />
        </div>
        <div className="order-1 lg:order-2">
          <p data-reveal="fade" className="etiqueta mb-6 inline-flex items-center gap-2 border border-nude px-3 py-1.5 text-carmin-suave">
            <Gift aria-hidden className="size-3.5" />
            {b.soon}
          </p>
          <SectionHeading id="bonos-title" kicker={b.kicker} title={b.title} accent={b.accent} description={b.description} />
          <div data-reveal className="mt-9">
            <Boton href={lp("/bonos")} variant="secundario" size="lg" iconRight={<ArrowRight aria-hidden />}>
              {b.cta}
            </Boton>
          </div>
        </div>
      </div>
    </section>
  );
}
