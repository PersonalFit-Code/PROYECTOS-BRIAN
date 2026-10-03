"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";

/**
 * EL MOTOR DE REVELADOS, SIN GSAP. Un IntersectionObserver compartido por toda la web que añade
 * `.is-revealed` a los `[data-reveal]` de una sección cuando asoman.
 *
 * POR QUÉ VIVE EN SU PROPIO MÓDULO. Esto estaba dentro de `useScrollReveal`, que además mueve las
 * capas `[data-parallax]` con GSAP y, por tanto, importa GSAP + ScrollTrigger de forma estática.
 * Mientras el hook solo se usaba en tres secciones de la PORTADA daba igual: allí GSAP ya viene con
 * el scroll suave. Pero el pie de página también quiere revelados, y el pie sale en /carta, /vinos y
 * en las tres páginas legales — donde no hay ni scroll suave ni una sola capa de parallax. Importar
 * el hook entero allí metía ~28 kB comprimidos de GSAP en el paquete de la carta para hacer cuatro
 * fundidos. Separado, el revelado no cuesta ni un byte de más: es un observador y una clase.
 *
 * El estado inicial, la transición y el estado final están en `globals.css` bajo `[data-reveal]`
 * (+ modos `fade` / `letterbox` / `wipe`) y `[data-reveal].is-revealed`. Aquí solo se decide CUÁNDO
 * se añade la clase.
 */

/**
 * `useLayoutEffect` en cliente (registra los elementos antes del primer pintado, sin "flash"),
 * `useEffect` en servidor para no emitir avisos durante el render SSR.
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Modo de revelado de un elemento `data-reveal`:
 *  - `up`: fundido + deslizamiento hacia arriba (clásico, es el valor sin atributo).
 *  - `fade`: solo fundido.
 *  - `letterbox`: el bloque se abre como un fotograma (clip-path inset vertical).
 *  - `wipe`: barrido de izquierda a derecha (clip-path inset horizontal).
 * Se elige por elemento con `data-reveal="wipe"`; sin valor se usa el modo por defecto del hook.
 */
export type RevealMode = "up" | "fade" | "letterbox" | "wipe";

export interface RevealOptions {
  /** Selector de los elementos a revelar dentro de la sección. Por defecto `[data-reveal]`. */
  revealSelector?: string;
  /** Escalonado (s) entre elementos que entran en la misma tanda. Por defecto 0.1. */
  stagger?: number;
  /** Permite desactivar el hook (p. ej. hasta que el contenido esté montado). Por defecto true. */
  enabled?: boolean;
  /**
   * Revelado cinematográfico: los `data-reveal` sin modo explícito se abren con `clip-path`
   * (modo `letterbox`) en vez del fundido + deslizamiento. Por defecto false.
   */
  cinematic?: boolean;
}

/* ──────────────────────────────────────────────────────────────
   UN IntersectionObserver para toda la web
   ────────────────────────────────────────────────────────────── */

/**
 * POR QUÉ NO ScrollTrigger. `ScrollTrigger.batch` creaba UN trigger por elemento: 24 elementos
 * `data-reveal` en la home eran 24 de los 38 triggers vivos, y `SmoothScrollProvider` recorre TODOS
 * los triggers en cada fotograma de Lenis (`ScrollTrigger.update()`) para calcular progresos. Un
 * revelado ocurre UNA vez y no necesita progreso continuo: con un observador compartido el coste por
 * fotograma es cero y la transición la lleva el compositor desde CSS.
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
 * cada vez que aparece contenido nuevo dentro de la sección (el mural de fotos, p. ej., se monta
 * cuando se acerca al viewport, y sus piezas tampoco existían todas en el primer barrido: las que
 * faltan aparecen al pulsar "ver todas").
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
 * Revela los hijos `[data-reveal]` de una sección (una sola vez, con escalonado).
 *
 * Todo el CSS vive dentro de `@media (prefers-reduced-motion: no-preference)`: quien pide menos
 * movimiento ve el contenido visible y quieto sin que intervenga nada de JavaScript (y sin riesgo de
 * sección en blanco si el observador no llegara a montarse).
 *
 * Los `[data-reveal]` no deben anidarse entre sí (cada uno se revela de forma independiente).
 *
 * Para añadir además capas con parallax, usa `useScrollReveal`, que es este mismo hook más GSAP.
 */
export function useReveal<T extends HTMLElement>(ref: RefObject<T | null>, options: RevealOptions = {}): void {
  const { revealSelector = "[data-reveal]", stagger = 0.1, enabled = true, cinematic = false } = options;

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
}
