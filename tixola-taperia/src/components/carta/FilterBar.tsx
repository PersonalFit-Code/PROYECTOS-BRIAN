"use client";

import { motion } from "framer-motion";
import { BookOpen, Check, Eraser, Flame, Leaf, Search, SlidersHorizontal, Sprout, Star, WheatOff, X, type LucideProps } from "lucide-react";
import { useCallback, useId, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import AllergenIcon from "@/components/ui/AllergenIcon";
import type { Allergen, AllergenId } from "@/data/allergens";
import type { DietTag, MenuCategory } from "@/data/menu";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import CategoryChips from "./CategoryChips";
import { CARTA_CONTAINER } from "./layout";
import { FILTERABLE_TAGS, type CategoryFilter, type MenuFilterResult, type MenuFilters } from "./useMenuFilters";

/**
 * FilterBar — barra pegajosa bajo la cabecera con la navegación principal de la carta.
 *
 *  Fila principal:  [chips de categorías …]            [búsqueda (lg)] [Filtros ●2]
 *  Panel plegable:  búsqueda (móvil) · Preferencias (chips dietéticos) · Excluir alérgenos (14 toggles)
 *                   · enlace a la leyenda · Limpiar filtros · "Ver N platos" (cierra el panel).
 *
 *  - Sticky bajo el navbar (`top: var(--header-h)`), cristal ahumado a sangre.
 *  - El panel se anima en altura con framer-motion (0 ⇄ auto); permanece montado con `inert`
 *    cuando está cerrado para que `aria-controls` siempre apunte a un nodo real.
 *  - Contador de resultados en una región `aria-live` (sr-only) que anuncia "12 platos encontrados".
 *  - Escape cierra el panel y devuelve el foco al botón "Filtros".
 */

export interface FilterBarProps {
  filters: MenuFilters;
  results: MenuFilterResult;
  categories: MenuCategory[];
  /** alérgenos ya localizados (`localizeAllergens(locale)`) */
  allergens: Allergen[];
  /** etiquetas dietéticas ya localizadas (`localizeDietTags(locale)`) */
  dietTags: Record<DietTag, string>;
  onSelectCategory: (id: CategoryFilter) => void;
  onQueryChange: (query: string) => void;
  onToggleTag: (tag: DietTag) => void;
  onToggleAllergen: (id: AllergenId) => void;
  /** limpia búsqueda, etiquetas y alérgenos (mantiene la categoría) */
  onClear: () => void;
  onOpenLegend: () => void;
  className?: string;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const TAG_ICONS: Record<DietTag, ComponentType<LucideProps>> = {
  vegano: Leaf,
  vegetariano: Sprout,
  "sin-gluten": WheatOff,
  picante: Flame,
  estrella: Star,
  nuevo: Star,
};

const TAG_ICON_COLOR: Record<DietTag, string> = {
  vegano: "text-emerald-300",
  vegetariano: "text-lime-300",
  "sin-gluten": "text-gold",
  picante: "text-ember",
  estrella: "text-gold",
  nuevo: "text-cream",
};

/* ───────────────────────── Campo de búsqueda ───────────────────────── */

interface SearchFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function SearchField({ id, value, onChange, className }: SearchFieldProps) {
  const m = useMessages();
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {m.carta.searchLabel}
      </label>
      <Search size={17} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-faint" />
      <input
        id={id}
        type="search"
        inputMode="search"
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={m.carta.search}
        className="h-11 w-full rounded-full border border-cream/15 bg-iron/60 pl-10 pr-11 text-[15px] text-cream placeholder:text-cream-faint transition-colors focus:border-pimenton-light/70 focus:bg-iron/80 focus:outline-none focus:ring-2 focus:ring-pimenton-light/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={m.carta.searchClear}
          className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
        >
          <X size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── Barra ───────────────────────── */

export default function FilterBar({
  filters,
  results,
  categories,
  allergens,
  dietTags,
  onSelectCategory,
  onQueryChange,
  onToggleTag,
  onToggleAllergen,
  onClear,
  onOpenLegend,
  className,
}: FilterBarProps) {
  const m = useMessages();
  const t = useFormat();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const searchBarId = useId();
  const searchPanelId = useId();

  const badge = results.contentCount;

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape" && open) {
        e.stopPropagation();
        close();
      }
    },
    [open, close],
  );

  return (
    <div className={cn("sticky top-[var(--header-h)] z-30", className)} onKeyDown={onKeyDown}>
      <div className="glass-smoke border-x-0 border-y border-cream/10 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]">
        <div className={CARTA_CONTAINER}>
          {/* ── Fila principal ── */}
          <div className="flex items-center gap-3">
            <CategoryChips
              className="min-w-0 flex-1"
              categories={categories}
              selected={filters.category}
              counts={results.counts}
              allCount={results.allCount}
              onSelect={onSelectCategory}
            />

            <div className="flex shrink-0 items-center gap-2 py-2">
              <SearchField id={searchBarId} value={filters.query} onChange={onQueryChange} className="hidden w-60 lg:block xl:w-72" />

              <button
                ref={toggleRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={open ? m.carta.filtersClose : m.carta.filtersOpen}
                className={cn(
                  "relative inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-300",
                  open || badge > 0 ? "border-pimenton-light/70 bg-pimenton/20 text-cream" : "border-cream/20 text-cream-muted hover:border-cream/45 hover:text-cream",
                )}
              >
                <SlidersHorizontal size={16} aria-hidden />
                <span>{m.carta.filters}</span>
                {badge > 0 && (
                  <span
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pimenton-light px-1.5 text-[11px] font-bold tabular-nums text-cream"
                    aria-label={t(m.carta.filtersActive, { count: badge })}
                  >
                    {badge}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Contador para lectores de pantalla */}
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {t(m.carta.resultsLive, { count: results.total })}
          </p>

          {/* ── Panel plegable ── */}
          <motion.div
            id={panelId}
            initial={false}
            animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            aria-hidden={!open || undefined}
            inert={!open || undefined}
            className="overflow-hidden"
          >
            <section aria-label={m.carta.filtersAria} className="max-h-[min(64dvh,600px)] overflow-y-auto overscroll-contain pb-4 pt-1">
              <div className="flex flex-col gap-5 border-t border-cream/10 pt-4">
                {/* Búsqueda (móvil / tablet) */}
                <SearchField id={searchPanelId} value={filters.query} onChange={onQueryChange} className="lg:hidden" />

                {/* Preferencias dietéticas */}
                <div>
                  <p className="mb-2.5 font-caps text-[11px] uppercase tracking-[0.3em] text-cream-faint">{m.carta.preferences}</p>
                  <ul className="flex flex-wrap gap-2" aria-label={m.carta.preferencesAria}>
                    {FILTERABLE_TAGS.map((tag) => {
                      const Icon = TAG_ICONS[tag];
                      const pressed = filters.tags.includes(tag);
                      return (
                        <li key={tag}>
                          <button
                            type="button"
                            aria-pressed={pressed}
                            onClick={() => onToggleTag(tag)}
                            className={cn(
                              "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-300",
                              pressed
                                ? "border-pimenton-light/80 bg-pimenton/30 text-cream shadow-[0_0_18px_rgba(216,50,60,0.4)]"
                                : "border-cream/15 text-cream-muted hover:border-cream/40 hover:text-cream",
                            )}
                          >
                            <Icon size={15} strokeWidth={2.3} aria-hidden className={TAG_ICON_COLOR[tag]} />
                            {dietTags[tag]}
                            {pressed && <Check size={14} strokeWidth={3} aria-hidden className="text-pimenton-a11y" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Excluir alérgenos */}
                <div>
                  <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-caps text-[11px] uppercase tracking-[0.3em] text-cream-faint">{m.carta.excludeAllergens}</p>
                    <p className="text-xs text-cream-faint">
                      {filters.excludedAllergens.length > 0
                        ? t(m.carta.hidingAllergens, { count: filters.excludedAllergens.length })
                        : m.carta.excludeAllergensHint}
                    </p>
                  </div>
                  <ul className="flex flex-wrap gap-2" aria-label={m.carta.excludeAllergensAria}>
                    {allergens.map((a) => {
                      const pressed = filters.excludedAllergens.includes(a.id);
                      const name = a.label.toLowerCase();
                      return (
                        <li key={a.id}>
                          <button
                            type="button"
                            aria-pressed={pressed}
                            aria-label={pressed ? t(m.carta.includeOne, { name }) : t(m.carta.excludeOne, { name })}
                            title={a.description}
                            onClick={() => onToggleAllergen(a.id)}
                            className={cn(
                              "relative inline-flex h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition-all duration-300",
                              pressed
                                ? "border-pimenton-light/80 bg-pimenton/20 shadow-[0_0_16px_rgba(216,50,60,0.35)]"
                                : "border-cream/10 hover:border-cream/35 hover:bg-cream/5",
                            )}
                          >
                            <AllergenIcon id={a.id} size="sm" active={pressed} />
                            <span className={cn("text-sm", pressed ? "text-cream line-through decoration-pimenton-light decoration-2" : "text-cream-muted")}>
                              {a.label}
                            </span>
                            {pressed && (
                              <span
                                aria-hidden
                                className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-pimenton-light text-cream shadow-[0_0_10px_rgba(216,50,60,0.8)]"
                              >
                                <X size={10} strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap items-center gap-2 border-t border-cream/10 pt-4">
                  <button
                    type="button"
                    onClick={onOpenLegend}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-cream/20 px-4 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:border-cream/50 hover:text-cream"
                  >
                    <BookOpen size={15} aria-hidden className="text-pimenton-light" />
                    {m.carta.legend}
                  </button>
                  {badge > 0 && (
                    <button
                      type="button"
                      onClick={onClear}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-cream/20 px-4 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:border-pimenton-light hover:bg-pimenton/20 hover:text-cream"
                    >
                      <Eraser size={14} aria-hidden />
                      {m.carta.clear}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={close}
                    className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-pimenton px-5 text-xs font-bold uppercase tracking-wider text-cream transition-colors hover:bg-pimenton-light"
                  >
                    <Check size={15} strokeWidth={2.6} aria-hidden />
                    {t(m.carta.showResults, { count: results.total })}
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
