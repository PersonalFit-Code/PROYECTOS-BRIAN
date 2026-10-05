"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowDown, MapPin, Newspaper } from "lucide-react";
import FacadeArt from "./FacadeArt";
import StatusPill from "@/components/ui/StatusPill";
import { useMessages, useLocalePath } from "@/i18n/LocaleProvider";
import { useOpenStatus } from "@/hooks/useOpenStatus";
import { BUSINESS } from "@/data/business";

export default function Hero() {
  const m = useMessages();
  const lp = useLocalePath();
  const status = useOpenStatus();
  const artRef = useRef<HTMLDivElement>(null);

  /* Parallax suave de la fachada: solo `transform`, solo mientras la portada está a la vista. */
  useEffect(() => {
    const el = artRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > window.innerHeight * 1.2) return;
        el.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* Antes de saber la hora la luz arranca a media potencia; luego se ajusta al estado real. */
  const luz = status === null ? 0.6 : status.isOpen ? 1 : 0.55;

  return (
    <section id="inicio" aria-labelledby="hero-title" className="grano relative isolate overflow-hidden">
      {/* Halo del rótulo sobre la página */}
      <div aria-hidden className="glow absolute -top-40 left-1/2 -z-10 h-[620px] w-[900px] -translate-x-1/2 [--glow-a:0.22]" />

      <div className="container-page relative grid min-h-[100svh] items-center gap-2 pt-[84px] pb-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-24 lg:pb-16">
        {/* La fachada: arriba en móvil, a la derecha en escritorio */}
        <div className="relative mx-auto w-[min(92vw,calc(42svh*0.78),560px)] lg:order-2 lg:w-full lg:max-w-[540px]">
          <div ref={artRef}>
            <div className="overflow-hidden rounded-b-3xl [border-top-left-radius:35%_27.5%] [border-top-right-radius:35%_27.5%] border border-cream/10 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
              <FacadeArt luz={luz} label={m.hero.artLabel} />
            </div>
          </div>
          {/* Velo para que el texto pise la acera en móvil */}
          <div aria-hidden className="pointer-events-none absolute inset-x-[-10%] bottom-[-2px] h-1/3 bg-gradient-to-t from-tinta via-tinta/70 to-transparent lg:hidden" />
        </div>

        <div className="relative z-10 -mt-24 lg:order-1 lg:mt-0">
          <p className="hero-in flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase [--i:0]">
            <span aria-hidden className="h-px w-8 bg-oro-light/70" />
            {m.hero.kicker}
          </p>
          <h1
            id="hero-title"
            className="hero-in mt-4 font-display text-[clamp(2.55rem,11.5vw,5.6rem)] leading-[0.98] font-medium text-balance [--i:1]"
          >
            {m.hero.titleBefore} <span className="palabra-rotulo text-gradient-marca whitespace-nowrap">{m.hero.titleAccent}</span> {m.hero.titleAfter}
          </h1>
          <p className="hero-in mt-5 max-w-md text-[15px] leading-relaxed text-pretty text-cream-muted sm:text-base [--i:2]">
            {m.hero.subtitle}
          </p>

          <StatusPill className="hero-in mt-4 [--i:3]" />

          <div className="hero-in mt-6 flex flex-wrap items-center gap-3 [--i:3]">
            <Link
              href={lp("/#barra")}
              className="pulsable inline-flex min-h-12 items-center gap-2 rounded-full bg-oro px-6 text-[15px] font-semibold text-tinta shadow-[0_10px_30px_-10px_rgba(227,196,106,0.6)] hover:bg-oro-light"
            >
              {m.hero.ctaPrimary}
              <ArrowDown aria-hidden className="size-4" />
            </Link>
            <a
              href={BUSINESS.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="pulsable inline-flex min-h-12 items-center gap-2 rounded-full border border-cream/20 bg-cream/[0.06] px-5 text-[15px] font-medium text-cream hover:border-cream/40 hover:bg-cream/10"
            >
              <MapPin aria-hidden className="size-4 text-oro-light" />
              {m.hero.ctaSecondary}
            </a>
          </div>

          <div className="hero-in mt-6 text-[13px] [--i:4]">
            <a
              href={BUSINESS.press.vozGalicia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 items-center gap-2 text-cream-muted underline-offset-4 hover:text-cream hover:underline"
            >
              <Newspaper aria-hidden className="size-4 text-oro-light" />
              {m.hero.proofPress}
              <span aria-hidden className="text-cream/30">·</span>
              {m.hero.proofYears}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
