import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Foto from "@/components/ui/Foto";
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
              <span className="text-acento">02</span> · Conceptos
            </p>
            <h2 id="titulo-conceptos" data-reveal className="titular mt-5 text-[clamp(3rem,9vw,7rem)]">
              {excluir ? "Más en 720" : "Elige cómo entrenar"}
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-[15px] leading-relaxed text-white/60">
            Seis formas de entrenar bajo el mismo techo. Combínalas como quieras: aquí cada persona va a su ritmo.
          </p>
        </div>
      </div>

      <ul className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:px-6 lg:container-page lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-14 lg:overflow-visible">
        {lista.map((c, i) => (
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
                <span className="absolute top-4 left-4 etiqueta text-white/70">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="etiqueta text-acento">{c.marca}</p>
                  <h3 className="titular mt-2 text-[40px] sm:text-[44px]">{c.nombre}</h3>
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
