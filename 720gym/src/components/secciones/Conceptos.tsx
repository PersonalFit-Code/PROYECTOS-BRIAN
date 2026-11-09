import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Foto from "@/components/ui/Foto";
import IconoConcepto from "@/components/ui/IconoConcepto";
import { conceptos } from "@/data/conceptos";

/** Tarjetas de «conceptos» (Bodyism): foto vertical grande, nombre y dos líneas. */
export default function Conceptos({ excluir }: { excluir?: string }) {
  const lista = conceptos.filter((c) => c.slug !== excluir);
  return (
    <section id="conceptos" className="bg-negro py-24 sm:py-32" aria-labelledby="titulo-conceptos">
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p data-reveal className="etiqueta text-white/55">
              {!excluir && <></>}Conceptos
            </p>
            <h2 id="titulo-conceptos" data-reveal className="titular mt-5 text-[clamp(2.1rem,3.6vw,3.1rem)]">
              {excluir ? "Más en 720" : "Elige cómo entrenar"}
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-[15px] leading-relaxed text-white/60">
            Seis formas de entrenar bajo el mismo techo. Combínalas como quieras: aquí cada persona va a su ritmo.
          </p>
        </div>
      </div>

      <ul className="no-scrollbar mt-14 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 sm:scroll-px-6 sm:px-6 lg:container-page lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-14 lg:overflow-visible">
        {lista.map((c) => (
          <li key={c.slug} data-reveal className="w-[78vw] max-w-[22rem] shrink-0 snap-start sm:w-[44vw] lg:w-auto lg:max-w-none">
            <Link href={c.href} className="group block">
              <div className="relative overflow-hidden">
                <Foto
                  src={c.foto}
                  descripcion={c.fotoDescripcion}
                  proporcion="aspect-[3/4]"
                  className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                  sizes="(min-width:1024px) 30vw, 78vw"
                />
                <span className="tarjeta-vidrio absolute top-4 left-4 grid size-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
                  <IconoConcepto icono={c.icono} className="size-6" />
                </span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="etiqueta text-acento">{c.marca}</p>
                  <h3 className="titular mt-2 text-[26px] sm:text-[30px]">{c.nombre}</h3>
                  <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-white/60">{c.lineas}</p>
                </div>
                <ArrowUpRight className="mt-8 size-6 shrink-0 text-white/40 transition-[transform,color] duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-acento" aria-hidden />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
