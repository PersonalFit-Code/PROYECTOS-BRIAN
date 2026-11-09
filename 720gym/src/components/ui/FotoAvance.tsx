"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * «Walkthrough» con la foto del hero: la cámara avanza hacia el fondo de la sala.
 *  - Al cargar, un avance muy lento y continuo (CSS).
 *  - Al hacer scroll, la cámara entra en la sala: la foto se acerca hacia el punto de fuga, el velo
 *    se abre y el contenido del hero sube y se desvanece (var --avance de 0 a 1 en el <section>).
 * Con «reducir movimiento», foto fija. Cuando haya vídeo de Veo, se sustituye por un <video>.
 */
export default function FotoAvance({ src, foco = "58% 52%" }: { src: string; foco?: string }) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = caja.current;
    const seccion = el?.closest("section");
    if (!el || !seccion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const mover = () => {
      raf = 0;
      const r = seccion.getBoundingClientRect();
      /* Con el hero fijado (escritorio) el recorrido es lo que sobra de la sección; si no, su alto. */
      const fijado = r.height > window.innerHeight * 1.2;
      const recorrido = fijado ? r.height - window.innerHeight : r.height * 0.9;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, recorrido)));
      seccion.style.setProperty("--avance", p.toFixed(4));
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
  }, []);

  return (
    <div ref={caja} className="avance-caja absolute inset-0 overflow-hidden" style={{ ["--foco" as string]: foco }} aria-hidden>
      <div className="avance-auto absolute inset-0">
        <div className="avance-scroll absolute inset-0">
          <Image src={src} alt="" fill priority sizes="100vw" className="object-cover saturate-[0.9]" style={{ objectPosition: foco }} />
        </div>
      </div>
    </div>
  );
}
