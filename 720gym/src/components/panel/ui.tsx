"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* `useGrouping: "always"`: en español los miles de 4 cifras no se separan por defecto (1199 €). */
const formatoEuros = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2, useGrouping: "always" } as Intl.NumberFormatOptions);
export const euros = (n: number) => `${formatoEuros.format(n)} €`;

/** Minuto actual, solo en el navegador (el panel no se pinta en el servidor tras el PIN). */
function suscribirMinuto(aviso: () => void) {
  const t = window.setInterval(aviso, 30_000);
  return () => window.clearInterval(t);
}
export function useAhora(): Date {
  const minuto = useSyncExternalStore(
    suscribirMinuto,
    () => Math.floor(Date.now() / 60_000),
    () => 0,
  );
  return new Date(minuto * 60_000);
}

export const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;
export const diaDe = (d: Date) => diasSemana[(d.getDay() + 6) % 7];

export function hace(iso: string, ahora: Date) {
  const min = Math.max(0, Math.round((ahora.getTime() - new Date(iso).getTime()) / 60_000));
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} días`;
}

export function Tarjeta({ children, className, oscura = false }: { children: ReactNode; className?: string; oscura?: boolean }) {
  return <div className={cn("min-w-0 p-5 sm:p-6", oscura ? "bg-negro text-white" : "bg-white text-negro ring-1 ring-black/[0.06]", className)}>{children}</div>;
}

export function TituloBloque({ children, accion }: { children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h3 className="subtitular text-[20px]">{children}</h3>
      {accion}
    </div>
  );
}

export function Kpi({ etiqueta, valor, nota, oscura = false, tendencia }: { etiqueta: string; valor: ReactNode; nota?: ReactNode; oscura?: boolean; tendencia?: number }) {
  return (
    <Tarjeta oscura={oscura}>
      <p className={cn("etiqueta", oscura ? "text-white/55" : "text-negro/50")}>{etiqueta}</p>
      <p className="titular mt-3 text-[40px] leading-none sm:text-[46px]">{valor}</p>
      <p className={cn("mt-2 flex items-center gap-2 text-[12px]", oscura ? "text-white/60" : "text-negro/55")}>
        {tendencia !== undefined && (
          <span className={cn("font-semibold", tendencia >= 0 ? (oscura ? "text-white" : "text-negro") : "text-negro/60 line-through decoration-transparent")}>
            {tendencia >= 0 ? "▲" : "▼"} {Math.abs(tendencia).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %
          </span>
        )}
        {nota}
      </p>
    </Tarjeta>
  );
}

export function Estado({ estado }: { estado: string }) {
  const estilos: Record<string, string> = {
    "Al día": "bg-negro text-white",
    Cobrado: "bg-negro text-white",
    Convertida: "bg-negro text-white",
    Pendiente: "bg-[#dfe0e3] text-negro",
    Contactada: "bg-[#dfe0e3] text-negro",
    Nueva: "bg-white text-negro ring-1 ring-negro",
    Impagado: "bg-white text-negro ring-1 ring-negro/40 line-through decoration-negro/40",
  };
  return <span className={cn("inline-flex h-6 items-center px-2 text-[11px] font-semibold whitespace-nowrap", estilos[estado] ?? "bg-niebla text-negro")}>{estado}</span>;
}

export function NuevoWeb() {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 bg-negro px-2 text-[11px] font-semibold whitespace-nowrap text-white">
      <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
      Nuevo · desde la web
    </span>
  );
}

export function BarraOcupacion({ ocupadas, total, fina = false }: { ocupadas: number; total: number; fina?: boolean }) {
  const pct = total ? Math.min(100, (ocupadas / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex-1 bg-niebla", fina ? "h-1.5" : "h-2")} role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={ocupadas} aria-label="Ocupación">
        <div className={cn("h-full", pct >= 100 ? "bg-negro" : pct >= 75 ? "bg-pizarra" : "bg-acero-osc")} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right text-[12px] font-semibold tabular-nums">
        {ocupadas}/{total}
      </span>
    </div>
  );
}

/** Barras de 12 meses: ingresos (negro el mes en curso) y gastos (línea). SVG accesible. */
export function BarrasMensuales({ datos }: { datos: { mes: string; ingresos: number; gastos: number }[] }) {
  const max = Math.max(...datos.map((d) => Math.max(d.ingresos, d.gastos))) * 1.1;
  const alto = 220;
  const ancho = 640;
  const paso = ancho / datos.length;
  const barra = paso * 0.56;
  const y = (v: number) => alto - (v / max) * alto;
  const linea = datos.map((d, i) => `${i ? "L" : "M"} ${(i * paso + paso / 2).toFixed(1)} ${y(d.gastos).toFixed(1)}`).join(" ");
  const resumen = `Ingresos de los últimos 12 meses, de ${euros(datos[0].ingresos)} en ${datos[0].mes} a ${euros(datos[datos.length - 1].ingresos)} en ${datos[datos.length - 1].mes}.`;
  return (
    <figure>
      <svg viewBox={`0 0 ${ancho} ${alto + 28}`} className="h-auto w-full" role="img" aria-label={resumen}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} x2={ancho} y1={alto - f * alto} y2={alto - f * alto} stroke="#0e0e0f" strokeOpacity={0.07} />
        ))}
        {datos.map((d, i) => {
          const ultimo = i === datos.length - 1;
          return (
            <g key={d.mes}>
              <rect x={i * paso + (paso - barra) / 2} y={y(d.ingresos)} width={barra} height={alto - y(d.ingresos)} fill={ultimo ? "#0e0e0f" : "#b9b9bd"}>
                <title>{`${d.mes}: ingresos ${euros(d.ingresos)} · gastos ${euros(d.gastos)}`}</title>
              </rect>
              <text x={i * paso + paso / 2} y={alto + 18} textAnchor="middle" fontSize="12" fill="#0e0e0f" fillOpacity={ultimo ? 1 : 0.55} fontWeight={ultimo ? 700 : 400}>
                {d.mes}
              </text>
            </g>
          );
        })}
        <path d={linea} fill="none" stroke="#0e0e0f" strokeWidth={1.5} strokeDasharray="4 4" />
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-negro/60">
        <span className="flex items-center gap-2">
          <span className="size-2.5 bg-[#b9b9bd]" aria-hidden /> Ingresos
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 bg-negro" aria-hidden /> Mes en curso
        </span>
        <span className="flex items-center gap-2">
          <span className="h-px w-4 border-t border-dashed border-negro" aria-hidden /> Gastos
        </span>
      </figcaption>
      <table className="sr-only">
        <caption>Ingresos y gastos por mes</caption>
        <tbody>
          {datos.map((d) => (
            <tr key={d.mes}>
              <th>{d.mes}</th>
              <td>{euros(d.ingresos)}</td>
              <td>{euros(d.gastos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function descargarCSV(nombre: string, filas: (string | number)[][]) {
  const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const botonPanel = "inline-flex h-10 items-center justify-center gap-2 px-4 text-[13px] font-semibold transition active:scale-[0.98]";
export const botonNegro = cn(botonPanel, "bg-negro text-white hover:bg-pizarra");
export const botonClaro = cn(botonPanel, "bg-white text-negro ring-1 ring-black/10 hover:ring-black/30");
