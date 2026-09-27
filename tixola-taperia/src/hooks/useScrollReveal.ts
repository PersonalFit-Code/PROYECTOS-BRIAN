"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { getGsap } from "@/lib/gsap";

/**
 * `useLayoutEffect` en cliente (registra los elementos antes del primer pintado, sin "flash"),
 * `useEffect` en servidor para no emitir avisos durante el render SSR.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Modo de revelado de un elemento `data-reveal`:
 *  - `up`: fundido + deslizamiento hacia arriba (clásico, es el valor sin atributo).
 *  - `fade`: solo fundido.
 *  - `letterbox`: el bloque se abre como un fotograma (clip-path inset vertical).
 *  - `wipe`: barrido de izquierda a derecha (clip-path inset horizontal).
 * Se elige por elemento con `data-reveal="wipe"`; sin valor se usa el modo por defecto del hook.
 *
 * Los cuatro estados (inicial, transición y final) viven en `globals.css` bajo `[data-reveal]`,
 * `[data-reveal="fade"]`, `[data-reveal="letterbox"]`, `[data-reveal="wipe"]` y
 * `[data-reveal].is-revealed`. Aquí solo se decide CUÁNDO se añade la clase.
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
  /** Escalonado (s) entre elementos que entran en la misma tanda. Por defecto 0.1. */
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

/* ──────────────────────────────────────────────────────────────
   Revelados: UN IntersectionObserver para toda la web
   ────────────────────────────────────────────────────────────── */

/**
 * POR QUÉ NO ScrollTrigger. `ScrollTrigger.batch` creaba UN trigger por elemento: 24 elementos
 * `data-reveal` en la home (4 en StarDishes, 11 en Experience, 9 en SocialProof) eran 24 de los 38
 * triggers vivos, y `SmoothScrollProvider` recorre TODOS los triggers en cada fotograma de Lenis
 * (`ScrollTrigger.update()`) para calcular progresos. Un revelado ocurre UNA vez y no necesita
 * progreso continuo: con un observador compartido el coste por fotograma es cero y la transición la
 * lleva el compositor desde CSS. El parallax, que sí necesita progreso, sigue en GSAP más abajo.
 */

/**
 * Equivalente al `start: "top 80%"` de antes: el elemento se revela cuando su borde superior entra
 * en el 80 % superior del viewport. Con `rootMargin` inferior negativo el área de observación se
 * recorta justo ahí.
 */
const REVEAL_ROOT_MARGIN = "0px 0px -20% 0px";

/**
 * Cancela el vigía que `layout.tsx` arma antes del primer pintado. Ese temporizador quita la clase
 * `reveal-armed` de <html> —y con ella el `opacity: 0` de TODOS los `[data-reveal]`— si nadie ha llegado
 * a montar este hook: sin JavaScript, con el bundle caído o con la wifi del local a medio gas, la home
 * por debajo de la portada se vería de todas formas en vez de quedarse en blanco. Cuando el observador
 * sí llega, el vigía sobra y hay que soltarlo o borraría la clase a mitad de una entrada.
 */
function disarmRevealWatchdog(): void {
  const w = window as Window & { __tixolaRevealWatchdog?: number };
  if (w.__tixolaRevealWatchdog === undefined) return;
  window.clearTimeout(w.__tixolaRevealWatchdog);
  delete w.__tixolaRevealWatchdog;
}

/** Escalonado (s) con el que se registró cada elemento pendiente. */
const pending = new WeakMap<Element, number>();
let revealObserver: IntersectionObserver | null = null;

/** Orden de documento: el escalonado debe cascar hacia abajo, no en el orden del callback. */
function compareDocumentOrder(a: Element, b: Element): number {
  if (a === b) return 0;
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function handleReveal(records: IntersectionObserverEntry[]): void {
  const entering: HTMLElement[] = [];
  for (const record of records) {
    if (record.isIntersecting) entering.push(record.target as HTMLElement);
  }
  if (entering.length === 0) return;
  entering.sort(compareDocumentOrder);

  entering.forEach((el, index) => {
    const stagger = pending.get(el) ?? 0;
    /* Una sola vez: se deja de observar en cuanto entra (`once` del ScrollTrigger anterior). */
    revealObserver?.unobserve(el);
    pending.delete(el);
    /* El retardo se escribe como variable CSS y lo consume `transition-delay` en globals.css. No se
       pisa un valor en línea que ya traiga el componente (las tarjetas de indicadores, p. ej., traen
       el suyo para escalonarse entre ellas aunque entren en tandas distintas). */
    if (index > 0 && stagger > 0 && !el.style.getPropertyValue("--reveal-delay")) {
      el.style.setProperty("--reveal-delay", `${Math.round(index * stagger * 1000)}ms`);
      /* Y se retira al acabar: la regla `[data-reveal]` deja puesto `transition-delay` para siempre, y
         un `transform` de hover sobre un elemento ya revelado arrancaría con ese retardo — justo lo que
         no queremos que se note al presentar la página. */
      el.addEventListener("transitionend", () => el.style.removeProperty("--reveal-delay"), { once: true });
    }
    el.classList.add("is-revealed");
  });
}

function observerForReveals(): IntersectionObserver {
  revealObserver ??= new IntersectionObserver(handleReveal, { rootMargin: REVEAL_ROOT_MARGIN, threshold: 0 });
  return revealObserver;
}

/**
 * Registra los `data-reveal` de `root` que aún no estén revelados ni en cola. Se llama al montar y
 * cada vez que aparece contenido nuevo dentro de la sección (la galería de fotos, p. ej., se monta
 * cuando se acerca al viewport y sus elementos no existían en el primer barrido).
 */
function registerReveals(root: Element, selector: string, stagger: number, fallback: RevealMode): Element[] {
  const observer = observerForReveals();
  const added: Element[] = [];
  for (const el of root.querySelectorAll<HTMLElement>(selector)) {
    if (el.classList.contains("is-revealed") || pending.has(el)) continue;
    /* En las secciones cinematográficas el modo por defecto es `letterbox`. El CSS solo mira el valor
       del atributo, así que se escribe una vez aquí en vez de duplicar reglas en globals.css.
       Se compara contra "true" además de contra vacío: en JSX un atributo sin valor (`<h2 data-reveal>`)
       es `data-reveal={true}` y React lo serializa como la CADENA "true", así que `!el.dataset.reveal`
       era SIEMPRE false y el modo no se escribía nunca — la opción `cinematic` era código muerto y
       Experience y SocialProof revelaban todo en modo `up`. */
    const explicit = el.dataset.reveal;
    if (fallback !== "up" && (!explicit || explicit === "true")) el.dataset.reveal = fallback;
    pending.set(el, stagger);
    observer.observe(el);
    added.push(el);
  }
  return added;
}

/* ──────────────────────────────────────────────────────────────
   Hook
   ────────────────────────────────────────────────────────────── */

/**
 * Revela los hijos `[data-reveal]` de una sección (una sola vez, con escalonado) y desplaza las capas
 * `[data-parallax]` a distintas velocidades mientras la sección atraviesa el viewport (scrub).
 *
 * - Revelados: un IntersectionObserver COMPARTIDO por toda la web añade `.is-revealed` y escribe
 *   `--reveal-delay`. Estado inicial, transición y estado final están en `globals.css`, dentro de
 *   `@media (prefers-reduced-motion: no-preference)`: quien pide menos movimiento ve el contenido
 *   visible y quieto sin que intervenga nada de JavaScript (y sin riesgo de sección en blanco si el
 *   observador no llegara a montarse).
 * - Parallax: sigue en GSAP + ScrollTrigger porque necesita progreso continuo (`scrub`). Vive en un
 *   `gsap.context()` que se revierte al desmontar.
 * - Compatible con el scroll suave de la home: Lenis mueve el scroll nativo de `window` (el scroller
 *   por defecto de ScrollTrigger) y `SmoothScrollProvider` hace `ScrollTrigger.refresh()` al montar
 *   Lenis, al cargar las fuentes y al cambiar la altura del documento.
 * - Los `[data-reveal]` no deben anidarse entre sí (cada uno se revela de forma independiente).
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
    stagger = 0.1,
    parallaxDistance = 320,
    enabled = true,
    cinematic = false,
  } = options;

  /* 1 · Revelados (observador compartido, sin coste por fotograma). */
  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    /* Con `prefers-reduced-motion: reduce` el CSS de revelado no aplica: el contenido ya está
       visible y no hay nada que observar. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* El observador ya está en marcha, así que el vigía de `layout.tsx` (que descubre el contenido por
       su cuenta si el bundle no llega) deja de hacer falta. Se cancela aquí y no en un efecto aparte
       para que el orden sea el correcto: primero hay quien revele, después se retira la red. */
    disarmRevealWatchdog();

    const fallback: RevealMode = cinematic ? "letterbox" : "up";
    const mine = new Set<Element>(registerReveals(root, revealSelector, stagger, fallback));

    /* Contenido diferido: solo se vuelve a barrer cuando de verdad se añaden nodos, y una vez por
       fotograma como mucho (un `childList` puede llegar en ráfagas durante una hidratación). */
    let scheduled = 0;
    const rescan = () => {
      scheduled = 0;
      for (const el of registerReveals(root, revealSelector, stagger, fallback)) mine.add(el);
    };
    const dom = new MutationObserver((records) => {
      if (scheduled) return;
      for (const record of records) {
        if (record.addedNodes.length > 0) {
          scheduled = window.requestAnimationFrame(rescan);
          return;
        }
      }
    });
    dom.observe(root, { childList: true, subtree: true });

    return () => {
      dom.disconnect();
      if (scheduled) window.cancelAnimationFrame(scheduled);
      /* Al desmontar se sueltan los que aún no habían entrado (los revelados ya no se observan). */
      for (const el of mine) {
        if (!pending.has(el)) continue;
        pending.delete(el);
        revealObserver?.unobserve(el);
      }
    };
  }, [ref, revealSelector, stagger, enabled, cinematic]);

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
