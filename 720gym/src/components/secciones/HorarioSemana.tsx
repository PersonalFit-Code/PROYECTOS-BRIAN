"use client";

import { useState, useSyncExternalStore } from "react";
import { Clock, Info } from "lucide-react";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import { conceptos } from "@/data/conceptos";
import { diasSemana, sesionesSemana, type DiaSemana, type SesionSemana } from "@/data/horario-semanal";
import { negocio, wa } from "@/data/negocio";
import { cn } from "@/lib/utils";

/**
 * Horario de toda la semana. En móvil: pestañas por día (abre en el día de hoy) con lo que hay ese
 * día. En escritorio: la semana entera en siete columnas, con hoy marcado. Cada actividad lleva su
 * color y se puede filtrar tocando su nombre. Sin reservas ni descargas: solo consultar.
 */
const actividad = Object.fromEntries(conceptos.map((c) => [c.slug, { nombre: c.nombre, color: c.color }]));
const conSesiones = conceptos.filter((c) => sesionesSemana.some((s) => s.slug === c.slug));
const sinSuscripcion = () => () => {};
const diaHoy = () => new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", weekday: "long" }).format(new Date());

function Bloque({ s, compacto = false }: { s: SesionSemana; compacto?: boolean }) {
  const a = actividad[s.slug];
  return (
    <li className={cn("relative overflow-hidden rounded-xl bg-white/[0.05] ring-1 ring-white/10", compacto ? "py-1.5 pr-2 pl-3.5" : "py-2.5 pr-3 pl-4.5")} style={{ ["--c" as string]: a.color }}>
      <span className="absolute inset-y-0 left-0 w-1.5 bg-[var(--c)]" aria-hidden />
      <span className="absolute inset-0 bg-[var(--c)] opacity-[0.14]" aria-hidden />
      <span className={cn("relative flex items-baseline gap-x-2.5", compacto && "flex-wrap gap-y-0")}>
        <span className={cn("titular shrink-0 leading-none tabular-nums", compacto ? "text-[15px]" : "w-[6.6rem] text-[19px]")}>
          {s.inicio}
          {s.fin && <span className="text-white/50">–{s.fin}</span>}
        </span>
        <span className="min-w-0">
          <span className={cn("block leading-tight font-bold", compacto ? "text-[12.5px]" : "text-[15px]")}>{a.nombre}</span>
          {s.detalle && <span className={cn("block leading-snug text-white/60", compacto ? "text-[11px]" : "text-[12.5px]")}>{s.detalle}</span>}
        </span>
      </span>
    </li>
  );
}

export default function HorarioSemana() {
  const hoyTexto = useSyncExternalStore(sinSuscripcion, diaHoy, () => "");
  const hoy = (diasSemana.find((d) => d.toLowerCase() === hoyTexto.toLowerCase()) ?? null) as DiaSemana | null;
  const [elegido, setElegido] = useState<DiaSemana | null>(null);
  const [filtro, setFiltro] = useState<string | null>(null);
  const dia = elegido ?? hoy ?? "Lunes";
  const delDia = (d: DiaSemana) => sesionesSemana.filter((s) => s.dia === d && (!filtro || s.slug === filtro)).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const vacio = <li className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-[12.5px] text-white/55">{filtro ? "Sin clases de esta actividad." : "Sin clases dirigidas."} El gimnasio está abierto.</li>;

  return (
    <section className="bg-negro pt-[calc(var(--header-h)+2rem)] pb-14 text-white sm:pb-20" aria-labelledby="titulo-horarios">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <p className="etiqueta text-white/50">Curso 2026-27</p>
            <h1 id="titulo-horarios" className="titular mt-3 text-titulo-2">
              Horarios de 720
            </h1>
          </div>
        <p className="flex items-center gap-2.5 pb-1 text-[15px] font-semibold text-white/85">
          <Clock className="size-5 text-white/60" aria-hidden />
          Gimnasio: {negocio.horario.texto.toLowerCase()}, los 365 días del año.
        </p>
        </div>

        {/* Aviso: los horarios cambian; mejor consultar antes de venir */}
        <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="flex items-start gap-3 text-[14.5px] leading-snug text-white/85">
            <Info className="mt-0.5 size-5 shrink-0 text-white/60" aria-hidden />
            <span>
              <strong className="font-bold text-white">Los horarios pueden cambiar durante el curso.</strong> Antes de venir, consúltanos: te confirmamos el
              horario y las plazas de la actividad que te interesa.
            </span>
          </p>
          <a
            href={wa("Hola, os escribo desde la web de 720 Gym Club. Me gustaría confirmar el horario y las plazas de una actividad. Gracias.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-whatsapp px-4 text-[14px] font-semibold text-white transition hover:scale-[1.03]"
          >
            <IconoWhatsApp className="size-4" /> Consultar horario
          </a>
        </div>

        {/* Filtro por actividad, con su color */}
        <div className="no-scrollbar -mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por actividad">
          <button type="button" aria-pressed={!filtro} onClick={() => setFiltro(null)} className={cn("h-9 shrink-0 rounded-full px-3.5 text-[13px] font-bold transition", !filtro ? "bg-white text-negro" : "bg-white/[0.06] text-white/75 ring-1 ring-white/10")}>
            Todas
          </button>
          {conSesiones.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={filtro === c.slug}
              onClick={() => setFiltro(filtro === c.slug ? null : c.slug)}
              className={cn("flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] font-bold transition", filtro === c.slug ? "bg-white text-negro" : "bg-white/[0.06] text-white/75 ring-1 ring-white/10 hover:text-white")}
            >
              <span className="size-2.5 rounded-full" style={{ background: c.color }} aria-hidden />
              {c.nombre}
            </button>
          ))}
        </div>

        {/* Móvil y tableta: un día cada vez */}
        <div className="lg:hidden">
          <div className="no-scrollbar -mx-4 mt-4 overflow-x-auto px-4" role="tablist" aria-label="Día de la semana">
            <div className="inline-flex min-w-full gap-1 rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
              {diasSemana.map((d) => (
                <button
                  key={d}
                  role="tab"
                  aria-selected={d === dia}
                  onClick={() => setElegido(d)}
                  className={cn("flex min-w-[3.4rem] flex-1 flex-col items-center rounded-full px-2 py-1.5 transition", d === dia ? "bg-white text-negro" : "text-white/70")}
                >
                  <span className="subtitular text-[15px]">{d.slice(0, 3)}</span>
                  <span className={cn("text-[10.5px] font-semibold", d === hoy ? "text-naranja" : "opacity-60")}>{d === hoy ? "Hoy" : `${delDia(d).length}`}</span>
                </button>
              ))}
            </div>
          </div>
          <h2 className="subtitular mt-5 text-[20px]">
            {dia}
            {dia === hoy && <span className="ml-2 text-[14px] text-naranja">· hoy</span>}
          </h2>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2" role="tabpanel" aria-label={`Clases del ${dia.toLowerCase()}`}>
            {delDia(dia).length ? delDia(dia).map((s, i) => <Bloque key={`${s.inicio}-${s.slug}-${i}`} s={s} />) : vacio}
          </ul>
        </div>

        {/* Escritorio: la semana entera */}
        <div className="mt-5 hidden grid-cols-7 gap-2 lg:grid">
          {diasSemana.map((d) => (
            <div key={d} className={cn("rounded-2xl p-1.5", d === hoy ? "bg-white/[0.07] ring-2 ring-white/70" : "bg-white/[0.025] ring-1 ring-white/8")}>
              <h2 className="flex items-baseline justify-between px-2 pt-1.5 pb-2">
                <span className="subtitular text-[15px]">{d}</span>
                {d === hoy && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-wider text-negro uppercase">Hoy</span>}
              </h2>
              <ul className="grid gap-1">{delDia(d).length ? delDia(d).map((s, i) => <Bloque key={`${s.inicio}-${s.slug}-${i}`} s={s} compacto />) : vacio}</ul>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-2xl text-[13.5px] leading-relaxed text-white/55">
          Horarios orientativos: los grupos, las horas y la disponibilidad pueden cambiar. Consulta siempre antes de venir.
        </p>
      </div>
    </section>
  );
}
