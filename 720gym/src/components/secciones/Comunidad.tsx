import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, AtSign, Heart, ShieldCheck, Smile, Star, UserCheck } from "lucide-react";
import CitasComunidad from "@/components/ui/CitasComunidad";
import Contador from "@/components/ui/Contador";
import Normas from "@/components/ui/Normas";
import { claseBoton } from "@/components/ui/Boton";
import { fotos } from "@/data/fotos";
import { negocio, waVisita } from "@/data/negocio";

/**
 * Comunidad: gente real entrenando (fotos de clase), los cuatro valores que más repiten las
 * reseñas, reseñas de Google que rotan, las normas de la casa y una invitación a venir.
 */
const valores = [
  { t: "Ambiente familiar", d: "Aquí la gente se saluda por su nombre.", I: Heart },
  { t: "Todas las edades", d: "Cada persona, a su ritmo y a su nivel.", I: Smile },
  { t: "Sin comparaciones", d: "Vienes a mejorar tu versión, no a medirte.", I: ShieldCheck },
  { t: "Atención cercana", d: "Grupos reducidos y alguien pendiente de ti.", I: UserCheck },
];

export default function Comunidad({ resumen = false }: { resumen?: boolean }) {
  return (
    <section id="comunidad" className="overflow-hidden bg-niebla py-16 text-negro sm:py-24" aria-labelledby="titulo-comunidad">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className="lg:col-span-6">
          <p data-reveal className="etiqueta text-negro/50">Comunidad</p>
          <h2 id="titulo-comunidad" data-reveal className="titular mt-3 text-titulo-2 leading-[0.97]">
            720 también es <span className="resalte">la gente</span> que entrena aquí
          </h2>
          <p data-reveal className="mt-5 max-w-xl text-[17px] leading-relaxed text-negro/70">
            La cercanía y el compañerismo son el sello de todos los socios. Un ambiente positivo en el que todos somos uno.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {valores.map(({ t, d, I }) => (
              <li key={t} data-reveal className="ficha-clara flex items-start gap-3.5 rounded-2xl border border-negro/10 bg-white p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-negro text-white">
                  <I className="size-[18px]" aria-hidden />
                </span>
                <span>
                  <span className="subtitular block text-[17px] leading-tight">{t}</span>
                  <span className="mt-1 block text-[13.5px] leading-snug text-negro/60">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <div data-reveal className="relative">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-suelo">
              <Image src={fotos.pilatesClaseWallUnit.grande} alt={fotos.pilatesClaseWallUnit.alt} fill sizes="(min-width:1024px) 46vw, 92vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 left-4 hidden aspect-[4/5] w-[30%] overflow-hidden rounded-3xl border-4 border-niebla bg-suelo sm:block">
              <Image src={fotos.powerSeleccion.src} alt={fotos.powerSeleccion.alt} fill sizes="200px" className="object-cover object-[50%_25%]" />
            </div>
            <a
              href={negocio.google.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ficha-clara group absolute -top-5 right-4 flex items-center gap-3 rounded-2xl border border-negro/10 bg-white px-4 py-3 shadow-[0_20px_40px_-25px_rgb(0_0_0/0.5)]"
            >
              <span className="titular text-[40px] leading-none">
                <Contador hasta={5} decimales={1} />
              </span>
              <span>
                <span className="flex gap-0.5" aria-label="5 de 5 estrellas">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-3.5 fill-marca text-marca" aria-hidden />
                  ))}
                </span>
                <span className="mt-0.5 block text-[12px] text-negro/60">
                  <Contador hasta={negocio.google.resenas} /> reseñas en Google
                </span>
              </span>
              <ArrowUpRight className="size-4 text-negro/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </a>
          </div>
          <div data-reveal className="mt-12 rounded-3xl bg-white p-6 sm:ml-[34%] sm:p-7">
            <CitasComunidad />
          </div>
        </div>
      </div>

      <Normas className="mt-16 sm:mt-20" />

      <div className="container-page mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p data-reveal className="subtitular text-[20px] sm:text-[22px]">¿Te apetece conocer a la gente de 720?</p>
        <div data-reveal className="flex flex-wrap items-center gap-3">
          <Link href={waVisita()} target="_blank" rel="noopener" className={claseBoton("venta")}>
            Ven a conocer 720
          </Link>
          <a href={negocio.instagram} target="_blank" rel="noopener noreferrer" className="group inline-flex h-12 items-center gap-2 rounded-full border border-negro/15 bg-white px-5 text-[14.5px] font-bold">
            <AtSign className="size-4 text-marca" aria-hidden /> {negocio.instagramUsuario.replace("@", "")} en Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
