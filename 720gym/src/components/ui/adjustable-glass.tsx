"use client";

/**
 * Material de vidrio ajustable (adaptado de «adjustable-glass-dashboard»).
 * Da las variables CSS del vidrio (--v-blur, --v-opacidad, --v-saturacion, --v-borde, --v-tinte)
 * y el control con preajustes y deslizadores. Las clases que las usan están en globals.css:
 * .panel-vidrio (topbar, carril, dock, ventanas) y .panel-tarjeta (paneles de dentro).
 */
import type { CSSProperties } from "react";
import { Layers, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Vidrio {
  blur: number;
  opacidad: number;
  saturacion: number;
  borde: number;
  tinte: string;
}

export const vidrioInicial: Vidrio = { blur: 18, opacidad: 0.5, saturacion: 1.3, borde: 0.7, tinte: "#ffffff" };

export const presetsVidrio: { nombre: string; valor: Partial<Vidrio> }[] = [
  { nombre: "Claro", valor: { blur: 8, opacidad: 0.18, saturacion: 1.1, borde: 0.85 } },
  { nombre: "Esmerilado", valor: { blur: 18, opacidad: 0.5, saturacion: 1.3, borde: 0.7 } },
  { nombre: "Sólido", valor: { blur: 32, opacidad: 0.88, saturacion: 1, borde: 0.35 } },
];

/** Solo tonos claros: el texto del panel es negro y tiene que leerse siempre. */
export const tintesVidrio = [
  { nombre: "Blanco", color: "#ffffff" },
  { nombre: "Hueso", color: "#f3f1ec" },
  { nombre: "Niebla", color: "#e4e6ea" },
  { nombre: "Acero", color: "#cdd2d8" },
];

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

export function normalizarVidrio(v: Partial<Vidrio>): Vidrio {
  const x = { ...vidrioInicial, ...v };
  return {
    blur: limitar(x.blur, 0, 40),
    opacidad: limitar(x.opacidad, 0.08, 0.92),
    saturacion: limitar(x.saturacion, 0.5, 2),
    borde: limitar(x.borde, 0, 1),
    tinte: /^#[0-9a-f]{6}$/i.test(x.tinte) ? x.tinte : vidrioInicial.tinte,
  };
}

export function estiloVidrio(v: Vidrio): CSSProperties {
  return {
    "--v-blur": `${v.blur}px`,
    "--v-opacidad": v.opacidad,
    "--v-saturacion": v.saturacion,
    "--v-borde": v.borde,
    "--v-tinte": v.tinte,
  } as CSSProperties;
}

const controles = [
  { clave: "blur", nombre: "Desenfoque", min: 0, max: 40, paso: 1, ver: (v: number) => `${Math.round(v)} px` },
  { clave: "opacidad", nombre: "Opacidad", min: 0.08, max: 0.92, paso: 0.01, ver: (v: number) => `${Math.round(v * 100)} %` },
  { clave: "saturacion", nombre: "Saturación", min: 0.5, max: 2, paso: 0.05, ver: (v: number) => `${Math.round(v * 100)} %` },
  { clave: "borde", nombre: "Luz del borde", min: 0, max: 1, paso: 0.05, ver: (v: number) => `${Math.round(v * 100)} %` },
] as const;

export function ControlVidrio({ valor, onCambio, className }: { valor: Vidrio; onCambio: (v: Vidrio) => void; className?: string }) {
  const cambiar = (p: Partial<Vidrio>) => onCambio(normalizarVidrio({ ...valor, ...p }));
  const activo = presetsVidrio.find((p) => Object.entries(p.valor).every(([k, x]) => Math.abs((valor[k as keyof Vidrio] as number) - (x as number)) < 0.001))?.nombre;
  return (
    <div className={cn("grid gap-5", className)}>
      <div className="panel-tarjeta relative grid h-24 place-items-center overflow-hidden" aria-hidden>
        <div className="absolute -top-6 -left-4 size-20 rounded-full bg-negro/80 blur-[2px]" />
        <div className="absolute -right-3 -bottom-8 size-24 rounded-full bg-pizarra/40" />
        <div className="panel-vidrio relative flex items-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-semibold">
          <Layers className="size-5" strokeWidth={1.4} /> Vista previa del material
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-full bg-black/[0.06] p-1" role="group" aria-label="Preajustes del vidrio">
        {presetsVidrio.map((p) => (
          <button
            key={p.nombre}
            type="button"
            aria-pressed={activo === p.nombre}
            onClick={() => cambiar(p.valor)}
            className={cn("h-9 rounded-full text-[13px] font-semibold transition", activo === p.nombre ? "bg-negro text-white shadow" : "text-negro/65 hover:text-negro")}
          >
            {p.nombre}
          </button>
        ))}
      </div>
      {controles.map((c) => (
        <label key={c.clave} className="grid gap-2 text-[13px] font-semibold">
          <span className="flex justify-between">
            {c.nombre}
            <output className="font-normal text-negro/60 tabular-nums">{c.ver(valor[c.clave])}</output>
          </span>
          <input type="range" min={c.min} max={c.max} step={c.paso} value={valor[c.clave]} onChange={(e) => cambiar({ [c.clave]: Number(e.target.value) })} className="rango-vidrio" />
        </label>
      ))}
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-[13px] font-semibold">Tinte</legend>
        <div className="flex gap-2">
          {tintesVidrio.map((t) => (
            <button
              key={t.color}
              type="button"
              onClick={() => cambiar({ tinte: t.color })}
              aria-pressed={valor.tinte === t.color}
              title={t.nombre}
              className={cn("grid size-10 place-items-center rounded-full ring-1 ring-black/15 transition hover:scale-110", valor.tinte === t.color && "ring-2 ring-negro ring-offset-2")}
              style={{ background: t.color }}
            >
              <span className="sr-only">{t.nombre}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <button type="button" onClick={() => onCambio(vidrioInicial)} className="inline-flex items-center gap-2 justify-self-start text-[13px] font-semibold text-negro/60 hover:text-negro">
        <RotateCcw className="size-4" aria-hidden /> Restablecer apariencia
      </button>
    </div>
  );
}
