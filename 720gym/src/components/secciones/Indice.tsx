import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, Euro, HelpCircle, Users } from "lucide-react";
import IconoConcepto from "@/components/ui/IconoConcepto";
import FondoMarca from "@/components/ui/FondoMarca";
import { conceptos } from "@/data/conceptos";

/**
 * «¿Qué buscas?»: índice de la web (idea de Burdin). En el móvil evita el scroll eterno: cada cosa
 * tiene su página y se llega en un toque.
 */
const extra = [
  { href: "/horario", titulo: "Horario y reservas", texto: "Clases de la semana con plazas libres", Icono: CalendarClock },
  { href: "/tarifas", titulo: "Tarifas", texto: "Desde 5 € el día o 35 €/mes", Icono: Euro },
  { href: "/clubes", titulo: "Clubes y 720P", texto: "Acrobacia, capoeira, BJJ y salas", Icono: Users },
  { href: "/preguntas", titulo: "Preguntas", texto: "Pagos, bonos y cómo llegar", Icono: HelpCircle },
];

export default function Indice() {
  return (
    <section id="que-buscas" className="relative overflow-hidden bg-negro py-16 sm:py-24" aria-labelledby="titulo-indice">
      <FondoMarca agua={false} />
      <div className="container-page relative">
        <p data-reveal className="etiqueta text-white/50">Índice</p>
        <h2 id="titulo-indice" data-reveal className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
          ¿Qué buscas?
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 lg:grid-cols-3 lg:gap-4">
          {conceptos.map((c) => (
            <li key={c.slug} data-reveal>
              <Link href={c.href} className="tarjeta-vidrio group relative isolate flex h-full min-h-[11rem] flex-col overflow-hidden rounded-2xl p-4 sm:min-h-[15rem] sm:p-6">
                {c.foto && (
                  <>
                    <Image src={c.foto} alt="" fill sizes="(min-width:1024px) 30vw, 50vw" className="-z-20 object-cover opacity-55 transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 -z-10 bg-gradient-to-t from-negro via-negro/70 to-negro/20" aria-hidden />
                  </>
                )}
                <span className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/10">
                    <IconoConcepto icono={c.icono} className="size-5" />
                  </span>
                  <ArrowUpRight className="size-4 text-white/40 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
                </span>
                <span className="etiqueta mt-auto pt-5 !text-[10px] text-white/55">{c.marca}</span>
                <span className="titular mt-1 text-[20px] sm:text-[26px]">{c.nombre}</span>
                <span className="mt-1 line-clamp-2 hidden text-[13px] leading-relaxed text-white/70 sm:block">{c.lineas}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-3 grid grid-cols-2 gap-3 lg:mt-4 lg:grid-cols-4 lg:gap-4">
          {extra.map(({ href, titulo, texto, Icono }) => (
            <li key={href} data-reveal>
              <Link href={href} className="group flex h-full items-center gap-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:ring-white/25">
                <Icono className="size-5 shrink-0 text-white/70" aria-hidden />
                <span className="min-w-0">
                  <span className="subtitular block text-[14px]">{titulo}</span>
                  <span className="block truncate text-[12px] text-white/50">{texto}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
