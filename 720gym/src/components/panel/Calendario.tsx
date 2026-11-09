"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { BarraOcupacion, Kpi, NuevoWeb, Tarjeta, diaDe, diasSemana, hace, useAhora } from "./ui";
import { nombreClase, ocupacion, ocupacionMedia, sesionesReservables, useDatosVivos } from "./datos";
import { reservasSemilla } from "@/data/panel-demo";
import { anularReserva } from "@/lib/demo";
import { cn } from "@/lib/utils";

type Vista = "Día" | "Semana" | "Lista";

interface Fila {
  id: string;
  nombre: string;
  clase: string;
  dia: string;
  hora: string;
  web: boolean;
  creada?: string;
}

export default function Calendario() {
  const ahora = useAhora();
  const { reservas } = useDatosVivos();
  const hoy = diaDe(ahora);
  const [vista, setVista] = useState<Vista>("Semana");
  const [dia, setDia] = useState<string | null>(null);
  const elegido = dia ?? hoy;

  const filas: Fila[] = [
    ...[...reservas].reverse().map((r) => ({ id: r.id, nombre: r.nombre, clase: r.clase, dia: r.dia, hora: r.hora, web: true, creada: r.creada })),
    ...reservasSemilla.map((r) => ({ ...r, web: false })),
  ];
  const deSesion = (d: string, h: string, clase: string) => filas.filter((f) => f.dia === d && f.hora === h && f.clase === nombreClase(clase));
  const horas = [...new Set(sesionesReservables.map((s) => s.hora))].sort();
  const llenas = sesionesReservables.filter((s) => {
    const o = ocupacion(s, reservas);
    return o.ocupadas >= o.total;
  }).length;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi oscura etiqueta="Ocupación media" valor={`${ocupacionMedia(reservas)} %`} nota="clases con plazas" />
        <Kpi etiqueta="Clases a la semana" valor={sesionesReservables.length} nota="+ las de los clubes" />
        <Kpi etiqueta="Completas" valor={llenas} nota="con lista de espera" />
        <Kpi etiqueta="Reservas web" valor={reservas.length} nota="en esta demo" />
      </div>

      <Tarjeta>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="subtitular text-[20px]">Calendario de reservas</h3>
          <div className="flex" role="tablist" aria-label="Vista">
            {(["Día", "Semana", "Lista"] as Vista[]).map((v) => (
              <button key={v} role="tab" aria-selected={vista === v} onClick={() => setVista(v)} className={cn("h-9 px-4 text-[13px] font-semibold", vista === v ? "bg-negro text-white" : "bg-pared text-negro/65")}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {vista === "Día" && (
          <>
            <div className="no-scrollbar -mx-1 mb-4 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Día">
              {diasSemana.map((d) => (
                <button key={d} role="tab" aria-selected={elegido === d} onClick={() => setDia(d)} className={cn("h-9 shrink-0 px-3 text-[13px] font-semibold", elegido === d ? "bg-negro text-white" : "bg-pared text-negro/65")}>
                  {d.slice(0, 3)}
                  {d === hoy && <span className="ml-1 opacity-60">· hoy</span>}
                </button>
              ))}
            </div>
            <ul className="divide-y divide-black/[0.06]">
              {sesionesReservables
                .filter((s) => s.dia === elegido)
                .sort((a, b) => a.hora.localeCompare(b.hora))
                .map((s) => {
                  const o = ocupacion(s, reservas);
                  const nombres = deSesion(s.dia, s.hora, s.clase);
                  return (
                    <li key={`${s.hora}-${s.clase}`} className="grid gap-2 py-4 lg:grid-cols-[1fr_16rem] lg:items-start">
                      <div className="flex gap-3">
                        <span className="subtitular w-12 shrink-0 text-[20px] tabular-nums">{s.hora}</span>
                        <div>
                          <p className="text-[15px] font-semibold">{nombreClase(s.clase)}</p>
                          <p className="text-[12px] text-negro/50">
                            {s.duracion} {o.ocupadas >= o.total && "· completa"}
                          </p>
                          {nombres.length > 0 && (
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {nombres.map((n) => (
                                <li key={n.id} className={cn("px-2 py-1 text-[12px]", n.web ? "bg-negro text-white" : "bg-pared")}>
                                  {n.nombre}
                                  {n.web && " · web"}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <BarraOcupacion ocupadas={o.ocupadas} total={o.total} />
                    </li>
                  );
                })}
              {sesionesReservables.filter((s) => s.dia === elegido).length === 0 && <li className="py-6 text-[14px] text-negro/55">Sin clases reservables este día.</li>}
            </ul>
          </>
        )}

        {vista === "Semana" && (
          <div className="-mx-5 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-[860px] table-fixed border-collapse text-left">
              <caption className="sr-only">Semana de clases con ocupación</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-16 pb-2 pl-5 text-[11px] font-semibold text-negro/45 sm:pl-6">Hora</th>
                  {diasSemana.map((d) => (
                    <th key={d} scope="col" className={cn("pb-2 text-[13px] font-semibold", d === hoy ? "text-negro" : "text-negro/55")}>
                      {d}
                      {d === hoy && <span className="ml-1 inline-block size-1.5 rounded-full bg-negro align-middle" aria-label="hoy" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horas.map((h) => (
                  <tr key={h} className="border-t border-black/[0.06]">
                    <th scope="row" className="py-1.5 pl-5 align-top text-[13px] font-semibold tabular-nums text-negro/55 sm:pl-6">
                      {h}
                    </th>
                    {diasSemana.map((d) => {
                      const s = sesionesReservables.find((x) => x.dia === d && x.hora === h);
                      if (!s) return <td key={d} className="p-0.5" />;
                      const o = ocupacion(s, reservas);
                      const lleno = o.ocupadas >= o.total;
                      return (
                        <td key={d} className="p-0.5 align-top">
                          <div className={cn("px-2 py-2", lleno ? "bg-negro text-white" : "bg-pared")}>
                            <p className="truncate text-[12px] font-semibold">{nombreClase(s.clase)}</p>
                            <p className="text-[11px] tabular-nums opacity-70">
                              {o.ocupadas}/{o.total}
                              {o.web > 0 && <span className="ml-1 font-semibold opacity-100">· +{o.web} web</span>}
                            </p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {vista === "Lista" && (
          <ul className="divide-y divide-black/[0.06]">
            {filas
              .slice()
              .sort((a, b) => diasSemana.indexOf(a.dia as (typeof diasSemana)[number]) - diasSemana.indexOf(b.dia as (typeof diasSemana)[number]) || a.hora.localeCompare(b.hora))
              .map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <span>
                    <span className="block text-[14px] font-semibold">{r.nombre}</span>
                    <span className="text-[12px] text-negro/55">
                      {r.clase} · {r.dia} {r.hora}
                      {r.creada && ` · reservó ${hace(r.creada, ahora)}`}
                    </span>
                    {r.web && (
                      <span className="mt-1 block">
                        <NuevoWeb />
                      </span>
                    )}
                  </span>
                  {r.web ? (
                    <button type="button" onClick={() => anularReserva(r.id)} className="grid size-9 shrink-0 place-items-center text-negro/50 ring-1 ring-black/10 hover:text-negro hover:ring-negro" aria-label={`Anular reserva de ${r.nombre}`}>
                      <X className="size-4" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-negro/45">Confirmada</span>
                  )}
                </li>
              ))}
          </ul>
        )}
        <p className="mt-5 text-[12px] leading-relaxed text-negro/50">
          Recordatorio automático por WhatsApp el día antes. Si alguien anula, la plaza se libera y se avisa a la lista de espera.
        </p>
      </Tarjeta>
    </div>
  );
}
