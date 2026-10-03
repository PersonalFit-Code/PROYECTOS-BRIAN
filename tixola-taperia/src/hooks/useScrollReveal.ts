"use client";

import { type RefObject } from "react";
import { getGsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect, useReveal, type RevealOptions } from "@/hooks/useReveal";

export type { RevealMode } from "@/hooks/useReveal";

/**
 * `useReveal` (revelados con IntersectionObserver, sin GSAP) + parallax de las capas
 * `[data-parallax]` con GSAP/ScrollTrigger.
 *
 * ESTE HOOK IMPORTA GSAP DE FORMA ESTÁTICA, así que úsalo solo donde GSAP ya esté — hoy, las
 * secciones de la PORTADA, que viene con Lenis y ScrollTrigger de todas formas. Si una sección solo
 * necesita revelados (el pie, /vinos…), usa `useReveal` directamente: mismo efecto visual y ~28 kB
 * comprimidos menos en el paquete de esa página.
 */
export interface ScrollRevealOptions extends RevealOptions {
  /**
   * Selector de las capas parallax. Cada capa declara su velocidad en el atributo,
   * p. ej. `data-parallax="0.2"`: cuanto mayor, más recorrido (la capa sube según se hace scroll).
   * Un valor negativo la mueve en sentido contrario. `false` desactiva el parallax.
   * Por defecto `[data-parallax]`.
   */
  parallaxSelector?: string | false;
  /** Recorrido total (px) de una capa con velocidad 1 durante todo el paso de la sección. Por defecto 320. */
  parallaxDistance?: number;
}

/**
 * Revela los hijos `[data-reveal]` de una sección (una sola vez, con escalonado) y desplaza las capas
 * `[data-parallax]` a distintas velocidades mientras la sección atraviesa el viewport (scrub).
 *
 * - Revelados: ver `useReveal`. Estado inicial, transición y estado final están en `globals.css`.
 * - Parallax: GSAP + ScrollTrigger porque necesita progreso continuo (`scrub`). Vive en un
 *   `gsap.context()` que se revierte al desmontar.
 * - Compatible con el scroll suave de la home: Lenis mueve el scroll nativo de `window` (el scroller
 *   por defecto de ScrollTrigger) y `SmoothScrollProvider` hace `ScrollTrigger.refresh()` al montar
 *   Lenis, al cargar las fuentes y al cambiar la altura del documento.
 *
 * @example
 * const ref = useRef<HTMLElement>(null);
 * useScrollReveal(ref, { cinematic: true });
 * return (
 *   <section ref={ref}>
 *     <div data-parallax="0.3" aria-hidden />
 *     <h2 data-reveal>Título</h2>            // letterbox (modo por defecto con cinematic)
 *     <p data-reveal="wipe">Subtítulo</p>    // barrido lateral
 *     <img data-reveal="up" … />             // fundido + deslizamiento clásico
 *   </section>
 * );
 */
export function useScrollReveal<T extends HTMLElement>(ref: RefObject<T | null>, options: ScrollRevealOptions = {}): void {
  const { revealSelector, stagger, enabled = true, cinematic, parallaxSelector = "[data-parallax]", parallaxDistance = 320 } = options;

  /* 1 · Revelados (observador compartido, sin coste por fotograma). */
  useReveal(ref, { revealSelector, stagger, enabled, cinematic });

  /* 2 · Parallax: cada capa recorre ±(velocidad × distancia) px mientras la sección va de "asomar por
        abajo" a "desaparecer por arriba". Scrub corto: Lenis ya suaviza. Este sí necesita progreso
        continuo, así que se queda en ScrollTrigger. */
  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || !enabled || !parallaxSelector) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      for (const layer of root.querySelectorAll<HTMLElement>(parallaxSelector)) {
        const speed = Number.parseFloat(layer.dataset.parallax ?? "");
        if (!Number.isFinite(speed) || speed === 0) continue;
        const travel = speed * parallaxDistance;
        gsap.fromTo(
          layer,
          { y: travel },
          {
            y: -travel,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.3,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, [ref, parallaxSelector, parallaxDistance, enabled]);
}
