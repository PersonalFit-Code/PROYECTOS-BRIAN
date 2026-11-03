import { Star } from "lucide-react";
import { OPINIONES } from "@/data/opiniones";

/** Opiniones reales. Sin reseñas en `data/opiniones.ts` no pinta nada: nada de ejemplos inventados. */
export default function Opiniones() {
  if (OPINIONES.length < 3) return null;
  return (
    <section aria-labelledby="opiniones-titulo" className="bg-hueso">
      <div className="container-page py-20 sm:py-24">
        <p className="etiqueta text-gris">Opiniones</p>
        <h2 id="opiniones-titulo" className="titular mt-3 text-4xl sm:text-5xl">
          Lo que dicen
          <br />
          quienes entrenan
        </h2>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {OPINIONES.slice(0, 3).map((o) => (
            <li key={o.autor + o.texto.slice(0, 12)} className="flex flex-col border border-linea bg-white p-7">
              <div className="flex gap-0.5 text-rojo" aria-label="5 estrellas">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} aria-hidden className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-gris">«{o.texto}»</p>
              <p className="mt-6 text-[12px] font-semibold tracking-[0.12em] text-negro uppercase">
                {o.autor}
                {o.producto ? ` · ${o.producto}` : ""} · {o.fuente}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
