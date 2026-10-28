"use client";

import { Flame, Minus, Plus } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { registrarHabito } from "@/app/(app)/habitos/acciones";
import { Icono } from "@/components/ui/iconos";
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

type Cambio = { id: string; done?: boolean; value?: number | null };

/** Casillas de una rutina del día. Marcar es instantáneo (optimista) y se guarda detrás. */
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

  return (
    <ul className="space-y-1">
      {lista.map((h, i) => (
        <li key={h.id} style={{ ["--i" as string]: i }} className="entrar flex items-center gap-3 rounded-xl px-1 py-1.5 transition hover:bg-hover/60">
          <Casilla
            hecho={h.done}
            etiqueta={h.kind === "dejar" ? `Hoy he evitado: ${h.name}` : `Hecho: ${h.name}`}
            color={h.kind === "dejar" ? "var(--warn)" : "var(--ok)"}
            onClick={() => cambiar({ id: h.id, done: !h.done })}
          />
          <Icono nombre={h.emoji} porDefecto="check" className={cx("size-4", h.done ? "text-faint" : "text-muted")} />
          <span className={cx("min-w-0 flex-1 truncate transition", h.done && "text-muted line-through decoration-faint")}>
            {h.kind === "dejar" ? `Sin ${h.name.toLowerCase()}` : h.name}
            {h.semanal && <span className="ml-2 text-xs text-muted">{h.semanal}</span>}
          </span>
          {h.kind === "cantidad" && (
            <span className="flex items-center gap-1 text-sm tabular-nums">
              <button aria-label="Menos" className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-hover active:scale-90" onClick={() => cambiar({ id: h.id, value: Math.max(0, (h.value ?? 0) - 1) })}>
                <Minus className="size-3.5" />
              </button>
              <span>
                {h.value ?? 0}/{h.target ?? "?"} {h.unit}
              </span>
              <button aria-label="Más" className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-hover active:scale-90" onClick={() => cambiar({ id: h.id, value: (h.value ?? 0) + 1 })}>
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
  );
}
