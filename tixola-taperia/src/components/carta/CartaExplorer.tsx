"use client";

import { MotionConfig } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { AllergenId } from "@/data/allergens";
import { MENU_CATEGORIES, type DietTag, type MenuCategoryId } from "@/data/menu";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { cn } from "@/lib/utils";
import AllergenLegendPanel, { AllergenLegendFab, AllergenLegendSheet } from "./AllergenLegend";
import CartaCta from "./CartaCta";
import CartaHero from "./CartaHero";
import CategoryNav, { useScrollSpy } from "./CategoryNav";
import CategorySection, { categoryAnchorId } from "./CategorySection";
import FilterBar from "./FilterBar";
import {
  DEFAULT_FILTERS,
  areFiltersEqual,
  parseFilters,
  serializeFilters,
  useMenuFilters,
  type MenuFilterResult,
  type MenuFilters,
} from "./useMenuFilters";

/**
 * CartaExplorer — orquestador de la página /carta.
 *
 *  Estado: categoría enfocada, búsqueda, alérgenos excluidos y etiquetas dietéticas.
 *  · Sincronizado con la URL (`?q=&cat=&sin=gluten,lacteos&tags=vegano`) para compartir filtros.
 *    La escritura usa `window.history.replaceState`, que Next integra con `useSearchParams`
 *    sin volver a pedir el payload RSC en cada pulsación (a diferencia de `router.replace`).
 *  · Enlaces profundos `/carta#tix-chistorra-huevos`: scroll hasta la tarjeta y anillo de resalte.
 *  · Scroll‑spy para la navegación de categorías; leyenda de alérgenos plegable, repetida al final
 *    y como modal desde el botón flotante "Leyenda".
 *  · Estilos de impresión (`@media print`) para el botón "Imprimir carta".
 *
 *  `useSearchParams` obliga a un límite <Suspense>: el fallback es la carta completa sin filtros
 *  (mismo árbol visual), de modo que el HTML estático ya contiene todos los platos (SEO) y el
 *  cambio a la versión interactiva es imperceptible.
 */

export default function CartaExplorer() {
  return (
    <Suspense fallback={<CartaStatic />}>
      <CartaLive />
    </Suspense>
  );
}

/* ───────────────────────── Acciones ───────────────────────── */

interface CartaActions {
  setQuery: (query: string) => void;
  toggleTag: (tag: DietTag) => void;
  toggleAllergen: (id: AllergenId) => void;
  focusCategory: (id: MenuCategoryId) => void;
  showAll: () => void;
  clear: () => void;
  selectCategory: (id: MenuCategoryId) => void;
  openLegend: () => void;
  closeLegend: () => void;
}

const noop = () => undefined;
const NOOP_ACTIONS: CartaActions = {
  setQuery: noop,
  toggleTag: noop,
  toggleAllergen: noop,
  focusCategory: noop,
  showAll: noop,
  clear: noop,
  selectCategory: noop,
  openLegend: noop,
  closeLegend: noop,
};

const CATEGORY_IDS: MenuCategoryId[] = MENU_CATEGORIES.map((c) => c.id);
/** Línea de lectura del scroll‑spy (px desde arriba: cabecera + barra de chips + margen). */
const SPY_OFFSET = 180;
/** Retardo de escritura en la URL mientras se escribe en el buscador. */
const URL_DEBOUNCE_MS = 180;
/** Duración del anillo de resalte del enlace profundo. */
const HIGHLIGHT_MS = 2600;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/* ───────────────────────── Versión interactiva ───────────────────────── */

function CartaLive() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const perf = usePerformanceTier();

  const [filters, setFilters] = useState<MenuFilters>(() => parseFilters(new URLSearchParams(searchParams.toString())));
  const [legendOpen, setLegendOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const results = useMenuFilters(filters);

  const focused = filters.category === "all" ? null : filters.category;
  const activeCategory = useScrollSpy(CATEGORY_IDS, SPY_OFFSET, focused);

  /* ── URL ⇄ estado ── */
  const lastWritten = useRef(serializeFilters(filters));
  const urlTimer = useRef(0);

  useEffect(() => {
    const next = serializeFilters(filters);
    if (next === lastWritten.current) return;
    urlTimer.current = window.setTimeout(() => {
      lastWritten.current = next;
      const url = `${pathname}${next ? `?${next}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", url);
    }, URL_DEBOUNCE_MS);
    return () => window.clearTimeout(urlTimer.current);
  }, [filters, pathname]);

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseFilters(new URLSearchParams(window.location.search));
      lastWritten.current = serializeFilters(parsed);
      setFilters((prev) => (areFiltersEqual(prev, parsed) ? prev : parsed));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  /* ── Enlace profundo a una tarjeta (#id) ── */
  const highlightTimer = useRef(0);
  const revealItem = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el || !el.classList.contains("carta-card")) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center", inline: "center" });
    setHighlightedId(id);
    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
  }, []);

  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) revealItem(id);
    };
    // Pequeño retardo para que fuentes e imágenes asienten el layout antes de medir.
    const timer = window.setTimeout(go, 160);
    window.addEventListener("hashchange", go);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(highlightTimer.current);
      window.removeEventListener("hashchange", go);
    };
  }, [revealItem]);

  /* ── Navegación ── */
  const scrollToElement = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }, []);

  const setQuery = useCallback((query: string) => setFilters((f) => ({ ...f, query })), []);
  const toggleTag = useCallback((tag: DietTag) => setFilters((f) => ({ ...f, tags: toggleInList(f.tags, tag) })), []);
  const toggleAllergen = useCallback(
    (id: AllergenId) => setFilters((f) => ({ ...f, excludedAllergens: toggleInList(f.excludedAllergens, id) })),
    [],
  );
  const focusCategory = useCallback(
    (id: MenuCategoryId) => {
      setFilters((f) => ({ ...f, category: id }));
      scrollToElement("carta-resultados");
    },
    [scrollToElement],
  );
  const showAll = useCallback(() => setFilters((f) => ({ ...f, category: "all" })), []);
  const clear = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  /** Raíl / chips: con la carta completa hace scroll a la sección; con una categoría enfocada, la cambia. */
  const selectCategory = useCallback(
    (id: MenuCategoryId) => {
      if (focused) {
        setFilters((f) => ({ ...f, category: id }));
        scrollToElement("carta-resultados");
      } else {
        scrollToElement(categoryAnchorId(id));
      }
    },
    [focused, scrollToElement],
  );
  const openLegend = useCallback(() => setLegendOpen(true), []);
  const closeLegend = useCallback(() => setLegendOpen(false), []);

  const actions: CartaActions = { setQuery, toggleTag, toggleAllergen, focusCategory, showAll, clear, selectCategory, openLegend, closeLegend };

  return (
    <CartaView
      filters={filters}
      results={results}
      activeCategory={activeCategory}
      highlightedId={highlightedId}
      legendOpen={legendOpen}
      animations={!perf.reducedMotion && perf.tier !== "low"}
      heroFloat={!perf.reducedMotion && perf.tier === "high"}
      actions={actions}
    />
  );
}

/* ───────────────────────── Fallback estático (SSR) ───────────────────────── */

function CartaStatic() {
  const results = useMenuFilters(DEFAULT_FILTERS);
  return (
    <CartaView
      filters={DEFAULT_FILTERS}
      results={results}
      activeCategory={CATEGORY_IDS[0]}
      highlightedId={null}
      legendOpen={false}
      animations={false}
      heroFloat={false}
      actions={NOOP_ACTIONS}
    />
  );
}

/* ───────────────────────── Vista ───────────────────────── */

interface CartaViewProps {
  filters: MenuFilters;
  results: MenuFilterResult;
  activeCategory: MenuCategoryId;
  highlightedId: string | null;
  legendOpen: boolean;
  /** revelado por scroll + animaciones de layout */
  animations: boolean;
  /** flotación de las polaroids del hero */
  heroFloat: boolean;
  actions: CartaActions;
}

function CartaView({ filters, results, activeCategory, highlightedId, legendOpen, animations, heroFloat, actions }: CartaViewProps) {
  const focused = filters.category === "all" ? null : filters.category;

  return (
    <MotionConfig reducedMotion="user">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="carta-root noise after:noise-after relative overflow-x-clip bg-iron bg-[url('/textures/slate.webp')] bg-[length:900px_900px] bg-repeat">
        {/* Velo oscuro sobre la pizarra para legibilidad */}
        <div
          aria-hidden
          className="carta-bg pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.9)_0%,rgba(18,18,18,0.8)_25%,rgba(18,18,18,0.84)_70%,var(--color-iron)_100%)]"
        />
        <div aria-hidden className="divider-iron absolute inset-x-0 top-0" />

        {/* Cabecera */}
        <div className="container-page relative">
          <CartaHero animate={heroFloat} />
        </div>

        {/* Chips de categorías (móvil / tablet), pegajosos bajo la cabecera */}
        <CategoryNav
          variant="chips"
          className="lg:hidden"
          activeId={activeCategory}
          focusedId={focused}
          counts={results.counts}
          onSelect={actions.selectCategory}
          onShowAll={actions.showAll}
        />

        <div className="container-page relative pb-16 md:pb-24 lg:pb-28">
          <div className="carta-grid lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:gap-14">
            {/* Raíl lateral (escritorio) */}
            <aside className="carta-no-print hidden lg:block">
              <div className="sticky top-[calc(var(--header-h)+24px)] pt-2">
                <CategoryNav
                  variant="rail"
                  activeId={activeCategory}
                  focusedId={focused}
                  counts={results.counts}
                  onSelect={actions.selectCategory}
                  onShowAll={actions.showAll}
                />
              </div>
            </aside>

            {/* Contenido */}
            <div className="min-w-0">
              <FilterBar
                className="mt-6 lg:mt-0"
                filters={filters}
                resultCount={results.total}
                activeCount={results.activeCount}
                onQueryChange={actions.setQuery}
                onToggleTag={actions.toggleTag}
                onToggleAllergen={actions.toggleAllergen}
                onClear={actions.clear}
              />

              <AllergenLegendPanel className="carta-no-print mt-4" />

              <div
                id="carta-resultados"
                className={cn("mt-12 flex flex-col gap-16 scroll-mt-[calc(var(--header-h)+72px)] md:mt-16 md:gap-24 lg:scroll-mt-[calc(var(--header-h)+24px)]")}
              >
                {results.sections.map((section) => (
                  <CategorySection
                    key={section.category.id}
                    category={section.category}
                    items={section.items}
                    total={section.total}
                    focused={focused === section.category.id}
                    highlightedId={highlightedId}
                    animations={animations}
                    onFocus={actions.focusCategory}
                    onShowAll={actions.showAll}
                    onClearFilters={actions.clear}
                  />
                ))}
              </div>

              <AllergenLegendPanel defaultOpen className="mt-16 md:mt-24" />
            </div>
          </div>

          <CartaCta className="mt-16 md:mt-24" />
        </div>
      </div>

      {/* Leyenda flotante */}
      <AllergenLegendFab onClick={actions.openLegend} open={legendOpen} />
      <AllergenLegendSheet open={legendOpen} onClose={actions.closeLegend} />
    </MotionConfig>
  );
}

/* ───────────────────────── Impresión ───────────────────────── */

const PRINT_CSS = `
@media print {
  @page { margin: 14mm; }
  body, main { background: #fff !important; color: #111 !important; padding: 0 !important; }
  header.fixed, footer, body > div.fixed, .carta-no-print, .carta-bg, .carta-emoji, .divider-iron { display: none !important; }
  .carta-root { background: #fff !important; overflow: visible !important; }
  .carta-root::after { display: none !important; }
  .carta-grid { display: block !important; }
  .carta-section {
    opacity: 1 !important; transform: none !important; margin: 0 0 22px !important; padding: 0 !important;
    border: 0 !important; box-shadow: none !important; background: transparent !important; break-inside: avoid;
  }
  .carta-section h2, .carta-section p, .carta-card h3, .carta-card p, .carta-card span, .carta-card li,
  .carta-legend p, .carta-legend span { color: #111 !important; text-shadow: none !important; }
  .carta-section h2 { font-size: 30px !important; }
  .carta-row {
    display: grid !important; grid-template-columns: 1fr 1fr; gap: 10px !important;
    overflow: visible !important; padding: 0 !important; margin: 0 !important;
  }
  .carta-card { width: auto !important; opacity: 1 !important; transform: none !important; break-inside: avoid; }
  .carta-card article {
    background: #fff !important; border: 1px solid #d6d2ca !important; box-shadow: none !important;
    backdrop-filter: none !important; transform: none !important; padding: 12px 14px !important;
  }
  .carta-card h3 { font-size: 20px !important; }
  .carta-card .carta-price { color: #b21e27 !important; font-size: 24px !important; }
  .carta-legend { background: transparent !important; border: 1px solid #d6d2ca !important; box-shadow: none !important; backdrop-filter: none !important; }
  .carta-legend-body { grid-template-rows: 1fr !important; }
  .carta-legend-item { border-color: #d6d2ca !important; background: #fff !important; }
}
`;
