"use client";

import { useEffect, type RefObject } from "react";

declare global {
  interface Window {
    __dpRevealWatchdog?: number;
  }
}

let observer: IntersectionObserver | null = null;

/** UN solo IntersectionObserver para toda la página: añade `.is-revealed` y deja de observar. */
function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          observer?.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  return observer;
}

/**
 * Revela los `[data-reveal]` de `ref` con escalonado (`--reveal-delay`). El estado inicial vive en
 * CSS bajo `:root[data-reveal-armed]`; este hook cancela el vigía que lo desarmaría a los 2,6 s.
 */
export function useReveal<T extends HTMLElement>(ref: RefObject<T | null>, stagger = 80) {
  useEffect(() => {
    if (window.__dpRevealWatchdog) {
      window.clearTimeout(window.__dpRevealWatchdog);
      delete window.__dpRevealWatchdog;
    }
    const root = ref.current;
    if (!root) return;
    const obs = getObserver();
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (root.hasAttribute("data-reveal")) nodes.unshift(root);
    nodes.forEach((n, i) => {
      if (!n.style.getPropertyValue("--reveal-delay")) n.style.setProperty("--reveal-delay", `${Math.min(i, 6) * stagger}ms`);
      obs.observe(n);
    });
    return () => nodes.forEach((n) => obs.unobserve(n));
  }, [ref, stagger]);
}
