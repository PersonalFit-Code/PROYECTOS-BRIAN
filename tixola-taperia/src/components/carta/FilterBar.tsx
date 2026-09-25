"use client";

import { Eraser, Flame, Leaf, Search, SlidersHorizontal, Sprout, Star, WheatOff, X, type LucideProps } from "lucide-react";
import { useId, useState, type ComponentType } from "react";
import AllergenIcon from "@/components/ui/AllergenIcon";
import { ALLERGENS, type AllergenId } from "@/data/allergens";
import { DIET_TAG_LABELS, type DietTag } from "@/data/menu";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { FILTERABLE_TAGS, formatResultCount, type MenuFilters } from "./useMenuFilters";

/**
 * FilterBar — búsqueda, etiquetas dietéticas y exclusión de alérgenos.
 *
 *  - Búsqueda con etiqueta accesible (sr-only), icono y botón de borrar.
 *  - Chips de etiquetas (`aria-pressed`): Vegano, Vegetariano, Sin gluten, Picante, Plato estrella.
 *  - "Excluir alérgenos": fila de 14 botones AllergenIcon (etiqueta visible en md+) con estado activo
 *    (anillo + aspa roja: el alérgeno queda fuera de la carta).
 *  - Contador "23 platos" + región `aria-live` que anuncia "23 platos encontrados".
 *  - En móvil, etiquetas y alérgenos viven en un panel plegable "Filtros" con badge numérico.
 *    El plegado se anima con `grid-template-rows` (puro CSS, sin parpadeo de hidratación).
 */

export interface FilterBarProps {
  filters: MenuFilters;
  resultCount: number;
  activeCount: number;
  onQueryChange: (query: string) => void;
  onToggleTag: (tag: DietTag) => void;
  onToggleAllergen: (id: AllergenId) => void;
  onClear: () => void;
  className?: string;
}

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

export default function FilterBar({
  filters,
  resultCount,
  activeCount,
  onQueryChange,
  onToggleTag,
  onToggleAllergen,
  onClear,
  className,
}: FilterBarProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const searchId = useId();
  const panelId = useId();

  const panelFilters = filters.tags.length + filters.excludedAllergens.length;
  const collapsed = isMobile && !open;

  return (
    <section aria-label="Filtros de la carta" className={cn("carta-no-print glass rounded-3xl p-4 md:p-6", className)}>
      {/* ── Fila superior: búsqueda · botón Filtros (móvil) · contador · limpiar ── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <label htmlFor={searchId} className="sr-only">
            Buscar en la carta
          </label>
          <Search size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream-faint" />
          <input
            id={searchId}
            type="search"
            inputMode="search"
            autoComplete="off"
            enterKeyHint="search"
            value={filters.query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Busca un plato: zamburiñas, croquetas, godello…"
            className="h-12 w-full rounded-full border border-cream/15 bg-iron/60 pl-11 pr-11 text-[15px] text-cream placeholder:text-cream-faint transition-colors focus:border-pimenton-light/70 focus:bg-iron/80 focus:outline-none focus:ring-2 focus:ring-pimenton-light/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Borrar búsqueda"
              className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <X size={16} aria-hidden />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          {/* Botón Filtros (solo móvil) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={!collapsed}
            aria-controls={panelId}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors md:hidden",
              open ? "border-pimenton-light/70 bg-pimenton/20 text-cream" : "border-cream/20 text-cream-muted hover:text-cream",
            )}
          >
            <SlidersHorizontal size={16} aria-hidden />
            Filtros
            {panelFilters > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pimenton-light px-1.5 text-[11px] font-bold text-cream" aria-label={`${panelFilters} filtros activos`}>
                {panelFilters}
              </span>
            )}
          </button>

          {/* Contador de resultados */}
          <p className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="font-condensed text-3xl leading-none tracking-wide text-cream">{resultCount}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-faint">{resultCount === 1 ? "plato" : "platos"}</span>
          </p>
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {formatResultCount(resultCount)} encontrados
          </p>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="hidden h-11 items-center gap-2 rounded-full border border-cream/20 px-4 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:border-pimenton-light hover:bg-pimenton/20 hover:text-cream md:inline-flex"
            >
              <Eraser size={14} aria-hidden />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Panel plegable (móvil) / siempre visible (md+) ── */}
      <div
        id={panelId}
        aria-hidden={collapsed || undefined}
        inert={collapsed || undefined}
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)] md:grid-rows-[1fr]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-5 pt-5 md:pt-6">
            {/* Etiquetas dietéticas */}
            <div>
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-cream-faint">Preferencias</p>
              <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0" aria-label="Etiquetas dietéticas">
                {FILTERABLE_TAGS.map((tag) => {
                  const Icon = TAG_ICONS[tag];
                  const pressed = filters.tags.includes(tag);
                  return (
                    <li key={tag} className="shrink-0">
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
                        {DIET_TAG_LABELS[tag]}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Excluir alérgenos */}
            <div>
              <div className="mb-2.5 flex items-baseline justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream-faint">Excluir alérgenos</p>
                {filters.excludedAllergens.length > 0 && (
                  <p className="text-xs text-cream-faint">
                    Ocultando {filters.excludedAllergens.length} {filters.excludedAllergens.length === 1 ? "alérgeno" : "alérgenos"}
                  </p>
                )}
              </div>
              <ul className="flex flex-wrap gap-2" aria-label="Alérgenos a excluir">
                {ALLERGENS.map((a) => {
                  const pressed = filters.excludedAllergens.includes(a.id);
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        aria-pressed={pressed}
                        aria-label={pressed ? `Volver a mostrar platos con ${a.label.toLowerCase()}` : `Excluir platos con ${a.label.toLowerCase()}`}
                        title={a.description}
                        onClick={() => onToggleAllergen(a.id)}
                        className={cn(
                          "relative inline-flex h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-1 transition-all duration-300 md:pr-3",
                          pressed
                            ? "border-pimenton-light/80 bg-pimenton/20 shadow-[0_0_16px_rgba(216,50,60,0.35)]"
                            : "border-cream/10 hover:border-cream/35 hover:bg-cream/5",
                        )}
                      >
                        <AllergenIcon id={a.id} size="sm" active={pressed} />
                        <span className={cn("hidden text-sm md:inline", pressed ? "text-cream line-through decoration-pimenton-light decoration-2" : "text-cream-muted")}>
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

            {/* Limpiar (móvil) */}
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-cream/20 px-5 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:border-pimenton-light hover:text-cream md:hidden"
              >
                <Eraser size={14} aria-hidden />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
