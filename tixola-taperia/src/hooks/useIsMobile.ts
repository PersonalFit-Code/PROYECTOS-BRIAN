"use client";

import { useEffect, useState } from "react";

/** true por debajo de `breakpoint` px (por defecto 768 = md de Tailwind). SSR-safe: false hasta montar. */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

/**
 * `true` cuando el puntero principal es GRUESO, o sea un dedo. Es el criterio correcto para las
 * decisiones que dependen de que haya un TECLADO VIRTUAL que bajar, y no `useIsMobile`: una ventana
 * de escritorio estrechada por debajo de 768 px es "móvil" para el ancho pero se maneja con un ratón
 * y un teclado físico, y allí soltar el foco de un campo no baja ningún teclado — solo se lo quita al
 * usuario. SSR-safe: `false` hasta montar, que es el lado que no toca el foco de nadie.
 */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return coarse;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
