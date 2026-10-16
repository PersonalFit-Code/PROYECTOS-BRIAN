"use client";

import { Check, Gift, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Boton from "@/components/ui/Boton";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductoBono } from "@/lib/vouchers/catalogo";

/**
 * Tienda de bonos: se elige uno, se rellenan los datos y se abre el pago ALOJADO de Stripe
 * (`/api/bonos/checkout` devuelve la URL). La caducidad va en grande en cada tarjeta y otra vez en
 * la casilla de condiciones, ANTES de pagar: es lo que exige Consumo y lo que evita discusiones.
 */
const campo =
  "mt-1.5 block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px] text-tinta focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";

export default function TiendaBonos({ productos }: { productos: ProductoBono[] }) {
  const m = useMessages().bonos.tienda;
  const legal = useMessages().legal;
  const t = useFormat();
  const lp = useLocalePath();
  const locale = useLocale();
  const [elegido, setElegido] = useState<string | null>(productos.length === 1 ? (productos[0]?.id ?? null) : null);
  const [regalo, setRegalo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const producto = productos.find((p) => p.id === elegido) ?? null;
  const caducidad = (p: ProductoBono) => (p.mesesValidez ? t(m.caduca, { meses: p.mesesValidez }) : m.noCaduca);
  const contenido = (p: ProductoBono) =>
    p.tipo === "sessions"
      ? p.sesiones === 1
        ? m.sesion
        : t(m.sesiones, { n: p.sesiones ?? 0 })
      : t(m.tarjeta, { valor: formatCents(p.valorCents ?? 0) });

  const pagar = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!producto) return;
    const f = new FormData(ev.currentTarget);
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/bonos/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: producto.id,
          nombre: String(f.get("nombre") ?? ""),
          email: String(f.get("email") ?? ""),
          paraQuien: regalo ? String(f.get("paraQuien") ?? "") : "",
          mensaje: regalo ? String(f.get("mensaje") ?? "") : "",
          condiciones: f.get("condiciones") === "on",
          locale,
        }),
      });
      const datos = (await res.json().catch(() => null)) as { url?: string } | null;
      if (res.ok && datos?.url) {
        window.location.assign(datos.url);
        return;
      }
      setError(m.error);
    } catch {
      setError(m.error);
    }
    setEnviando(false);
  };

  return (
    <div className="space-y-10">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((p) => {
          const activo = p.id === elegido;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setElegido(p.id)}
                aria-pressed={activo}
                className={cn(
                  "flex h-full w-full flex-col rounded-3xl border bg-white p-6 text-left transition-[border-color,box-shadow]",
                  activo ? "border-carmin shadow-[var(--shadow-card)]" : "border-[var(--capa-borde)] hover:border-carmin/40",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-display text-xl font-semibold text-tinta">{p.nombre}</span>
                  {p.tipo === "gift" && <Gift aria-hidden className="size-5 shrink-0 text-carmin-suave" />}
                </span>
                <span className="mt-1 text-sm text-gris">{contenido(p)}</span>
                {p.descripcion && <span className="mt-3 text-sm text-tinta">{p.descripcion}</span>}
                <span className="mt-auto pt-5">
                  <span className="block font-display text-3xl font-semibold text-carmin">{formatCents(p.precioCents)}</span>
                  {/* La caducidad, grande y antes de pagar. */}
                  <span className="mt-2 inline-flex rounded-full bg-rosa-niebla px-3 py-1 text-sm font-semibold text-tinta">{caducidad(p)}</span>
                </span>
                <span className={cn("mt-4 inline-flex items-center gap-2 text-sm font-semibold", activo ? "text-carmin" : "text-gris")}>
                  {activo && <Check aria-hidden className="size-4" />}
                  {activo ? m.elegido : m.elegir}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {producto && (
        <form onSubmit={pagar} className="mx-auto max-w-xl space-y-4 rounded-3xl border border-[var(--capa-borde)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-2xl font-semibold text-tinta">{m.formTitle}</h2>
          <label className="block text-sm font-semibold text-tinta">
            {m.nombre}
            <input name="nombre" required minLength={2} maxLength={80} autoComplete="name" className={campo} />
          </label>
          <label className="block text-sm font-semibold text-tinta">
            {m.email}
            <input name="email" type="email" required autoComplete="email" className={campo} />
            <span className="mt-1 block text-xs font-normal text-gris">{m.emailHint}</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-tinta">
            <input type="checkbox" checked={regalo} onChange={(e) => setRegalo(e.target.checked)} className="size-5 accent-[#8e0e33]" />
            {m.regalo}
          </label>
          {regalo && (
            <>
              <label className="block text-sm font-semibold text-tinta">
                {m.paraQuien}
                <input name="paraQuien" maxLength={80} className={campo} />
              </label>
              <label className="block text-sm font-semibold text-tinta">
                {m.mensaje}
                <textarea name="mensaje" maxLength={300} rows={3} className={cn(campo, "py-3")} />
              </label>
            </>
          )}
          <label className="flex items-start gap-3 text-sm text-tinta">
            <input name="condiciones" type="checkbox" required className="mt-0.5 size-5 accent-[#8e0e33]" />
            <span>{t(m.condiciones, { caducidad: caducidad(producto).toLowerCase() })}</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-tinta">
            <input name="privacidad" type="checkbox" required className="mt-0.5 size-5 accent-[#8e0e33]" />
            <span>
              {m.privacidad}{" "}
              <Link href={lp(`/legal/${legal.privacy.slug}`)} target="_blank" className="font-semibold text-carmin underline underline-offset-2">
                {legal.privacy.title}
              </Link>
            </span>
          </label>
          {error && (
            <p role="alert" className="rounded-2xl bg-rosa-niebla px-4 py-3 text-sm text-carmin">
              {error}
            </p>
          )}
          <Boton type="submit" size="lg" className="w-full" disabled={enviando} icon={<Lock />}>
            {enviando ? m.redirigiendo : t(m.pagar, { precio: formatCents(producto.precioCents) })}
          </Boton>
          <p className="text-xs text-gris">{m.seguro}</p>
        </form>
      )}
    </div>
  );
}
