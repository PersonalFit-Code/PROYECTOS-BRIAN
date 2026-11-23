import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SelloConcepto from "@/components/ui/SelloConcepto";
import { conceptos, type Grupo } from "@/data/conceptos";
import { cn } from "@/lib/utils";

/**
 * Un apartado de la portada por cada grupo de disciplinas: se van encontrando al bajar, no hay que
 * buscarlas en el menú. En claro, las fichas se destacan en naranja al pasar; en oscuro, vidrio.
 * `grande`: tarjetas con foto (gimnasio y Programa 720).
 */
export default function Disciplinas({ id, de, etiqueta, titulo, texto, tono, grande = false }: { id: string; de: Grupo[]; etiqueta: string; titulo: React.ReactNode; texto?: string; tono: "claro" | "oscuro"; grande?: boolean }) {
  const lista = conceptos.filter((c) => de.includes(c.grupo));
  const claro = tono === "claro";
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-24", claro ? "bg-pared text-negro" : "bg-negro text-white")} aria-labelledby={`titulo-${id}`}>
      <div className="container-page">
        <div className="grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p data-reveal className={cn("etiqueta", claro ? "text-negro/50" : "text-white/50")}>
              {etiqueta}
            </p>
            <h2 id={`titulo-${id}`} data-reveal className="titular mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[0.97]">
              {titulo}
            </h2>
          </div>
          {texto && (
            <p data-reveal className={cn("text-[16px] leading-relaxed lg:col-span-5", claro ? "text-negro/65" : "text-white/65")}>
              {texto}
            </p>
          )}
        </div>

        <ul className={cn("mt-9 grid gap-3 lg:gap-4", grande ? "md:grid-cols-2" : lista.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
          {lista.map((c) => (
            <li key={c.slug} data-reveal>
              <Link
                href={c.href}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-3xl",
                  claro ? "ficha-clara border border-negro/10 bg-white" : "tarjeta-vidrio",
                )}
              >
                {grande && c.foto && (
                  <span className="relative block aspect-[16/9] overflow-hidden">
                    <Image src={c.foto} alt="" fill sizes="(min-width:768px) 46vw, 92vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </span>
                )}
                <span className="flex flex-1 items-start gap-4 p-5 sm:p-6">
                  <SelloConcepto logo={c.logo} nombre={c.nombre} className="size-16 rounded-2xl sm:size-[4.5rem]" />
                  <span className="min-w-0 flex-1">
                    <span className={cn("etiqueta sin-punto block !text-[10px]", claro ? "text-negro/45" : "text-white/45")}>{c.marca}</span>
                    <span className="subtitular mt-1 block text-[22px] leading-tight sm:text-[24px]">{c.nombre}</span>
                    {c.lema && <span className={cn("mt-1 block text-[14.5px] font-semibold", claro ? "text-negro/75" : "text-white/80")}>{c.lema}</span>}
                    <span className={cn("mt-2 text-[14px] leading-relaxed", c.lema ? "hidden sm:block" : "block", claro ? "text-negro/60" : "text-white/60")}>{c.texto}</span>
                    <span className="mt-4 flex flex-wrap gap-1.5">
                      {c.chips.map((x) => (
                        <span key={x} className={cn("rounded-full px-2.5 py-1 text-[12px] font-semibold", claro ? "bg-pared text-negro/70" : "bg-white/[0.07] text-white/75")}>
                          {x}
                        </span>
                      ))}
                    </span>
                  </span>
                  <ArrowUpRight className={cn("size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", claro ? "text-marca" : "text-white/40 group-hover:text-white")} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
