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
 * Transición cinematográfica de la portada. Se monta justo después de `<Hero />` y no renderiza
 * nada: ancla `#hero` durante el primer viewport de scroll y, mientras el siguiente capítulo se
 * desliza por encima (ver `<Chapter overlapsHero>`), la escena hace un "pull-back":
 *  - la capa 3D (`#hero [data-hero-canvas]`) encoge 1 → 0.92, se oscurece y (tier high) se desenfoca;
 *    el filtro se aplica vía variables CSS `--hero-dim` / `--hero-blur` animadas en `#hero`;
 *  - el copy (`#hero [data-hero-copy]`) sube más rápido que la escena y se funde (parallax a dos
 *    velocidades);
 *  - si el hero no expone esos atributos, solo se transforma `#hero` (escala + brillo).
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
    const copy = hero.querySelector<HTMLElement>("[data-hero-copy]");
    const { gsap } = getGsap();

    const ctx = gsap.context(() => {
      /* El filtro lee las variables del hero: así animamos un único elemento y no peleamos con
         otros estilos inline de la capa 3D. */
      const filterTarget = canvas ?? hero;
      gsap.set(filterTarget, {
        filter: blur ? "brightness(var(--hero-dim, 1)) blur(var(--hero-blur, 0px))" : "brightness(var(--hero-dim, 1))",
      });
      /* Por debajo del capítulo que se le superpone (z-10). */
      gsap.set(hero, { "--hero-dim": 1, "--hero-blur": "0px", zIndex: 0 });

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
            gsap.set(filterTarget, { willChange: self.isActive ? "transform, filter" : "auto" });
          },
        },
      });

      tl.to(hero, { "--hero-dim": 0.35, "--hero-blur": blur ? "6px" : "0px" }, 0);

      if (canvas) {
        tl.to(canvas, { scale: 0.92, yPercent: -3, transformOrigin: "50% 45%" }, 0);
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
