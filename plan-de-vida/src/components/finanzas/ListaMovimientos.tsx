"use client";

import { Banknote, CreditCard, Repeat, Trash2 } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { borrarMovimiento } from "@/app/(app)/finanzas/acciones";
import { Vacio } from "@/components/ui/basicos";
import { Icono } from "@/components/ui/iconos";
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

  // Gastos del mes según cómo se pagaron (los apuntados antes de existir el método no cuentan).
  const gastoCon = (metodo: string) => lista.filter((m) => m.kind === "gasto" && m.method === metodo).reduce((a, m) => a + Number(m.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-bg/50 px-3 py-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CreditCard className="size-3.5" /> Gastado con tarjeta: <b className="tabular-nums text-fg">{euros(gastoCon("tarjeta"))}</b>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Banknote className="size-3.5" /> En efectivo: <b className="tabular-nums text-fg">{euros(gastoCon("efectivo"))}</b>
        </span>
      </div>
      {[...porDia].map(([dia, ms]) => (
        <div key={dia}>
          <div className="mb-1 text-xs font-medium text-muted">{fechaLarga(dia)}</div>
          <ul>
            {ms.map((m) => {
              const c = m.category_id ? cat.get(m.category_id) : null;
              return (
                <li key={m.id} className="group flex items-center gap-3 rounded-xl px-1 py-1.5 transition hover:bg-hover/60">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Icono nombre={c?.emoji} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{m.note || c?.name || (m.kind === "gasto" ? "Gasto" : "Ingreso")}</div>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      {m.method === "efectivo" ? (
                        <Banknote className="size-3" aria-label="Efectivo" />
                      ) : m.method === "tarjeta" ? (
                        <CreditCard className="size-3" aria-label="Tarjeta" />
                      ) : null}
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
                    className="rounded-lg p-1 text-muted opacity-60 transition hover:bg-hover hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
