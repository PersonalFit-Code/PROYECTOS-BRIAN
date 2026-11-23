import Link from "next/link";
import { ArrowRight, ClipboardList, Dumbbell, Trophy, Users } from "lucide-react";
import { grupos, type Grupo } from "@/data/conceptos";

/** «Qué es 720» (texto del boceto de Brais): la idea del centro y las cuatro maneras de entrenar. */
const maneras: { grupo: Grupo; href: string; Icono: typeof Users }[] = [
  { grupo: "libre", href: "#entrena", Icono: Dumbbell },
  { grupo: "plan", href: "#entrena", Icono: ClipboardList },
  { grupo: "grupos", href: "#grupos-reducidos", Icono: Users },
  { grupo: "clubes", href: "#clubes", Icono: Trophy },
];

export default function QueEs720() {
  return (
    <section id="que-buscas" className="bg-white py-16 text-negro sm:py-24" aria-labelledby="titulo-que-es">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p data-reveal className="etiqueta text-negro/50">
              Qué es 720
            </p>
            <h2 id="titulo-que-es" data-reveal className="titular mt-4 text-[clamp(2.3rem,5vw,4rem)] leading-[0.95]">
              Un espacio. <span className="resalte">Diferentes formas</span> de entrenar.
            </h2>
          </div>
          <div data-reveal className="space-y-3 text-[16.5px] leading-relaxed text-negro/70 lg:col-span-5">
            <p>720GYM CLUB es un centro de entrenamiento y actividad física en Ourense creado para reunir diferentes formas de entrenar y cuidarse dentro de un mismo espacio.</p>
            <p>Puedes entrenar por libre, seguir una planificación mediante el Programa 720 o participar en actividades dirigidas y grupos reducidos.</p>
          </div>
        </div>

        <p data-reveal className="etiqueta mt-12 text-negro/50">
          Encuentra tu manera de entrenar
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {maneras.map(({ grupo, href, Icono }) => (
            <li key={grupo} data-reveal>
              <Link href={href} className="ficha-clara group flex h-full flex-col rounded-3xl border border-negro/10 bg-white p-5 sm:p-6">
                <span className="disco size-14">
                  <span className="size-8">
                    <Icono className="size-4" aria-hidden />
                  </span>
                </span>
                <span className="subtitular mt-5 block text-[20px] leading-tight">{grupos[grupo].titulo}</span>
                <span className="mt-2 block flex-1 text-[13.5px] leading-relaxed text-negro/65 sm:text-[14.5px]">{grupos[grupo].texto}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold">
                  Ver <ArrowRight className="size-4 text-marca transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
