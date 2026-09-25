"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { getGsap } from "@/lib/gsap";

/**
 * `useLayoutEffect` en cliente (oculta los elementos antes del primer pintado, sin "flash"),
 * `useEffect` en servidor para no emitir avisos durante el render SSR.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ScrollRevealOptions {
  /** Selector de los elementos a revelar dentro de la sección. Por defecto `[data-reveal]`. */
  revealSelector?: string;
  /**
   * Selector de las capas parallax. Cada capa declara su velocidad en el atributo,
   * p. ej. `data-parallax="0.2"`: cuanto mayor, más recorrido (la capa sube según se hace scroll).
   * Un valor negativo la mueve en sentido contrario. `false` desactiva el parallax.
   * Por defecto `[data-parallax]`.
   */
  parallaxSelector?: string | false;
  /** Punto de disparo de cada reveal (sintaxis ScrollTrigger). Por defecto `"top 80%"`. */
  start?: string;
  /** Desplazamiento vertical inicial (px) del reveal. Por defecto 40. */
  distance?: number;
  /** Duración (s) de cada reveal. Por defecto 1. */
  duration?: number;
  /** Escalonado (s) entre elementos que entran a la vez. Por defecto 0.1. */
  stagger?: number;
  /** Recorrido total (px) de una capa con velocidad 1 durante todo el paso de la sección. Por defecto 320. */
  parallaxDistance?: number;
  /** Permite desactivar el hook (p. ej. hasta que el contenido esté montado). Por defecto true. */
  enabled?: boolean;
}

/**
 * Revela con GSAP + ScrollTrigger los hijos `[data-reveal]` de una sección (fade + slide-up
 * escalonado, una sola vez) y desplaza las capas `[data-parallax]` a distintas velocidades
 * mientras la sección atraviesa el viewport (scrub).
 *
 * - Todo vive dentro de un `gsap.context()` que se revierte al desmontar (sin fugas ni triggers huérfanos).
 * - Es un no-op cuando el usuario prefiere menos movimiento: los elementos quedan visibles y quietos.
 * - Los `[data-reveal]` no deben anidarse entre sí (cada uno se anima de forma independiente).
 *
 * @example
 * const ref = useRef<HTMLElement>(null);
 * useScrollReveal(ref);
 * return (
 *   <section ref={ref}>
 *     <div data-parallax="0.3" aria-hidden />
 *     <h2 data-reveal>Título</h2>
 *   </section>
 * );
 */
export function useScrollReveal<T extends HTMLElement>(ref: RefObject<T | null>, options: ScrollRevealOptions = {}): void {
  const {
    revealSelector = "[data-reveal]",
    parallaxSelector = "[data-parallax]",
    start = "top 80%",
    distance = 40,
    duration = 1,
    stagger = 0.1,
    parallaxDistance = 320,
    enabled = true,
  } = options;

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { gsap, ScrollTrigger } = getGsap();

    const ctx = gsap.context(() => {
      /* 1 · Reveals escalonados: ScrollTrigger.batch agrupa los elementos que entran en el
            mismo intervalo y los anima juntos con stagger, ideal para pilas verticales largas. */
      const targets = Array.from(root.querySelectorAll<HTMLElement>(revealSelector));
      if (targets.length) {
        gsap.set(targets, { autoAlpha: 0, y: distance });
        ScrollTrigger.batch(targets, {
          start,
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration,
              stagger,
              ease: "expo.out",
              overwrite: true,
              // Al terminar retiramos el transform inline para no interferir con hover/sticky.
              clearProps: "transform",
            });
          },
        });
      }

      /* 2 · Parallax: cada capa recorre ±(velocidad × distancia) px mientras la sección
            va de "asomar por abajo" a "desaparecer por arriba". */
      if (parallaxSelector) {
        const layers = Array.from(root.querySelectorAll<HTMLElement>(parallaxSelector));
        for (const layer of layers) {
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
                scrub: 0.6,
              },
            },
          );
        }
      }
    }, root);

    return () => ctx.revert();
  }, [ref, revealSelector, parallaxSelector, start, distance, duration, stagger, parallaxDistance, enabled]);
}
