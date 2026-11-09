import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { fotos } from "@/data/fotos";
import { cn } from "@/lib/utils";

/** «La sala por dentro»: mosaico en escritorio, carrusel deslizable en el móvil. Fotos reales. */
const piezas = [
  { ...fotos.sala, titulo: "La sala", texto: "+1.000 m² sin agobios", href: "/gimnasio", clase: "lg:col-span-2 lg:row-span-2" },
  { ...fotos.maquinas, titulo: "Máquinas guiadas", texto: "Multiestación y poleas", href: "/gimnasio", clase: "" },
  { ...fotos.racks, titulo: "Racks y peso libre", texto: "Material de competición", href: "/powerlifting", clase: "" },
  { ...fotos.funcional, titulo: "Zona funcional", texto: "CrossGym y acrobacia", href: "/crossgym", clase: "lg:col-span-2" },
];

export default function Galeria() {
  return (
    <section className="bg-negro py-16 sm:py-24" aria-labelledby="titulo-galeria">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p data-reveal className="etiqueta text-white/50">Calle Río Bibei 16 · Ourense</p>
            <h2 id="titulo-galeria" data-reveal className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
              La sala por dentro
            </h2>
          </div>
          <Link href="/club" className="group hidden items-center gap-1 text-[14px] font-semibold text-white/75 hover:text-white sm:flex">
            Conoce el club <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
      <ul className="no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:px-6 lg:container-page lg:grid lg:auto-rows-[15rem] lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
        {piezas.map((p, i) => (
          <li key={p.src} data-reveal className={cn("relative w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:w-auto", p.clase)}>
            <Link href={p.href} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-auto lg:h-full">
              <Image src={i === 0 ? p.grande : p.src} alt={p.alt} fill sizes={i === 0 ? "(min-width:1024px) 50vw, 82vw" : "(min-width:1024px) 25vw, 82vw"} className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />
              <span className="tarjeta-vidrio absolute right-3 bottom-3 left-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                <span>
                  <span className="subtitular block text-[15px]">{p.titulo}</span>
                  <span className="block text-[12px] text-white/70">{p.texto}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
