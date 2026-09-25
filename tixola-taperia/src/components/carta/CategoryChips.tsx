"use client";

import { LayoutGroup, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { MenuCategory, MenuCategoryId } from "@/data/menu";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { CategoryFilter } from "./useMenuFilters";

/**
 * CategoryChips — chips de categorías de la carta, selección única.
 *
 *  [Toda la carta 38] [Sugerencias 3] [Croquetas 4] [Tixolas 5] …
 *
 *  - `aria-pressed` marca el chip activo; el fondo pimentón se desliza entre chips (framer `layoutId`).
 *  - Cada chip muestra el nº de platos que cumplen los filtros de contenido (búsqueda, alérgenos,
 *    etiquetas); los que quedan a cero se atenúan pero siguen siendo pulsables.
 *  - Móvil / tablet: fila con scroll horizontal (el chip activo se centra solo). Escritorio (lg): se
 *    envuelve en varias líneas si hace falta.
 */

export interface CategoryChipsProps {
  categories: MenuCategory[];
  selected: CategoryFilter;
  /** nº de platos por categoría que cumplen los filtros de contenido */
  counts: Record<MenuCategoryId, number>;
  /** nº de platos totales que cumplen los filtros de contenido (chip "Toda la carta") */
  allCount: number;
  onSelect: (id: CategoryFilter) => void;
  className?: string;
}

interface Chip {
  id: CategoryFilter;
  label: string;
  count: number;
}

const SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 } as const;

export default function CategoryChips({ categories, selected, counts, allCount, onSelect, className }: CategoryChipsProps) {
  const m = useMessages();
  const t = useFormat();
  const scrollerRef = useRef<HTMLDivElement>(null);

  /* Centra el chip activo cuando cambia y no está completamente a la vista (scroller móvil). */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const chip = scroller.querySelector<HTMLElement>(`[data-chip="${selected}"]`);
    if (!chip) return;
    const left = chip.offsetLeft;
    const right = left + chip.offsetWidth;
    const viewLeft = scroller.scrollLeft;
    const viewRight = viewLeft + scroller.clientWidth;
    if (left >= viewLeft + 12 && right <= viewRight - 12) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({
      left: Math.max(0, left - scroller.clientWidth / 2 + chip.offsetWidth / 2),
      behavior: reduce ? "auto" : "smooth",
    });
  }, [selected]);

  const chips: Chip[] = [
    { id: "all", label: m.carta.all, count: allCount },
    ...categories.map((c) => ({ id: c.id, label: c.label, count: counts[c.id] })),
  ];

  return (
    <nav aria-label={m.carta.categoriesAria} className={cn("relative min-w-0", className)}>
      {/* Desvanecidos laterales del scroller (solo cuando hay scroll horizontal) */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-4 z-10 w-4 bg-gradient-to-r from-iron-900/90 to-transparent sm:-left-6 sm:w-6 lg:hidden" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-iron-900/90 to-transparent lg:hidden" />

      <div
        ref={scrollerRef}
        className="no-scrollbar -ml-4 flex snap-x gap-2 overflow-x-auto py-2 pl-4 pr-8 sm:-ml-6 sm:pl-6 lg:ml-0 lg:flex-wrap lg:overflow-visible lg:pl-0 lg:pr-0"
      >
        <LayoutGroup id="carta-chips">
          {chips.map((chip) => {
            const active = chip.id === selected;
            const empty = chip.count === 0;
            return (
              <button
                key={chip.id}
                type="button"
                data-chip={chip.id}
                aria-pressed={active}
                onClick={() => onSelect(chip.id)}
                className={cn(
                  "relative inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 transition-colors duration-300 focus-visible:outline-offset-2",
                  active ? "border-transparent text-cream" : "border-cream/15 text-cream-muted hover:border-cream/40 hover:text-cream",
                  empty && !active && "opacity-50",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="carta-chip-active"
                    aria-hidden
                    transition={SPRING}
                    className="absolute inset-0 rounded-full border border-pimenton-light/70 bg-pimenton shadow-[0_0_22px_rgba(216,50,60,0.45)]"
                  />
                )}
                <span className="relative font-condensed text-lg uppercase leading-none tracking-wide">{chip.label}</span>
                <span
                  className={cn(
                    "relative min-w-[1.4rem] rounded-full px-1.5 py-px text-center font-sans text-[11px] font-semibold tabular-nums leading-4",
                    active ? "bg-cream/20 text-cream" : "bg-cream/[0.06] text-cream-faint",
                  )}
                  aria-label={t(m.carta.chipCount, { count: chip.count })}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </LayoutGroup>
      </div>
    </nav>
  );
}
