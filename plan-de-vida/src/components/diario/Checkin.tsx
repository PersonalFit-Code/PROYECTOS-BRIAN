"use client";

import { useState, useTransition } from "react";
import { guardarCheckin } from "@/app/(app)/diario/acciones";
import { Boton, Campo } from "@/components/ui/basicos";
import { CARAS_ANIMO, CARAS_ENERGIA, Escala } from "./Escala";

/** Check-in de la pantalla Hoy: cómo estás (1–5), energía (1–5) y una línea para el diario. */
export function Checkin({ dia, mood, energy }: { dia: string; mood: number | null; energy: number | null }) {
  const [animo, setAnimo] = useState(mood);
  const [energia, setEnergia] = useState(energy);
  const [linea, setLinea] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [pendiente, start] = useTransition();

  function guardar(m: number | null, e: number | null, l: string) {
    start(async () => {
      await guardarCheckin(dia, m, e, l);
      setGuardado(true);
      setLinea("");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="w-16 text-sm text-muted">Ánimo</span>
          <Escala etiqueta="Ánimo" caras={CARAS_ANIMO} valor={animo} onChange={(v) => { setAnimo(v); guardar(v, energia, ""); }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-sm text-muted">Energía</span>
          <Escala etiqueta="Energía" caras={CARAS_ENERGIA} valor={energia} onChange={(v) => { setEnergia(v); guardar(animo, v, ""); }} />
        </div>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (linea.trim()) guardar(animo, energia, linea);
        }}
      >
        <Campo value={linea} onChange={(e) => { setLinea(e.target.value); setGuardado(false); }} placeholder="Una línea sobre tu día…" />
        <Boton disabled={pendiente || !linea.trim()}>Guardar</Boton>
      </form>
      {guardado && !pendiente && <p className="text-xs text-ok">Guardado en tu diario.</p>}
    </div>
  );
}
