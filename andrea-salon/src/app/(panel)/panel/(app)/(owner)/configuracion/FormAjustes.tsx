"use client";

import { useActionState, useId } from "react";
import { ESTADO_INICIAL } from "../_comun/estado";
import { AYUDA, CAMPO, ETIQUETA } from "../_comun/estilos";
import { BotonEnviar, Resultado } from "../_comun/ui";
import { guardarAjustesReserva } from "./acciones";
import { PASOS_HUECO } from "./zona";

export interface ValoresAjustes {
  horizon_days: number;
  min_lead_minutes: number;
  slot_step_min: number;
  hold_minutes: number;
  cancel_hours: number;
  reminder_hour_local: string;
  voucher_expiry_warning_days: number;
}

/** Reglas de la reserva online. Cada campo explica en una línea qué cambia para la clienta. */
export default function FormAjustes({ valores }: { valores: ValoresAjustes }) {
  const [estado, accion] = useActionState(guardarAjustesReserva, ESTADO_INICIAL);
  const id = useId();

  const campo = (
    nombre: keyof ValoresAjustes,
    etiqueta: string,
    ayuda: string,
    min: number,
    max: number,
  ) => (
    <label className={ETIQUETA}>
      {etiqueta}
      <input
        name={nombre}
        type="number"
        required
        min={min}
        max={max}
        inputMode="numeric"
        defaultValue={valores[nombre]}
        className={CAMPO}
        aria-describedby={`${id}-${nombre}`}
      />
      <span id={`${id}-${nombre}`} className={AYUDA}>
        {ayuda}
      </span>
    </label>
  );

  return (
    <form action={accion} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {campo("horizon_days", "Reservar con hasta (días)", "Cuántos días por delante se ve el calendario. De 1 a 120.", 1, 120)}
        {campo(
          "min_lead_minutes",
          "Antelación mínima (minutos)",
          "Ej.: 120 = no se puede reservar para dentro de menos de dos horas.",
          0,
          2880,
        )}
        <label className={ETIQUETA}>
          Horas cada (minutos)
          <select
            name="slot_step_min"
            defaultValue={String(valores.slot_step_min)}
            className={CAMPO}
            aria-describedby={`${id}-paso`}
          >
            {PASOS_HUECO.map((p) => (
              <option key={p} value={p}>
                {p} min
              </option>
            ))}
          </select>
          <span id={`${id}-paso`} className={AYUDA}>
            Con 15 se ofrecen 10:00, 10:15, 10:30…
          </span>
        </label>
        {campo(
          "hold_minutes",
          "Tiempo para terminar la reserva (min)",
          "Lo que se guarda la hora elegida mientras la clienta rellena sus datos. De 3 a 30.",
          3,
          30,
        )}
        {campo(
          "cancel_hours",
          "Cancelar o cambiar hasta (horas antes)",
          "Después de eso, la clienta tiene que llamar al salón. De 0 a 168.",
          0,
          168,
        )}
        <label className={ETIQUETA}>
          Hora del recordatorio
          <input
            name="reminder_hour_local"
            type="time"
            required
            defaultValue={valores.reminder_hour_local}
            className={CAMPO}
            aria-describedby={`${id}-rec`}
          />
          <span id={`${id}-rec`} className={AYUDA}>
            Orientativa: el aviso del día anterior sale una vez al día con la tarea automática.
          </span>
        </label>
        {campo(
          "voucher_expiry_warning_days",
          "Avisar de bonos que caducan (días antes)",
          "Cuántos días antes de caducar un bono se avisa.",
          0,
          180,
        )}
      </div>
      <Resultado estado={estado} />
      <BotonEnviar pendiente="Guardando…" className="w-full sm:w-auto">
        Guardar ajustes
      </BotonEnviar>
    </form>
  );
}
