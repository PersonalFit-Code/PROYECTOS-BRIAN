import Link from "next/link";
import { ArrowRight, Clock, Download } from "lucide-react";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import SelloConcepto from "@/components/ui/SelloConcepto";
import { conceptos } from "@/data/conceptos";
import { negocio, wa } from "@/data/negocio";

/**
 * Todos los horarios del centro en una sola página. Sale de las fichas (src/data/conceptos.ts):
 * al cambiar un horario allí, cambia también aquí. Sin reservas: la disponibilidad se consulta
 * por WhatsApp con cada actividad.
 */
export default function HorariosCentro() {
  const conHorario = conceptos.filter((c) => c.horarios && c.slug !== "gimnasio");
  return (
    <section className="bg-pared pt-[calc(var(--header-h)+3rem)] pb-16 text-negro sm:pb-24" aria-labelledby="titulo-horarios">
      <div className="container-page">
        <p className="etiqueta text-negro/50">Curso 2026-27</p>
        <h1 id="titulo-horarios" className="titular mt-4 text-titulo-1">
          Horarios de <span className="resalte">720</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-negro/70">
          Todos los horarios del centro, actividad por actividad. Los grupos y la disponibilidad pueden variar durante el curso: escríbenos y te
          decimos qué plazas hay.
        </p>

        <div className="ficha-clara mt-10 flex flex-col gap-5 rounded-3xl border border-negro/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-negro text-white">
              <Clock className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="subtitular text-[22px] leading-tight">Gimnasio</h2>
              <p className="mt-1 text-[16px] font-semibold">{negocio.horario.texto}</p>
              <p className="text-[14.5px] text-negro/60">{negocio.horario.detalle}</p>
            </div>
          </div>
          <a href="/horario-720-2026-27.pdf" download className="boton-info subtitular inline-flex h-12 shrink-0 items-center justify-center gap-2 px-6 text-[15px]">
            <Download className="size-4" aria-hidden /> Descargar el horario en PDF
          </a>
        </div>

        <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {conHorario.map((c) => (
            <li key={c.slug} id={c.slug} className="ficha-clara flex scroll-mt-28 flex-col rounded-3xl border border-negro/10 bg-white p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <SelloConcepto logo={c.logo} nombre={c.nombre} className="size-14 rounded-2xl text-[40px]" />
                <div className="min-w-0">
                  <h2 className="subtitular text-[21px] leading-tight">{c.nombre}</h2>
                  {c.club && <p className="text-[13.5px] text-negro/55">{c.club.nombre}</p>}
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {c.horarios!.grupos.map((g, i) => (
                  <div key={g.titulo ?? i}>
                    {g.titulo && <h3 className="etiqueta sin-punto text-negro/50">{g.titulo}</h3>}
                    <ul className="mt-1.5 space-y-1 text-[15px] leading-snug">
                      {g.lineas.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {c.horarios!.nota && <p className="mt-4 text-[13.5px] text-negro/55">{c.horarios!.nota}</p>}
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6">
                <a href={wa(c.horarios!.mensaje, c.whatsapp ?? negocio.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[14px] font-bold">
                  <IconoWhatsApp className="size-4 text-whatsapp" /> Consultar disponibilidad
                </a>
                <Link href={c.href} className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-negro/65 hover:text-negro">
                  Ver la actividad <ArrowRight className="size-4 text-marca transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
