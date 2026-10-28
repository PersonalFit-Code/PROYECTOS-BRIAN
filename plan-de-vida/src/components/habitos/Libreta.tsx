"use client";

import { Check, Smile } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { registrarHabito } from "@/app/(app)/habitos/acciones";
import { Icono } from "@/components/ui/iconos";
import { diaSemana, INICIALES_DIA } from "@/lib/fechas";
import { cx } from "@/lib/formato";
import type { FilaHabito } from "./VistaHabitos";

type Cambio = { id: string; dia: string; done: boolean };

const COLOR_ANIMO = ["", "var(--bad)", "var(--warn)", "var(--faint)", "var(--accent)", "var(--ok)"];

/**
 * El mes como en la libreta de papel: un día por fila y un hábito por columna, con el ánimo al final.
 * Las columnas se reparten el ancho (nada de scroll horizontal); el nombre de cada icono va en la leyenda.
 */
export function Libreta({ filas, dias, hoy, animo }: { filas: FilaHabito[]; dias: string[]; hoy: string; animo: Record<string, number> }) {
  const [, start] = useTransition();
  const [estado, aplicar] = useOptimistic(filas, (actual, c: Cambio) =>
    actual.map((f) => (f.id !== c.id ? f : { ...f, hechos: c.done ? [...f.hechos, c.dia] : f.hechos.filter((d) => d !== c.dia) })),
  );
  const cambiar = (c: Cambio) =>
    start(async () => {
      aplicar(c);
      await registrarHabito(c.id, c.dia, { done: c.done });
    });

  const columnas = { gridTemplateColumns: `2.5rem repeat(${estado.length}, minmax(0, 1fr)) 1.5rem` };

  return (
    <div className="space-y-3">
      <section className="glass entrar rounded-2xl" style={{ ["--i" as string]: 1 }}>
        <div className="sticky top-0 z-10 grid items-end gap-1 rounded-t-2xl border-b border-line/60 bg-bg/90 px-2 py-2 backdrop-blur-md" style={columnas}>
          <span className="text-[11px] text-muted">Día</span>
          {estado.map((f) => (
            <span key={f.id} title={f.name} className="mx-auto grid size-7 place-items-center rounded-lg bg-accent/12 text-accent [&_svg]:size-4">
              <Icono nombre={f.emoji} porDefecto="check" />
              <span className="sr-only">{f.name}</span>
            </span>
          ))}
          <span title="Ánimo" className="mx-auto text-muted [&_svg]:size-4">
            <Smile />
            <span className="sr-only">Ánimo</span>
          </span>
        </div>

        <div className="px-2 py-1">
          {dias.map((d) => {
            const ds = diaSemana(d);
            const esHoy = d === hoy;
            return (
              <div
                key={d}
                className={cx("grid items-center gap-1 rounded-lg py-0.5", esHoy && "bg-accent/10", ds === 0 && "mt-1.5 border-t border-line/40 pt-1.5")}
                style={columnas}
              >
                <span className={cx("flex items-baseline gap-1 text-xs tabular-nums", esHoy ? "font-semibold text-accent" : "text-muted")}>
                  <span className="w-4 text-right">{Number(d.slice(8))}</span>
                  <span className="text-[10px] text-faint">{INICIALES_DIA[ds]}</span>
                </span>
                {estado.map((f) => (
                  <Celda key={f.id} fila={f} dia={d} hoy={hoy} cambiar={cambiar} />
                ))}
                <span className="mx-auto size-2.5 rounded-full" style={{ background: animo[d] ? COLOR_ANIMO[animo[d]] : "transparent" }} title={animo[d] ? `Ánimo ${animo[d]}/5` : undefined} />
              </div>
            );
          })}
        </div>

        <div className="grid items-center gap-1 border-t border-line/60 px-2 py-2" style={columnas}>
          <span className="text-[11px] text-muted">Total</span>
          {estado.map((f) => {
            const hechos = f.hechos.filter((d) => dias.includes(d)).length;
            return (
              <span key={f.id} className="text-center text-[11px] font-semibold tabular-nums" style={{ color: f.pct >= 80 ? "var(--ok)" : f.pct >= 50 ? "var(--warn)" : "var(--bad)" }}>
                {hechos}
              </span>
            );
          })}
          <span />
        </div>
      </section>

      <section className="glass entrar rounded-2xl p-3" style={{ ["--i" as string]: 2 }}>
        <div className="mb-2 text-xs font-medium text-muted">Leyenda</div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
          {estado.map((f) => (
            <li key={f.id} className="flex min-w-0 items-center gap-2">
              <span className="text-accent [&_svg]:size-4">
                <Icono nombre={f.emoji} porDefecto="check" />
              </span>
              <span className="min-w-0 flex-1 truncate">{f.kind === "dejar" ? `Sin ${f.name.toLowerCase()}` : f.name}</span>
              <span className="text-xs tabular-nums text-muted">{Math.round(f.pct)}%</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Celda({ fila, dia, hoy, cambiar }: { fila: FilaHabito; dia: string; hoy: string; cambiar: (c: Cambio) => void }) {
  const toca = fila.tocaDias.includes(dia);
  const hecho = fila.hechos.includes(dia);
  if (!toca && !hecho) return <span className="mx-auto text-xs text-faint/60">·</span>;
  const color = fila.kind === "dejar" ? "var(--warn)" : "var(--ok)";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={hecho}
      aria-label={`${fila.name} · ${dia}`}
      disabled={dia > hoy}
      onClick={() => cambiar({ id: fila.id, dia, done: !hecho })}
      className={cx(
        "mx-auto grid aspect-square w-full max-w-7 place-items-center rounded-md border transition duration-200 active:scale-90 disabled:opacity-30",
        hecho ? "border-transparent text-white" : "border-faint/50 hover:bg-hover",
        dia === hoy && !hecho && "border-accent",
      )}
      style={hecho ? { background: color } : undefined}
    >
      {hecho && <Check className="marcar size-3.5" strokeWidth={3} />}
    </button>
  );
}

/** La línea de ánimo del margen de la libreta: un punto por día con check-in, de 1 (abajo) a 5 (arriba). */
export function LineaAnimo({ dias, animo }: { dias: string[]; animo: Record<string, number> }) {
  const ancho = 300;
  const alto = 70;
  const x = (i: number) => (dias.length > 1 ? (i * ancho) / (dias.length - 1) : ancho / 2);
  const y = (v: number) => alto - 6 - ((v - 1) * (alto - 12)) / 4;
  const puntos = dias.map((d, i) => (animo[d] ? { x: x(i), y: y(animo[d]), v: animo[d], d } : null)).filter((p) => p != null);
  if (puntos.length === 0) return <p className="text-sm text-muted">Aún no hay check-ins este mes. Marca cómo estás en «Hoy» y aquí verás tu línea de ánimo.</p>;
  const media = puntos.reduce((a, p) => a + p.v, 0) / puntos.length;
  return (
    <div>
      <svg viewBox={`-4 0 ${ancho + 8} ${alto}`} className="h-20 w-full" role="img" aria-label={`Ánimo medio ${media.toFixed(1)} de 5`}>
        {[1, 3, 5].map((v) => (
          <line key={v} x1={0} x2={ancho} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray="3 4" />
        ))}
        <polyline points={puntos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {puntos.map((p) => (
          <circle key={p.d} cx={p.x} cy={p.y} r={3} fill={COLOR_ANIMO[p.v]} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>Día 1</span>
        <span>Media {media.toFixed(1)}/5</span>
        <span>Día {dias.length}</span>
      </div>
    </div>
  );
}
