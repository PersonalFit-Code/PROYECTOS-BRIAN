"use client";

import { motion } from "framer-motion";
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
      {/* Los desvanecidos de los lados son una MÁSCARA del propio scroller y no dos degradados
          pintados encima: sobre el cristal de la cápsula, un degradado de color se veía como una
          franja más oscura con canto recto. La máscara hace transparentes las chapas que se van, y
          detrás se ve el cristal tal cual. */}
      <div
        ref={scrollerRef}
        className="no-scrollbar -ml-4 flex snap-x gap-2 overflow-x-auto py-2 pl-4 pr-8 [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%-40px),transparent)] sm:-ml-6 sm:pl-6 lg:ml-0 lg:flex-wrap lg:overflow-visible lg:pl-0 lg:pr-0 lg:[mask-image:none]"
      >
        {/* Sin `LayoutGroup`: `layoutId` ya comparte contexto de layout a nivel de aplicación y en la
            página solo existe UNA fila de chips, así que el grupo no aportaba nada y sí un contexto
            más que atravesar en cada render de los 9 chips. */}
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
                "pulsable relative inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 focus-visible:outline-offset-2",
                active ? "border-transparent text-cream" : "border-cream/15 text-cream-muted hover:border-cream/40 hover:text-cream",
                empty && !active && "opacity-50",
              )}
            >
              {active && (
                <motion.span
                  layoutId="carta-chip-active"
                  aria-hidden
                  transition={SPRING}
                  /* Solo sombras INTERIORES: esta fila es `overflow-x-auto`, y un resplandor exterior
                     quedaba recortado por el scroller y dibujaba un recuadro de cantos rectos detrás
                     de la chapa. El brillo va hacia dentro y el filo de luz arriba, como el cristal. */
                  className="absolute inset-0 rounded-full border border-pimenton-light/70 bg-pimenton shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_0_14px_rgba(232,86,90,0.55)]"
                />
              )}
              <span className="relative font-condensed text-lg uppercase leading-none tracking-wide">{chip.label}</span>
              {/* ARIA 1.2 no permite nombrar un <span> genérico: el número queda decorativo y el
                  texto completo viaja en un `sr-only` dentro del propio botón. */}
              <span
                aria-hidden
                className={cn(
                  "relative min-w-[1.4rem] rounded-full px-1.5 py-px text-center font-sans text-[11px] font-semibold tabular-nums leading-4",
                  active ? "bg-cream/20 text-cream" : "bg-cream/[0.06] text-cream-faint",
                )}
              >
                {chip.count}
              </span>
              <span className="sr-only">{t(m.carta.chipCount, { count: chip.count })}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
