"use client";

import { useState } from "react";
import { euros } from "./ui";
import type { PuntoFlujo } from "./datos";

/** Flujo de caja: área de ingresos (negro) y línea de gastos (gris, discontinua). Se dibuja al entrar. */
export default function GraficoFlujo({ puntos, titulo }: { puntos: PuntoFlujo[]; titulo: string }) {
  const [foco, setFoco] = useState<number | null>(null);
  const ancho = 600;
  const alto = 190;
  const max = Math.max(1, ...puntos.flatMap((p) => [p.ingresos, p.gastos])) * 1.1;
  const x = (i: number) => (puntos.length === 1 ? ancho / 2 : (i * ancho) / (puntos.length - 1));
  const y = (v: number) => alto - (Math.max(0, v) / max) * (alto - 10);
  const linea = (k: "ingresos" | "gastos") => puntos.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
  const area = `${linea("ingresos")} L${ancho},${alto} L0,${alto} Z`;
  const etiquetas = new Set(Array.from({ length: Math.min(puntos.length, 7) }, (_, i) => (puntos.length <= 7 ? i : Math.round((i * (puntos.length - 1)) / 6))));
  const ingresos = puntos.reduce((a, p) => a + p.ingresos, 0);
  const gastos = puntos.reduce((a, p) => a + p.gastos, 0);
  const p = foco !== null ? puntos[foco] : null;

  return (
    <figure className="relative">
      <div className="flex gap-3">
        <div className="hidden w-14 shrink-0 flex-col justify-between pb-7 text-right text-[11px] text-negro/45 tabular-nums sm:flex" aria-hidden>
          <span>{euros(Math.round(max))}</span>
          <span>{euros(Math.round(max / 2))}</span>
          <span>0 €</span>
        </div>
        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${ancho} ${alto}`}
            preserveAspectRatio="none"
            className="h-[190px] w-full overflow-visible"
            role="img"
            aria-label={`${titulo}: ingresos ${euros(ingresos)}, gastos ${euros(gastos)}.`}
            onMouseLeave={() => setFoco(null)}
          >
            <defs>
              <linearGradient id="flujo-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#0e0e0f" stopOpacity="0.22" />
                <stop offset="1" stopColor="#0e0e0f" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={0} x2={ancho} y1={alto * f} y2={alto * f} stroke="#0e0e0f" strokeOpacity={0.07} vectorEffect="non-scaling-stroke" />
            ))}
            <path d={area} fill="url(#flujo-area)" className="animate-[aparece_0.8s_ease_both]" />
            <path d={linea("gastos")} fill="none" stroke="#8a8a90" strokeWidth={1.6} strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
            <path d={linea("ingresos")} fill="none" stroke="#0e0e0f" strokeWidth={2.2} vectorEffect="non-scaling-stroke" className="traza-linea" pathLength={2000} />
            {foco !== null && <line x1={x(foco)} x2={x(foco)} y1={0} y2={alto} stroke="#0e0e0f" strokeOpacity={0.25} vectorEffect="non-scaling-stroke" />}
            {puntos.map((pt, i) => (
              <rect key={i} x={x(i) - ancho / puntos.length / 2} y={0} width={ancho / puntos.length} height={alto} fill="transparent" onMouseEnter={() => setFoco(i)} onClick={() => setFoco(i)}>
                <title>{`${pt.etiqueta}: ingresos ${euros(pt.ingresos)} · gastos ${euros(pt.gastos)}`}</title>
              </rect>
            ))}
          </svg>
          {p && foco !== null && (
            <div
              className="pop-entra pointer-events-none absolute top-0 z-10 rounded-xl bg-negro px-3 py-2 text-[12px] whitespace-nowrap text-white shadow-lg"
              style={{ left: `${(x(foco) / ancho) * 100}%`, transform: `translateX(${foco > puntos.length / 2 ? "-105%" : "5%"})` }}
            >
              <p className="font-semibold">{p.etiqueta}</p>
              <p className="text-white/75">Entra {euros(p.ingresos)}</p>
              <p className="text-white/75">Sale {euros(p.gastos)}</p>
            </div>
          )}
          <div className="mt-2 flex justify-between text-[11px] text-negro/50">
            {puntos.map((pt, i) => (etiquetas.has(i) ? <span key={i}>{pt.etiqueta}</span> : null))}
          </div>
        </div>
      </div>
      <figcaption className="mt-5 grid grid-cols-3 gap-2">
        {[
          { n: "Entra", v: ingresos, c: "bg-negro" },
          { n: "Sale", v: gastos, c: "bg-[#8a8a90]" },
          { n: "Neto", v: ingresos - gastos, c: "bg-white ring-1 ring-negro" },
        ].map((d) => (
          <div key={d.n} className="rounded-2xl bg-black/[0.04] px-3 py-3">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-negro/55">
              <span className={`size-2 rounded-full ${d.c}`} aria-hidden /> {d.n}
            </p>
            <p className="mt-1 text-[15px] font-semibold tabular-nums sm:text-[17px]">{euros(d.v)}</p>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
