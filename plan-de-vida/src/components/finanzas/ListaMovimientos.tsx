"use client";

import { Repeat, Trash2 } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { borrarMovimiento } from "@/app/(app)/finanzas/acciones";
import { Vacio } from "@/components/ui/basicos";
import { fechaLarga } from "@/lib/fechas";
import { cx, euros } from "@/lib/formato";
import type { Category, Transaction } from "@/lib/tipos";

export function ListaMovimientos({ movimientos, categorias }: { movimientos: Transaction[]; categorias: Category[] }) {
  const [, start] = useTransition();
  const [lista, quitar] = useOptimistic(movimientos, (actual, id: string) => actual.filter((m) => m.id !== id));
  const cat = new Map(categorias.map((c) => [c.id, c]));
  if (!lista.length) return <Vacio>Sin movimientos este mes. Usa el botón + para apuntar el primero.</Vacio>;

  const porDia = new Map<string, Transaction[]>();
  for (const m of lista) porDia.set(m.day, [...(porDia.get(m.day) ?? []), m]);

  return (
    <div className="space-y-4">
      {[...porDia].map(([dia, ms]) => (
        <div key={dia}>
          <div className="mb-1 text-xs font-medium capitalize text-muted">{fechaLarga(dia)}</div>
          <ul>
            {ms.map((m) => {
              const c = m.category_id ? cat.get(m.category_id) : null;
              return (
                <li key={m.id} className="group flex items-center gap-3 rounded-md px-1 py-1.5 hover:bg-hover">
                  <span className="grid size-8 place-items-center rounded-md bg-hover">{c?.emoji ?? "•"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{m.note || c?.name || (m.kind === "gasto" ? "Gasto" : "Ingreso")}</div>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      {c?.name}
                      {m.recurring_id && <Repeat className="size-3" aria-label="Fijo" />}
                    </div>
                  </div>
                  <span className={cx("tabular-nums", m.kind === "ingreso" ? "text-ok" : "")}>
                    {m.kind === "ingreso" ? "+" : "−"}
                    {euros(m.amount)}
                  </span>
                  <button
                    aria-label="Borrar movimiento"
                    className="rounded p-1 text-muted opacity-0 hover:bg-hover group-hover:opacity-100 focus:opacity-100"
                    onClick={() => {
                      if (confirm("¿Borrar este movimiento?"))
                        start(async () => {
                          quitar(m.id);
                          await borrarMovimiento(m.id);
                        });
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
