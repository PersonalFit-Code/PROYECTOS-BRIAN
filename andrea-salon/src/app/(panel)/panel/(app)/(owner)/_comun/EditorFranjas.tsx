"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { ESTADO_INICIAL, type EstadoAccion } from "./estado";
import { problemaFranjas, type Franja } from "./franjas";
import { BotonEnviar, Resultado, type Accion } from "./ui";

/**
 * Editor de horario semanal: varias franjas por día (mañana y tarde). Lo usan el horario de cada
 * profesional y el horario público del salón; cambia solo cómo se llaman los días por dentro
 * («1»…«7» o «mon»…«sun»). El estado entero viaja como JSON en un campo oculto y la acción lo
 * sustituye de una vez: así no hay franjas a medio guardar.
 */
export interface DiaEditor {
  clave: string;
  nombre: string;
}

const CAMPO_HORA =
  "block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-3 text-[16px] text-tinta focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";

export default function EditorFranjas({
  dias,
  inicial,
  accion,
  campos = {},
  textoBoton = "Guardar horario",
  franjaNueva = { inicio: "09:30", fin: "13:30" },
}: {
  dias: DiaEditor[];
  inicial: Record<string, Franja[]>;
  accion: Accion;
  campos?: Record<string, string>;
  textoBoton?: string;
  franjaNueva?: Franja;
}) {
  const [semana, setSemana] = useState<Record<string, Franja[]>>(() =>
    Object.fromEntries(dias.map((d) => [d.clave, inicial[d.clave] ?? []])),
  );
  const [aviso, setAviso] = useState<string | null>(null);

  // Se comprueba en el navegador antes de enviar para no hacer esperar a Andrea por un error obvio;
  // la acción vuelve a comprobarlo todo igualmente.
  const enviar = async (prev: EstadoAccion, form: FormData): Promise<EstadoAccion> => {
    for (const d of dias) {
      const problema = problemaFranjas(semana[d.clave] ?? [], d.nombre);
      if (problema) return { ok: false, error: problema };
    }
    return accion(prev, form);
  };
  const [estado, ejecutar] = useActionState(enviar, ESTADO_INICIAL);

  const cambiar = (clave: string, i: number, campo: keyof Franja, valor: string) => {
    setAviso(null);
    setSemana((s) => ({
      ...s,
      [clave]: (s[clave] ?? []).map((f, j) => (j === i ? { ...f, [campo]: valor } : f)),
    }));
  };
  const anadir = (clave: string) => {
    setAviso(null);
    setSemana((s) => {
      const actuales = s[clave] ?? [];
      // La segunda franja del día sugiere la tarde, que es lo habitual en el salón.
      const sugerida = actuales.length === 0 ? franjaNueva : { inicio: "15:30", fin: "19:30" };
      return { ...s, [clave]: [...actuales, sugerida] };
    });
  };
  const quitar = (clave: string, i: number) => {
    setAviso(null);
    setSemana((s) => ({ ...s, [clave]: (s[clave] ?? []).filter((_, j) => j !== i) }));
  };
  const copiarATodos = (origen: string) => {
    const franjas = semana[origen] ?? [];
    setSemana((s) => {
      const copia = { ...s };
      // Solo de lunes a viernes: copiar el sábado o el domingo encima casi nunca es lo que se quiere.
      for (const d of dias.slice(0, 5)) copia[d.clave] = franjas.map((f) => ({ ...f }));
      return copia;
    });
    setAviso(`Copiado el horario de ${dias.find((d) => d.clave === origen)?.nombre.toLowerCase()} de lunes a viernes. Falta guardar.`);
  };

  return (
    <form action={ejecutar} className="space-y-3">
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      <input type="hidden" name="semana" value={JSON.stringify(semana)} />

      <ul className="space-y-3">
        {dias.map((d, indiceDia) => {
          const franjas = semana[d.clave] ?? [];
          return (
            <li key={d.clave} className="rounded-2xl border border-[var(--capa-borde)] bg-white p-3">
              <fieldset>
                <legend className="flex w-full flex-wrap items-center justify-between gap-2">
                  <span className="text-[15px] font-semibold text-tinta">{d.nombre}</span>
                  {franjas.length === 0 && <span className="text-sm text-gris">Cerrado / libre</span>}
                </legend>
                <div className="mt-2 space-y-2">
                  {franjas.map((f, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                      <label className="text-xs font-semibold text-gris">
                        Desde
                        <input
                          type="time"
                          step={300}
                          required
                          value={f.inicio}
                          onChange={(e) => cambiar(d.clave, i, "inicio", e.target.value)}
                          className={cn(CAMPO_HORA, "mt-1")}
                        />
                      </label>
                      <label className="text-xs font-semibold text-gris">
                        Hasta
                        <input
                          type="time"
                          step={300}
                          required
                          value={f.fin}
                          onChange={(e) => cambiar(d.clave, i, "fin", e.target.value)}
                          className={cn(CAMPO_HORA, "mt-1")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => quitar(d.clave, i)}
                        className="grid size-12 place-items-center rounded-full text-gris hover:bg-rosa-niebla hover:text-carmin"
                        aria-label={`Quitar franja ${f.inicio}–${f.fin} del ${d.nombre.toLowerCase()}`}
                      >
                        <Trash2 aria-hidden className="size-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => anadir(d.clave)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-carmin hover:bg-rosa-niebla"
                  >
                    <Plus aria-hidden className="size-4" /> Añadir franja
                  </button>
                  {indiceDia === 0 && franjas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => copiarATodos(d.clave)}
                      className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-gris hover:bg-rosa-niebla hover:text-tinta"
                    >
                      Copiar de lunes a viernes
                    </button>
                  )}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className={aviso ? "text-sm text-gris" : "sr-only"}>
        {aviso}
      </p>
      <Resultado estado={estado} />
      <BotonEnviar pendiente="Guardando…" className="w-full sm:w-auto">
        {textoBoton}
      </BotonEnviar>
    </form>
  );
}
