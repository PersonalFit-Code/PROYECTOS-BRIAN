"use client";

import { useState, useSyncExternalStore } from "react";
import { Info } from "lucide-react";
import { clasesHorario, dias, sesiones, type ClaseId, type Dia } from "@/data/horario";
import { cn } from "@/lib/utils";

/**
 * Horario semanal en cuadrícula (escritorio) o por días (móvil), filtrable por disciplina.
 * DATOS DE EJEMPLO hasta tener el real: se rotula en pantalla.
 */
const sinSuscripcion = () => () => {};

export default function Horario({
  soloClases,
  titulo = "Horario de clases",
  id = "horario",
  tono = "oscuro",
}: {
  soloClases?: ClaseId[];
  titulo?: string;
  id?: string;
  tono?: "oscuro" | "crema";
}) {
  const cr = tono === "crema";
  const disponibles = soloClases ? clasesHorario.filter((c) => soloClases.includes(c.id)) : clasesHorario;
  const [filtro, setFiltro] = useState<ClaseId | "todas">("todas");
  /* «Hoy» solo en el navegador: la página se genera en estático y la fecha del servidor no vale. */
  const hoy = useSyncExternalStore<Dia | null>(
    sinSuscripcion,
    () => dias[(new Date().getDay() + 6) % 7],
    () => null,
  );
  const [elegido, setDia] = useState<Dia | null>(null);
  const dia: Dia = elegido ?? hoy ?? "Lunes";

  const visibles = sesiones.filter((s) => (soloClases ? soloClases.includes(s.clase) : true) && (filtro === "todas" || s.clase === filtro));
  const horas = [...new Set(visibles.map((s) => s.hora))].sort();
  const info = (id: ClaseId) => clasesHorario.find((c) => c.id === id)!;
  const vars = (id: ClaseId) => ({ ["--c-color" as string]: info(id).color, ["--c-gris" as string]: info(id).gris });

  return (
    <section id={id} className={cn("py-24 sm:py-32", cr ? "bg-crema text-carbon" : "bg-negro")} aria-labelledby={`titulo-${id}`}>
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p data-reveal className={cn("etiqueta", cr ? "text-carbon/55" : "text-white/55")}>
              <span className={cr ? "text-pil-menta-osc" : "text-acento"}>04</span> · Semana tipo
            </p>
            <h2 id={`titulo-${id}`} data-reveal className="titular mt-5 text-[clamp(3rem,9vw,7rem)]">
              {titulo}
            </h2>
          </div>
          <p data-reveal className={cn("flex max-w-md items-start gap-2 border border-acento/40 bg-acento/8 px-4 py-3 text-[13px] leading-relaxed", cr ? "text-carbon/80" : "text-white/80")}>
            <Info className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden />
            Horario de ejemplo: pendiente de cargar el real. {cr ? "Grupos reducidos por niveles: reserva tu plaza." : "La sala de musculación está abierta todos los días de 08:00 a 22:30."}
          </p>
        </div>

        {disponibles.length > 1 && (
          <div className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por disciplina">
            {[{ id: "todas" as const, nombre: "Todas", color: "#fff", gris: "#fff" }, ...disponibles].map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={filtro === c.id}
                onClick={() => setFiltro(c.id)}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 px-4 text-[13px] font-semibold transition",
                  filtro === c.id ? (cr ? "bg-carbon text-crema" : "bg-white text-negro") : cr ? "bg-white text-carbon/75" : "bg-suelo text-white/75 hover:bg-suelo-2 hover:text-white",
                )}
              >
                {c.id !== "todas" && <span className="marca-clase size-2 rounded-full bg-[var(--clase)] ring-1 ring-black/20" style={{ ["--c-color" as string]: c.color, ["--c-gris" as string]: c.gris }} aria-hidden />}
                {c.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Móvil: un día cada vez */}
        <div className="mt-8 lg:hidden">
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4" role="tablist" aria-label="Día">
            {dias.map((d) => (
              <button
                key={d}
                role="tab"
                aria-selected={dia === d}
                onClick={() => setDia(d)}
                className={cn("subtitular h-11 shrink-0 px-4 text-[17px]", dia === d ? "bg-acento text-acento-tinta" : cr ? "text-carbon/60" : "text-white/60")}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
          <ul className={cn("mt-4 divide-y border-y", cr ? "divide-carbon/10 border-carbon/10" : "divide-white/8 border-white/8")}>
            {visibles.filter((s) => s.dia === dia).length === 0 && <li className="py-6 text-[14px] opacity-60">Sin clases este día con este filtro. La sala sigue abierta.</li>}
            {visibles
              .filter((s) => s.dia === dia)
              .sort((a, b) => a.hora.localeCompare(b.hora))
              .map((s, i) => (
                <li key={i} className="flex items-center gap-4 py-4">
                  <span className="subtitular w-16 text-[22px]">{s.hora}</span>
                  <span className="marca-clase h-8 w-1 bg-[var(--clase)] ring-1 ring-black/15" style={vars(s.clase)} aria-hidden />
                  <span>
                    <span className="block font-semibold">{info(s.clase).nombre}</span>
                    <span className="text-[13px] opacity-55">{s.duracion}</span>
                  </span>
                </li>
              ))}
          </ul>
        </div>

        {/* Escritorio: cuadrícula semanal */}
        <div className="mt-10 hidden lg:block">
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">Horario semanal de clases (ejemplo)</caption>
            <thead>
              <tr>
                <th scope="col" className="w-20 pb-4 etiqueta opacity-45">Hora</th>
                {dias.map((d) => (
                  <th key={d} scope="col" className={cn("pb-4 subtitular text-[18px]", d === hoy ? (cr ? "text-pil-menta-osc" : "text-acento") : "opacity-80")}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horas.map((h) => (
                <tr key={h} className={cn("border-t", cr ? "border-carbon/10" : "border-white/8")}>
                  <th scope="row" className="py-2 align-top subtitular text-[18px] opacity-55">
                    {h}
                  </th>
                  {dias.map((d) => {
                    const s = visibles.find((x) => x.dia === d && x.hora === h);
                    return (
                      <td key={d} className="p-1 align-top">
                        {s && (
                          <div className={cn("marca-clase h-full px-3 py-2.5 shadow-[inset_3px_0_0_var(--clase)]", cr ? "bg-white" : "bg-suelo")} style={vars(s.clase)}>
                            <p className="text-[13px] font-semibold leading-tight">{info(s.clase).nombre}</p>
                            <p className="mt-0.5 text-[11px] opacity-50">{s.duracion}</p>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
