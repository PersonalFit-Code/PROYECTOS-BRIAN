"use client";

import { useState } from "react";
import { Boton, Campo, Etiqueta, Selector } from "@/components/ui/basicos";
import { useCerrarHoja } from "@/components/ui/Hoja";
import { SelectorIcono } from "@/components/ui/SelectorIcono";
import { INICIALES_DIA } from "@/lib/fechas";
import type { Area, Habit } from "@/lib/tipos";

/** Formulario de alta/edición de hábito. La frecuencia cambia los campos que se ven. */
export function FormHabito({
  accion,
  areas,
  habito,
  textoBoton = "Crear hábito",
  alTerminar,
}: {
  accion: (f: FormData) => Promise<void>;
  areas: Area[];
  habito?: Habit;
  textoBoton?: string;
  alTerminar?: () => void;
}) {
  const inicialFrecuencia = !habito
    ? "diario"
    : habito.weekly_target
      ? "semana"
      : habito.weekdays.length === 7
        ? "diario"
        : habito.weekdays.join() === "0,1,2,3,4"
          ? "laborables"
          : "dias";
  const [kind, setKind] = useState(habito?.kind ?? "check");
  const [frecuencia, setFrecuencia] = useState(inicialFrecuencia);
  const [error, setError] = useState<string | null>(null);
  const cerrar = useCerrarHoja();

  return (
    <form
      action={async (f) => {
        setError(null);
        try {
          await accion(f);
          // el formulario se vacía solo; los selectores controlados vuelven a su valor de partida
          if (!habito) {
            setKind("check");
            setFrecuencia("diario");
          }
          alTerminar?.();
          cerrar();
        } catch (e) {
          setError(e instanceof Error ? e.message : "No se pudo guardar");
        }
      }}
      className="grid gap-3 sm:grid-cols-6"
    >
      <div className="sm:col-span-6">
        <Etiqueta label="Nombre">
          <Campo name="name" required defaultValue={habito?.name} placeholder="Leer 20 minutos, Gimnasio, Agua…" />
        </Etiqueta>
      </div>
      <div className="sm:col-span-6">
        <Etiqueta label="Icono" grupo>
          <SelectorIcono name="emoji" inicial={habito?.emoji ?? "check"} />
        </Etiqueta>
      </div>
      <div className="sm:col-span-2">
        <Etiqueta label="Tipo">
          <Selector name="kind" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            <option value="check">Casilla sí/no</option>
            <option value="cantidad">Con cantidad</option>
            <option value="dejar">Hábito a dejar</option>
          </Selector>
        </Etiqueta>
      </div>
      <div className="sm:col-span-2">
        <Etiqueta label="Rutina">
          <Selector name="routine" defaultValue={habito?.routine ?? "dia"}>
            <option value="manana">Mañana</option>
            <option value="dia">Durante el día</option>
            <option value="noche">Noche</option>
          </Selector>
        </Etiqueta>
      </div>
      <div className="sm:col-span-2">
        <Etiqueta label="Área">
          <Selector name="area_id" defaultValue={habito?.area_id ?? ""}>
            <option value="">—</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Selector>
        </Etiqueta>
      </div>
      {kind === "cantidad" && (
        <>
          <div className="sm:col-span-3">
            <Etiqueta label="Objetivo diario">
              <Campo name="target" inputMode="decimal" required defaultValue={habito?.target != null ? String(habito.target) : ""} placeholder="8" />
            </Etiqueta>
          </div>
          <div className="sm:col-span-3">
            <Etiqueta label="Unidad">
              <Campo name="unit" defaultValue={habito?.unit ?? ""} placeholder="vasos, min, pasos" />
            </Etiqueta>
          </div>
        </>
      )}
      <div className="sm:col-span-3">
        <Etiqueta label="Frecuencia">
          <Selector name="frecuencia" value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)}>
            <option value="diario">Todos los días</option>
            <option value="laborables">Lunes a viernes</option>
            <option value="dias">Días concretos</option>
            <option value="semana">N veces por semana</option>
          </Selector>
        </Etiqueta>
      </div>
      <div className="sm:col-span-3">
        {frecuencia === "dias" && (
          <Etiqueta label="Días" grupo>
            <div className="flex gap-1">
              {INICIALES_DIA.map((d, i) => (
                <label key={i} className="flex cursor-pointer flex-col items-center gap-0.5 text-xs">
                  <input type="checkbox" name="weekdays" value={i} defaultChecked={habito ? habito.weekdays.includes(i) : true} className="accent-[var(--accent)]" />
                  {d}
                </label>
              ))}
            </div>
          </Etiqueta>
        )}
        {frecuencia === "semana" && (
          <Etiqueta label="Veces por semana">
            <Campo name="weekly_target" type="number" min={1} max={7} defaultValue={habito?.weekly_target ?? 3} />
          </Etiqueta>
        )}
      </div>
      {error && <p className="text-sm text-bad sm:col-span-6">{error}</p>}
      <div className="sm:col-span-6">
        <Boton variante="primario" className="w-full sm:w-auto">{textoBoton}</Boton>
      </div>
    </form>
  );
}
