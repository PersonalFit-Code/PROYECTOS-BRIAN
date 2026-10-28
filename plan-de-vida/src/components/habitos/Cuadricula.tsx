"use client";

import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { registrarHabito } from "@/app/(app)/habitos/acciones";
import { diaSemana, INICIALES_DIA } from "@/lib/fechas";
import { cx } from "@/lib/formato";
import { Casilla } from "./Casilla";

export interface FilaCuadricula {
  id: string;
  name: string;
  emoji: string;
  kind: "check" | "cantidad" | "dejar";
  /** días en que toca (los "N por semana" tocan todos) */
  tocaDias: string[];
  hechos: string[];
  pct: number;
}

/**
 * Cuadrícula de casillas: una fila por hábito, una columna por día (semana o mes entero). Se pueden
 * marcar días pasados que se olvidaron; los futuros no.
 */
export function Cuadricula({ filas, dias, hoy }: { filas: FilaCuadricula[]; dias: string[]; hoy: string }) {
  const [, startTransition] = useTransition();
  const [estado, aplicar] = useOptimistic(filas, (actual, c: { id: string; dia: string; done: boolean }) =>
    actual.map((f) => (f.id !== c.id ? f : { ...f, hechos: c.done ? [...f.hechos, c.dia] : f.hechos.filter((d) => d !== c.dia) })),
  );

  function cambiar(id: string, dia: string, done: boolean) {
    startTransition(async () => {
      aplicar({ id, dia, done });
      await registrarHabito(id, dia, { done });
    });
  }

  const compacta = dias.length > 7;
  const caja = useRef<HTMLDivElement>(null);

  // En el móvil el mes no cabe: se desplaza para que hoy quede a la vista.
  useEffect(() => {
    const el = caja.current;
    const col = el?.querySelector<HTMLElement>("[data-hoy]");
    if (el && col) el.scrollLeft = Math.max(0, col.offsetLeft - el.clientWidth + 120);
  }, []);

  return (
    <div ref={caja} className="overflow-x-auto">
      <table className="border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-36 bg-bg pr-3 text-left text-xs font-medium text-muted">Hábito</th>
            {dias.map((d) => (
              <th key={d} data-hoy={d === hoy || undefined} className={cx("px-0.5 pb-1 text-center text-[10px] font-medium", d === hoy ? "text-accent" : "text-muted")}>
                <div>{INICIALES_DIA[diaSemana(d)]}</div>
                <div className="tabular-nums">{Number(d.slice(8))}</div>
              </th>
            ))}
            <th className="pl-3 text-right text-xs font-medium text-muted">%</th>
          </tr>
        </thead>
        <tbody>
          {estado.map((f) => (
            <tr key={f.id} className="hover:bg-hover">
              <td className="sticky left-0 z-10 max-w-44 truncate bg-bg py-1 pr-3">
                <span className="mr-1">{f.emoji}</span>
                {f.name}
              </td>
              {dias.map((d) => {
                const toca = f.tocaDias.includes(d);
                const hecho = f.hechos.includes(d);
                const futuro = d > hoy;
                return (
                  <td key={d} className="px-0.5 py-1 text-center">
                    {toca || hecho ? (
                      <div className="flex justify-center">
                        <Casilla
                          tamano={compacta ? "sm" : "md"}
                          hecho={hecho}
                          deshabilitada={futuro}
                          color={f.kind === "dejar" ? "var(--warn)" : "var(--ok)"}
                          etiqueta={`${f.name} · ${d}`}
                          onClick={() => cambiar(f.id, d, !hecho)}
                        />
                      </div>
                    ) : (
                      <span className="text-faint">·</span>
                    )}
                  </td>
                );
              })}
              <td className="pl-3 text-right text-xs tabular-nums text-muted">{Math.round(f.pct)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
