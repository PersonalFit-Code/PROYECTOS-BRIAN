"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowRight, CalendarCheck, Check } from "lucide-react";
import Boton from "@/components/ui/Boton";
import StatusPill from "@/components/ui/StatusPill";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { urlFor } from "@/lib/hosts";

/**
 * Portada: claim, subtítulo, dos CTAs y el estado en vivo, sobre un panel de `liquid-glass` que
 * flota sobre halos rosas con parallax. El texto entra con CSS (`.hero-in`, escalonado) y no con JS:
 * es lo primero que se ve y lo que mide la velocidad (LCP), así que no espera al bundle.
 *
 * El panel es UNA superficie de cristal, de tamaño acotado, sobre un fondo que apenas se mueve: es
 * de las cuatro que el presupuesto de móvil admite a la vez (con la cabecera, el dock y WhatsApp).
 * Los halos de detrás llevan `data-parallax` (lo mueve `useScrollReveal` con GSAP, solo en la home).
 */
export default function Hero() {
  const m = useMessages();
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  useScrollReveal(ref, { enabled: true });
  const h = m.home.hero;

  return (
    <section ref={ref} id="hero" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-[calc(var(--header-h)+1rem)] pb-16">
      {/* Halos de fondo: horneados (sin blur) y con parallax suave. */}
      <div aria-hidden data-parallax="0.25" className="halo absolute -top-24 -right-24 -z-10 h-[520px] w-[520px] rounded-full [--halo-a:0.75]" />
      <div aria-hidden data-parallax="-0.15" className="halo absolute -bottom-32 -left-32 -z-10 h-[460px] w-[460px] rounded-full [--halo-rgb:243_211_222] [--halo-a:0.9]" />
      <div aria-hidden data-parallax="0.4" className="halo absolute top-1/3 left-1/2 -z-10 h-[320px] w-[320px] rounded-full [--halo-rgb:142_14_51] [--halo-a:0.08]" />

      <div className="container-page grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div className="liquid-glass liquid-glass-strong rounded-[2rem] p-6 sm:p-10 lg:p-12">
          <p className="hero-in inline-flex items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-carmin-suave" style={{ ["--i" as string]: 0 }}>
            <span aria-hidden className="h-px w-8 bg-carmin-suave/60" />
            {h.kicker}
          </p>
          <h1 id="hero-title" className="hero-in mt-5 font-display text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.015em] text-tinta text-balance sm:text-6xl lg:text-7xl" style={{ ["--i" as string]: 1 }}>
            {h.title} <em className="font-display italic font-normal text-carmin">{h.accent}</em>
          </h1>
          <p className="hero-in mt-6 max-w-xl text-base leading-relaxed text-gris text-pretty sm:text-lg" style={{ ["--i" as string]: 2 }}>
            {h.subtitle}
          </p>
          <div className="hero-in mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ ["--i" as string]: 3 }}>
            <Boton href={urlFor("reservar", "/")} size="lg" icon={<CalendarCheck aria-hidden />}>
              {h.primary}
            </Boton>
            <Boton href={lp("/servicios")} variant="secundario" size="lg" iconRight={<ArrowRight aria-hidden />}>
              {h.secondary}
            </Boton>
          </div>
          <div className="hero-in mt-6 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ ["--i" as string]: 4 }}>
            <StatusPill />
          </div>
          <ul className="hero-in mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-gris" style={{ ["--i" as string]: 5 }}>
            {h.perks.map((perk) => (
              <li key={perk} className="inline-flex items-center gap-1.5">
                <Check aria-hidden className="size-3.5 text-carmin-suave" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* El logo, grande y flotando despacio (solo con movimiento). Cuando lleguen las fotos del
            salón, aquí va la foto de portada y el logo vuelve a su tamaño de marca. */}
        <div className="hero-in relative mx-auto hidden aspect-square w-full max-w-[420px] lg:block" style={{ ["--i" as string]: 2 }}>
          <div aria-hidden className="halo absolute inset-[-12%] rounded-full [--halo-a:0.8]" />
          <div className="motion-safe:animate-float relative grid size-full place-items-center">
            <Image src="/brand/logo.png" alt={h.logoAlt} width={317} height={318} priority sizes="420px" className="w-[72%] rounded-full shadow-[var(--shadow-card)]" />
          </div>
        </div>
      </div>

      {/* Indicador de scroll: solo en escritorio (en móvil el dock ya marca que hay más abajo). */}
      <p aria-hidden className="hero-in absolute inset-x-0 bottom-6 hidden justify-center font-sans text-[10px] font-semibold tracking-[0.3em] text-gris uppercase md:flex" style={{ ["--i" as string]: 6 }}>
        {h.scrollCue}
      </p>
    </section>
  );
}
