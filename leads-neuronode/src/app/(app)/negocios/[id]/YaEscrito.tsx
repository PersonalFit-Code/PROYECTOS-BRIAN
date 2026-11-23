"use client";

import { Check, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { Boton } from "@/components/ui";
import { yaEscrito } from "./acciones";

const OPCIONES = [
  { canal: "instagram", txt: "Instagram" },
  { canal: "whatsapp", txt: "WhatsApp" },
  { canal: "formulario", txt: "Formulario web" },
] as const;

/** Un toque cuando ya le has escrito: queda apuntado y el negocio pasa a «Esperando respuesta». */
export function YaEscrito({ negocioId, porDefecto, esperando }: { negocioId: string; porDefecto: string; esperando: boolean }) {
  const [canal, setCanal] = useState(porDefecto);
  const [hecho, setHecho] = useState(false);
  const [error, setError] = useState(false);
  const [cargando, empezar] = useTransition();

  function enviar() {
    setError(false);
    empezar(async () => {
      try {
        await yaEscrito(negocioId, canal);
        setHecho(true);
      } catch {
        setError(true);
      }
    });
  }

  return (
    <div className="mb-5 rounded-xl bg-soft p-3">
      <fieldset>
        <legend className="mb-2 text-sm font-bold">¿Ya le has escrito?</legend>
        <div className="flex flex-wrap gap-2">
          {OPCIONES.map((o) => (
            <label key={o.canal} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-bg px-3 text-sm font-bold has-checked:border-brand has-checked:text-brand">
              <input type="radio" name="canal-escrito" value={o.canal} checked={canal === o.canal} onChange={() => setCanal(o.canal)} className="accent-[var(--brand)]" />
              {o.txt}
            </label>
          ))}
        </div>
      </fieldset>
      <Boton variante="primario" className="mt-3 w-full sm:w-auto" onClick={enviar} disabled={cargando}>
        {hecho ? <Check className="size-4" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {cargando ? "Guardando…" : hecho ? "Apuntado: esperando respuesta" : esperando ? "Le he vuelto a escribir" : "Ya le he escrito"}
      </Boton>
      <p aria-live="polite" className="mt-2 text-sm">
        {error ? <span className="font-bold text-bad">No se ha podido guardar. Prueba otra vez.</span> : hecho ? "Lo tienes en el pipeline, en «Esperando respuesta»." : ""}
      </p>
    </div>
  );
}
