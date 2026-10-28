"use client";

import { Pause, Play, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { activarRecurrente, borrarRecurrente } from "@/app/(app)/finanzas/acciones";
import { Boton, Vacio } from "@/components/ui/basicos";
import { Icono } from "@/components/ui/iconos";
import { fechaCorta } from "@/lib/fechas";
import { mensual } from "@/lib/finanzas";
import { cx, euros } from "@/lib/formato";
import type { Category, RecurringItem } from "@/lib/tipos";

export function Recurrentes({ items, categorias }: { items: RecurringItem[]; categorias: Category[] }) {
  const [pendiente, start] = useTransition();
  const cat = new Map(categorias.map((c) => [c.id, c]));
  if (!items.length) return <Vacio>Nada aquí todavía.</Vacio>;
  return (
    <ul>
      {items.map((r) => (
        <li key={r.id} className={cx("flex items-center gap-3 border-b border-line py-2 last:border-0", !r.active && "opacity-50")}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
            <Icono nombre={(r.category_id && cat.get(r.category_id)?.emoji) || "repeat"} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{r.name}</div>
            <div className="text-xs text-muted">
              {r.frequency} · {r.active ? `próximo ${fechaCorta(r.next_date)}` : "en pausa"}
              {r.frequency !== "mensual" && ` · ${euros(mensual(r.amount, r.frequency))}/mes`}
            </div>
          </div>
          <span className={cx("tabular-nums", r.kind === "ingreso" && "text-ok")}>{euros(r.amount)}</span>
          <Boton variante="fantasma" aria-label={r.active ? "Pausar" : "Reactivar"} disabled={pendiente} onClick={() => start(() => activarRecurrente(r.id, !r.active))}>
            {r.active ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Boton>
          <Boton variante="peligro" aria-label="Borrar" disabled={pendiente} onClick={() => confirm(`¿Borrar "${r.name}"?`) && start(() => borrarRecurrente(r.id))}>
            <Trash2 className="size-4" />
          </Boton>
        </li>
      ))}
    </ul>
  );
}
