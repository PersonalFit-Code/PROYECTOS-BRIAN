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

/** Una fila de la carta de servicios: nombre en Bodoni y precio a la derecha, como una carta de perfumería. */
function TarjetaServicio({ s }: { s: Servicio }) {
  const m = useMessages();
  const t = useFormat();
  const c = m.servicios.card;
  const precio =
    s.precioCents === null ? null : s.precioDesde ? t(c.from, { price: formatCents(s.precioCents) }) : formatCents(s.precioCents);
  return (
    <li data-reveal className="grid gap-x-8 gap-y-3 border-b border-nude py-7 sm:grid-cols-[1fr_auto] sm:items-start">
      <div>
        <h3 className="titulo-editorial text-xl text-tinta sm:text-2xl">{s.nombre}</h3>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-gris text-pretty">{s.descripcion}</p>
        <p className="etiqueta mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-carmin-suave">
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-3" />
            {t(c.duration, { minutes: s.duracionMin })}
          </span>
          {s.pendiente ? <span>· {m.common.misc.pending}</span> : null}
        </p>
      </div>
      <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
        <span className="font-display text-2xl text-tinta">{precio ?? m.common.misc.priceOnRequest}</span>
        {s.reservableOnline ? (
          <Boton href={urlFor("reservar", `/?servicio=${s.slug}`)} size="sm" variant="secundario" aria-label={t(c.bookAria, { name: s.nombre })}>
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
 * Carta de servicios, en filas separadas por filetes. Recibe los datos por props (fixture hoy, DB mañana). Con
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
    <div ref={ref} className={cn("space-y-16", className)}>
      {grupos.map(({ cat, items }) => (
        <section key={cat ?? "todos"} aria-labelledby={cat ? `cat-${cat}` : undefined}>
          {cat ? (
            <h2 id={`cat-${cat}`} data-reveal className="etiqueta mb-2 scroll-mt-28 text-carmin-suave">
              {m.servicios.categories[cat]}
            </h2>
          ) : null}
          <ul className="border-t border-grafito/80">
            {items.map((s) => (
              <TarjetaServicio key={s.id} s={s} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
