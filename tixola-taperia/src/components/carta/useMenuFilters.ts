"use client";

import { useMemo } from "react";
import { ALLERGEN_MAP, type AllergenId } from "@/data/allergens";
import {
  DIET_TAG_LABELS,
  MENU_CATEGORIES,
  MENU_ITEMS,
  type DietTag,
  type MenuCategory,
  type MenuCategoryId,
  type MenuItem,
} from "@/data/menu";

/**
 * useMenuFilters — lógica pura de filtrado de la carta + serialización a URL.
 *
 *  - Búsqueda insensible a acentos y mayúsculas (normalización NFD) sobre nombre y descripción.
 *  - "Excluir alérgenos": se descarta cualquier plato que contenga alguno de los alérgenos marcados.
 *  - Etiquetas dietéticas: el plato debe cumplir TODAS las seleccionadas (AND).
 *  - Categoría: `"all"` muestra la carta completa; un id concreto la reduce a esa sección.
 *
 * El estado se codifica en la URL como `?q=&cat=&sin=gluten,lacteos&tags=vegano` para que los
 * filtros sean compartibles. Todo lo que llega de la URL se valida contra los datos reales.
 */

/* ───────────────────────── Tipos ───────────────────────── */

export type CategoryFilter = MenuCategoryId | "all";

export interface MenuFilters {
  category: CategoryFilter;
  query: string;
  excludedAllergens: AllergenId[];
  tags: DietTag[];
}

export interface MenuSection {
  category: MenuCategory;
  /** platos que pasan los filtros, en el orden original de la carta */
  items: MenuItem[];
  /** nº de platos de la categoría sin filtrar */
  total: number;
}

export interface MenuFilterResult {
  /** todos los platos que pasan los filtros (incluida la categoría) */
  items: MenuItem[];
  /** secciones a pintar: todas, o solo la categoría enfocada */
  sections: MenuSection[];
  /** nº total de resultados */
  total: number;
  /** nº de platos por categoría SIN filtrar */
  totals: Record<MenuCategoryId, number>;
  /** nº de platos por categoría que pasan query + alérgenos + etiquetas (ignorando `category`) */
  counts: Record<MenuCategoryId, number>;
  /** nº de filtros activos (para el badge del botón "Filtros") */
  activeCount: number;
}

export const DEFAULT_FILTERS: MenuFilters = {
  category: "all",
  query: "",
  excludedAllergens: [],
  tags: [],
};

/** Etiquetas que se ofrecen como filtro (el orden es el de la barra de chips). */
export const FILTERABLE_TAGS: DietTag[] = ["vegano", "vegetariano", "sin-gluten", "picante", "estrella"];

/** Nombres de los parámetros de la URL. */
export const URL_KEYS = { query: "q", category: "cat", allergens: "sin", tags: "tags" } as const;

/* ───────────────────────── Normalización de texto ───────────────────────── */

/** Minúsculas, sin diacríticos (NFD) y con espacios colapsados: "Zamburiñas" → "zamburinas". */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Índice de búsqueda precalculado (los datos de la carta son estáticos). */
const SEARCH_INDEX: ReadonlyMap<string, string> = new Map(
  MENU_ITEMS.map((item) => [item.id, normalizeText(`${item.name} ${item.description} ${item.pairing ?? ""}`)]),
);

/** Comprueba si el plato contiene todas las palabras de la consulta (ya normalizada). */
export function matchesQuery(item: MenuItem, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  const haystack = SEARCH_INDEX.get(item.id) ?? normalizeText(`${item.name} ${item.description}`);
  return normalizedQuery.split(" ").every((word) => haystack.includes(word));
}

/* ───────────────────────── Filtrado ───────────────────────── */

/** Aplica query + alérgenos excluidos + etiquetas (sin la categoría). */
function passesContentFilters(item: MenuItem, normalizedQuery: string, excluded: ReadonlySet<AllergenId>, tags: DietTag[]): boolean {
  if (!matchesQuery(item, normalizedQuery)) return false;
  if (excluded.size && item.allergens.some((a) => excluded.has(a))) return false;
  if (tags.length && !tags.every((t) => item.tags.includes(t))) return false;
  return true;
}

/** Filtra una lista de platos con el estado completo (categoría incluida). */
export function filterItems(items: MenuItem[], filters: MenuFilters): MenuItem[] {
  const normalizedQuery = normalizeText(filters.query);
  const excluded = new Set(filters.excludedAllergens);
  return items.filter(
    (item) =>
      (filters.category === "all" || item.category === filters.category) &&
      passesContentFilters(item, normalizedQuery, excluded, filters.tags),
  );
}

function emptyCounts(): Record<MenuCategoryId, number> {
  return Object.fromEntries(MENU_CATEGORIES.map((c) => [c.id, 0])) as Record<MenuCategoryId, number>;
}

/** Nº de platos por categoría. */
export function countByCategory(items: MenuItem[]): Record<MenuCategoryId, number> {
  const counts = emptyCounts();
  for (const item of items) counts[item.category] += 1;
  return counts;
}

/** Totales de la carta completa (constante). */
export const CATEGORY_TOTALS: Record<MenuCategoryId, number> = countByCategory(MENU_ITEMS);

/** Nº de filtros activos: 1 por búsqueda, 1 por categoría enfocada, 1 por alérgeno, 1 por etiqueta. */
export function countActiveFilters(filters: MenuFilters): number {
  return (
    (filters.query.trim() ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0) +
    filters.excludedAllergens.length +
    filters.tags.length
  );
}

export function areFiltersEqual(a: MenuFilters, b: MenuFilters): boolean {
  return (
    a.category === b.category &&
    a.query === b.query &&
    a.excludedAllergens.length === b.excludedAllergens.length &&
    a.excludedAllergens.every((id, i) => b.excludedAllergens[i] === id) &&
    a.tags.length === b.tags.length &&
    a.tags.every((t, i) => b.tags[i] === t)
  );
}

/* ───────────────────────── URL ⇄ estado ───────────────────────── */

const CATEGORY_IDS = new Set<string>(MENU_CATEGORIES.map((c) => c.id));
const TAG_IDS = new Set<string>(Object.keys(DIET_TAG_LABELS));

const isCategoryId = (v: string): v is MenuCategoryId => CATEGORY_IDS.has(v);
const isAllergenId = (v: string): v is AllergenId => v in ALLERGEN_MAP;
const isDietTag = (v: string): v is DietTag => TAG_IDS.has(v);

function splitList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Lee `?q=&cat=&sin=&tags=` y devuelve un estado válido (ignora valores desconocidos y duplicados). */
export function parseFilters(params: URLSearchParams): MenuFilters {
  const rawCategory = params.get(URL_KEYS.category) ?? "";
  const category: CategoryFilter = isCategoryId(rawCategory) ? rawCategory : "all";
  const query = (params.get(URL_KEYS.query) ?? "").slice(0, 80);
  const excludedAllergens = Array.from(new Set(splitList(params.get(URL_KEYS.allergens)).filter(isAllergenId)));
  const tags = Array.from(new Set(splitList(params.get(URL_KEYS.tags)).filter(isDietTag)));
  return { category, query, excludedAllergens, tags };
}

/** Serializa el estado a query string (sin `?`). Devuelve "" cuando no hay filtros. */
export function serializeFilters(filters: MenuFilters): string {
  const params = new URLSearchParams();
  const q = filters.query.trim();
  if (q) params.set(URL_KEYS.query, q);
  if (filters.category !== "all") params.set(URL_KEYS.category, filters.category);
  if (filters.excludedAllergens.length) params.set(URL_KEYS.allergens, filters.excludedAllergens.join(","));
  if (filters.tags.length) params.set(URL_KEYS.tags, filters.tags.join(","));
  // Las comas legibles en la URL compartida: "sin=gluten,lacteos" en vez de "gluten%2Clacteos".
  return params.toString().replace(/%2C/gi, ",");
}

/* ───────────────────────── Hook ───────────────────────── */

/**
 * Calcula (memoizado) los resultados de la carta para un estado de filtros.
 * Es barato: ~45 platos, índice de búsqueda precalculado.
 */
export function useMenuFilters(filters: MenuFilters): MenuFilterResult {
  const { category, query, excludedAllergens, tags } = filters;
  const allergensKey = excludedAllergens.join(",");
  const tagsKey = tags.join(",");

  return useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const excluded = new Set(allergensKey ? (allergensKey.split(",") as AllergenId[]) : []);
    const tagList = tagsKey ? (tagsKey.split(",") as DietTag[]) : [];

    // 1 · Filtros de contenido (sin categoría) → conteos por categoría para la navegación.
    const contentMatches = MENU_ITEMS.filter((item) => passesContentFilters(item, normalizedQuery, excluded, tagList));
    const counts = countByCategory(contentMatches);

    // 2 · Categoría enfocada (o todas).
    const items = category === "all" ? contentMatches : contentMatches.filter((item) => item.category === category);

    const visibleCategories = category === "all" ? MENU_CATEGORIES : MENU_CATEGORIES.filter((c) => c.id === category);
    const sections: MenuSection[] = visibleCategories.map((cat) => ({
      category: cat,
      items: items.filter((item) => item.category === cat.id),
      total: CATEGORY_TOTALS[cat.id],
    }));

    return {
      items,
      sections,
      total: items.length,
      totals: CATEGORY_TOTALS,
      counts,
      activeCount: countActiveFilters({ category, query, excludedAllergens: Array.from(excluded), tags: tagList }),
    };
  }, [category, query, allergensKey, tagsKey]);
}

/** "1 plato" / "23 platos" — para el contador y la región aria-live. */
export function formatResultCount(n: number): string {
  return n === 1 ? "1 plato" : `${n} platos`;
}
