"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, MapPin } from "lucide-react";
import HeroSpotlight from "./hero/HeroSpotlight";
import HeroShowcase from "./hero/HeroShowcase";
import PressMarquee from "./hero/PressMarquee";
import StatusPill from "@/components/ui/StatusPill";
import MapSheet from "@/components/ui/MapSheet";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";

/** Portada: texto a la izquierda, panel modular de cristal a la derecha (debajo en móvil). */
export default function Hero() {
  const m = useMessages();
  const lp = useLocalePath();
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <section id="inicio" aria-labelledby="hero-title" className="grano relative isolate overflow-hidden">
      <HeroSpotlight />

      <div className="container-page grid min-h-[100svh] grid-cols-1 items-center gap-10 pt-28 pb-14 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-14 lg:pt-32 lg:pb-20">
        <div className="relative z-10 min-w-0">
          <p className="hero-in flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase [--i:0]">
            <span aria-hidden className="h-px w-8 bg-oro-light/70" />
            {m.hero.kicker}
          </p>
          <h1 id="hero-title" className="hero-in mt-5 font-display text-[clamp(2.6rem,11vw,5.5rem)] leading-[0.97] font-medium text-balance [--i:1]">
            {m.hero.titleBefore} <span className="palabra-rotulo text-gradient-marca whitespace-nowrap">{m.hero.titleAccent}</span> {m.hero.titleAfter}
          </h1>
          <p className="hero-in mt-5 max-w-md text-[15px] leading-relaxed text-pretty text-cream-muted sm:text-base [--i:2]">{m.hero.subtitle}</p>

          <StatusPill badge className="hero-in mt-6 [--i:3]" />

          <div className="hero-in mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 [--i:4]">
            <Link
              href={lp("/#barra")}
              className="btn-brillo pulsable inline-flex min-h-12 items-center gap-2 rounded-full bg-oro px-6 text-[15px] font-semibold text-tinta"
            >
              {m.hero.ctaPrimary}
              <ArrowDown aria-hidden className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              aria-haspopup="dialog"
              className="pulsable inline-flex min-h-12 items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.04] px-5 text-[15px] font-medium text-cream hover:border-oro/45 hover:bg-cream/[0.08]"
            >
              <MapPin aria-hidden className="size-4 text-oro-light" />
              {m.hero.ctaSecondary}
            </button>
          </div>

          <PressMarquee className="hero-in mt-8 [--i:5]" />
        </div>

        <HeroShowcase className="hero-in min-w-0 [--i:3] lg:translate-y-4" />
      </div>

      <MapSheet open={mapOpen} onClose={() => setMapOpen(false)} />
    </section>
  );
}
