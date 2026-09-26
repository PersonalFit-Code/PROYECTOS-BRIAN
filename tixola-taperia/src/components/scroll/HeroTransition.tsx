"use client";

import { useEffect, useLayoutEffect } from "react";
import { getGsap } from "@/lib/gsap";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";

/** `useLayoutEffect` en cliente (el pin se crea antes del primer pintado), `useEffect` en SSR. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Recorrido del pin como fracción de la altura del viewport (más corto en móvil: menos pulgar). */
const PIN_DISTANCE_DESKTOP = 1;
const PIN_DISTANCE_MOBILE = 0.7;

/**
 * Opacidad del velo negro al final del anclaje. Sobre un velo negro, 0.65 deja pasar el 35 % de la
 * luz de la escena: el mismo resultado que el `brightness(0.35)` que se usaba antes.
 */
const DIM_MAX = 0.65;

/**
 * Transición cinematográfica de la portada. Se monta justo después de `<Hero />` y no renderiza
 * nada: ancla `#hero` durante el primer viewport de scroll y, mientras el siguiente capítulo se
 * desliza por encima (ver `<Chapter overlapsHero>`), la escena hace un "pull-back":
 *  - la capa 3D (`#hero [data-hero-canvas]`) encoge 1 → 0.92 y (tier high) se desenfoca;
 *  - un velo negro dentro de esa capa (`[data-hero-dim]`) sube de 0 a 0.65 y la oscurece;
 *  - el copy (`#hero [data-hero-copy]`) sube más rápido que la escena y se funde (parallax a dos
 *    velocidades);
 *  - si el hero no expone esos atributos, solo se transforma `#hero`.
 *
 * El oscurecido va en un velo y no en un `filter: brightness()` de la capa. Motivo: el filtro se
 * escribía como `brightness(var(--hero-dim))` con la variable animada por GSAP, y el valor inicial
 * de esa variable no se capturaba como 1 sino como ~0 — la capa entera quedaba en
 * `brightness(0.000001)`, es decir, negra, y con ella la tixola 3D y el fondo estático. Un velo
 * opaco da el mismo resultado visual, se compone en GPU sin repintar el lienzo y no puede apagar la
 * portada: `opacity` está acotada a [0,1] y su valor de reposo (0) es justo el que deja verlo todo.
 * El velo vive dentro de la capa 3D, así que oscurece la escena sin tocar el texto de la portada.
 *
 * Todo en un `gsap.context` revertido al desmontar. Sin pin con `prefers-reduced-motion` o tier "low".
 */
export default function HeroTransition() {
  const { tier, reducedMotion, isMobile } = usePerformanceTier();
  const enabled = !reducedMotion && tier !== "low";
  const blur = tier === "high";

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;
    const hero = document.getElementById("hero");
    if (!hero) return;

    const canvas = hero.querySelector<HTMLElement>("[data-hero-canvas]");
    const dim = hero.querySelector<HTMLElement>("[data-hero-dim]");
    const copy = hero.querySelector<HTMLElement>("[data-hero-copy]");
    const { gsap } = getGsap();

    const ctx = gsap.context(() => {
      /* Por debajo del capítulo que se le superpone (z-10). */
      gsap.set(hero, { zIndex: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * (isMobile ? PIN_DISTANCE_MOBILE : PIN_DISTANCE_DESKTOP))}`,
          pin: true,
          /* Sin espaciado: el siguiente capítulo avanza sobre el hero fijo en vez de esperar. */
          pinSpacing: false,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
          /* `will-change` solo mientras la transición está activa. */
          onToggle: (self) => {
            const hint = self.isActive ? (blur ? "transform, filter" : "transform") : "auto";
            if (canvas) gsap.set(canvas, { willChange: hint });
            if (dim) gsap.set(dim, { willChange: self.isActive ? "opacity" : "auto" });
          },
        },
      });

      /* Oscurecido. `fromTo` explícito: el estado de reposo queda fijado en 0 aunque un refresh de
         ScrollTrigger vuelva a leer los valores iniciales a mitad del recorrido. */
      if (dim) tl.fromTo(dim, { opacity: 0 }, { opacity: DIM_MAX }, 0);

      if (canvas) {
        tl.to(canvas, { scale: 0.92, yPercent: -3, transformOrigin: "50% 45%" }, 0);
        /* Desenfoque solo en gama alta: repinta el lienzo en cada fotograma del anclaje. */
        if (blur) tl.fromTo(canvas, { filter: "blur(0px)" }, { filter: "blur(6px)" }, 0);
      } else {
        /* Sin capa 3D identificable: encogemos la portada entera. */
        tl.to(hero, { scale: 0.94, transformOrigin: "50% 40%" }, 0);
      }

      if (copy) {
        /* El texto sube más deprisa que la escena y se ha fundido al 70 % del recorrido. */
        tl.to(copy, { y: -160, opacity: 0, ease: "power1.in", duration: 0.7 }, 0);
      }
    }, hero);

    return () => ctx.revert();
  }, [enabled, blur, isMobile]);

  return null;
}
