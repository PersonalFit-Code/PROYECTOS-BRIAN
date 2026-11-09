import Link from "next/link";
import { ArrowUpRight, Dumbbell, Flower2, Sun } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Anillas, Arrancada, BarraDiscos, Berimbau, Cinturon, Kettlebell, LlaveSala } from "./IconosMarca";
import { cn } from "@/lib/utils";

/**
 * «El universo 720» (v4): sin cinta. Tarjetas de vidrio con un icono que representa cada submarca
 * y cada club; las submarcas llevan a su página. Hasta tener sus logos, icono + marca tipográfica.
 */
type Icono = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

const submarcas: { a: string; b: string; texto: string; href: string; Icono: Icono }[] = [
  { a: "720", b: "GYM", texto: "Sala de musculación", href: "/gimnasio", Icono: Dumbbell as Icono },
  { a: "720", b: "PILATES", texto: "Reformer, Mat e Hipopresivos", href: "/pilates", Icono: Flower2 as Icono },
  { a: "720", b: "YOGA", texto: "Movilidad y calma", href: "/yoga", Icono: Sun as Icono },
  { a: "CROSSGYM", b: "720", texto: "Fuerza y acondicionamiento", href: "/crossgym", Icono: Kettlebell },
  { a: "720", b: "POWERLIFTING", texto: "Material de competición", href: "/powerlifting", Icono: BarraDiscos },
  { a: "720P", b: "PROFESIONALES", texto: "Alquiler de salas", href: "/clubes#profesionales", Icono: LlaveSala },
];
const clubes: { a: string; b: string; texto: string; Icono: Icono }[] = [
  { a: "Ximnasia", b: "Burgas", texto: "Gimnasia acrobática", Icono: Anillas },
  { a: "Capoeira", b: "Andaruê", texto: "Arte marcial afrobrasileño", Icono: Berimbau },
  { a: "BJJ", b: "Mambises", texto: "Jiu-jitsu brasileño", Icono: Cinturon },
  { a: "Halterofilia", b: "720", texto: "Arrancada y dos tiempos", Icono: Arrancada },
];

function Ficha({ Icono, a, b, texto, marca, i }: { Icono: Icono; a: string; b: string; texto: string; marca: boolean; i: number }) {
  return (
    <>
      <span className="flex items-start justify-between">
        <span className="icono-flota grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-white/20 to-white/[0.04] ring-1 ring-white/15" style={{ animationDelay: `${i * 0.4}s` }}>
          <Icono className="size-6" />
        </span>
        {marca && <ArrowUpRight className="size-4 text-white/35 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />}
      </span>
      <span className="mt-5 flex items-baseline gap-1.5">
        {marca ? <span className="marca text-[24px]">{a}</span> : <span className="subtitular text-[16px]">{a}</span>}
        <span className={cn("font-bold tracking-[0.16em] text-white/65", marca ? "text-[10px]" : "text-[11px] uppercase")}>{b}</span>
      </span>
      <span className="mt-1 block text-[12px] text-white/55">{texto}</span>
    </>
  );
}

export default function CintaLogos({ className }: { className?: string; tono?: "claro" | "oscuro" }) {
  return (
    <section aria-labelledby="titulo-universo" className={cn("relative overflow-hidden bg-negro py-16 text-white sm:py-20", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_20%_30%,rgb(255_255_255/0.07),transparent_70%),radial-gradient(40%_60%_at_85%_80%,rgb(255_255_255/0.06),transparent_70%)]" aria-hidden />
      <div className="container-page relative">
        <p className="etiqueta text-white/45">Submarcas y clubes</p>
        <h2 id="titulo-universo" className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
          El universo <span className="texto-logo">720</span>
        </h2>

        <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {submarcas.map((s, i) => (
            <li key={s.b + s.a} className="w-[44%] shrink-0 snap-start sm:w-auto">
              <Link href={s.href} className="tarjeta-vidrio group flex h-full flex-col rounded-2xl p-4">
                <Ficha {...s} marca i={i} />
              </Link>
            </li>
          ))}
        </ul>

        <p className="etiqueta mt-10 text-white/45">Clubes que entrenan en 720</p>
        <ul className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
          {clubes.map((c, i) => (
            <li key={c.a} className="w-[60%] shrink-0 snap-start sm:w-auto">
              <Link href="/clubes" className="group flex h-full flex-col rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition duration-500 hover:-translate-y-1 hover:bg-white/[0.07] hover:ring-white/25">
                <Ficha {...c} marca={false} i={i + 6} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
