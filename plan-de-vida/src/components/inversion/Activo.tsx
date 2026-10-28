"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { guardarActivo, quitarActivo } from "@/app/(app)/finanzas/inversion/acciones";
import { Boton, Campo, Etiqueta, Selector } from "@/components/ui/basicos";
import { FormAccion } from "@/components/ui/FormAccion";
import type { WatchItem } from "@/lib/tipos";

export function FormActivo({ activo, alTerminar }: { activo?: WatchItem; alTerminar?: () => void }) {
  return (
    <FormAccion
      accion={async (f) => {
        await guardarActivo(activo?.id ?? null, f);
        alTerminar?.();
      }}
      resetear={!activo}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      <Etiqueta label="Ticker (Yahoo)">
        <Campo name="symbol" required defaultValue={activo?.symbol} placeholder="VWCE.DE" />
      </Etiqueta>
      <div className="sm:col-span-3">
        <Etiqueta label="Nombre">
          <Campo name="name" required defaultValue={activo?.name} placeholder="Vanguard FTSE All-World" />
        </Etiqueta>
      </div>
      <Etiqueta label="Clase">
        <Selector name="asset_class" defaultValue={activo?.asset_class ?? "renta_variable"}>
          <option value="renta_variable">Renta variable</option>
          <option value="renta_fija">Renta fija</option>
          <option value="liquidez">Liquidez</option>
        </Selector>
      </Etiqueta>
      <Etiqueta label="Parte">
        <Selector name="sleeve" defaultValue={activo?.sleeve ?? "nucleo"}>
          <option value="nucleo">Núcleo</option>
          <option value="satelite">Satélite</option>
        </Selector>
      </Etiqueta>
      <Etiqueta label="Peso objetivo %">
        <Campo name="target_pct" inputMode="decimal" defaultValue={activo ? String(activo.target_pct) : "0"} />
      </Etiqueta>
      <Etiqueta label="Rentabilidad % (si no cotiza)">
        <Campo name="yield_pct" inputMode="decimal" defaultValue={activo?.yield_pct != null ? String(activo.yield_pct) : ""} placeholder="2,1" />
      </Etiqueta>
      <label className="col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="quoted" defaultChecked={activo?.quoted ?? true} className="accent-[var(--accent)]" /> Cotiza en bolsa (descargar precios)
      </label>
      <div className="col-span-2 text-right sm:col-span-2">
        <Boton variante="primario">{activo ? "Guardar" : "Añadir activo"}</Boton>
      </div>
    </FormAccion>
  );
}

export function FilaActivo({ activo, pesoActual, ultimo }: { activo: WatchItem; pesoActual: number | null; ultimo: string }) {
  const [editando, setEditando] = useState(false);
  const [pendiente, start] = useTransition();
  return (
    <>
      <tr className="border-t border-line">
        <td className="py-2 pr-2">
          <div className="font-medium">{activo.name}</div>
          <div className="text-xs text-muted">
            {activo.symbol} · {activo.sleeve}
          </div>
        </td>
        <td className="py-2 pr-2 text-right tabular-nums">{ultimo}</td>
        <td className="py-2 pr-2 text-right tabular-nums">{Number(activo.target_pct).toFixed(0)} %</td>
        <td className="py-2 pr-2 text-right tabular-nums">{pesoActual == null ? "—" : `${pesoActual.toFixed(1)} %`}</td>
        <td className="py-2 text-right whitespace-nowrap">
          <button aria-label="Editar" onClick={() => setEditando((v) => !v)} className="rounded p-1 text-muted hover:bg-hover">
            <Pencil className="size-3.5" />
          </button>
          <button aria-label="Quitar" disabled={pendiente} onClick={() => confirm(`¿Quitar ${activo.name} de la lista?`) && start(() => quitarActivo(activo.id))} className="rounded p-1 text-muted hover:bg-hover">
            <Trash2 className="size-3.5" />
          </button>
        </td>
      </tr>
      {editando && (
        <tr>
          <td colSpan={5} className="bg-side p-3">
            <FormActivo activo={activo} alTerminar={() => setEditando(false)} />
          </td>
        </tr>
      )}
    </>
  );
}
