"use client";

import { useEffect, useRef, type ReactNode } from "react";

declare global {
  interface Window {
    __dpDentro?: boolean;
  }
}

/**
 * Entre página y página, dos hojas de puerta se abren hacia los lados y dejan ver la nueva. La
 * plantilla se vuelve a montar en cada navegación; en la primera carga no hay puertas (ya está la
 * portada) y sin movimiento tampoco. Solo `transform`, con la Web Animations API: nada de estado.
 */
export default function Template({ children }: { children: ReactNode }) {
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.__dpDentro) {
      window.__dpDentro = true;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const opts: KeyframeAnimationOptions = { duration: 820, easing: "cubic-bezier(0.76, 0, 0.24, 1)", delay: 60, fill: "both" };
    const a = left.current?.animate(
      [
        { transform: "translate3d(0,0,0)", visibility: "visible" },
        { transform: "translate3d(-102%,0,0)", visibility: "visible" },
      ],
      opts,
    );
    const b = right.current?.animate(
      [
        { transform: "translate3d(0,0,0)", visibility: "visible" },
        { transform: "translate3d(102%,0,0)", visibility: "visible" },
      ],
      opts,
    );
    return () => {
      a?.cancel();
      b?.cancel();
    };
  }, []);

  return (
    <>
      {children}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
        <div ref={left} className="hoja-transicion invisible absolute inset-y-0 left-0 w-1/2 border-r border-oro/50 bg-botella-800">
          <span className="absolute top-1/2 right-0 h-[46svh] w-[min(36vw,220px)] -translate-y-1/2 rounded-tl-full border-t border-l border-oro/30" />
          <span className="absolute top-1/2 right-[14px] size-2.5 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fbe7a8,#b8963f)]" />
        </div>
        <div ref={right} className="hoja-transicion invisible absolute inset-y-0 right-0 w-1/2 border-l border-oro/50 bg-botella-800">
          <span className="absolute top-1/2 left-0 h-[46svh] w-[min(36vw,220px)] -translate-y-1/2 rounded-tr-full border-t border-r border-oro/30" />
          <span className="absolute top-1/2 left-[14px] size-2.5 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fbe7a8,#b8963f)]" />
        </div>
      </div>
    </>
  );
}
