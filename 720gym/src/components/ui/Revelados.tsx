"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Un IntersectionObserver para toda la web: añade `.is-revealed` a cada `[data-reveal]` cuando
 * asoma. El ocultado vive en globals.css y solo se arma con `data-reveal-armed`, que pone el layout
 * antes del primer pintado; si este componente no llegara a montarse, un vigía lo quita a los 2,6 s
 * y todo se ve igual (sin animación).
 */
export default function Revelados() {
  const ruta = usePathname();
  useEffect(() => {
    const w = window as Window & { __revealWatchdog?: number };
    if (w.__revealWatchdog !== undefined) {
      window.clearTimeout(w.__revealWatchdog);
      delete w.__revealWatchdog;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entradas) => {
        const visibles = entradas.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        visibles.forEach((el, i) => {
          io.unobserve(el);
          if (i > 0 && !el.style.getPropertyValue("--reveal-delay")) {
            el.style.setProperty("--reveal-delay", `${Math.min(i, 6) * 80}ms`);
            el.addEventListener("transitionend", () => el.style.removeProperty("--reveal-delay"), { once: true });
          }
          el.classList.add("is-revealed");
        });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    const registrar = () => document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => io.observe(el));
    registrar();
    const mo = new MutationObserver(() => registrar());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ruta]);
  return null;
}
