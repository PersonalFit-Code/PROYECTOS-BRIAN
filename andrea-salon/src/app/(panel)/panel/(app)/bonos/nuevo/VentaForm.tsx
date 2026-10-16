"use client";

import { useId, useState, useTransition } from "react";
import { formatearEuros } from "@/lib/money";
import type { VoucherKind } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { venderBono } from "../acciones";

/**
 * Formulario de venta en el mostrador. Va por `onSubmit` y no por `action` a propósito: si algo
 * falla (un correo mal escrito) React no vacía el formulario y no hay que volver a teclear nada
 * con la clienta esperando. Si sale bien, la acción redirige a la ficha del bono recién creado.
 */
export interface ProductoVenta {
  id: string;
  nombre: string;
  descripcion: string | null;
  kind: VoucherKind;
  sesiones: number | null;
  valorCents: number | null;
  precioCents: number;
  meses: number | null;
}

type Metodo = "card" | "cash" | "bizum";

const campo =
  "mt-1.5 block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px] text-tinta focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";
const ayuda = "mt-1 block text-xs font-normal text-gris";

function incluye(p: ProductoVenta): string {
  if (p.kind === "sessions") return `${p.sesiones ?? 0} ${p.sesiones === 1 ? "sesión" : "sesiones"}`;
  return `Tarjeta regalo de ${formatearEuros(p.valorCents ?? 0)}`;
}

export default function VentaForm({ productos }: { productos: ProductoVenta[] }) {
  const id = useId();
  const [elegido, setElegido] = useState<string | null>(productos.length === 1 ? productos[0]!.id : null);
  const [metodo, setMetodo] = useState<Metodo>("card");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();
  const producto = productos.find((p) => p.id === elegido) ?? null;

  return (
    <form
      noValidate
      className="space-y-5 rounded-3xl border border-[var(--capa-borde)] bg-white p-5 sm:p-6"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (!elegido) return setError("Elige qué bono se lleva.");
        const f = new FormData(ev.currentTarget);
        const nombre = String(f.get("nombre") ?? "").trim();
        if (nombre.length < 2) return setError("Escribe el nombre de quien lo compra.");
        setError(null);
        empezar(async () => {
          const r = await venderBono({
            productId: elegido,
            nombre,
            email: String(f.get("email") ?? "").trim(),
            paraQuien: String(f.get("paraQuien") ?? ""),
            mensaje: String(f.get("mensaje") ?? ""),
            metodo,
          });
          // Si salió bien, la acción ya ha redirigido a la ficha y aquí no llega nada.
          if (r && !r.ok) setError(r.error);
        });
      }}
    >
      <fieldset>
        <legend className="text-sm font-semibold text-tinta">Qué bono se lleva</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {productos.map((p) => (
            <label
              key={p.id}
              className={cn(
                "flex cursor-pointer flex-col rounded-2xl border bg-white p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-carmin/40",
                elegido === p.id ? "border-carmin bg-rosa-niebla/60 ring-1 ring-carmin" : "border-carmin/20 hover:bg-rosa-niebla/40",
              )}
            >
              <input
                type="radio"
                name="producto"
                value={p.id}
                checked={elegido === p.id}
                onChange={() => setElegido(p.id)}
                className="sr-only"
              />
              <span className="font-semibold text-tinta">{p.nombre}</span>
              <span className="text-sm text-gris">{incluye(p)}</span>
              {p.descripcion && <span className="mt-1 line-clamp-2 text-xs text-gris">{p.descripcion}</span>}
              <span className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-display text-xl font-semibold tabular-nums">{formatearEuros(p.precioCents)}</span>
                <span className={cn("text-xs", p.meses ? "font-semibold text-amber-800" : "text-gris")}>
                  {p.meses ? `Caduca a los ${p.meses} ${p.meses === 1 ? "mes" : "meses"}` : "No caduca"}
                </span>
              </span>
            </label>
          ))}
        </div>
        {producto?.meses && (
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
            Este bono caduca a los {producto.meses} {producto.meses === 1 ? "mes" : "meses"} de comprarlo. Díselo antes de cobrar.
          </p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-tinta">
          Quién lo compra
          <input name="nombre" required minLength={2} maxLength={80} autoComplete="off" className={campo} />
        </label>
        <label className="block text-sm font-semibold text-tinta">
          Su correo <span className="font-normal text-gris">(opcional)</span>
          <input name="email" type="email" inputMode="email" maxLength={200} autoComplete="off" className={campo} aria-describedby={`${id}-email`} />
          <span id={`${id}-email`} className={ayuda}>
            Para enviarle el bono con el QR. Sin correo, se lo enseñas en la pantalla.
          </span>
        </label>
        <label className="block text-sm font-semibold text-tinta">
          Para quién es <span className="font-normal text-gris">(opcional)</span>
          <input name="paraQuien" maxLength={80} autoComplete="off" className={campo} />
        </label>
        <label className="block text-sm font-semibold text-tinta sm:col-span-2">
          Dedicatoria <span className="font-normal text-gris">(opcional)</span>
          <textarea name="mensaje" maxLength={300} rows={2} className={cn(campo, "py-3")} />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-tinta">Cómo paga</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {([["card", "Tarjeta"], ["cash", "Efectivo"], ["bizum", "Bizum"]] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={metodo === v}
              onClick={() => setMetodo(v)}
              className={cn("min-h-11 rounded-full px-5 text-sm font-semibold ring-1", metodo === v ? "bg-carmin text-white ring-carmin" : "bg-white ring-carmin/20")}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gris">Es un registro para la gestión del salón; no es una factura.</p>
      </fieldset>

      <p role="status" aria-live="polite" className={error ? "rounded-2xl bg-white px-4 py-3 text-sm text-carmin ring-1 ring-carmin/30" : "sr-only"}>
        {error}
      </p>

      <button type="submit" disabled={pendiente} className="min-h-12 w-full rounded-full bg-carmin px-6 font-semibold text-white disabled:opacity-60 sm:w-auto">
        {pendiente ? "Creando el bono…" : producto ? `Cobrar ${formatearEuros(producto.precioCents)} y crear el bono` : "Crear el bono"}
      </button>
    </form>
  );
}
