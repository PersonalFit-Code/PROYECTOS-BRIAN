"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Reseñas reales de Google (src/data/resenas.ts) que hablan del ambiente; rotan solas y se pueden elegir. */
const citas = [
  { texto: "El mejor gimnasio de la ciudad. En él se respira compañerismo y se fomenta el mismo, no hay envidias ni críticas hacia nadie, todo el mundo se ayuda y se apoya entre sí…", nombre: "Héctor P." },
  { texto: "720 se ha convertido en mucho más que un lugar para entrenar. Aquí no solo he mejorado físicamente, sino que también he encontrado un ambiente excepcional rodeado de personas increíbles…", nombre: "Esperanza V." },
  { texto: "Sin duda alguna el mejor gimnasio en el que he estado nunca, gente súper amable y comprensiva, nada masificado y entrenadores que realmente se preocupan por ti.", nombre: "Oscar C." },
];

export default function CitasComunidad() {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  useEffect(() => {
    if (pausa || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % citas.length), 6500);
    return () => window.clearInterval(id);
  }, [pausa]);
  return (
    <div onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)} onFocus={() => setPausa(true)} onBlur={() => setPausa(false)}>
      <div className="grid">
        {citas.map((c, n) => (
          <figure key={c.nombre} aria-hidden={n !== i} className={cn("col-start-1 row-start-1 transition-[opacity,transform] duration-700", n === i ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
            <blockquote className="text-[16px] leading-relaxed text-negro/80 sm:text-[17px]">«{c.texto}»</blockquote>
            <figcaption className="mt-3 text-[13px] font-semibold text-negro/55">{c.nombre} · Reseña de Google</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-5 flex gap-2" role="group" aria-label="Elegir reseña">
        {citas.map((c, n) => (
          <button key={c.nombre} type="button" onClick={() => setI(n)} aria-label={`Reseña de ${c.nombre}`} aria-pressed={n === i} className={cn("h-1.5 rounded-full transition-all duration-500", n === i ? "w-8 bg-marca" : "w-3 bg-negro/20 hover:bg-negro/40")} />
        ))}
      </div>
    </div>
  );
}
