"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { guardarActivo, quitarActivo } from "@/app/(app)/finanzas/inversion/acciones";
import { Boton, Campo, Etiqueta, Selector } from "@/components/ui/basicos";
import { FormAccion } from "@/components/ui/FormAccion";
import { Hoja } from "@/components/ui/Hoja";
import { cx } from "@/lib/formato";
import type { WatchItem } from "@/lib/tipos";

export function FormActivo({ activo }: { activo?: WatchItem }) {
  return (
    <FormAccion
      accion={async (f) => {
        await guardarActivo(activo?.id ?? null, f);
      }}
      resetear={!activo}
      className="grid grid-cols-2 gap-3"
    >
      <Etiqueta label="Ticker (Yahoo)">
        <Campo name="symbol" required defaultValue={activo?.symbol} placeholder="VWCE.DE" />
      </Etiqueta>
      <div>
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
      <div className="col-span-2 sm:col-span-4">
        <Boton variante="primario" className="w-full">{activo ? "Guardar" : "Añadir activo"}</Boton>
      </div>
    </FormAccion>
  );
}

export function FilaActivo({ activo, pesoActual, ultimo }: { activo: WatchItem; pesoActual: number | null; ultimo: string }) {
  const [pendiente, start] = useTransition();
  const objetivo = Number(activo.target_pct);
  const desvio = pesoActual == null ? null : pesoActual - objetivo;
  return (
    <li className="entrar rounded-2xl border border-line/70 bg-bg/50 p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{activo.name}</div>
          <div className="text-xs text-muted">
            {activo.symbol} · {activo.sleeve === "nucleo" ? "núcleo" : "satélite"} · {ultimo}
          </div>
        </div>
        <Hoja titulo={`Editar ${activo.name}`} boton="" etiqueta="Editar" icono={<Pencil />} variante="fantasma" claseBoton="px-2 py-1.5">
          <FormActivo activo={activo} />
        </Hoja>
        <button aria-label="Quitar" disabled={pendiente} onClick={() => confirm(`¿Quitar ${activo.name} de la lista?`) && start(() => quitarActivo(activo.id))} className="rounded-xl p-2 text-muted transition hover:bg-hover">
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-hover">
          <div className="h-full rounded-full bg-accent/40" style={{ width: `${Math.min(100, objetivo)}%` }} />
        </div>
        <span className="tabular-nums text-muted">objetivo {objetivo.toFixed(0)} %</span>
        <span className={cx("tabular-nums font-medium", desvio != null && Math.abs(desvio) > 5 && (desvio > 0 ? "text-warn" : "text-accent"))}>{pesoActual == null ? "—" : `actual ${pesoActual.toFixed(1)} %`}</span>
      </div>
    </li>
  );
}
