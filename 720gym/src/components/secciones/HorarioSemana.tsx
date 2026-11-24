"use client";

import { useState, useSyncExternalStore } from "react";
import { Clock } from "lucide-react";
import { conceptos } from "@/data/conceptos";
import { diasSemana, sesionesSemana, type DiaSemana, type SesionSemana } from "@/data/horario-semanal";
import { negocio } from "@/data/negocio";
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
    <li className="relative overflow-hidden rounded-2xl border border-negro/10 bg-white py-3 pr-3 pl-5" style={{ ["--c" as string]: a.color }}>
      <span className="absolute inset-y-0 left-0 w-1.5 bg-[var(--c)]" aria-hidden />
      <span className="absolute inset-0 bg-[var(--c)] opacity-[0.07]" aria-hidden />
      <span className="relative block">
        <span className={cn("titular block leading-none", compacto ? "text-[19px]" : "text-[24px]")}>
          {s.inicio}
          {s.fin && <span className="text-negro/45"> – {s.fin}</span>}
        </span>
        <span className={cn("mt-1.5 block leading-tight font-bold", compacto ? "text-[13.5px]" : "text-[16px]")}>{a.nombre}</span>
        {s.detalle && <span className={cn("mt-0.5 block leading-snug text-negro/60", compacto ? "text-[12px]" : "text-[13.5px]")}>{s.detalle}</span>}
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
  const vacio = <li className="rounded-2xl border border-dashed border-negro/15 px-4 py-5 text-[13.5px] text-negro/55">{filtro ? "Sin clases de esta actividad." : "Sin clases dirigidas."} El gimnasio está abierto.</li>;

  return (
    <section className="bg-pared pt-[calc(var(--header-h)+3rem)] pb-16 text-negro sm:pb-24" aria-labelledby="titulo-horarios">
      <div className="container-page">
        <p className="etiqueta text-negro/50">Curso 2026-27</p>
        <h1 id="titulo-horarios" className="titular mt-4 text-titulo-1">
          Horarios de <span className="resalte">720</span>
        </h1>
        <p className="mt-5 flex items-center gap-2.5 text-[16px] font-semibold">
          <Clock className="size-5 text-marca" aria-hidden />
          Gimnasio: {negocio.horario.texto.toLowerCase()}, los 365 días del año.
        </p>

        {/* Filtro por actividad, con su color */}
        <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por actividad">
          <button type="button" aria-pressed={!filtro} onClick={() => setFiltro(null)} className={cn("h-10 shrink-0 rounded-full px-4 text-[14px] font-bold transition", !filtro ? "bg-negro text-white" : "border border-negro/15 bg-white text-negro/75")}>
            Todas
          </button>
          {conSesiones.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={filtro === c.slug}
              onClick={() => setFiltro(filtro === c.slug ? null : c.slug)}
              className={cn("flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-bold transition", filtro === c.slug ? "bg-negro text-white" : "border border-negro/15 bg-white text-negro/75 hover:text-negro")}
            >
              <span className="size-3 rounded-full" style={{ background: c.color }} aria-hidden />
              {c.nombre}
            </button>
          ))}
        </div>

        {/* Móvil y tableta: un día cada vez */}
        <div className="lg:hidden">
          <div className="no-scrollbar -mx-4 mt-5 overflow-x-auto px-4" role="tablist" aria-label="Día de la semana">
            <div className="inline-flex min-w-full gap-1 rounded-full border border-negro/10 bg-white p-1">
              {diasSemana.map((d) => (
                <button
                  key={d}
                  role="tab"
                  aria-selected={d === dia}
                  onClick={() => setElegido(d)}
                  className={cn("flex min-w-[3.6rem] flex-1 flex-col items-center rounded-full px-2 py-2 transition", d === dia ? "bg-negro text-white" : "text-negro/70")}
                >
                  <span className="subtitular text-[15px]">{d.slice(0, 3)}</span>
                  <span className={cn("text-[10.5px] font-semibold", d === hoy ? "text-marca" : "opacity-60")}>{d === hoy ? "Hoy" : `${delDia(d).length}`}</span>
                </button>
              ))}
            </div>
          </div>
          <h2 className="subtitular mt-6 text-[22px]">
            {dia}
            {dia === hoy && <span className="ml-2 text-[14px] text-marca">· hoy</span>}
          </h2>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2" role="tabpanel" aria-label={`Clases del ${dia.toLowerCase()}`}>
            {delDia(dia).length ? delDia(dia).map((s, i) => <Bloque key={`${s.inicio}-${s.slug}-${i}`} s={s} />) : vacio}
          </ul>
        </div>

        {/* Escritorio: la semana entera */}
        <div className="mt-6 hidden grid-cols-7 gap-3 lg:grid">
          {diasSemana.map((d) => (
            <div key={d} className={cn("rounded-3xl p-2.5", d === hoy ? "bg-white ring-2 ring-negro" : "bg-white/50 ring-1 ring-negro/8")}>
              <h2 className="flex items-baseline justify-between px-2 pt-2 pb-3">
                <span className="subtitular text-[18px]">{d}</span>
                {d === hoy && <span className="rounded-full bg-negro px-2 py-0.5 text-[10.5px] font-bold tracking-wider text-white uppercase">Hoy</span>}
              </h2>
              <ul className="grid gap-2">{delDia(d).length ? delDia(d).map((s, i) => <Bloque key={`${s.inicio}-${s.slug}-${i}`} s={s} compacto />) : vacio}</ul>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-[14px] leading-relaxed text-negro/60">
          Los grupos y la disponibilidad pueden variar durante el curso. Escríbenos y te decimos qué plazas hay en la actividad que te interesa.
        </p>
      </div>
    </section>
  );
}
