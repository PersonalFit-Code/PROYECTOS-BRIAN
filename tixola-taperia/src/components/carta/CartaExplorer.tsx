"use client";

import { MotionConfig } from "framer-motion";
import { BookOpen, Eraser, MessageCircleQuestion, Utensils } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@/components/chat/ChatProvider";
import NeonButton from "@/components/ui/NeonButton";
import type { AllergenId } from "@/data/allergens";
import type { DietTag } from "@/data/menu";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { localizeAllergens, localizeDietTags } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import AllergenLegendSheet from "./AllergenLegend";
import CartaCta from "./CartaCta";
import CartaHero from "./CartaHero";
import CategorySection from "./CategorySection";
import FilterBar from "./FilterBar";
import { CARTA_CONTAINER, FILTER_BAR_HEIGHT, RESULTS_ID } from "./layout";
import WaiterCard from "./WaiterCard";
import {
  DEFAULT_FILTERS,
  areFiltersEqual,
  getMenuDataset,
  parseFilters,
  serializeFilters,
  useMenuFilters,
  type CategoryFilter,
  type MenuFilterResult,
  type MenuFilters,
} from "./useMenuFilters";

/**
 * CartaExplorer — orquestador de la página /carta ("todo visible + filtro por categorías").
 *
 *  Estructura:  CartaHero → [camarero virtual (banda, móvil)] → FilterBar pegajosa (chips de
 *  categorías · búsqueda · panel de filtros) → resultados (todas las categorías apiladas o solo la
 *  seleccionada; rejilla 1 / 2 / 3 columnas) + tarjeta lateral pegajosa del camarero (lg) → CTA.
 *
 *  Estado: categoría seleccionada, búsqueda, alérgenos excluidos y etiquetas dietéticas.
 *  · Sincronizado con la URL (`?cat=&q=&sin=gluten,lacteos&tags=vegano`) para compartir filtros.
 *    La escritura usa `window.history.replaceState`, que Next integra con `useSearchParams`
 *    sin volver a pedir el payload RSC en cada pulsación (a diferencia de `router.replace`).
 *  · Enlaces profundos `/carta#tix-chistorra-huevos`: scroll hasta la tarjeta y anillo de resalte.
 *    Si la categoría seleccionada o los filtros ocultan la tarjeta, se vuelve a la carta completa.
 *  · La leyenda de alérgenos vive en un modal (segundo plano, por decisión del cliente).
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
  selectCategory: (id: CategoryFilter) => void;
  setQuery: (query: string) => void;
  toggleTag: (tag: DietTag) => void;
  toggleAllergen: (id: AllergenId) => void;
  /** limpia búsqueda, etiquetas y alérgenos (mantiene la categoría) */
  clearContent: () => void;
  /** vuelve a la carta completa sin ningún filtro */
  reset: () => void;
  openLegend: () => void;
  closeLegend: () => void;
}

const noop = () => undefined;
const NOOP_ACTIONS: CartaActions = {
  selectCategory: noop,
  setQuery: noop,
  toggleTag: noop,
  toggleAllergen: noop,
  clearContent: noop,
  reset: noop,
  openLegend: noop,
  closeLegend: noop,
};

/** Retardo de escritura en la URL mientras se escribe en el buscador. */
const URL_DEBOUNCE_MS = 180;
/** Duración del anillo de resalte del enlace profundo. */
const HIGHLIGHT_MS = 2600;
/** Espera inicial antes de leer el hash (fuentes e imágenes asientan el layout). */
const HASH_DELAY_MS = 160;

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
  const locale = useLocale();
  const perf = usePerformanceTier();
  const dataset = getMenuDataset(locale);

  const [filters, setFilters] = useState<MenuFilters>(() => parseFilters(new URLSearchParams(searchParams.toString())));
  const [legendOpen, setLegendOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  /** id de tarjeta pendiente de revelar (enlace profundo `#id`) */
  const [pendingHash, setPendingHash] = useState<string | null>(null);
  const results = useMenuFilters(filters, locale);

  /* ── URL ⇄ estado ── */
  const lastWritten = useRef(serializeFilters(filters));

  useEffect(() => {
    const next = serializeFilters(filters);
    if (next === lastWritten.current) return;
    const timer = window.setTimeout(() => {
      lastWritten.current = next;
      window.history.replaceState(null, "", `${pathname}${next ? `?${next}` : ""}${window.location.hash}`);
    }, URL_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
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

  /** Hace scroll hasta la tarjeta y la resalta. Devuelve false si no está montada. */
  const revealItem = useCallback((id: string): boolean => {
    const el = document.getElementById(id);
    if (!el || !el.classList.contains("carta-card")) return false;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    setHighlightedId(id);
    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
    return true;
  }, []);

  useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

  useEffect(() => {
    const read = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && dataset.byId.has(id)) setPendingHash(id);
    };
    const timer = window.setTimeout(read, HASH_DELAY_MS);
    window.addEventListener("hashchange", read);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", read);
    };
  }, [dataset]);

  /* Resuelve el hash pendiente tras cada cambio de filtros: si la tarjeta no está montada
     (la categoría seleccionada o los filtros la ocultan), vuelve a la carta completa y reintenta. */
  useEffect(() => {
    if (!pendingHash) return;
    const raf = requestAnimationFrame(() => {
      if (revealItem(pendingHash)) {
        setPendingHash(null);
        return;
      }
      if (areFiltersEqual(filters, DEFAULT_FILTERS)) setPendingHash(null);
      else setFilters(DEFAULT_FILTERS);
    });
    return () => cancelAnimationFrame(raf);
  }, [pendingHash, filters, revealItem]);

  /* ── Navegación ── */

  /** Si el usuario ya ha bajado por la carta, sube al inicio de los resultados al cambiar de categoría. */
  const scrollToResultsIfBelow = useCallback(() => {
    const el = document.getElementById(RESULTS_ID);
    if (!el) return;
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 72;
    if (el.getBoundingClientRect().top < headerHeight + FILTER_BAR_HEIGHT) {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
  }, []);

  const selectCategory = useCallback(
    (id: CategoryFilter) => {
      setFilters((f) => (f.category === id ? f : { ...f, category: id }));
      scrollToResultsIfBelow();
    },
    [scrollToResultsIfBelow],
  );
  const setQuery = useCallback((query: string) => setFilters((f) => ({ ...f, query })), []);
  const toggleTag = useCallback((tag: DietTag) => setFilters((f) => ({ ...f, tags: toggleInList(f.tags, tag) })), []);
  const toggleAllergen = useCallback(
    (id: AllergenId) => setFilters((f) => ({ ...f, excludedAllergens: toggleInList(f.excludedAllergens, id) })),
    [],
  );
  const clearContent = useCallback(() => setFilters((f) => ({ ...DEFAULT_FILTERS, category: f.category })), []);
  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const openLegend = useCallback(() => setLegendOpen(true), []);
  const closeLegend = useCallback(() => setLegendOpen(false), []);

  const actions: CartaActions = { selectCategory, setQuery, toggleTag, toggleAllergen, clearContent, reset, openLegend, closeLegend };

  return (
    <CartaView
      filters={filters}
      results={results}
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
  const locale = useLocale();
  const results = useMenuFilters(DEFAULT_FILTERS, locale);
  return (
    <CartaView filters={DEFAULT_FILTERS} results={results} highlightedId={null} legendOpen={false} animations={false} heroFloat={false} actions={NOOP_ACTIONS} />
  );
}

/* ───────────────────────── Vista ───────────────────────── */

interface CartaViewProps {
  filters: MenuFilters;
  results: MenuFilterResult;
  highlightedId: string | null;
  legendOpen: boolean;
  /** revelado por scroll + animaciones de layout */
  animations: boolean;
  /** flotación de las polaroids de la cabecera */
  heroFloat: boolean;
  actions: CartaActions;
}

function CartaView({ filters, results, highlightedId, legendOpen, animations, heroFloat, actions }: CartaViewProps) {
  const m = useMessages();
  const locale = useLocale();
  const dataset = getMenuDataset(locale);
  const allergens = useMemo(() => localizeAllergens(locale), [locale]);
  const dietTags = useMemo(() => localizeDietTags(locale), [locale]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="noise after:noise-after relative overflow-x-clip bg-iron bg-[url('/textures/slate.webp')] bg-[length:900px_900px] bg-repeat">
        {/* Velo oscuro sobre la pizarra para legibilidad */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.9)_0%,rgba(18,18,18,0.8)_25%,rgba(18,18,18,0.84)_70%,var(--color-iron)_100%)]"
        />
        <div aria-hidden className="divider-iron absolute inset-x-0 top-0" />

        {/* Cabecera + camarero virtual (banda en móvil / tablet) */}
        <div className={cn(CARTA_CONTAINER, "relative")}>
          <CartaHero animate={heroFloat} />
          <WaiterCard className="mb-6 lg:hidden" />
        </div>

        {/* Chips de categorías · búsqueda · filtros (pegajoso bajo el navbar) */}
        <FilterBar
          filters={filters}
          results={results}
          categories={dataset.categories}
          allergens={allergens}
          dietTags={dietTags}
          onSelectCategory={actions.selectCategory}
          onQueryChange={actions.setQuery}
          onToggleTag={actions.toggleTag}
          onToggleAllergen={actions.toggleAllergen}
          onClear={actions.clearContent}
          onOpenLegend={actions.openLegend}
        />

        <div className={cn(CARTA_CONTAINER, "relative pb-16 md:pb-24 lg:pb-28")}>
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-12">
            {/* Resultados */}
            <section id={RESULTS_ID} aria-label={m.carta.resultsRegion} className="min-w-0 scroll-mt-[calc(var(--header-h)+80px)]">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pb-8 pt-8 md:pb-10 md:pt-10">
                <p className="flex items-baseline gap-2 leading-none">
                  <span className="font-condensed text-4xl tracking-wide text-cream md:text-5xl">{results.total}</span>
                  <span className="font-caps text-[11px] uppercase tracking-[0.3em] text-cream-faint">
                    {results.total === 1 ? m.carta.resultsUnitOne : m.carta.resultsUnit}
                  </span>
                </p>
                <p className="text-xs text-cream-faint">{m.carta.priceNote}</p>
              </div>

              {results.total === 0 ? (
                <EmptyState query={filters.query} onReset={actions.reset} />
              ) : (
                <div className="flex flex-col gap-14 md:gap-20">
                  {results.sections.map((section) => (
                    <CategorySection
                      key={section.category.id}
                      category={section.category}
                      items={section.items}
                      total={section.total}
                      dietTags={dietTags}
                      selected={filters.category === section.category.id}
                      highlightedId={highlightedId}
                      animations={animations}
                      onSelect={actions.selectCategory}
                    />
                  ))}
                </div>
              )}

              {/* Pie de resultados: leyenda de alérgenos en segundo plano */}
              <div className="mt-12 flex flex-col items-start gap-2 border-t border-cream/10 pt-6 sm:flex-row sm:items-center sm:justify-between md:mt-16">
                <p className="text-sm text-cream-muted">{m.carta.legendFooter}</p>
                <button
                  type="button"
                  onClick={actions.openLegend}
                  className="-ml-3 inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-cream underline-offset-4 transition-colors hover:bg-cream/5 hover:underline sm:ml-0"
                >
                  <BookOpen size={16} aria-hidden className="text-pimenton-light" />
                  {m.carta.legendLink}
                </button>
              </div>
            </section>

            {/* Camarero virtual: tarjeta lateral pegajosa (escritorio) */}
            <aside className="hidden pt-10 lg:block">
              <div className="sticky top-[calc(var(--header-h)+88px)]">
                <WaiterCard />
              </div>
            </aside>
          </div>

          <CartaCta className="mt-16 md:mt-24" />
        </div>
      </div>

      {/* Leyenda de alérgenos (modal / bottom-sheet) */}
      <AllergenLegendSheet open={legendOpen} onClose={actions.closeLegend} />
    </MotionConfig>
  );
}

/* ───────────────────────── Estado vacío ───────────────────────── */

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  const m = useMessages();
  const t = useFormat();
  const chat = useChat();
  const trimmed = query.trim();

  const ask = () => chat.open({ prefill: trimmed ? t(m.carta.emptyAskQuery, { query: trimmed }) : m.carta.emptyAsk, page: "carta" });

  return (
    <div className="glass-smoke flex flex-col items-center gap-4 rounded-3xl px-6 py-14 text-center">
      <span aria-hidden className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-cream/10 bg-iron/60 text-gold">
        <Utensils size={24} strokeWidth={1.8} />
      </span>
      <p className="font-condensed text-3xl uppercase tracking-wide text-cream">{m.carta.empty}</p>
      <p className="max-w-sm text-sm leading-relaxed text-cream-muted">{m.carta.emptyHint}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <NeonButton variant="primary" size="md" icon={<MessageCircleQuestion aria-hidden />} onClick={ask}>
          {m.carta.askAboutDishCta}
        </NeonButton>
        <NeonButton variant="outline" size="md" icon={<Eraser aria-hidden />} onClick={onReset}>
          {m.carta.clear}
        </NeonButton>
      </div>
    </div>
  );
}
