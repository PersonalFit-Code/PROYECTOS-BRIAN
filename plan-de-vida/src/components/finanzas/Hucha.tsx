"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { aportarHucha, borrarHucha } from "@/app/(app)/finanzas/acciones";
import { Boton, Card, Progreso } from "@/components/ui/basicos";
import { fechaCorta } from "@/lib/fechas";
import { euros } from "@/lib/formato";
import type { SavingsGoal } from "@/lib/tipos";
import { n } from "@/lib/tipos";

export function Hucha({ hucha, ritmo }: { hucha: SavingsGoal; ritmo: number | null }) {
  const [cantidad, setCantidad] = useState("");
  const [pendiente, start] = useTransition();
  const pct = (100 * n(hucha.saved)) / n(hucha.target);

  function mover(signo: 1 | -1) {
    const v = Number(cantidad.replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) return;
    start(async () => {
      await aportarHucha(hucha.id, signo * v);
      setCantidad("");
    });
  }

  return (
    <Card>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-2xl">{hucha.emoji}</div>
          <div className="font-semibold">{hucha.name}</div>
          {hucha.target_date && <div className="text-xs text-muted">para el {fechaCorta(hucha.target_date)}</div>}
        </div>
        <button aria-label="Borrar hucha" className="rounded p-1 text-muted hover:bg-hover" onClick={() => confirm(`¿Borrar la hucha "${hucha.name}"?`) && start(() => borrarHucha(hucha.id))}>
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="mb-1 flex justify-between text-sm tabular-nums">
        <span className="font-medium">{euros(hucha.saved)}</span>
        <span className="text-muted">de {euros(hucha.target, false)}</span>
      </div>
      <Progreso valor={pct} color={hucha.done ? "var(--ok)" : "var(--accent)"} />
      <div className="mt-1 text-xs text-muted">
        {hucha.done ? "🎉 ¡Conseguida!" : `${Math.round(pct)} %${ritmo != null ? ` · aparta ${euros(ritmo, false)}/mes para llegar` : ""}`}
      </div>
      <div className="mt-3 flex gap-1.5">
        <input
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          inputMode="decimal"
          placeholder="€"
          aria-label="Cantidad"
          className="w-20 min-w-0 flex-1 rounded-md border border-line bg-bg px-2 text-sm"
        />
        <Boton disabled={pendiente} onClick={() => mover(1)}>
          + Aportar
        </Boton>
        <Boton variante="fantasma" disabled={pendiente} onClick={() => mover(-1)}>
          Retirar
        </Boton>
      </div>
    </Card>
  );
}
