"use client";

import { useState, useTransition } from "react";
import { guardarRevision } from "@/app/(app)/revisiones/acciones";
import { Boton, Etiqueta, Texto } from "@/components/ui/basicos";
import type { TipoRevision } from "@/lib/revisiones";

export function FormRevision({ tipo, clave, preguntas, respuestas }: { tipo: TipoRevision; clave: string; preguntas: { id: string; texto: string }[]; respuestas: Record<string, string> }) {
  const [pendiente, start] = useTransition();
  const [ok, setOk] = useState(false);
  return (
    <form
      key={`${tipo}-${clave}`}
      action={(f) =>
        start(async () => {
          await guardarRevision(tipo, clave, f);
          setOk(true);
        })
      }
      className="space-y-4"
      onChange={() => setOk(false)}
    >
      {preguntas.map((p) => (
        <Etiqueta key={p.id} label={p.texto}>
          <Texto name={p.id} rows={3} defaultValue={respuestas[p.id] ?? ""} />
        </Etiqueta>
      ))}
      <div className="flex items-center gap-3">
        <Boton variante="primario" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar revisión"}
        </Boton>
        {ok && <span className="text-sm text-ok">Guardada</span>}
      </div>
    </form>
  );
}
