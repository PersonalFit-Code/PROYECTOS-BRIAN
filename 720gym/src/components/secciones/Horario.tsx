"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Clock, Info } from "lucide-react";
import { clasesHorario, dias, sesiones, type ClaseId, type Dia, type Sesion } from "@/data/horario";
import { capacidad, claveSesion, esReservable, ocupacionBase } from "@/data/plazas";
import { useDemo, type Reserva } from "@/lib/demo";
import { cn } from "@/lib/utils";
import ModalReserva from "./ModalReserva";

/**
 * HORARIO v3: selector de días en pastilla (con nº de clases), filtros por disciplina, tarjetas con
 * plazas libres y reserva, y la próxima clase de hoy destacada.
 * DATOS DE EJEMPLO hasta tener el real (se rotula en pantalla).
 */
const sinSuscripcion = () => () => {};
const ahoraMadrid = () => {
  const p = new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const dia = p.find((x) => x.type === "weekday")?.value ?? "";
  const hora = `${p.find((x) => x.type === "hour")?.value}:${p.find((x) => x.type === "minute")?.value}`;
  return `${dia}|${hora}`;
};
const info = (id: ClaseId) => clasesHorario.find((c) => c.id === id)!;
const vars = (id: ClaseId) => ({ ["--c-color" as string]: info(id).color, ["--c-gris" as string]: info(id).gris });
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function usePlazas() {
  const reservas = useDemo<Reserva>("reservas");
  return (s: Sesion) => {
    const total = capacidad[s.clase] ?? 0;
    const mias = reservas.filter((r) => r.clave === claveSesion(s)).length;
    return { total, libres: Math.max(0, total - ocupacionBase(s) - mias) };
  };
}

function useHoy() {
  const v = useSyncExternalStore(sinSuscripcion, ahoraMadrid, () => "");
  if (!v) return { dia: null as Dia | null, hora: "" };
  const [d, hora] = v.split("|");
  return { dia: (dias.find((x) => x.toLowerCase() === d.toLowerCase()) ?? null) as Dia | null, hora };
}

export function TarjetaClase({ s, cr = false, destacada = false, onReservar }: { s: Sesion; cr?: boolean; destacada?: boolean; onReservar: (s: Sesion) => void }) {
  const plazas = usePlazas()(s);
  const reservable = esReservable(s.clase);
  const ocupado = plazas.total ? (plazas.total - plazas.libres) / plazas.total : 0;
  return (
    <article
      className={cn(
        "marca-clase relative flex flex-col rounded-2xl p-4 ring-1 transition duration-300 sm:p-5",
        cr ? "bg-white ring-carbon/10 hover:ring-carbon/30" : "bg-white/[0.045] ring-white/10 hover:bg-white/[0.07] hover:ring-white/25",
      )}
      style={vars(s.clase)}
    >
      {destacada && <span className={cn("absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase", cr ? "bg-carbon text-crema" : "bg-white text-negro")}>Próxima</span>}
      <div className="flex items-baseline gap-2">
        <span className="titular text-[28px] leading-none">{s.hora}</span>
        <span className={cn("flex items-center gap-1 text-[12px]", cr ? "text-carbon/55" : "text-white/50")}>
          <Clock className="size-3" aria-hidden /> {s.duracion}
        </span>
      </div>
      <p className="subtitular mt-3 flex items-center gap-2 text-[16px]">
        <span className="size-2.5 rounded-full bg-[var(--clase)] ring-1 ring-black/20" aria-hidden />
        {info(s.clase).nombre}
      </p>
      {reservable ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", cr ? "bg-carbon/10" : "bg-white/10")}>
              <div className={cn("h-full rounded-full", cr ? "bg-carbon" : "bg-white")} style={{ width: `${ocupado * 100}%` }} />
            </div>
            <span className={cn("text-[12px] font-semibold", cr ? "text-carbon/70" : "text-white/70")}>
              {plazas.libres === 0 ? "Completa" : `${plazas.libres} ${plazas.libres === 1 ? "libre" : "libres"}`}
            </span>
          </div>
          <button
            type="button"
            disabled={plazas.libres === 0}
            onClick={() => onReservar(s)}
            className={cn("subtitular mt-4 h-10 rounded-full text-[14px] transition disabled:cursor-not-allowed disabled:opacity-40", cr ? "bg-carbon text-crema hover:bg-carbon/85" : "bg-white text-negro hover:bg-white/85")}
            aria-label={`Reservar ${info(s.clase).nombre}, ${s.dia} a las ${s.hora}`}
          >
            {plazas.libres === 0 ? "Clase completa" : "Reservar plaza"}
          </button>
        </>
      ) : (
        <p className={cn("mt-4 text-[13px]", cr ? "text-carbon/60" : "text-white/55")}>Clase del club · reserva con ellos</p>
      )}
    </article>
  );
}

export default function Horario({
  soloClases,
  titulo = "Horario de clases",
  id = "horario",
  tono = "oscuro",
  pagina = false,
}: {
  soloClases?: ClaseId[];
  titulo?: string;
  id?: string;
  tono?: "oscuro" | "crema";
  pagina?: boolean;
}) {
  const cr = tono === "crema";
  const disponibles = soloClases ? clasesHorario.filter((c) => soloClases.includes(c.id)) : clasesHorario;
  const [filtro, setFiltro] = useState<ClaseId | "todas">("todas");
  const hoy = useHoy();
  const [elegido, setDia] = useState<Dia | null>(null);
  const dia: Dia = elegido ?? hoy.dia ?? "Lunes";
  const [abierta, setAbierta] = useState<Sesion | null>(null);
  const plazasDe = usePlazas();

  const visibles = sesiones.filter((s) => (soloClases ? soloClases.includes(s.clase) : true) && (filtro === "todas" || s.clase === filtro));
  const delDia = visibles.filter((s) => s.dia === dia).sort((a, b) => a.hora.localeCompare(b.hora));
  const proxima = dia === hoy.dia ? delDia.find((s) => s.hora >= hoy.hora)?.hora : undefined;
  const Titulo = pagina ? "h1" : "h2";

  return (
    <section id={id} className={cn("relative py-16 sm:py-24", cr ? "bg-crema text-carbon" : "bg-negro", pagina && "pt-[calc(var(--header-h)+3rem)]")} aria-labelledby={`titulo-${id}`}>
      <div className="container-page">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p data-reveal className={cn("etiqueta", cr ? "text-carbon/55" : "text-white/50")}>
              Semana tipo · reserva en un toque
            </p>
            <Titulo id={`titulo-${id}`} data-reveal className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
              {titulo}
            </Titulo>
          </div>
          <p data-reveal className={cn("flex max-w-md items-start gap-2 text-[13px] leading-relaxed", cr ? "text-carbon/65" : "text-white/55")}>
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Horario de ejemplo, pendiente de cargar el real. La sala está abierta todos los días de 08:00 a 22:30.
          </p>
        </div>

        {/* Días */}
        <div className={cn("no-scrollbar mt-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0")}>
          <div className={cn("inline-flex min-w-full gap-1 rounded-full p-1 sm:min-w-0", cr ? "bg-white ring-1 ring-carbon/10" : "tarjeta-vidrio")} role="tablist" aria-label="Día de la semana">
            {dias.map((d) => {
              const n = visibles.filter((s) => s.dia === d).length;
              const activo = d === dia;
              return (
                <button
                  key={d}
                  role="tab"
                  aria-selected={activo}
                  onClick={() => setDia(d)}
                  className={cn(
                    "flex min-w-[4.5rem] flex-1 flex-col items-center rounded-full px-3 py-2 transition sm:min-w-[5.5rem]",
                    activo ? (cr ? "bg-carbon text-crema" : "bg-white text-negro") : cr ? "text-carbon/70 hover:bg-crema" : "text-white/70 hover:bg-white/10",
                  )}
                >
                  <span className="subtitular text-[14px]">
                    {d.slice(0, 3)}
                    {d === hoy.dia && <span className="sr-only"> (hoy)</span>}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] opacity-70">
                    {d === hoy.dia ? `Hoy · ${n}` : `${n} ${n === 1 ? "clase" : "clases"}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros */}
        {disponibles.length > 1 && (
          <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por disciplina">
            {[{ id: "todas" as const, nombre: "Todas", color: "#fff", gris: "#fff" }, ...disponibles].map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={filtro === c.id}
                onClick={() => setFiltro(c.id)}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition",
                  filtro === c.id ? (cr ? "bg-carbon text-crema" : "bg-white text-negro") : cr ? "bg-white text-carbon/75 ring-1 ring-carbon/10" : "bg-white/[0.06] text-white/75 ring-1 ring-white/10 hover:text-white",
                )}
              >
                {c.id !== "todas" && <span className="marca-clase size-2 rounded-full bg-[var(--clase)] ring-1 ring-black/20" style={{ ["--c-color" as string]: c.color, ["--c-gris" as string]: c.gris }} aria-hidden />}
                {c.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Clases del día */}
        <div className="mt-6" role="tabpanel" aria-label={`Clases del ${dia.toLowerCase()}`}>
          {delDia.length === 0 ? (
            <div className={cn("rounded-2xl p-6 text-[14px] ring-1", cr ? "bg-white ring-carbon/10" : "bg-white/[0.04] ring-white/10 text-white/70")}>
              No hay clases {filtro === "todas" ? "este día" : "de esta disciplina este día"}.{" "}
              <button type="button" onClick={() => setFiltro("todas")} className="font-semibold underline underline-offset-4">
                Ver todas
              </button>{" "}
              · La sala sigue abierta de 08:00 a 22:30.
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {delDia.map((s, i) => (
                <li key={`${s.hora}-${s.clase}-${i}`} data-reveal>
                  <TarjetaClase s={s} cr={cr} destacada={s.hora === proxima} onReservar={setAbierta} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {abierta && (
        <ModalReserva sesion={abierta} nombreClase={info(abierta.clase).nombre} libres={plazasDe(abierta).libres} total={plazasDe(abierta).total} onCerrar={() => setAbierta(null)} />
      )}
    </section>
  );
}

/** Adelanto para la portada: las próximas clases de hoy (o de mañana) y enlace al horario. */
export function ClasesHoy() {
  const hoy = useHoy();
  const [abierta, setAbierta] = useState<Sesion | null>(null);
  const plazasDe = usePlazas();
  const idx = hoy.dia ? dias.indexOf(hoy.dia) : 0;
  let lista = sesiones.filter((s) => s.dia === dias[idx] && s.hora >= hoy.hora).sort((a, b) => a.hora.localeCompare(b.hora));
  let cuando = hoy.dia ? "Hoy" : "Esta semana";
  if (lista.length === 0) {
    const sig = dias[(idx + 1) % 7];
    lista = sesiones.filter((s) => s.dia === sig).sort((a, b) => a.hora.localeCompare(b.hora));
    cuando = capital(sig.toLowerCase() === "lunes" && idx === 6 ? "el lunes" : "mañana");
  }
  lista = lista.slice(0, 4);
  return (
    <section className="bg-negro py-16 sm:py-24" aria-labelledby="titulo-hoy">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p data-reveal className="etiqueta text-white/50">{cuando} en 720</p>
            <h2 id="titulo-hoy" data-reveal className="titular mt-3 text-[clamp(1.9rem,3.2vw,2.6rem)]">
              Próximas clases
            </h2>
          </div>
          <Link href="/horario" className="group hidden items-center gap-1 text-[14px] font-semibold text-white/75 hover:text-white sm:flex">
            Horario completo <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
        <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {lista.map((s, i) => (
            <li key={`${s.dia}-${s.hora}-${i}`} data-reveal className="w-[78%] shrink-0 snap-start sm:w-auto">
              <TarjetaClase s={s} destacada={i === 0 && cuando === "Hoy"} onReservar={setAbierta} />
            </li>
          ))}
        </ul>
        <Link href="/horario" className="mt-6 flex items-center justify-center gap-1 rounded-full py-3 text-[14px] font-semibold text-white/80 ring-1 ring-white/15 sm:hidden">
          Ver el horario completo <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
      {abierta && <ModalReserva sesion={abierta} nombreClase={info(abierta.clase).nombre} libres={plazasDe(abierta).libres} total={plazasDe(abierta).total} onCerrar={() => setAbierta(null)} />}
    </section>
  );
}
