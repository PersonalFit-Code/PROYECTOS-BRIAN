"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Frase gigante que cruza la pantalla al hacer scroll (el «be kind to yourself» de Bodyism).
 * Se mueve con el scroll de la página, no sola: un transform por fotograma y nada más.
 */
export default function FraseGigante({
  frase,
  sentido = 1,
  tono = "claro",
  className,
}: {
  frase: string;
  sentido?: 1 | -1;
  tono?: "claro" | "oscuro" | "contorno";
  className?: string;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const pista = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const mover = () => {
      raf = 0;
      const c = caja.current;
      const p = pista.current;
      if (!c || !p) return;
      const r = c.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      /* 0 cuando la caja entra por abajo, 1 cuando sale por arriba */
      const progreso = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const recorrido = Math.max(0, p.scrollWidth - c.clientWidth);
      const x = sentido === 1 ? -progreso * recorrido : -(1 - progreso) * recorrido;
      p.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(mover);
    };
    mover();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      cancelAnimationFrame(raf);
    };
  }, [sentido]);

  return (
    <div ref={caja} className={cn("overflow-hidden py-10 sm:py-16", className)}>
      <p
        ref={pista}
        className={cn(
          "titular w-max pl-[6vw] pr-[6vw] text-[clamp(5rem,17vw,15rem)] whitespace-nowrap will-change-transform",
          tono === "claro" && "text-negro",
          tono === "oscuro" && "text-white",
          tono === "contorno" && "text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.55)]",
        )}
      >
        {frase}
      </p>
    </div>
  );
}
