"use client";

import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { ESTADO_INICIAL } from "../_comun/estado";
import { CAMPO, ETIQUETA } from "../_comun/estilos";
import { BotonEnviar, Resultado } from "../_comun/ui";
import { crearCierre } from "./acciones";

/**
 * Alta de un cierre: el salón entero (festivo, vacaciones) o una sola profesional (médico, un día
 * libre). Dos maneras de decir cuándo: días completos o unas horas de un día.
 */
export default function FormCierre({ equipo, hoy }: { equipo: { id: string; name: string }[]; hoy: string }) {
  const [estado, accion] = useActionState(crearCierre, ESTADO_INICIAL);
  const [tipo, setTipo] = useState<"dias" | "horas">("dias");

  const pestana = (valor: "dias" | "horas", texto: string) => (
    <label
      className={cn(
        "flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-carmin/40",
        tipo === valor ? "bg-carmin text-white" : "text-carmin hover:bg-rosa-niebla",
      )}
    >
      <input
        type="radio"
        name="tipo"
        value={valor}
        checked={tipo === valor}
        onChange={() => setTipo(valor)}
        className="sr-only"
      />
      {texto}
    </label>
  );

  return (
    <form action={accion} className="space-y-4">
      <label className={ETIQUETA}>
        ¿A quién afecta?
        <select name="staff_id" defaultValue="" className={CAMPO}>
          <option value="">Todo el salón (cerrado)</option>
          {equipo.map((p) => (
            <option key={p.id} value={p.id}>
              Solo {p.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className={ETIQUETA}>¿Cuándo?</legend>
        <div className="mt-1.5 flex gap-1 rounded-full border border-carmin/20 bg-white p-1">
          {pestana("dias", "Días completos")}
          {pestana("horas", "Unas horas")}
        </div>
      </fieldset>

      {tipo === "dias" ? (
        <div className="grid grid-cols-2 gap-3">
          <label className={ETIQUETA}>
            Desde el día
            <input name="desde" type="date" required min={hoy} defaultValue={hoy} className={CAMPO} />
          </label>
          <label className={ETIQUETA}>
            Hasta el día (incluido)
            <input name="hasta" type="date" required min={hoy} defaultValue={hoy} className={CAMPO} />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className={cn(ETIQUETA, "col-span-2 sm:col-span-1")}>
            Día
            <input name="fecha" type="date" required min={hoy} defaultValue={hoy} className={CAMPO} />
          </label>
          <label className={ETIQUETA}>
            De
            <input name="horaDesde" type="time" required step={300} defaultValue="10:00" className={CAMPO} />
          </label>
          <label className={ETIQUETA}>
            A
            <input name="horaHasta" type="time" required step={300} defaultValue="12:00" className={CAMPO} />
          </label>
        </div>
      )}

      <label className={ETIQUETA}>
        Motivo <span className="font-normal text-gris">(opcional, solo lo ves tú)</span>
        <input name="reason" maxLength={200} placeholder="Vacaciones, festivo, formación…" className={CAMPO} />
      </label>

      <Resultado estado={estado} />
      <BotonEnviar pendiente="Guardando…" className="w-full sm:w-auto">
        Añadir cierre
      </BotonEnviar>
    </form>
  );
}
