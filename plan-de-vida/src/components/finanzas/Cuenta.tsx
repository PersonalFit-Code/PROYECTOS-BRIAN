"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { actualizarSaldo, borrarCuenta, metodoCuenta } from "@/app/(app)/finanzas/acciones";
import { fechaCorta } from "@/lib/fechas";
import { cx, euros } from "@/lib/formato";
import type { Account, PayMethod } from "@/lib/tipos";

/** Fila de cuenta: el saldo se actualiza tocándolo. */
export function Cuenta({ cuenta }: { cuenta: Account }) {
  const [editando, setEditando] = useState(false);
  const [pendiente, start] = useTransition();
  return (
    <li className={cx("group flex items-center gap-3 border-b border-line py-2 last:border-0", pendiente && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {cuenta.name}
          {cuenta.symbol && <span className="ml-2 text-xs text-muted">{cuenta.symbol}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span>actualizado {fechaCorta(cuenta.updated_at.slice(0, 10))}</span>
          {cuenta.kind === "liquidez" && (
            <select
              aria-label={`Pagos que mueven ${cuenta.name}`}
              value={cuenta.pago ?? ""}
              onChange={(e) => start(() => metodoCuenta(cuenta.id, (e.target.value || null) as PayMethod | null))}
              className={cx("rounded-md border border-line bg-bg/60 px-1 py-0.5", cuenta.pago && "text-accent")}
            >
              <option value="">sin pagos</option>
              <option value="tarjeta">pagos con tarjeta</option>
              <option value="efectivo">pagos en efectivo</option>
            </select>
          )}
        </div>
      </div>
      {editando ? (
        <input
          autoFocus
          inputMode="decimal"
          defaultValue={String(cuenta.balance)}
          aria-label="Nuevo saldo"
          className="w-28 rounded border border-line bg-bg px-2 py-1 text-right text-sm"
          onBlur={(e) => {
            setEditando(false);
            const v = Number(e.target.value.replace(",", "."));
            if (Number.isFinite(v) && v !== Number(cuenta.balance)) start(() => actualizarSaldo(cuenta.id, v));
          }}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        />
      ) : (
        <button onClick={() => setEditando(true)} className={cx("tabular-nums underline decoration-dotted", cuenta.kind === "deuda" && "text-bad")} title="Actualizar saldo">
          {cuenta.kind === "deuda" ? "−" : ""}
          {euros(cuenta.balance)}
        </button>
      )}
      <button aria-label="Quitar cuenta" className="rounded p-1 text-muted opacity-0 hover:bg-hover group-hover:opacity-100 focus:opacity-100" onClick={() => confirm(`¿Quitar "${cuenta.name}"?`) && start(() => borrarCuenta(cuenta.id))}>
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}
