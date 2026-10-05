/**
 * La barra. Los nombres y las etiquetas salen del brief; las historias, de La Voz de Galicia
 * (02/03/2024); bocadillos y raciones, de la pizarra de la fachada. Sin precios por pincho ni alérgenos: no están documentados (PENDIENTE con Marisa).
 * Sin fotos todavía: cada pincho se pinta con su ilustración hasta que lleguen las reales.
 */
export const CATEGORIES = ["casa", "montados", "raciones", "beber"] as const;
export type CategoryId = (typeof CATEGORIES)[number];

export const PINCHO_IDS = [
  "chicharrones",
  "calamares",
  "tortilla",
  "empanadillas",
  "rixones",
  "lomo-queso",
  "jamon-queso",
  "atun-tomate",
  "bocadillos",
  "raciones",
  "vinos",
  "cerveza",
] as const;
export type PinchoId = (typeof PINCHO_IDS)[number];

export type Illustration = "chicharron" | "calamar" | "tortilla" | "empanadilla" | "rixon" | "montado" | "bocadillo" | "racion" | "copa" | "cana";

export interface Pincho {
  id: PinchoId;
  category: CategoryId;
  illustration: Illustration;
  /** Los cuatro de la portada. */
  star: boolean;
  /** Foto real cuando llegue (ruta en /public). */
  photo: string | null;
}

export const MENU: readonly Pincho[] = [
  { id: "chicharrones", category: "casa", illustration: "chicharron", star: true, photo: null },
  { id: "calamares", category: "casa", illustration: "calamar", star: true, photo: null },
  { id: "tortilla", category: "casa", illustration: "tortilla", star: true, photo: null },
  { id: "empanadillas", category: "casa", illustration: "empanadilla", star: true, photo: null },
  { id: "rixones", category: "casa", illustration: "rixon", star: false, photo: null },
  { id: "lomo-queso", category: "montados", illustration: "montado", star: false, photo: null },
  { id: "jamon-queso", category: "montados", illustration: "montado", star: false, photo: null },
  { id: "atun-tomate", category: "montados", illustration: "montado", star: false, photo: null },
  { id: "bocadillos", category: "raciones", illustration: "bocadillo", star: false, photo: null },
  { id: "raciones", category: "raciones", illustration: "racion", star: false, photo: null },
  { id: "vinos", category: "beber", illustration: "copa", star: false, photo: null },
  { id: "cerveza", category: "beber", illustration: "cana", star: false, photo: null },
];

export const STAR_PINCHOS = MENU.filter((p) => p.star);
