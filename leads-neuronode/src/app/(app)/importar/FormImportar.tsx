"use client";

import { useActionState } from "react";
import { Boton, Campo } from "@/components/ui";
import { importarCsv, type EstadoImportar } from "./acciones";

const INICIAL: EstadoImportar = { ok: false, mensaje: "", errores: [] };

export function FormImportar() {
  const [estado, accion, cargando] = useActionState(importarCsv, INICIAL);
  return (
    <form action={accion} className="space-y-4">
      <label htmlFor="fichero" className="block">
        <span className="mb-1 block text-sm font-bold">Fichero CSV</span>
        <input
          id="fichero"
          name="fichero"
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full rounded-xl border border-line bg-bg p-2 text-sm file:mr-3 file:min-h-9 file:rounded-lg file:border-0 file:bg-soft file:px-3 file:font-bold file:text-brand"
        />
      </label>
      <Campo etiqueta="Número de lote" name="lote" type="number" min={1} max={99} defaultValue={1} className="max-w-32" />
      <Boton variante="primario" disabled={cargando}>
        {cargando ? "Cargando…" : "Cargar negocios"}
      </Boton>
      <div aria-live="polite">
        {estado.mensaje && <p className={estado.ok ? "font-bold text-ok" : "font-bold text-bad"}>{estado.mensaje}</p>}
        {estado.errores.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {estado.errores.slice(0, 20).map((e) => (
              <li key={e}>{e}</li>
            ))}
            {estado.errores.length > 20 && <li>…y {estado.errores.length - 20} avisos más.</li>}
          </ul>
        )}
      </div>
    </form>
  );
}
