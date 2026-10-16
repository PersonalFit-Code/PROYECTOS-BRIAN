"use client";

import { Check } from "lucide-react";
import { useActionState, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ESTADO_INICIAL, slugDe } from "../_comun/estado";
import { AREA, AYUDA, CAMPO, CHECK, ETIQUETA, FILA_CHECK } from "../_comun/estilos";
import { BotonEnviar, Resultado } from "../_comun/ui";
import { guardarProfesional } from "./acciones";

export interface ProfesionalEditable {
  id: string;
  name: string;
  slug: string;
  color: string;
  bio: string | null;
  specialties: string[];
  instagram: string | null;
  active: boolean;
  bookable_online: boolean;
  position: number;
}

/**
 * Colores para la columna de la agenda: distintos entre sí a simple vista y con contraste
 * suficiente para texto blanco encima. El primero es el de por defecto de la base de datos.
 */
const PALETA = ["#B8365A", "#8E0E33", "#C2185B", "#7B1FA2", "#3949AB", "#00796B", "#2E7D32", "#E65100", "#6D4C41", "#546E7A"];

const HEX = /^#[0-9a-fA-F]{6}$/;

export default function FormProfesional({ profesional, posicionNueva = 0 }: { profesional?: ProfesionalEditable; posicionNueva?: number }) {
  const [estado, accion] = useActionState(guardarProfesional, ESTADO_INICIAL);
  const id = useId();
  const slugRef = useRef<HTMLInputElement>(null);
  const slugTocado = useRef(Boolean(profesional));
  // El color sí es controlado: lo comparten la paleta, el selector nativo y el campo de texto.
  const [color, setColor] = useState(profesional?.color ?? PALETA[0]!);
  const colorValido = HEX.test(color);

  return (
    <form
      action={accion}
      onReset={() => {
        slugTocado.current = Boolean(profesional);
      }}
      className="space-y-4"
    >
      {profesional && <input type="hidden" name="id" value={profesional.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={ETIQUETA}>
          Nombre
          <input
            name="name"
            required
            maxLength={80}
            defaultValue={profesional?.name}
            onChange={(e) => {
              if (!slugTocado.current && slugRef.current) slugRef.current.value = slugDe(e.target.value);
            }}
            className={CAMPO}
          />
        </label>
        <label className={ETIQUETA}>
          Dirección en la web (slug)
          <input
            ref={slugRef}
            name="slug"
            required
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={profesional?.slug}
            onChange={() => {
              slugTocado.current = true;
            }}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={CAMPO}
          />
        </label>
      </div>

      <fieldset>
        <legend className={ETIQUETA}>Color en la agenda</legend>
        <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label="Colores sugeridos">
          {PALETA.map((c) => {
            const elegido = color.toUpperCase() === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={elegido}
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                className="grid size-11 place-items-center rounded-full"
              >
                <span
                  className={cn("grid size-8 place-items-center rounded-full ring-offset-2", elegido && "ring-2 ring-tinta")}
                  style={{ backgroundColor: c }}
                >
                  {elegido && <Check aria-hidden className="size-4 text-white" />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-end gap-2">
          <label className="text-xs font-semibold text-gris">
            Otro
            <input
              type="color"
              value={colorValido ? color : "#B8365A"}
              onChange={(e) => setColor(e.target.value.toUpperCase())}
              className="mt-1 block h-12 w-14 cursor-pointer rounded-2xl border border-carmin/20 bg-white p-1"
            />
          </label>
          <label className="min-w-0 flex-1 text-xs font-semibold text-gris">
            Código
            <input
              name="color"
              required
              value={color}
              onChange={(e) => setColor(e.target.value.trim())}
              pattern="#[0-9a-fA-F]{6}"
              maxLength={7}
              autoCapitalize="characters"
              spellCheck={false}
              className={cn(CAMPO, "mt-1")}
            />
          </label>
        </div>
      </fieldset>

      <label className={ETIQUETA}>
        Presentación <span className="font-normal text-gris">(opcional, sale en la web)</span>
        <textarea name="bio" maxLength={1000} rows={3} defaultValue={profesional?.bio ?? ""} className={AREA} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={ETIQUETA}>
          Especialidades
          <input
            name="specialties"
            defaultValue={profesional?.specialties.join(", ")}
            placeholder="Nail art, francesa, pedicura"
            className={CAMPO}
            aria-describedby={`${id}-esp`}
          />
          <span id={`${id}-esp`} className={AYUDA}>
            Separadas por comas.
          </span>
        </label>
        <label className={ETIQUETA}>
          Instagram <span className="font-normal text-gris">(opcional)</span>
          <input
            name="instagram"
            defaultValue={profesional?.instagram ?? ""}
            placeholder="@usuario o enlace"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={CAMPO}
          />
        </label>
      </div>

      <div className="grid items-end gap-x-4 sm:grid-cols-3">
        <label className={FILA_CHECK}>
          <input type="checkbox" name="active" defaultChecked={profesional?.active ?? true} className={CHECK} />
          Activa
        </label>
        <label className={FILA_CHECK}>
          <input type="checkbox" name="bookable_online" defaultChecked={profesional?.bookable_online ?? true} className={CHECK} />
          Se le reserva online
        </label>
        <label className={ETIQUETA}>
          Posición
          <input
            name="position"
            type="number"
            min={0}
            max={9999}
            inputMode="numeric"
            defaultValue={profesional?.position ?? posicionNueva}
            className={CAMPO}
          />
        </label>
      </div>

      <Resultado estado={estado} />
      <BotonEnviar pendiente="Guardando…" className="w-full sm:w-auto">
        {profesional ? "Guardar cambios" : "Crear profesional"}
      </BotonEnviar>
    </form>
  );
}
