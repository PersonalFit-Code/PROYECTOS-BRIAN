"use client";

import { RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { actualizarAhora } from "@/app/(app)/finanzas/inversion/acciones";
import { Boton } from "@/components/ui/basicos";

export function BotonActualizar() {
  const [pendiente, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-bad">{error}</span>}
      <Boton
        disabled={pendiente}
        onClick={() => {
          if (!confirm("Se descargan cotizaciones y se rehace el informe de hoy (las valoraciones de hoy se pierden). ¿Seguir?")) return;
          start(async () => {
            setError(null);
            try {
              await actualizarAhora();
            } catch (e) {
              setError(e instanceof Error ? e.message : "No se pudo actualizar");
            }
          });
        }}
      >
        <RefreshCw className={pendiente ? "size-4 animate-spin" : "size-4"} />
        {pendiente ? "Analizando…" : "Actualizar ahora"}
      </Boton>
    </div>
  );
}
