import type { StaticImageData } from "next/image";
import promoTacos from "../../public/images/promo-tacos.webp";
import localInterior from "../../public/images/local-interior.webp";

/*
 * Fotos reales de BH Tacos. Cada hueco de la web tiene un id; cuando hay foto, el hueco la enseña y,
 * si no, un bloque de marca (crema, plancha y el taco del logo). Para añadir una foto: original en
 * fotos/originales/, `python3 scripts/fotos.py`, importarla aquí y asignarla a su hueco.
 *
 * PERMISO: son fotos que el local tiene publicadas (las pasó Brian). Hay que confirmar con BH Tacos
 * que se pueden usar en la web antes de publicar la versión definitiva.
 */
export const PHOTO_SLOTS = [
  "hero",
  "taco-cortado", // «¿Qué es un French Taco?»
  "taco-clasico",
  "taco-rebozado",
  "tenders",
  "nuggets",
  "mozzarella",
  "patatas-cheddar",
  "local",
  "gaming",
] as const;
export type PhotoSlot = (typeof PHOTO_SLOTS)[number];

export interface Photo {
  src: StaticImageData;
  alt: string;
  /** Encuadre dentro del hueco (object-position), p. ej. "50% 40%". */
  position?: string;
  /** De dónde sale la foto (para el README y el permiso). */
  source: string;
}

const PROMO: Photo = {
  src: promoTacos,
  alt: "Cuatro French tacos de BH Tacos gratinados con cheddar y queso de cabra, con el logo de BH Tacos en el centro",
  source: "Imagen promocional de BH Tacos (Google, enviada por Brian)",
};
const LOCAL: Photo = {
  src: localInterior,
  alt: "Interior de BH Tacos: la planta de arriba con mesas, suelo de madera y el letrero de BH Tacos",
  position: "50% 55%",
  source: "Foto del local en Google (enviada por Brian)",
};

// TODO: fotos de producto (taco cortado, clásico, rebozado, entrantes) en buena resolución.
export const PHOTOS: Partial<Record<PhotoSlot, Photo>> = {
  hero: PROMO,
  local: LOCAL,
  gaming: LOCAL,
};

/**
 * Puntos del diagrama sobre la foto del taco cortado, en % del ancho y alto. Se ajustan cuando
 * llegue la foto; el id coincide con las capas de `HOME.whatIs.layers`.
 */
export const ANATOMY_HOTSPOTS: Record<string, { x: number; y: number }> = {
  gratinado: { x: 50, y: 18 },
  tortilla: { x: 22, y: 30 },
  salsa: { x: 62, y: 44 },
  carne: { x: 38, y: 55 },
  patatas: { x: 70, y: 64 },
  plancha: { x: 30, y: 82 },
};
