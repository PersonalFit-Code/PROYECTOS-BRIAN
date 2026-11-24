import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clubes } from "@/data/conceptos";
import { wa } from "@/data/negocio";


/** Clubes que entrenan en 720, con enlace a 720P (espacios para profesionales). */
export default function Clubes({ pagina = false }: { pagina?: boolean }) {
  const Titulo = pagina ? "h1" : "h2";
  return (
    <section id="clubes" className={pagina ? "bg-pizarra pt-[calc(var(--header-h)+4rem)] pb-24 sm:pb-32" : "bg-pizarra py-24 sm:py-32"} aria-labelledby="titulo-clubes">
      <div className="container-page">
        <p data-reveal className="etiqueta text-white/55">
          Clubes que entrenan en 720
        </p>
        <Titulo id="titulo-clubes" data-reveal className="titular mt-5 max-w-4xl text-titulo-2">
          Un centro vivo, de la mañana a la noche
          {pagina && <span className="sr-only">: clubes deportivos y alquiler de salas en Ourense</span>}
        </Titulo>
        <ul className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {clubes.map((c) => (
            <li key={c.nombre} data-reveal className="flex flex-col bg-pizarra p-7">
              <div className="grid h-28 place-items-center bg-black ring-1 ring-inset ring-white/8">
                {c.logo ? (
                  <Image src={c.logo} alt={`Logo de ${c.nombre}`} width={104} height={104} className="size-[104px] object-contain" />
                ) : (
                  <span className="font-sans text-[22px] font-black tracking-tight text-white/80">{c.corto}</span>
                )}
              </div>
              <p className="etiqueta mt-6 text-acento">{c.disciplina}</p>
              <h3 className="subtitular mt-2 text-[26px]">{c.nombre}</h3>
              <p className="mt-2 text-[14px] text-white/60">{c.detalle}</p>
              <a
                href={wa(c.mensaje, c.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-white/85 hover:text-acento"
              >
                Escribir a {c.nombre} <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </li>
          ))}
        </ul>

        {/* 720P tiene su propia página */}
        <Link href="/720p" id="profesionales" data-reveal className="group mt-16 flex flex-col gap-5 rounded-[2rem] bg-white/[0.05] p-6 ring-1 ring-white/10 transition hover:bg-white/[0.08] sm:flex-row sm:items-center sm:gap-7 sm:p-8">
          <Image src="/sellos/720p-logo.png" alt="Logo de 720P" width={96} height={96} className="size-20 shrink-0 rounded-2xl ring-1 ring-white/15 sm:size-24" />
          <span className="min-w-0 flex-1">
            <span className="etiqueta block text-white/55">720P · Espacios para profesionales</span>
            <span className="titular mt-2 block text-titulo-3">¿Quieres un espacio para tu actividad?</span>
            <span className="mt-1 block text-[15px] text-white/65">Alquila una sala o el centro entero para tus clases, cursos, talleres o eventos.</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[15px] font-bold">
            Ver 720P <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </div>
    </section>
  );
}
