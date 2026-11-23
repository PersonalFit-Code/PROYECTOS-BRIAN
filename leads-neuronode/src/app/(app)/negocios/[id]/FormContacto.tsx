"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AreaTexto, Boton, Campo, Selector } from "@/components/ui";
import { CANALES, CANAL_TXT, ESTADO_TXT, RESULTADOS } from "@/lib/tipos";
import { registrarContacto } from "./acciones";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <Boton variante="primario" disabled={pending}>
      {pending ? "Guardando…" : "Guardar contacto"}
    </Boton>
  );
}

/** Apuntar cómo ha ido un contacto. La fecha solo se pide si hay que volver a llamar. */
export function FormContacto({ negocioId }: { negocioId: string }) {
  const [resultado, setResultado] = useState<string>("sin_respuesta");
  const pideCorreo = resultado === "quiere_propuesta";
  return (
    <form action={registrarContacto} className="grid gap-4 sm:grid-cols-2">
      <p className="text-sm font-bold text-muted sm:col-span-2">O apúntalo con más detalle:</p>
      <input type="hidden" name="negocio_id" value={negocioId} />
      <Selector etiqueta="Canal" name="canal" defaultValue="llamada">
        {CANALES.map((c) => (
          <option key={c} value={c}>
            {CANAL_TXT[c]}
          </option>
        ))}
      </Selector>
      <Selector etiqueta="Resultado" name="resultado" value={resultado} onChange={(e) => setResultado(e.target.value)}>
        {RESULTADOS.map((r) => (
          <option key={r} value={r}>
            {ESTADO_TXT[r]}
          </option>
        ))}
      </Selector>
      {resultado === "volver" && <Campo etiqueta="Cuándo volver a llamar" name="proxima_fecha" type="date" />}
      <div className="sm:col-span-2">
        <AreaTexto etiqueta="Nota (opcional)" name="nota" maxLength={1000} placeholder="Qué te han dicho, con quién hay que hablar…" />
      </div>
      {pideCorreo && (
        <label className="flex items-start gap-3 rounded-xl bg-soft p-3 sm:col-span-2">
          <input type="checkbox" name="consentimiento" className="mt-1 size-5 accent-[var(--brand)]" />
          <span className="text-sm">
            <strong>Me ha pedido que le envíe la propuesta por correo.</strong> Márcalo solo si lo ha dicho de forma clara: sin esto, la ley no permite escribirle.
          </span>
        </label>
      )}
      <div className="sm:col-span-2">
        <Enviar />
      </div>
    </form>
  );
}
