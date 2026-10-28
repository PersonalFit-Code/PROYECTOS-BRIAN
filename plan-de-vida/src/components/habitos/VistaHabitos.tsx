"use client";

import { Check } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { registrarHabito } from "@/app/(app)/habitos/acciones";
import { Icono } from "@/components/ui/iconos";
import { diaSemana, INICIALES_DIA } from "@/lib/fechas";
import { cx } from "@/lib/formato";

export interface FilaHabito {
  id: string;
  name: string;
  emoji: string;
  kind: "check" | "cantidad" | "dejar";
  /** días en que toca (los "N por semana" tocan todos) */
  tocaDias: string[];
  hechos: string[];
  pct: number;
}

type Cambio = { id: string; dia: string; done: boolean };

/**
 * La semana sin scroll horizontal: una tarjeta por hábito con sus 7 casillas debajo del nombre
 * (el mes entero va en la Libreta). Se pueden marcar días pasados que se olvidaron; los futuros no.
 */
export function VistaHabitos({ filas, dias, hoy }: { filas: FilaHabito[]; dias: string[]; hoy: string }) {
  const [, start] = useTransition();
  const [estado, aplicar] = useOptimistic(filas, (actual, c: Cambio) =>
    actual.map((f) => (f.id !== c.id ? f : { ...f, hechos: c.done ? [...f.hechos, c.dia] : f.hechos.filter((d) => d !== c.dia) })),
  );
  const cambiar = (c: Cambio) =>
    start(async () => {
      aplicar(c);
      await registrarHabito(c.id, c.dia, { done: c.done });
    });

  return (
    <div className="space-y-3">
      {estado.map((f, i) => (
        <div key={f.id} className="glass entrar rounded-2xl p-3" style={{ ["--i" as string]: i }}>
          <Cabecera fila={f} />
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {dias.map((d) => (
              <Celda key={d} fila={f} dia={d} hoy={hoy} cambiar={cambiar} etiqueta={INICIALES_DIA[diaSemana(d)]} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Cabecera({ fila }: { fila: FilaHabito }) {
  const color = fila.pct >= 80 ? "var(--ok)" : fila.pct >= 50 ? "var(--warn)" : "var(--bad)";
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
        <Icono nombre={fila.emoji} porDefecto="check" />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{fila.kind === "dejar" ? `Sin ${fila.name.toLowerCase()}` : fila.name}</span>
      <span className="text-sm font-semibold tabular-nums" style={{ color }}>
        {Math.round(fila.pct)}%
      </span>
    </div>
  );
}

function Celda({ fila, dia, hoy, cambiar, etiqueta }: { fila: FilaHabito; dia: string; hoy: string; cambiar: (c: Cambio) => void; etiqueta: string }) {
  const toca = fila.tocaDias.includes(dia);
  const hecho = fila.hechos.includes(dia);
  const futuro = dia > hoy;
  const color = fila.kind === "dejar" ? "var(--warn)" : "var(--ok)";
  if (!toca && !hecho) {
    return (
      <div className="flex flex-col items-center gap-1 text-[11px] text-faint">
        <span>{etiqueta}</span>
        <span className="grid size-9 place-items-center rounded-xl text-xs">·</span>
      </div>
    );
  }
  return (
    <div className={cx("flex flex-col items-center gap-1 text-[11px]", dia === hoy ? "font-semibold text-accent" : "text-muted")}>
      <span>{etiqueta}</span>
      <button
        type="button"
        role="checkbox"
        aria-checked={hecho}
        aria-label={`${fila.name} · ${dia}`}
        disabled={futuro}
        onClick={() => cambiar({ id: fila.id, dia, done: !hecho })}
        className={cx(
          "grid size-9 place-items-center rounded-xl border transition duration-200 active:scale-90 disabled:opacity-35",
          hecho ? "border-transparent text-white shadow-sm" : "border-faint/50 hover:bg-hover",
          dia === hoy && !hecho && "border-accent",
        )}
        style={hecho ? { background: color } : undefined}
      >
        {hecho && <Check className="marcar size-4" strokeWidth={3} />}
      </button>
    </div>
  );
}
