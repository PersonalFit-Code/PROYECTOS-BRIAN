"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMessages } from "@/i18n/LocaleProvider";

/**
 * Portada de entrada: el logo de la casa a pantalla completa. Al hacer scroll se encoge, sube y se
 * desvanece (solo `transform` y `opacity`) mientras aparece la portada. Mientras se ve, el logo
 * pequeño de la cabecera se oculta (`data-portada` en <html>) para no repetir la marca.
 */
export default function LogoCover() {
  const m = useMessages();
  const t = m.cover;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.75], [1, 0.5]);
  const y = useTransform(scrollYProgress, [0, 0.75], ["0svh", "-14svh"]);
  const opacity = useTransform(scrollYProgress, [0.3, 0.7], [1, 0]);
  const doors = useTransform(scrollYProgress, [0, 0.75], [1, 1.2]);
  const doorsOpacity = useTransform(scrollYProgress, [0.15, 0.6], [0.16, 0]);
  const cue = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-portada", "");
    return () => root.removeAttribute("data-portada");
  }, []);
  useMotionValueEvent(scrollYProgress, "change", (v) => document.documentElement.toggleAttribute("data-portada", v < 0.6));

  return (
    <section ref={ref} aria-label={t.label} className="relative h-[135svh]">
      <div className="grano sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_42%,rgba(227,196,106,0.16),transparent_70%)]" />

        {/* Las dos puertas en arco, al fondo */}
        <motion.svg
          aria-hidden
          viewBox="0 0 400 300"
          className="pointer-events-none absolute h-[78svh] max-w-[110vw] [mask-image:linear-gradient(180deg,#000_55%,transparent_96%)]"
          style={reduced ? { opacity: 0.16 } : { scale: doors, opacity: doorsOpacity }}
        >
          <g fill="none" stroke="#e3c46a" strokeWidth="1.2">
            <path d="M40 300 V120 A70 70 0 0 1 180 120 V300" />
            <path d="M52 300 V122 A58 58 0 0 1 168 122 V300" strokeOpacity="0.5" />
            <path d="M220 300 V120 A70 70 0 0 1 360 120 V300" />
            <path d="M232 300 V122 A58 58 0 0 1 348 122 V300" strokeOpacity="0.5" />
          </g>
        </motion.svg>

        <motion.div className="relative px-4 text-center" style={reduced ? undefined : { scale, y, opacity }}>
          {/* Entrada por CSS (.portada-in): se pinta en el primer fotograma, sin esperar al JS. */}
          <div className="portada-in">
            <p className="font-caps text-[clamp(0.85rem,3vw,1.5rem)] font-semibold tracking-[0.55em] text-oro-a11y">CAFÉ · BAR</p>
            <p className="logo-oro mt-1 font-rotulo text-[clamp(4.6rem,25vw,8rem)] leading-[0.82] uppercase sm:mt-2 sm:text-[clamp(5rem,15vw,14rem)] sm:leading-[0.9]">
              <span className="block sm:inline">Dos</span> <span className="block sm:inline">Puertas</span>
            </p>
            <p className="mt-6 flex items-center justify-center gap-4 font-caps text-[11px] font-semibold tracking-[0.32em] text-cream-muted uppercase sm:mt-8 sm:text-xs">
              <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-oro/70" />
              {t.tagline}
              <span aria-hidden className="h-px w-10 bg-gradient-to-l from-transparent to-oro/70" />
            </p>
          </div>
        </motion.div>

        <motion.a
          href="#puertas"
          style={reduced ? undefined : { opacity: cue }}
          className="absolute bottom-[max(28px,env(safe-area-inset-bottom))] flex flex-col items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-cream-faint uppercase hover:text-cream"
        >
          {t.scroll}
          <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-cream/15">
            <span className="cue-gota absolute inset-x-0 top-0 h-4 bg-oro" />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
