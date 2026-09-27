"use client";

import { useSyncExternalStore } from "react";

/**
 * useScrollPast — UN solo almacén de scroll para toda la web.
 *
 * Había tres copias del mismo hook vigilando el scroll: `useScrolledPast` duplicado carácter a
 * carácter en FloatingWhatsApp y ChatLauncher, y la lectura propia de Navbar con su listener y su
 * rAF. Tres escuchas y tres rAF pidiendo lo mismo (`scrollY`, `innerHeight`) en cada gesto de
 * scroll, cada una con su `setState` y su render.
 *
 * Aquí hay un único listener pasivo estrangulado con rAF que publica `{ y, vh }` por
 * `useSyncExternalStore` (el patrón que ya usa `usePerformanceTier`). Los consumidores derivan su
 * booleano en `getSnapshot`: devuelve un primitivo, así que React compara por valor y solo
 * re-renderiza cuando el booleano cambia de verdad — no en cada fotograma de scroll.
 *
 * El listener se engancha con el primer suscriptor y se suelta con el último: en una página sin
 * flotantes ni cabecera no hay nada escuchando.
 */

let scrollY = 0;
let viewportHeight = 0;
let rafId = 0;

const listeners = new Set<() => void>();

function measure() {
  rafId = 0;
  const y = window.scrollY;
  const vh = window.innerHeight;
  /* Sin cambio real no se avisa a nadie: el rebote del scroll en iOS dispara eventos con el mismo
     desplazamiento y cada aviso costaría un render por consumidor. */
  if (y === scrollY && vh === viewportHeight) return;
  scrollY = y;
  viewportHeight = vh;
  for (const listener of listeners) listener();
}

function schedule() {
  if (!rafId) rafId = window.requestAnimationFrame(measure);
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    /* Lectura inicial síncrona: si la página se abre ya desplazada (recarga, enlace con #ancla),
       el primer snapshot tiene que ser el bueno. React vuelve a leerlo tras suscribirse. */
    scrollY = window.scrollY;
    viewportHeight = window.innerHeight;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }
  };
}

/** Lectura imperativa (helpers de GSAP, callbacks fuera de React). En servidor devuelve ceros. */
export function getScrollMetrics(): { y: number; vh: number } {
  return { y: scrollY, vh: viewportHeight };
}

/**
 * `true` cuando el usuario ha bajado más de `px` píxeles.
 * En servidor y en el primer render de hidratación es `false`, igual que hacía cada copia del hook.
 */
export function useScrollPastPixels(px: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => scrollY > px,
    () => false,
  );
}

/** `true` cuando el usuario ha bajado más de `ratio` × alto del viewport. */
export function useScrollPastViewport(ratio: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => scrollY > viewportHeight * ratio,
    () => false,
  );
}
