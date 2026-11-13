"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Quote, Star } from "lucide-react";
import Contador from "@/components/ui/Contador";
import { negocio } from "@/data/negocio";
import { resenas, type Tema } from "@/data/resenas";
import { cn } from "@/lib/utils";

/**
 * Reseñas reales de Google: la nota media de la ficha arriba, filtros por tema y tarjetas que se
 * despliegan. En una página de concepto (p. ej. Pilates) llega `tema` y se muestran solo esas.
 */
const filtros: { id: Tema | "todas"; nombre: string }[] = [
  { id: "todas", nombre: "Todas" },
  { id: "gimnasio", nombre: "Gimnasio" },
  { id: "pilates", nombre: "Pilates" },
  { id: "ambiente", nombre: "Ambiente" },
  { id: "fuerza", nombre: "Fuerza" },
  { id: "rehabilitacion", nombre: "Rehabilitación" },
];

function Estrellas({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="size-full fill-current" style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </span>
  );
}

export default function Resenas({ tema, titulo = "Lo que dicen de 720" }: { tema?: Tema; titulo?: string }) {
  const [filtro, setFiltro] = useState<Tema | "todas">(tema ?? "todas");
  const [todas, setTodas] = useState(false);
  const lista = resenas.filter((r) => filtro === "todas" || r.temas.includes(filtro));
  const visibles = todas ? lista : lista.slice(0, 6);

  return (
    <section className="relative bg-negro py-20 text-white sm:py-28" aria-labelledby="titulo-resenas">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p data-reveal className="etiqueta text-white/55">
              Reseñas reales de Google
            </p>
            <h2 id="titulo-resenas" data-reveal className="titular mt-4 text-[clamp(2.3rem,4.4vw,3.4rem)]">
              {titulo}
            </h2>
          </div>
          <a
            data-reveal
            href={negocio.google.url}
            target="_blank"
            rel="noopener noreferrer"
            className="vidrio group flex items-center gap-4 rounded-3xl px-5 py-4 transition hover:-translate-y-0.5"
          >
            <span className="titular text-[52px] leading-none">{negocio.google.nota}</span>
            <span>
              <Estrellas className="h-5 text-[#fbbc04]" />
              <span className="mt-1 block text-[13px] text-white/70">
                <Contador hasta={negocio.google.resenas} /> reseñas en Google
              </span>
            </span>
            <ArrowUpRight className="size-5 text-white/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" aria-hidden />
          </a>
        </div>

        {!tema && (
          <div data-reveal className="no-scrollbar mt-8 flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar reseñas por tema">
            {filtros.map((f) => {
              const n = f.id === "todas" ? resenas.length : resenas.filter((r) => r.temas.includes(f.id as Tema)).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filtro === f.id}
                  onClick={() => {
                    setFiltro(f.id);
                    setTodas(false);
                  }}
                  className={cn("h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold ring-1 transition active:scale-95", filtro === f.id ? "bg-white text-negro ring-white" : "text-white/75 ring-white/20 hover:text-white hover:ring-white/50")}
                >
                  {f.nombre} <span className="opacity-50">{n}</span>
                </button>
              );
            })}
          </div>
        )}

        <ul key={filtro} className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visibles.map((r, i) => (
            <li key={`${r.nombre}-${i}`} className="pop-entra mb-4 break-inside-avoid" style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
              <figure className="tarjeta-vidrio group rounded-3xl p-6 transition duration-300 hover:-translate-y-1">
                <Quote className="size-7 text-white/25 transition group-hover:rotate-[-8deg] group-hover:text-white/60" aria-hidden />
                <blockquote className="mt-3 text-[15px] leading-relaxed text-white/85">{r.texto}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[14px] font-semibold text-negro">{r.nombre.charAt(0)}</span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold">{r.nombre}</span>
                    <span className="block text-[12px] text-white/50">
                      Reseña de Google{r.guia ? " · Local Guide" : ""}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-center gap-4">
          {lista.length > 6 && (
            <button type="button" onClick={() => setTodas(!todas)} className="boton-info subtitular inline-flex h-11 items-center gap-2 px-5 text-white">
              {todas ? "Ver menos" : `Ver las ${lista.length} reseñas`}
              <ChevronDown className={cn("size-4 transition duration-300", todas && "rotate-180")} aria-hidden />
            </button>
          )}
          <div data-reveal className="mt-4 flex flex-col items-center gap-3 text-center sm:flex-row">
            <p className="subtitular text-[18px]">¿Te unes a ellos?</p>
            <div className="flex gap-2">
              <Link href="/alta" className="boton-venta subtitular inline-flex h-11 items-center px-5 text-[15px]">
                Inscríbete
              </Link>
              <Link href="/clase-gratis" className="boton-info subtitular inline-flex h-11 items-center px-5 text-[15px] text-white">
                Clase gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
