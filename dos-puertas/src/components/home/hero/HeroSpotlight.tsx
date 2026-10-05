"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo de la portada: dos focos radiales fijos (oro sobre el titular, ámbar tras el panel) y, con
 * ratón, un tercer foco suave que sigue al puntero con inercia. Solo se anima `transform`.
 */
export default function HeroSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spot = spotRef.current;
    const host = spot?.parentElement;
    if (!spot || !host) return;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = host.clientWidth * 0.7;
    let y = host.clientHeight * 0.4;
    let tx = x;
    let ty = y;
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      spot.style.transform = `translate3d(${x - 450}px, ${y - 450}px, 0)`;
      if (Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    host.addEventListener("pointermove", onMove);
    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,transparent,#000_22%)] bg-[radial-gradient(900px_520px_at_18%_-8%,rgba(227,196,106,0.16),transparent_62%),radial-gradient(760px_620px_at_82%_48%,rgba(232,162,74,0.11),transparent_65%),radial-gradient(1200px_500px_at_50%_115%,rgba(35,64,50,0.7),transparent_70%)]"
      />
      <div
        ref={spotRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 -z-10 hidden size-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(240,220,158,0.09),rgba(240,220,158,0.035)_45%,transparent)] lg:block"
      />
    </>
  );
}
