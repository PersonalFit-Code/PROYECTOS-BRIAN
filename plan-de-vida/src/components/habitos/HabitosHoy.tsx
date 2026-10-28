"use client";

import Link from "next/link";
import { Flame, Minus, Plus } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { registrarHabito } from "@/app/(app)/habitos/acciones";
import { Vacio } from "@/components/ui/basicos";
import { cx } from "@/lib/formato";
import type { Routine } from "@/lib/tipos";
import { Casilla } from "./Casilla";

export interface HabitoDelDia {
  id: string;
  name: string;
  emoji: string;
  kind: "check" | "cantidad" | "dejar";
  target: number | null;
  unit: string | null;
  routine: Routine;
  done: boolean;
  value: number | null;
  racha: number;
  semanal: string | null;
}

const RUTINAS: { id: Routine; titulo: string }[] = [
  { id: "manana", titulo: "🌅 Rutina de mañana" },
  { id: "dia", titulo: "☀️ Durante el día" },
  { id: "noche", titulo: "🌙 Rutina de noche" },
];

type Cambio = { id: string; done?: boolean; value?: number | null };

/** Las casillas del día agrupadas por rutina. Marcar es instantáneo (optimista) y se guarda detrás. */
export function HabitosHoy({ habitos, dia }: { habitos: HabitoDelDia[]; dia: string }) {
  const [, startTransition] = useTransition();
  const [lista, aplicar] = useOptimistic(habitos, (estado, c: Cambio) =>
    estado.map((h) => {
      if (h.id !== c.id) return h;
      const value = c.value !== undefined ? c.value : h.value;
      const done = c.done !== undefined ? c.done : h.kind === "cantidad" && h.target != null ? (value ?? 0) >= h.target : h.done;
      return { ...h, value, done };
    }),
  );

  function cambiar(c: Cambio) {
    startTransition(async () => {
      aplicar(c);
      await registrarHabito(c.id, dia, { done: c.done, value: c.value });
    });
  }

  if (!habitos.length) {
    return (
      <Vacio>
        Aún no tienes hábitos. <Link href="/habitos" className="text-accent underline">Crea tu primera rutina</Link>.
      </Vacio>
    );
  }

  const hechos = lista.filter((h) => h.done).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-sm text-muted">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hover">
          <div className="h-full rounded-full bg-ok transition-all" style={{ width: `${(100 * hechos) / lista.length}%` }} />
        </div>
        <span className="tabular-nums">
          {hechos}/{lista.length}
        </span>
      </div>
      {RUTINAS.map((r) => {
        const delGrupo = lista.filter((h) => h.routine === r.id);
        if (!delGrupo.length) return null;
        return (
          <div key={r.id}>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{r.titulo}</h3>
            <ul>
              {delGrupo.map((h) => (
                <li key={h.id} className="group flex items-center gap-3 rounded-md px-1 py-1.5 hover:bg-hover">
                  <Casilla
                    hecho={h.done}
                    etiqueta={h.kind === "dejar" ? `Hoy he evitado: ${h.name}` : `Hecho: ${h.name}`}
                    color={h.kind === "dejar" ? "var(--warn)" : "var(--ok)"}
                    onClick={() => cambiar({ id: h.id, done: !h.done })}
                  />
                  <span className={cx("flex-1 truncate", h.done && "text-muted line-through decoration-faint")}>
                    <span className="mr-1.5">{h.emoji}</span>
                    {h.kind === "dejar" ? `Sin ${h.name.toLowerCase()}` : h.name}
                    {h.semanal && <span className="ml-2 text-xs text-muted">{h.semanal}</span>}
                  </span>
                  {h.kind === "cantidad" && (
                    <span className="flex items-center gap-1 text-sm tabular-nums">
                      <button aria-label="Menos" className="rounded p-1 text-muted hover:bg-hover" onClick={() => cambiar({ id: h.id, value: Math.max(0, (h.value ?? 0) - 1) })}>
                        <Minus className="size-3.5" />
                      </button>
                      <span>
                        {h.value ?? 0}/{h.target ?? "?"} {h.unit}
                      </span>
                      <button aria-label="Más" className="rounded p-1 text-muted hover:bg-hover" onClick={() => cambiar({ id: h.id, value: (h.value ?? 0) + 1 })}>
                        <Plus className="size-3.5" />
                      </button>
                    </span>
                  )}
                  {h.racha > 1 && (
                    <span className="flex items-center gap-0.5 text-xs text-warn" title={`Racha de ${h.racha}`}>
                      <Flame className="size-3.5" />
                      {h.racha}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
