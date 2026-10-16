"use client";

import { useActionState, useId, useRef, useState } from "react";
import type { VoucherKind } from "@/lib/supabase/types";
import { ESTADO_INICIAL, slugDe } from "../_comun/estado";
import { AREA, AYUDA, CAMPO, CHECK, ETIQUETA, FILA_CHECK } from "../_comun/estilos";
import { BotonEnviar, Resultado } from "../_comun/ui";
import { guardarProducto } from "./acciones";

/**
 * Alta y edición de un bono del catálogo. Campos no controlados, como en servicios (React 19 vacía
 * el formulario tras la acción: en el alta, listo para el siguiente; en la edición, el
 * `defaultValue` llega ya actualizado). Solo el tipo va en estado, porque decide qué campos se ven.
 */
export interface ProductoEditable {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: VoucherKind;
  sessions: number | null;
  service_id: string | null;
  value_cents: number | null;
  price_cents: number;
  validity_months: number | null;
  active: boolean;
  position: number;
}

/** 2550 → "25,50": lo que Andrea escribiría, sin el símbolo (el campo ya dice que son euros). */
function centimosATexto(c: number | null): string {
  if (c === null) return "";
  return `${Math.trunc(c / 100)},${String(c % 100).padStart(2, "0")}`;
}

export default function FormBono({
  producto,
  servicios,
}: {
  producto?: ProductoEditable;
  servicios: { id: string; name: string; active: boolean }[];
}) {
  const [estado, accion] = useActionState(guardarProducto, ESTADO_INICIAL);
  const id = useId();
  const slugRef = useRef<HTMLInputElement>(null);
  // Como en servicios: el slug se rellena con el nombre solo en el alta y mientras no se toque.
  const slugTocado = useRef(Boolean(producto));
  const [tipo, setTipo] = useState<VoucherKind>(producto?.kind ?? "sessions");
  const editando = Boolean(producto);

  // Un servicio desactivado no sale en la lista, salvo que este bono ya lo tuviera (si no,
  // guardar se lo quitaría sin que Andrea lo viera).
  const opciones = servicios.filter((s) => s.active || s.id === producto?.service_id);

  return (
    <form
      action={accion}
      onReset={() => {
        slugTocado.current = editando;
        setTipo(producto?.kind ?? "sessions");
      }}
      className="space-y-4"
    >
      {producto && <input type="hidden" name="id" value={producto.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={ETIQUETA}>
          Nombre
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={producto?.name}
            placeholder="Bono 5 manicuras"
            onChange={(e) => {
              if (!slugTocado.current && slugRef.current) slugRef.current.value = slugDe(e.target.value);
            }}
            className={CAMPO}
          />
        </label>
        <label className={ETIQUETA}>
          Dirección (slug)
          <input
            ref={slugRef}
            name="slug"
            required
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={producto?.slug}
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
        <textarea name="description" maxLength={1000} rows={2} defaultValue={producto?.description ?? ""} className={AREA} />
      </label>

      <fieldset>
        <legend className={ETIQUETA}>Tipo</legend>
        <div className="mt-1 grid gap-x-4 sm:grid-cols-2">
          <label className={FILA_CHECK}>
            <input
              type="radio"
              name="kind"
              value="sessions"
              defaultChecked={(producto?.kind ?? "sessions") === "sessions"}
              onChange={() => setTipo("sessions")}
              className={CHECK}
            />
            Bono de sesiones
          </label>
          <label className={FILA_CHECK}>
            <input
              type="radio"
              name="kind"
              value="gift"
              defaultChecked={producto?.kind === "gift"}
              onChange={() => setTipo("gift")}
              className={CHECK}
            />
            Tarjeta regalo (saldo en euros)
          </label>
        </div>
      </fieldset>

      {tipo === "sessions" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={ETIQUETA}>
            Sesiones
            <input
              name="sessions"
              type="number"
              required
              min={1}
              max={100}
              inputMode="numeric"
              defaultValue={producto?.sessions ?? 5}
              className={CAMPO}
            />
          </label>
          <label className={ETIQUETA}>
            Servicio <span className="font-normal text-gris">(opcional)</span>
            <select name="service_id" defaultValue={producto?.service_id ?? ""} className={CAMPO} aria-describedby={`${id}-servicio`}>
              <option value="">Cualquier servicio</option>
              {opciones.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.active ? s.name : `${s.name} (inactivo)`}
                </option>
              ))}
            </select>
            <span id={`${id}-servicio`} className={AYUDA}>
              Para qué servicio valen las sesiones. «Cualquier servicio» si da igual.
            </span>
          </label>
        </div>
      ) : (
        <label className={ETIQUETA}>
          Saldo de la tarjeta (€)
          <input
            name="value"
            required
            inputMode="decimal"
            placeholder="50"
            defaultValue={centimosATexto(producto?.value_cents ?? null)}
            className={CAMPO}
            aria-describedby={`${id}-saldo`}
          />
          <span id={`${id}-saldo`} className={AYUDA}>
            Lo que se puede gastar. Normalmente igual al precio.
          </span>
        </label>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <label className={ETIQUETA}>
          Precio (€)
          <input
            name="price"
            required
            inputMode="decimal"
            placeholder="120"
            defaultValue={producto ? centimosATexto(producto.price_cents) : ""}
            className={CAMPO}
          />
        </label>
        <label className={ETIQUETA}>
          Caduca a los (meses)
          <input
            name="validity_months"
            type="number"
            min={1}
            max={120}
            inputMode="numeric"
            placeholder="No caduca"
            defaultValue={producto?.validity_months ?? ""}
            className={CAMPO}
            aria-describedby={`${id}-validez`}
          />
        </label>
        <label className={ETIQUETA}>
          Posición
          <input
            name="position"
            type="number"
            min={0}
            max={9999}
            inputMode="numeric"
            defaultValue={producto?.position}
            placeholder="Al final"
            className={CAMPO}
          />
        </label>
        <p id={`${id}-validez`} className="col-span-2 -mt-2 text-xs text-gris sm:col-span-3">
          Vacío = <strong className="font-semibold text-tinta">no caduca</strong>, que es lo recomendable (Consumo lo prefiere y
          evita discusiones en el mostrador). Si pones un plazo, la web lo enseña en grande antes de pagar y cuenta desde el
          día de la compra.
        </p>
      </div>

      <label className={FILA_CHECK}>
        <input type="checkbox" name="active" defaultChecked={producto?.active ?? true} className={CHECK} />
        A la venta
      </label>

      <Resultado estado={estado} />
      <BotonEnviar pendiente="Guardando…" className="w-full sm:w-auto">
        {editando ? "Guardar cambios" : "Crear bono"}
      </BotonEnviar>
    </form>
  );
}
