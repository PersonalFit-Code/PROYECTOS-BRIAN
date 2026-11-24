import Link from "next/link";
import { Lightbulb, Play, Users, Warehouse } from "lucide-react";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import { waVisita } from "@/data/negocio";

/**
 * Nuestra historia, con el texto del boceto de Brais: la idea, el espacio y la comunidad, «Hoy,
 * 720 sigue creciendo» y la franja negra de cierre con el lema.
 */
const pilares = [
  { I: Lightbulb, t: "La idea", d: "No todas las personas necesitan entrenar de la misma manera. Algunas buscan autonomía; otras, una planificación; y otras prefieren aprender y avanzar dentro de un grupo." },
  { I: Warehouse, t: "El espacio", d: "Un centro con espacios para gimnasio de fuerza, entrenamiento funcional, Pilates, Yoga, artes marciales y gimnasia acrobática. Cada actividad cuenta con una zona preparada para su práctica." },
  { I: Users, t: "La comunidad", d: "Profesionales y clubes especializados comparten el espacio, mantienen su identidad y forman parte de una comunidad deportiva más amplia." },
];

export default function Historia() {
  return (
    <section id="historia" className="relative scroll-mt-24 overflow-hidden bg-white py-16 text-negro sm:py-24" aria-labelledby="titulo-historia">
      <p className="marca pointer-events-none absolute -top-6 right-0 hidden text-[22rem] leading-none text-negro/[0.045] select-none lg:block" aria-hidden>
        720
      </p>
      <div className="container-page relative">
        <p data-reveal className="etiqueta text-negro/50">Nuestra historia</p>
        <h2 id="titulo-historia" data-reveal className="titular mt-4 max-w-4xl text-titulo-1 leading-[0.95]">
          Una idea que se convierte en un <span className="resalte">espacio compartido.</span>
        </h2>
        <div data-reveal className="mt-6 max-w-3xl space-y-4 text-[17px] leading-relaxed text-negro/70">
          <p>720 nace en Ourense con una idea clara: crear un lugar donde cada persona pueda encontrar su manera de entrenar, aprender y cuidarse.</p>
          <p>
            Queríamos alejarnos del modelo de gimnasio masificado donde simplemente vienes, entrenas y te vas. Por eso construimos un entorno cercano, con
            aforo limitado y diferentes propuestas para distintas personas, objetivos y momentos.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 md:grid-cols-3 md:gap-4">
          {pilares.map(({ I, t, d }) => (
            <li key={t} data-reveal className="ficha-clara rounded-3xl border border-negro/10 bg-white p-6 sm:p-7">
              <span className="grid size-14 place-items-center rounded-2xl bg-pared">
                <I className="size-8 text-marca" strokeWidth={1.6} aria-hidden />
              </span>
              <h3 className="subtitular mt-4 text-[21px]">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-negro/65">{d}</p>
            </li>
          ))}
        </ul>

        <div data-reveal className="mt-4 rounded-3xl bg-pared p-6 sm:p-7">
          <p className="etiqueta text-negro/55">Hoy, 720 sigue creciendo</p>
          <p className="mt-3 max-w-4xl text-[16px] leading-relaxed text-negro/75">
            720 es la suma de las personas que entrenan, enseñan, comparten y hacen crecer cada actividad. Seguimos construyendo un espacio profesional,
            cercano y con identidad propia, sin perder la esencia con la que comenzó.
          </p>
          <a href="https://www.instagram.com/reel/Dd16RzrKhXV/" target="_blank" rel="noopener noreferrer" className="group mt-4 inline-flex items-center gap-2.5 text-[14.5px] font-bold">
            <span className="grid size-9 place-items-center rounded-full bg-negro text-white transition-transform group-hover:scale-110">
              <Play className="size-3.5 fill-current" aria-hidden />
            </span>
            Ver el antes y el después en Instagram
          </a>
        </div>

        <div data-reveal className="mt-4 flex flex-col gap-6 rounded-3xl bg-negro p-6 text-white sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="titular max-w-3xl text-[clamp(1.5rem,3vw,2.3rem)] leading-[1.02]">
              No buscamos que todo el mundo entrene igual. Queremos que cada persona encuentre su manera de avanzar.
            </p>
            <p className="mt-4 text-[13px] font-semibold tracking-[0.14em] text-white/60 uppercase">720GYM CLUB · Entrena. Cuídate. Creciendo.</p>
          </div>
          <Link href={waVisita()} target="_blank" rel="noopener" className="boton-venta sin-flecha subtitular inline-flex h-14 shrink-0 items-center justify-center gap-2.5 px-7 text-[16px]">
            <IconoWhatsApp className="size-5 text-marca" />
            Quiero conocer 720
          </Link>
        </div>
      </div>
    </section>
  );
}
