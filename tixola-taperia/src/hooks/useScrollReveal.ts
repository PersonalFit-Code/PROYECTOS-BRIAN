"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { getGsap } from "@/lib/gsap";

/**
 * `useLayoutEffect` en cliente (oculta los elementos antes del primer pintado, sin "flash"),
 * `useEffect` en servidor para no emitir avisos durante el render SSR.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Modo de revelado de un elemento `data-reveal`:
 *  - `up`: fundido + deslizamiento hacia arriba (clásico).
 *  - `fade`: solo fundido.
 *  - `letterbox`: el bloque se abre como un fotograma (clip-path inset vertical) mientras sube.
 *  - `wipe`: barrido de izquierda a derecha (clip-path inset horizontal).
 * Se elige por elemento con `data-reveal="wipe"`; sin valor se usa el modo por defecto del hook.
 */
export type RevealMode = "up" | "fade" | "letterbox" | "wipe";

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
  /**
   * Revelado cinematográfico: los `data-reveal` sin modo explícito se abren con `clip-path`
   * (modo `letterbox`) en vez del fundido + deslizamiento. Por defecto false.
   */
  cinematic?: boolean;
}

const MODES: ReadonlySet<string> = new Set<RevealMode>(["up", "fade", "letterbox", "wipe"]);

function resolveMode(el: HTMLElement, fallback: RevealMode): RevealMode {
  const value = el.dataset.reveal;
  return value && MODES.has(value) ? (value as RevealMode) : fallback;
}

/** Estado inicial (oculto) y final (visible) de cada modo. */
function statesFor(mode: RevealMode, distance: number) {
  switch (mode) {
    case "fade":
      return { from: { autoAlpha: 0 }, to: { autoAlpha: 1 } };
    case "letterbox":
      return {
        from: { autoAlpha: 0, y: distance * 0.6, clipPath: "inset(18% 0% 18% 0%)" },
        to: { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" },
      };
    case "wipe":
      return {
        from: { autoAlpha: 0, x: -distance * 0.5, clipPath: "inset(0% 100% 0% 0%)" },
        to: { autoAlpha: 1, x: 0, clipPath: "inset(0% 0% 0% 0%)" },
      };
    case "up":
    default:
      return { from: { autoAlpha: 0, y: distance }, to: { autoAlpha: 1, y: 0 } };
  }
}

/**
 * Revela con GSAP + ScrollTrigger los hijos `[data-reveal]` de una sección (una sola vez, con
 * stagger) y desplaza las capas `[data-parallax]` a distintas velocidades mientras la sección
 * atraviesa el viewport (scrub).
 *
 * - Compatible con el scroll suave de la home: Lenis mueve el scroll nativo de `window` (el
 *   scroller por defecto de ScrollTrigger) y `SmoothScrollProvider` hace `ScrollTrigger.refresh()`
 *   al montar Lenis, al cargar las fuentes y al cambiar la altura del documento. Aquí no se
 *   cambia el `scroller` ni se instancia nada global.
 * - Todo vive dentro de un `gsap.context()` que se revierte al desmontar (sin fugas ni triggers huérfanos).
 * - Es un no-op cuando el usuario prefiere menos movimiento: los elementos quedan visibles y quietos.
 * - Los `[data-reveal]` no deben anidarse entre sí (cada uno se anima de forma independiente).
 * - Al terminar cada reveal se limpian `transform` y `clip-path` inline (hover/sticky intactos).
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
  const {
    revealSelector = "[data-reveal]",
    parallaxSelector = "[data-parallax]",
    start = "top 80%",
    distance = 40,
    duration = 1,
    stagger = 0.1,
    parallaxDistance = 320,
    enabled = true,
    cinematic = false,
  } = options;

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { gsap, ScrollTrigger } = getGsap();
    const fallbackMode: RevealMode = cinematic ? "letterbox" : "up";

    const ctx = gsap.context(() => {
      /* 1 · Reveals escalonados por modo: ScrollTrigger.batch agrupa los elementos que entran en el
            mismo intervalo y los anima juntos con stagger, ideal para pilas verticales largas. */
      const targets = Array.from(root.querySelectorAll<HTMLElement>(revealSelector));
      const groups = new Map<RevealMode, HTMLElement[]>();
      for (const el of targets) {
        const mode = resolveMode(el, fallbackMode);
        const group = groups.get(mode);
        if (group) group.push(el);
        else groups.set(mode, [el]);
      }

      for (const [mode, group] of groups) {
        const { from, to } = statesFor(mode, distance);
        const isClip = mode === "letterbox" || mode === "wipe";
        gsap.set(group, from);
        ScrollTrigger.batch(group, {
          start,
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              ...to,
              duration: isClip ? duration * 1.2 : duration,
              stagger,
              ease: "expo.out",
              overwrite: true,
              // Al terminar retiramos transform y clip-path inline para no interferir con hover/sticky.
              clearProps: isClip ? "transform,clipPath" : "transform",
            });
          },
        });
      }

      /* 2 · Parallax: cada capa recorre ±(velocidad × distancia) px mientras la sección
            va de "asomar por abajo" a "desaparecer por arriba". Scrub corto: Lenis ya suaviza. */
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
                scrub: 0.3,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      }
    }, root);

    return () => ctx.revert();
  }, [ref, revealSelector, parallaxSelector, start, distance, duration, stagger, parallaxDistance, enabled, cinematic]);
}
