"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarCheck, Globe, Inbox, Target, TrendingUp, Users, Wallet } from "lucide-react";
import Contador from "@/components/ui/Contador";
import GraficoFlujo from "./GraficoFlujo";
import { Tarjeta, TituloBloque, euros, useAhora } from "./ui";
import { cuentas, movimientosVivos, ocupacionMedia, pesoFiltro, seriesFlujo, useDatosVivos, type Periodo } from "./datos";
import { usePanel } from "./almacen";
import { usePanelCtx } from "./contexto";
import { historico, porEntrenador, solicitudesSemilla, totales } from "@/data/panel-demo";
import { cn } from "@/lib/utils";
import type { Seccion } from "./Panel";

const periodos: { id: Periodo; nombre: string }[] = [
  { id: "semana", nombre: "Semana" },
  { id: "mes", nombre: "Mes" },
  { id: "año", nombre: "Año" },
];

export function Segmento<T extends string>({ opciones, valor, onCambio, etiqueta }: { opciones: { id: T; nombre: string }[]; valor: T; onCambio: (v: T) => void; etiqueta: string }) {
  return (
    <div className="flex rounded-full bg-black/[0.06] p-1" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={valor === o.id}
          onClick={() => onCambio(o.id)}
          className={cn("h-8 rounded-full px-3.5 text-[12px] font-semibold transition", valor === o.id ? "bg-white text-negro shadow-sm" : "text-negro/60 hover:text-negro")}
        >
          {o.nombre}
        </button>
      ))}
    </div>
  );
}

export const fechaCorta = (d: Date) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

export default function Resumen({ ir }: { ir: (s: Seccion) => void }) {
  const ahora = useAhora();
  const panel = usePanel();
  const { filtro } = usePanelCtx();
  const { pagos, reservas, solicitudes } = useDatosVivos();
  const [periodo, setPeriodo] = useState<Periodo>("mes");

  const peso = pesoFiltro(filtro);
  const c = cuentas(pagos);
  const ingresos = Math.round(c.ingresos * peso);
  const gastos = Math.round(c.gastos * peso);
  const anterior = historico[historico.length - 2].ingresos * peso;
  const variacion = ((ingresos - anterior) / anterior) * 100;
  const series = seriesFlujo(pagos, ahora, peso);
  const ultimos = movimientosVivos(pagos, ahora).slice(0, 6);
  const ocupacion = ocupacionMedia(reservas);
  const convertidas = solicitudesSemilla.filter((s) => s.estado === "Convertida").length;
  const conversion = Math.round((convertidas / (solicitudesSemilla.length + solicitudes.length)) * 100);
  const metas = panel.metas;
  const clientes = filtro === "Todos" ? totales.sociosActivos : porEntrenador[filtro].clientes;

  const objetivos = [
    { nombre: "Facturación del mes", actual: ingresos, meta: Math.round(panel.objetivo * peso), ver: euros, Icono: Wallet },
    { nombre: "Altas nuevas", actual: totales.altasMes + pagos.length, meta: metas.altas, ver: (n: number) => `${n}`, Icono: Users },
    { nombre: "Ocupación media de clases", actual: ocupacion, meta: metas.ocupacion, ver: (n: number) => `${n} %`, Icono: CalendarCheck },
    { nombre: "Solicitudes que acaban en alta", actual: conversion, meta: metas.conversion, ver: (n: number) => `${n} %`, Icono: Target },
  ];

  const accesos = [
    { n: "Clientes activos", v: clientes, s: "clientes" as Seccion, Icono: Users },
    { n: "Ocupación de clases", v: ocupacion, suf: " %", s: "calendario" as Seccion, Icono: CalendarCheck },
    { n: "Solicitudes por atender", v: solicitudes.length + solicitudesSemilla.filter((x) => x.estado === "Nueva").length, s: "solicitudes" as Seccion, Icono: Inbox },
    { n: "Pagos online del mes", v: pagos.length, s: "movimientos" as Seccion, Icono: Globe },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="grid grid-cols-2 gap-3 lg:col-span-12 lg:grid-cols-4">
        {accesos.map(({ n, v, suf, s, Icono }) => (
          <button key={n} type="button" onClick={() => ir(s)} className="panel-tarjeta group flex flex-col items-start gap-3 p-4 text-left">
            <span className="flex w-full items-center justify-between">
              <span className="grid size-9 place-items-center rounded-full bg-negro text-white transition group-hover:rotate-[-8deg] group-hover:scale-110">
                <Icono className="size-[18px]" aria-hidden />
              </span>
              <ArrowUpRight className="size-4 text-negro/35 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-negro" aria-hidden />
            </span>
            <span className="titular text-[34px] leading-none tabular-nums">
              <Contador hasta={v} sufijo={suf} duracion={900} />
            </span>
            <span className="text-[12px] font-semibold text-negro/60">{n}</span>
          </button>
        ))}
      </div>

      <Tarjeta oscura className="flex flex-col lg:col-span-5">
        <div className="flex items-center justify-between">
          <p className="etiqueta text-white/55">Ingresos del mes {filtro !== "Todos" && `· ${filtro}`}</p>
          <span className="grid size-9 place-items-center rounded-full bg-white/10">
            <Wallet className="size-[18px]" aria-hidden />
          </span>
        </div>
        <p className="titular mt-5 text-[54px] leading-none tabular-nums sm:text-[64px]">
          <Contador hasta={ingresos} sufijo=" €" duracion={1200} />
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-white/65">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold", variacion >= 0 ? "bg-white text-negro" : "bg-white/15 text-white")}>
            <TrendingUp className={cn("size-3.5", variacion < 0 && "rotate-180")} aria-hidden />
            {variacion > 0 ? "+" : ""}
            {variacion.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %
          </span>
          respecto al mes pasado
        </p>
        <div className="mt-auto grid grid-cols-3 gap-2 pt-7">
          {[
            { n: "Gastos", v: euros(gastos) },
            { n: "Beneficio", v: euros(ingresos - gastos) },
            { n: "Margen", v: `${Math.round(((ingresos - gastos) / ingresos) * 100)} %` },
          ].map((d) => (
            <div key={d.n} className="rounded-2xl bg-white/[0.07] px-3 py-3 ring-1 ring-white/10">
              <p className="text-[11px] text-white/55">{d.n}</p>
              <p className="mt-1 text-[14px] font-semibold tabular-nums sm:text-[16px]">{d.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => ir("movimientos")} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[13px] font-semibold text-negro transition hover:gap-3">
            Movimientos <ArrowRight className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => ir("informes")} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-[13px] font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10">
            Informes
          </button>
        </div>
      </Tarjeta>

      <Tarjeta className="lg:col-span-7">
        <TituloBloque accion={<Segmento opciones={periodos} valor={periodo} onCambio={setPeriodo} etiqueta="Periodo del flujo de caja" />}>Flujo de caja</TituloBloque>
        <GraficoFlujo key={periodo} puntos={series[periodo]} titulo={`Flujo de caja · ${periodo}`} />
      </Tarjeta>

      <Tarjeta className="lg:col-span-5">
        <TituloBloque>Objetivos del mes</TituloBloque>
        <ul className="grid gap-5">
          {objetivos.map(({ nombre, actual, meta, ver, Icono }, i) => {
            const pct = Math.min(100, Math.round((actual / Math.max(1, meta)) * 100));
            return (
              <li key={nombre}>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black/[0.06]">
                    <Icono className="size-[17px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex justify-between gap-2 text-[13px] font-semibold">
                      <span className="truncate">{nombre}</span>
                      <span className="tabular-nums">{pct} %</span>
                    </p>
                    <p className="text-[12px] text-negro/55 tabular-nums">
                      {ver(actual)} de {ver(meta)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[0.07]" role="meter" aria-valuemin={0} aria-valuemax={meta} aria-valuenow={actual} aria-label={nombre}>
                  <div className={cn("barra-crece h-full rounded-full", pct >= 100 ? "bg-negro" : "bg-gradient-to-r from-pizarra/70 to-negro")} style={{ width: `${pct}%`, animationDelay: `${0.15 + i * 0.1}s` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Tarjeta>

      <Tarjeta className="lg:col-span-7">
        <TituloBloque
          accion={
            <button type="button" onClick={() => ir("movimientos")} className="inline-flex items-center gap-1 text-[13px] font-semibold text-negro/60 hover:text-negro">
              Ver todos <ArrowRight className="size-4" aria-hidden />
            </button>
          }
        >
          Últimos movimientos
        </TituloBloque>
        <ul className="grid gap-1.5">
          {ultimos.map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-black/[0.04]">
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", m.tipo === "Ingreso" ? "bg-negro text-white" : "bg-black/[0.07] text-negro")}>
                {m.tipo === "Ingreso" ? <ArrowDownLeft className="size-4" aria-hidden /> : <ArrowUpRight className="size-4" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{m.concepto}</p>
                <p className="text-[12px] text-negro/50">
                  {m.categoria} · {fechaCorta(m.fecha)}
                  {m.web && <span className="ml-1.5 rounded-full bg-negro px-1.5 py-px text-[10px] font-semibold text-white">web</span>}
                </p>
              </div>
              <span className={cn("text-[14px] font-semibold tabular-nums", m.tipo === "Gasto" && "text-negro/55")}>
                {m.tipo === "Ingreso" ? "+" : "−"}
                {euros(m.importe)}
              </span>
            </li>
          ))}
        </ul>
      </Tarjeta>
    </div>
  );
}
