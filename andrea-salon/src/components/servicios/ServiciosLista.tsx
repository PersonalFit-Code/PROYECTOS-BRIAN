"use client";

import { useRef } from "react";
import { Clock } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { formatCents } from "@/lib/format";
import { urlFor } from "@/lib/hosts";
import { cn } from "@/lib/utils";
import type { CategoriaServicio, Servicio } from "./types";

const ORDEN: readonly CategoriaServicio[] = ["manos", "pies", "mirada"];

function TarjetaServicio({ s }: { s: Servicio }) {
  const m = useMessages();
  const t = useFormat();
  const c = m.servicios.card;
  const precio =
    s.precioCents === null ? null : s.precioDesde ? t(c.from, { price: formatCents(s.precioCents) }) : formatCents(s.precioCents);
  return (
    <li data-reveal className="glass-alta group relative flex flex-col rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-semibold leading-tight text-tinta sm:text-2xl">{s.nombre}</h3>
        <span className="shrink-0 text-right">
          {precio ? (
            <span className="font-display text-xl font-semibold text-carmin">{precio}</span>
          ) : (
            <span className="rounded-full bg-rosa px-2.5 py-1 text-[11px] font-semibold text-carmin">{m.common.misc.priceOnRequest}</span>
          )}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gris text-pretty">{s.descripcion}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gris">
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden className="size-3.5 text-carmin-suave" />
          {t(c.duration, { minutes: s.duracionMin })}
        </span>
        {s.pendiente ? <span className="inline-flex items-center gap-1.5 text-carmin-suave">· {m.common.misc.pending}</span> : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-carmin/10 pt-4">
        {s.reservableOnline ? (
          <Boton href={urlFor("reservar", `/?servicio=${s.slug}`)} size="sm" aria-label={t(c.bookAria, { name: s.nombre })}>
            {c.book}
          </Boton>
        ) : (
          <span className="text-sm text-gris">{c.notOnline}</span>
        )}
      </div>
    </li>
  );
}

/**
 * Lista de servicios en tarjetas. Recibe los datos por props (fixture hoy, DB mañana). Con
 * `grouped` (por defecto) agrupa por categoría con un título por grupo; la portada lo apaga y
 * pinta la selección en una sola rejilla.
 */
export default function ServiciosLista({ servicios, grouped = true, className }: { servicios: readonly Servicio[]; grouped?: boolean; className?: string }) {
  const m = useMessages();
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  const grupos = grouped
    ? ORDEN.map((cat) => ({ cat, items: servicios.filter((s) => s.categoria === cat) })).filter((g) => g.items.length)
    : [{ cat: null, items: servicios }];

  return (
    <div ref={ref} className={cn("space-y-12", className)}>
      {grupos.map(({ cat, items }) => (
        <section key={cat ?? "todos"} aria-labelledby={cat ? `cat-${cat}` : undefined}>
          {cat ? (
            <h2 id={`cat-${cat}`} data-reveal className="mb-5 font-display text-2xl font-semibold text-tinta sm:text-3xl">
              {m.servicios.categories[cat]}
            </h2>
          ) : null}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <TarjetaServicio key={s.id} s={s} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
