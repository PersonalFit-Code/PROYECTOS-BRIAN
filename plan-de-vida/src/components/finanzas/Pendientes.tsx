"use client";

import { ArrowRight, Check, Clock, Trash2 } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { borrarMovimiento, borrarTraspaso, marcarLlegado } from "@/app/(app)/finanzas/acciones";
import { Boton } from "@/components/ui/basicos";
import { fechaCorta } from "@/lib/fechas";
import { cx, euros } from "@/lib/formato";
import type { Transaction, Transfer } from "@/lib/tipos";

/** Dinero en camino: no ha movido el saldo todavía. «Ha llegado» lo cuenta desde hoy. */
export function Pendientes({ pendientes, cuentas }: { pendientes: Transaction[]; cuentas: Record<string, string> }) {
  const [, start] = useTransition();
  const [lista, quitar] = useOptimistic(pendientes, (actual, id: string) => actual.filter((m) => m.id !== id));
  return (
    <ul className="space-y-1">
      {lista.map((m) => (
        <li key={m.id} className="rounded-xl px-1 py-1.5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warn/15 text-warn">
              <Clock className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{m.note || (m.kind === "ingreso" ? "Ingreso" : "Gasto")}</div>
              <div className="truncate text-xs text-muted">
                desde el {fechaCorta(m.day)}
                {m.account_id && cuentas[m.account_id] ? ` · ${m.kind === "ingreso" ? "entrará en" : "saldrá de"} ${cuentas[m.account_id]}` : ""}
              </div>
            </div>
            <span className={cx("shrink-0 tabular-nums", m.kind === "ingreso" && "text-ok")}>
              {m.kind === "ingreso" ? "+" : "−"}
              {euros(m.amount)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-end gap-1 pl-12">
            <button
              aria-label="Borrar pendiente"
              className="rounded-lg p-1.5 text-muted transition hover:bg-hover"
              onClick={() =>
                confirm("¿Borrar este pendiente?") &&
                start(async () => {
                  quitar(m.id);
                  await borrarMovimiento(m.id);
                })
              }
            >
              <Trash2 className="size-3.5" />
            </button>
            <Boton
              variante="suave"
              className="px-3 py-1.5 text-xs"
              onClick={() =>
                start(async () => {
                  quitar(m.id);
                  await marcarLlegado(m.id);
                })
              }
            >
              <Check className="size-3.5" /> {m.kind === "ingreso" ? "Ha llegado" : "Cobrado"}
            </Boton>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Traspasos entre tus cuentas: ni ingreso ni gasto. Borrar uno devuelve el dinero a su sitio. */
export function ListaTraspasos({ traspasos, cuentas }: { traspasos: Transfer[]; cuentas: Record<string, string> }) {
  const [, start] = useTransition();
  const [lista, quitar] = useOptimistic(traspasos, (actual, id: string) => actual.filter((t) => t.id !== id));
  return (
    <ul className="space-y-1">
      {lista.map((t) => (
        <li key={t.id} className="flex items-center gap-3 rounded-xl px-1 py-1.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 truncate text-sm">
              {cuentas[t.from_account_id] ?? "Cuenta"} <ArrowRight className="size-3.5 shrink-0 text-muted" /> {cuentas[t.to_account_id] ?? "Cuenta"}
            </div>
            <div className="truncate text-xs text-muted">
              {fechaCorta(t.day)}
              {t.note ? ` · ${t.note}` : ""}
            </div>
          </div>
          <span className="shrink-0 tabular-nums">{euros(t.amount)}</span>
          <button
            aria-label="Borrar traspaso"
            className="rounded-lg p-1 text-muted transition hover:bg-hover"
            onClick={() =>
              confirm("¿Borrar este traspaso? El dinero vuelve a la cuenta de la que salió.") &&
              start(async () => {
                quitar(t.id);
                await borrarTraspaso(t.id);
              })
            }
          >
            <Trash2 className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
