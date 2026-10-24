"use client";

import { useEffect } from "react";

/**
 * Un único IntersectionObserver para la página: marca `data-shown` en cada `.reveal` la primera vez
 * que entra en pantalla y deja de observarlo. El escalonado lo da `--i` en el estilo de cada
 * elemento (60 ms por paso, dentro de los 30–80 ms que recomienda Emil).
 */
export default function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not([data-shown])"));
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.setAttribute("data-shown", "true"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-shown", "true");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
