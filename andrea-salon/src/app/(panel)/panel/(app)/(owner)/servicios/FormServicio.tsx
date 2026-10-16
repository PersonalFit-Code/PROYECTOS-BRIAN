"use client";

import { useActionState, useId, useRef } from "react";
import { ESTADO_INICIAL, slugDe } from "../_comun/estado";
import { AREA, AYUDA, CAMPO, CHECK, ETIQUETA, FILA_CHECK } from "../_comun/estilos";
import { BotonEnviar, Resultado } from "../_comun/ui";
import { guardarServicio } from "./acciones";

/**
 * Alta y edición de un servicio. Los campos son no controlados a propósito: React 19 vacía el
 * formulario tras una acción, y en el alta eso es justo lo que queremos (listo para el siguiente);
 * en la edición, el `defaultValue` ya llega actualizado porque la acción revalida la página.
 */
export interface ServicioEditable {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  duration_min: number;
  buffer_min: number;
  price_cents: number;
  price_is_from: boolean;
  active: boolean;
  bookable_online: boolean;
  position: number;
  staff: string[];
}

interface Opcion {
  id: string;
  name: string;
}

/** 2550 → "25,50": lo que Andrea escribiría, sin el símbolo (el campo ya dice que son euros). */
function centimosATexto(c: number): string {
  return `${Math.trunc(c / 100)},${String(c % 100).padStart(2, "0")}`;
}

export default function FormServicio({
  servicio,
  categorias,
  equipo,
  categoriaPorDefecto,
}: {
  servicio?: ServicioEditable;
  categorias: Opcion[];
  equipo: (Opcion & { active: boolean })[];
  categoriaPorDefecto?: string | null;
}) {
  const [estado, accion] = useActionState(guardarServicio, ESTADO_INICIAL);
  const id = useId();
  const slugRef = useRef<HTMLInputElement>(null);
  // Mientras Andrea no toque el slug, se rellena solo a partir del nombre. En un servicio que ya
  // existe no: cambiar el slug cambia su dirección en la web y eso tiene que ser a propósito.
  const slugTocado = useRef(Boolean(servicio));
  const editando = Boolean(servicio);

  // En el desplegable solo las activas, salvo que una inactiva ya lo tuviera asignado (si no,
  // guardar la quitaría sin que Andrea lo viera).
  const visibles = equipo.filter((p) => p.active || servicio?.staff.includes(p.id));

  return (
    <form
      action={accion}
      onReset={() => {
        slugTocado.current = editando;
      }}
      className="space-y-4"
    >
      {servicio && <input type="hidden" name="id" value={servicio.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={ETIQUETA}>
          Nombre
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={servicio?.name}
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
            defaultValue={servicio?.slug}
            onChange={() => {
              slugTocado.current = true;
            }}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={CAMPO}
            aria-describedby={`${id}-slug`}
          />
          <span id={`${id}-slug`} className={AYUDA}>
            Minúsculas y guiones. Se rellena sola con el nombre.
          </span>
        </label>
      </div>

      <label className={ETIQUETA}>
        Descripción <span className="font-normal text-gris">(opcional)</span>
        <textarea name="description" maxLength={1000} rows={3} defaultValue={servicio?.description ?? ""} className={AREA} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={ETIQUETA}>
          Categoría
          <select
            name="category_id"
            defaultValue={servicio ? (servicio.category_id ?? "") : (categoriaPorDefecto ?? "")}
            className={CAMPO}
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={ETIQUETA}>
          Precio (€)
          <input
            name="price"
            required
            inputMode="decimal"
            placeholder="25,50"
            defaultValue={servicio ? centimosATexto(servicio.price_cents) : ""}
            className={CAMPO}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <label className={ETIQUETA}>
          Duración (min)
          <input
            name="duration_min"
            type="number"
            required
            min={5}
            max={480}
            step={5}
            inputMode="numeric"
            defaultValue={servicio?.duration_min ?? 60}
            className={CAMPO}
          />
        </label>
        <label className={ETIQUETA}>
          Recogida (min)
          <input
            name="buffer_min"
            type="number"
            min={0}
            max={120}
            step={5}
            inputMode="numeric"
            defaultValue={servicio?.buffer_min ?? 0}
            className={CAMPO}
            aria-describedby={`${id}-buffer`}
          />
          <span id={`${id}-buffer`} className={AYUDA}>
            Limpieza después; la clienta no la ve.
          </span>
        </label>
        <label className={ETIQUETA}>
          Posición
          <input
            name="position"
            type="number"
            min={0}
            max={9999}
            inputMode="numeric"
            defaultValue={servicio?.position}
            placeholder="Al final"
            className={CAMPO}
          />
        </label>
      </div>

      <div className="grid gap-x-4 sm:grid-cols-3">
        <label className={FILA_CHECK}>
          <input type="checkbox" name="price_is_from" defaultChecked={servicio?.price_is_from ?? false} className={CHECK} />
          Precio «desde»
        </label>
        <label className={FILA_CHECK}>
          <input type="checkbox" name="active" defaultChecked={servicio?.active ?? true} className={CHECK} />
          Activo
        </label>
        <label className={FILA_CHECK}>
          <input type="checkbox" name="bookable_online" defaultChecked={servicio?.bookable_online ?? true} className={CHECK} />
          Se reserva online
        </label>
      </div>

      <fieldset>
        <legend className={ETIQUETA}>Quién lo hace</legend>
        {visibles.length === 0 ? (
          <p className="mt-1 text-sm text-gris">Aún no hay profesionales activas. Créalas en Equipo.</p>
        ) : (
          <div className="mt-1 grid gap-x-4 sm:grid-cols-2">
            {visibles.map((p) => (
              <label key={p.id} className={FILA_CHECK}>
                <input
                  type="checkbox"
                  name="staff"
                  value={p.id}
                  defaultChecked={servicio ? servicio.staff.includes(p.id) : p.active}
                  className={CHECK}
                />
                {p.name}
                {!p.active && <span className="text-xs text-gris">(inactiva)</span>}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <Resultado estado={estado} />
      <BotonEnviar pendiente="Guardando…" className="w-full sm:w-auto">
        {editando ? "Guardar cambios" : "Crear servicio"}
      </BotonEnviar>
    </form>
  );
}
