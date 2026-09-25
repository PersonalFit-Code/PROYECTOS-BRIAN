"use client";

import { AnimatePresence, motion, useInView, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Eraser, Focus, LayoutList } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MenuCategory, MenuCategoryId, MenuItem } from "@/data/menu";
import { cn } from "@/lib/utils";
import MenuItemCard from "./MenuItemCard";

/**
 * CategorySection — una categoría de la carta.
 *
 *  - Cabecera: kicker rojo, título enorme en Bebas Neue con color "tiza", descripción y contador.
 *  - Escritorio (lg): fila horizontal con scroll‑snap (estilo RavioXO), flechas anterior/siguiente
 *    y sombras de desplazamiento en los bordes. Móvil: pila vertical a ancho completo.
 *  - "Sugerencias" se pinta como una pizarra real: panel con borde de tiza, ligera rotación.
 *  - Revelado al hacer scroll (una sola vez). Las secciones que ya están en pantalla al cargar
 *    no se animan, para que el cambio fallback → cliente no produzca parpadeos.
 *  - Estado vacío "Sin resultados con estos filtros" cuando los filtros dejan la sección a cero.
 */

export const categoryAnchorId = (id: MenuCategoryId) => `cat-${id}`;

export interface CategorySectionProps {
  category: MenuCategory;
  items: MenuItem[];
  /** nº de platos de la categoría sin filtrar */
  total: number;
  /** la categoría está enfocada (filtro `cat=`) */
  focused: boolean;
  highlightedId: string | null;
  /** animaciones de layout / revelado (false en tier "low" o reduced motion) */
  animations: boolean;
  onFocus: (id: MenuCategoryId) => void;
  onShowAll: () => void;
  onClearFilters: () => void;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const REVEAL: Variants = {
  hidden: { opacity: 0, y: 36, transition: { duration: 0 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_OUT_EXPO } },
};

export default function CategorySection({
  category,
  items,
  total,
  focused,
  highlightedId,
  animations,
  onFocus,
  onShowAll,
  onClearFilters,
}: CategorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const chalkboard = category.id === "sugerencias";
  const empty = items.length === 0;
  const headingId = `${categoryAnchorId(category.id)}-title`;

  /* ── Revelado: solo se oculta (en el siguiente frame) si la sección está fuera de pantalla ── */
  const [deferred, setDeferred] = useState(false);
  const inView = useInView(sectionRef, { once: true, amount: 0.12 });
  useEffect(() => {
    if (!animations) return;
    const raf = requestAnimationFrame(() => {
      const el = sectionRef.current;
      if (!el) return;
      const { top } = el.getBoundingClientRect();
      if (top > window.innerHeight * 0.92) setDeferred(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [animations]);
  const revealState = deferred && !inView ? "hidden" : "visible";

  /* ── Fila horizontal (lg): sombras de borde y flechas ── */
  const rowRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measureEdges = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const next = { start: row.scrollLeft > 8, end: max - row.scrollLeft > 8 };
    setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(measureEdges);
    ro.observe(row);
    for (const child of Array.from(row.children)) ro.observe(child);
    return () => ro.disconnect();
  }, [measureEdges, items.length]);

  const scrollByCards = useCallback((direction: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector<HTMLElement>(".carta-card");
    const step = card ? card.offsetWidth + 20 : row.clientWidth * 0.8;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollBy({ left: direction * step, behavior: reduce ? "auto" : "smooth" });
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      id={categoryAnchorId(category.id)}
      aria-labelledby={headingId}
      data-category={category.id}
      initial={false}
      animate={revealState}
      variants={REVEAL}
      className={cn(
        "carta-section relative scroll-mt-[calc(var(--header-h)+72px)] lg:scroll-mt-[calc(var(--header-h)+24px)]",
        chalkboard
          ? "rounded-3xl border-2 border-dashed border-cream/25 bg-iron-900/60 p-5 shadow-card md:p-8 lg:-rotate-[0.4deg] lg:p-10"
          : "",
      )}
    >
      {chalkboard && (
        <>
          {/* Marco interior de tiza + "chincheta" */}
          <span aria-hidden className="pointer-events-none absolute inset-2 rounded-[1.25rem] border border-cream/10" />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-pimenton-light shadow-[0_0_16px_rgba(216,50,60,0.8),inset_0_-2px_3px_rgba(0,0,0,0.5)]"
          />
        </>
      )}

      {/* Cabecera de categoría */}
      <header className="relative mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-pimenton-a11y">
            <span aria-hidden className="h-px w-6 bg-pimenton-light/70" />
            {category.kicker}
          </p>
          <h2
            id={headingId}
            className={cn(
              "font-condensed text-5xl uppercase leading-[0.92] tracking-wide text-cream-200 md:text-6xl lg:text-7xl",
              "[text-shadow:0_0_1px_rgba(249,246,240,0.5),0_0_24px_rgba(249,246,240,0.12),0_12px_30px_rgba(0,0,0,0.6)]",
            )}
          >
            {category.label}
            <span className="ml-3 align-top font-sans text-xs font-semibold tracking-[0.2em] text-cream-faint" aria-label={`${items.length} de ${total} platos`}>
              {items.length}/{total}
            </span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream-muted md:text-base">{category.description}</p>
        </div>

        <div className="carta-no-print flex items-center gap-2 md:shrink-0">
          {/* Enfocar / ver toda la carta */}
          {focused ? (
            <button
              type="button"
              onClick={onShowAll}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-cream/20 px-4 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:border-cream/50 hover:text-cream"
            >
              <LayoutList size={15} aria-hidden />
              Ver toda la carta
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onFocus(category.id)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-cream/15 px-4 text-xs font-semibold uppercase tracking-wider text-cream-faint transition-colors hover:border-pimenton-light/60 hover:text-cream"
              aria-label={`Ver solo ${category.label}`}
            >
              <Focus size={15} aria-hidden />
              Solo esta
            </button>
          )}

          {/* Flechas (solo escritorio, cuando hay fila) */}
          {!empty && (
            <div className="hidden items-center gap-1.5 lg:flex" role="group" aria-label={`Desplazar ${category.label}`}>
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                disabled={!edges.start}
                aria-label="Platos anteriores"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream transition-all hover:border-pimenton-light hover:bg-pimenton/20 disabled:cursor-default disabled:opacity-30 disabled:hover:border-cream/20 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                disabled={!edges.end}
                aria-label="Platos siguientes"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream transition-all hover:border-pimenton-light hover:bg-pimenton/20 disabled:cursor-default disabled:opacity-30 disabled:hover:border-cream/20 disabled:hover:bg-transparent"
              >
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Platos */}
      <div className="relative">
        {/* Sombras de desplazamiento (lg) */}
        <span
          aria-hidden
          className={cn(
            "carta-no-print pointer-events-none absolute inset-y-0 -left-2 z-10 hidden w-16 bg-gradient-to-r from-iron via-iron/70 to-transparent transition-opacity duration-500 lg:block",
            edges.start ? "opacity-90" : "opacity-0",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "carta-no-print pointer-events-none absolute inset-y-0 -right-2 z-10 hidden w-20 bg-gradient-to-l from-iron via-iron/70 to-transparent transition-opacity duration-500 lg:block",
            edges.end ? "opacity-90" : "opacity-0",
          )}
        />

        {empty ? (
          <EmptyState onClear={onClearFilters} chalk={chalkboard} />
        ) : (
          <ul
            ref={rowRef}
            onScroll={measureEdges}
            aria-label={category.label}
            className={cn(
              "carta-row flex flex-col gap-4",
              "lg:-mx-2 lg:snap-x lg:snap-mandatory lg:flex-row lg:items-stretch lg:gap-5 lg:overflow-x-auto lg:overscroll-x-contain lg:scroll-px-2 lg:px-2 lg:py-4 lg:no-scrollbar",
            )}
          >
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  variant={chalkboard ? "chalk" : "glass"}
                  highlighted={highlightedId === item.id}
                  layoutAnimations={animations}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </motion.section>
  );
}

/* ───────────────────────── Estado vacío ───────────────────────── */

function EmptyState({ onClear, chalk }: { onClear: () => void; chalk: boolean }) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center",
        chalk ? "border-cream/20 bg-iron-900/40" : "border-cream/15 bg-iron/40",
      )}
    >
      <span aria-hidden className="text-3xl opacity-60">
        🍽️
      </span>
      <p className="font-condensed text-2xl uppercase tracking-wide text-cream-muted">Sin resultados con estos filtros</p>
      <p className="max-w-sm text-sm text-cream-faint">Prueba a quitar algún alérgeno o etiqueta: seguro que hay algo en la tixola para ti.</p>
      <button
        type="button"
        onClick={onClear}
        className="carta-no-print mt-1 inline-flex h-10 items-center gap-2 rounded-full border border-cream/20 px-4 text-xs font-semibold uppercase tracking-wider text-cream transition-colors hover:border-pimenton-light hover:bg-pimenton/20"
      >
        <Eraser size={14} aria-hidden />
        Limpiar filtros
      </button>
    </div>
  );
}
