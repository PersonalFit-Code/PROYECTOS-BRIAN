import { MENU, getSize, getStyle, isSizeId, isStyleId, type SizeId, type StyleId } from "@/data/menu";

/*
 * Reglas de negocio del configurador. Todo son funciones puras: el componente solo despacha
 * acciones y pinta lo que devuelven.
 *  - Total = precio base (estilo + tamaño) + extras.
 *  - Carnes gratis hasta el límite del tamaño; más no se puede.
 *  - Salsas gratis hasta `maxFreeSauces` (2); la tercera se bloquea.
 *  - Si cambia el estilo o el tamaño y las carnes no caben, se vacían.
 */

export interface TacoDraft {
  style: StyleId;
  size: SizeId;
  meats: string[];
  sauces: string[];
  extras: string[];
}

export const DEFAULT_SAUCES = MENU.sauces.filter((s) => s.default).map((s) => s.id);

export const INITIAL_DRAFT: TacoDraft = { style: "clasico", size: "L", meats: [], sauces: DEFAULT_SAUCES, extras: [] };

export const meatLimit = (size: SizeId) => getSize(size).meats;

export function basePrice(draft: Pick<TacoDraft, "style" | "size">): number {
  return getStyle(draft.style).prices[draft.size];
}

export function extrasPrice(extras: string[]): number {
  return extras.reduce((sum, id) => sum + (MENU.extras.find((e) => e.id === id)?.price ?? 0), 0);
}

/** Redondeo a céntimos para que 9,99 + 1,50 no dé 11,490000000000002. */
export function totalPrice(draft: TacoDraft): number {
  return Math.round((basePrice(draft) + extrasPrice(draft.extras)) * 100) / 100;
}

export type DraftAction =
  | { type: "style"; style: StyleId }
  | { type: "size"; size: SizeId }
  | { type: "toggleMeat"; id: string }
  | { type: "toggleSauce"; id: string }
  | { type: "toggleExtra"; id: string }
  | { type: "reset" }
  | { type: "load"; draft: TacoDraft };

/** Al cambiar de tamaño (o de estilo), si las carnes elegidas ya no caben, se vacían. */
function fitMeats(meats: string[], size: SizeId): string[] {
  return meats.length > meatLimit(size) ? [] : meats;
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function draftReducer(state: TacoDraft, action: DraftAction): TacoDraft {
  switch (action.type) {
    case "style":
      return { ...state, style: action.style, meats: fitMeats(state.meats, state.size) };
    case "size":
      return { ...state, size: action.size, meats: fitMeats(state.meats, action.size) };
    case "toggleMeat": {
      const selected = state.meats.includes(action.id);
      if (!selected && state.meats.length >= meatLimit(state.size)) return state;
      return { ...state, meats: toggle(state.meats, action.id) };
    }
    case "toggleSauce": {
      const selected = state.sauces.includes(action.id);
      if (!selected && state.sauces.length >= MENU.maxFreeSauces) return state;
      return { ...state, sauces: toggle(state.sauces, action.id) };
    }
    case "toggleExtra":
      return { ...state, extras: toggle(state.extras, action.id) };
    case "reset":
      return INITIAL_DRAFT;
    case "load":
      return action.draft;
  }
}

/** Valida lo que venga de localStorage: si algo no cuadra con la carta actual, se descarta. */
export function sanitizeDraft(value: unknown): TacoDraft | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!isStyleId(v.style) || !isSizeId(v.size)) return null;
  const ids = (list: unknown, valid: string[]) =>
    Array.isArray(list) ? list.filter((x): x is string => typeof x === "string" && valid.includes(x)) : [];
  const meats = ids(v.meats, MENU.meats.map((m) => m.id));
  const sauces = ids(v.sauces, MENU.sauces.map((s) => s.id)).slice(0, MENU.maxFreeSauces);
  const extras = ids(v.extras, MENU.extras.map((e) => e.id));
  return { style: v.style, size: v.size, meats: fitMeats(meats, v.size), sauces, extras };
}

export const DRAFT_STORAGE_KEY = "bh_taco_draft";
