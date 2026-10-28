"use client";

import { useState, useTransition } from "react";
import { guardarDiario } from "@/app/(app)/diario/acciones";
import { Boton, Etiqueta, Texto } from "@/components/ui/basicos";
import type { JournalEntry } from "@/lib/tipos";
import { CARAS_ANIMO, CARAS_ENERGIA, Escala } from "./Escala";

export function FormDiario({ dia, entrada }: { dia: string; entrada: JournalEntry | null }) {
  const [animo, setAnimo] = useState(entrada?.mood ?? null);
  const [energia, setEnergia] = useState(entrada?.energy ?? null);
  const [estado, setEstado] = useState<"" | "ok">("");
  const [pendiente, start] = useTransition();

  return (
    <form
      key={dia}
      action={(f) =>
        start(async () => {
          await guardarDiario(dia, f);
          setEstado("ok");
        })
      }
      className="space-y-4"
    >
      <div className="flex flex-wrap gap-6">
        <Etiqueta label="Ánimo" grupo>
          <Escala name="mood" etiqueta="Ánimo" caras={CARAS_ANIMO} valor={animo} onChange={setAnimo} />
        </Etiqueta>
        <Etiqueta label="Energía" grupo>
          <Escala name="energy" etiqueta="Energía" caras={CARAS_ENERGIA} valor={energia} onChange={setEnergia} />
        </Etiqueta>
      </div>
      <Etiqueta label="Hoy agradezco…">
        <Texto name="gratitude" rows={2} defaultValue={entrada?.gratitude ?? ""} placeholder="Tres cosas, aunque sean pequeñas" />
      </Etiqueta>
      <Etiqueta label="Cómo ha ido el día">
        <Texto name="body" rows={8} defaultValue={entrada?.body ?? ""} placeholder="Qué ha pasado, qué aprendí, qué haría distinto…" onChange={() => setEstado("")} />
      </Etiqueta>
      <div className="flex items-center gap-3">
        <Boton variante="primario" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar"}
        </Boton>
        {estado === "ok" && <span className="text-sm text-ok">Guardado</span>}
      </div>
    </form>
  );
}
