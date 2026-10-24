import raw from "./menu.json";

/* Tipos de la carta. El JSON se valida contra ellos al compilar: si falta un campo, falla el typecheck. */
export type SizeId = "M" | "L" | "XL";
export type StyleId = "clasico" | "rebozado";

export interface TacoSize {
  id: SizeId;
  name: string;
  meats: number;
  scale: number;
  description: string;
  reference: string;
}
export interface TacoStyle {
  id: StyleId;
  name: string;
  description: string;
  prices: Record<SizeId, number>;
}
export interface Meat {
  id: string;
  name: string;
  color: string;
}
export interface Sauce {
  id: string;
  name: string;
  group?: string;
  spice: number;
  profile: string;
  origin: string;
  pairing: string;
  color: string;
  default?: boolean;
}
export interface Extra {
  id: string;
  name: string;
  price: number;
  color: string;
  todo?: boolean;
}
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  builder?: { style: StyleId; size: SizeId };
  featured?: boolean;
}
export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  todo?: boolean;
  items: MenuItem[];
}
export interface Combo {
  id: string;
  name: string;
  description: string;
  items: string[];
}
export interface Menu {
  currency: string;
  tacoSizes: TacoSize[];
  tacoStyles: TacoStyle[];
  meats: Meat[];
  sauces: Sauce[];
  maxFreeSauces: number;
  extras: Extra[];
  categories: MenuCategory[];
  combos: Combo[];
}

export const MENU: Menu = raw as Menu;

const allItems = MENU.categories.flatMap((c) => c.items);

export function findItem(id: string): MenuItem | undefined {
  return allItems.find((i) => i.id === id);
}

export const FEATURED_ITEMS: MenuItem[] = allItems.filter((i) => i.featured);

/** Precio orientativo de un combo: la suma de lo que lleva. */
export function comboPrice(combo: Combo): number {
  return combo.items.reduce((sum, id) => sum + (findItem(id)?.price ?? 0), 0);
}

export const getStyle = (id: StyleId) => MENU.tacoStyles.find((s) => s.id === id) ?? MENU.tacoStyles[0];
export const getSize = (id: SizeId) => MENU.tacoSizes.find((s) => s.id === id) ?? MENU.tacoSizes[0];
export const isSizeId = (v: unknown): v is SizeId => v === "M" || v === "L" || v === "XL";
export const isStyleId = (v: unknown): v is StyleId => v === "clasico" || v === "rebozado";
