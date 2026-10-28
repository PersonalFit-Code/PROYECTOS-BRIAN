"use client";

import { useState, useTransition } from "react";
import { guardarPresupuesto } from "@/app/(app)/finanzas/acciones";
import { Progreso } from "@/components/ui/basicos";
import { Icono } from "@/components/ui/iconos";
import { euros } from "@/lib/formato";

export interface FilaPresupuesto {
  id: string;
  nombre: string;
  emoji: string;
  gastado: number;
  presupuesto: number | null;
}

/** Gasto por categoría frente a su presupuesto. El presupuesto se edita tocando la cifra. */
export function Presupuesto({ filas }: { filas: FilaPresupuesto[] }) {
  return (
    <ul className="space-y-3">
      {filas.map((f) => (
        <FilaCat key={f.id} f={f} />
      ))}
    </ul>
  );
}

function FilaCat({ f }: { f: FilaPresupuesto }) {
  const [editando, setEditando] = useState(false);
  const [, start] = useTransition();
  const pasado = f.presupuesto != null && f.gastado > f.presupuesto;
  return (
    <li>
      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <Icono nombre={f.emoji} className="text-muted" />
          <span className="truncate">{f.nombre}</span>
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <span className={pasado ? "text-bad" : ""}>{euros(f.gastado)}</span>
          <span className="text-muted">/</span>
          {editando ? (
            <input
              autoFocus
              inputMode="decimal"
              defaultValue={f.presupuesto ?? ""}
              className="w-24 rounded-lg border border-line bg-bg/70 px-1.5 py-0.5 text-right"
              onBlur={(e) => {
                const v = Number(e.target.value.replace(",", "."));
                setEditando(false);
                start(() => guardarPresupuesto(f.id, e.target.value.trim() === "" ? null : v));
              }}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            />
          ) : (
            <button className="text-muted underline decoration-dotted hover:text-fg" onClick={() => setEditando(true)} title="Cambiar presupuesto">
              {f.presupuesto != null ? euros(f.presupuesto, false) : "sin límite"}
            </button>
          )}
        </span>
      </div>
      <Progreso
        valor={f.presupuesto ? (100 * f.gastado) / f.presupuesto : f.gastado > 0 ? 100 : 0}
        color={pasado ? "var(--bad)" : f.presupuesto ? "var(--accent)" : "var(--faint)"}
      />
    </li>
  );
}
