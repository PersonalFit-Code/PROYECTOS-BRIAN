"use client";

import { LayoutGroup, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MENU_CATEGORIES, type MenuCategoryId } from "@/data/menu";
import { cn } from "@/lib/utils";
import { categoryAnchorId } from "./CategorySection";

/**
 * CategoryNav — navegación por categorías de la carta.
 *
 *  - `variant="rail"`: raíl lateral pegajoso en escritorio (lg). Activa en crema con marcador rojo
 *    (framer `layoutId`, se desliza entre entradas), inactivas en crema apagado, con contador.
 *  - `variant="chips"`: barra horizontal de chips pegajosa bajo la cabecera en móvil/tablet, con
 *    desenfoque de fondo; el chip activo se centra automáticamente.
 *  - El elemento activo lo decide `useScrollSpy` (categoría visible) o la categoría enfocada.
 *  - Clic → scroll suave hasta el ancla de la sección (o cambio de categoría si hay una enfocada).
 */

export interface CategoryNavProps {
  variant: "rail" | "chips";
  activeId: MenuCategoryId;
  /** categoría enfocada por el filtro `cat=` (null = toda la carta) */
  focusedId: MenuCategoryId | null;
  /** nº de platos por categoría que cumplen los filtros de contenido */
  counts: Record<MenuCategoryId, number>;
  onSelect: (id: MenuCategoryId) => void;
  onShowAll: () => void;
  className?: string;
}

const SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 } as const;

export default function CategoryNav({ variant, activeId, focusedId, counts, onSelect, onShowAll, className }: CategoryNavProps) {
  return variant === "rail" ? (
    <RailNav activeId={activeId} focusedId={focusedId} counts={counts} onSelect={onSelect} onShowAll={onShowAll} className={className} />
  ) : (
    <ChipNav activeId={activeId} focusedId={focusedId} counts={counts} onSelect={onSelect} onShowAll={onShowAll} className={className} />
  );
}

type VariantProps = Omit<CategoryNavProps, "variant">;

/* ───────────────────────── Raíl lateral (lg) ───────────────────────── */

function RailNav({ activeId, focusedId, counts, onSelect, onShowAll, className }: VariantProps) {
  return (
    <nav aria-label="Categorías de la carta" className={cn("carta-no-print", className)}>
      <p className="mb-4 pl-4 font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-cream-faint">Categorías</p>
      <LayoutGroup id="carta-rail">
        <ul className="relative flex flex-col">
          {MENU_CATEGORIES.map((cat) => {
            const active = cat.id === activeId;
            const count = counts[cat.id];
            return (
              <li key={cat.id} className="relative">
                {active && (
                  <motion.span
                    layoutId="carta-rail-marker"
                    aria-hidden
                    transition={SPRING}
                    className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-pimenton-light shadow-[0_0_14px_rgba(216,50,60,0.9)]"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onSelect(cat.id)}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "group flex w-full items-center justify-between gap-3 rounded-r-lg py-2.5 pl-4 pr-3 text-left transition-colors duration-300",
                    active ? "text-cream" : "text-cream-muted hover:text-cream",
                    count === 0 && !active && "opacity-50",
                  )}
                >
                  <span className={cn("font-condensed text-2xl uppercase leading-none tracking-wide transition-transform duration-300", active && "translate-x-1")}>
                    {cat.label}
                  </span>
                  <span
                    className={cn(
                      "min-w-[1.75rem] rounded-full border px-1.5 py-0.5 text-center font-sans text-[11px] font-semibold tabular-nums transition-colors",
                      active ? "border-pimenton-light/60 bg-pimenton/25 text-cream" : "border-cream/10 text-cream-faint group-hover:border-cream/30",
                    )}
                    aria-label={`${count} platos`}
                  >
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>

      {focusedId && (
        <button
          type="button"
          onClick={onShowAll}
          className="mt-5 ml-4 inline-flex h-10 items-center gap-2 rounded-full border border-cream/20 px-4 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:border-cream/50 hover:text-cream"
        >
          Ver toda la carta
        </button>
      )}

      <div className="divider-iron mt-8 ml-4" />
      <p className="mt-4 ml-4 max-w-[180px] text-xs leading-relaxed text-cream-faint">
        Precios orientativos, IVA incluido. Pregunta por la pizarra del día.
      </p>
    </nav>
  );
}

/* ───────────────────────── Barra de chips (móvil / tablet) ───────────────────────── */

function ChipNav({ activeId, focusedId, counts, onSelect, onShowAll, className }: VariantProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  /* Centra el chip activo cuando cambia (scroll-spy o clic). */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const chip = scroller.querySelector<HTMLElement>(`[data-chip="${activeId}"]`);
    if (!chip) return;
    const target = chip.offsetLeft - scroller.clientWidth / 2 + chip.offsetWidth / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ left: Math.max(0, target), behavior: reduce ? "auto" : "smooth" });
  }, [activeId]);

  return (
    <nav
      aria-label="Categorías de la carta"
      className={cn(
        "carta-no-print sticky top-[var(--header-h)] z-30 border-b border-cream/10 bg-iron/80 backdrop-blur-xl supports-[backdrop-filter]:bg-iron/65",
        className,
      )}
    >
      <div className="relative">
        {/* Desvanecidos laterales */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-iron/90 to-transparent" />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-iron/90 to-transparent" />

        <div ref={scrollerRef} className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
          <LayoutGroup id="carta-chips">
            {focusedId && (
              <button
                type="button"
                onClick={onShowAll}
                className="inline-flex h-10 shrink-0 snap-start items-center rounded-full border border-cream/25 px-4 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:text-cream"
              >
                Toda la carta
              </button>
            )}
            {MENU_CATEGORIES.map((cat) => {
              const active = cat.id === activeId;
              const count = counts[cat.id];
              return (
                <button
                  key={cat.id}
                  type="button"
                  data-chip={cat.id}
                  onClick={() => onSelect(cat.id)}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "relative inline-flex h-10 shrink-0 snap-start items-center gap-2 rounded-full border px-4 transition-colors duration-300",
                    active ? "border-transparent text-cream" : "border-cream/15 text-cream-muted hover:border-cream/40 hover:text-cream",
                    count === 0 && !active && "opacity-50",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="carta-chip-marker"
                      aria-hidden
                      transition={SPRING}
                      className="absolute inset-0 rounded-full border border-pimenton-light/70 bg-pimenton/30 shadow-[0_0_20px_rgba(216,50,60,0.45)]"
                    />
                  )}
                  <span className="relative font-condensed text-lg uppercase leading-none tracking-wide">{cat.label}</span>
                  <span className="relative font-sans text-[11px] font-semibold tabular-nums text-cream-faint" aria-label={`${count} platos`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </LayoutGroup>
        </div>
      </div>
    </nav>
  );
}

/* ───────────────────────── Scroll‑spy ───────────────────────── */

/**
 * Devuelve el id de la categoría cuya sección está bajo la línea de lectura
 * (`offset` px desde el borde superior del viewport). Escucha scroll/resize con rAF.
 * `forced` (categoría enfocada) tiene prioridad y desactiva la escucha.
 */
export function useScrollSpy(ids: MenuCategoryId[], offset: number, forced: MenuCategoryId | null): MenuCategoryId {
  const [active, setActive] = useState<MenuCategoryId>(ids[0] ?? "sugerencias");
  const idsKey = ids.join(",");

  useEffect(() => {
    if (forced) return;
    const list = idsKey.split(",").filter(Boolean) as MenuCategoryId[];
    if (!list.length) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      let current = list[0];
      // Al final de la página, la última categoría con sección es la activa.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        current = list[list.length - 1];
      } else {
        for (const id of list) {
          const el = document.getElementById(categoryAnchorId(id));
          if (!el) continue;
          if (el.getBoundingClientRect().top - offset <= 0) current = id;
          else break;
        }
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [idsKey, offset, forced]);

  return forced ?? active;
}
