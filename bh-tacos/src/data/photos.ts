import type { StaticImageData } from "next/image";

/*
 * Fotos reales de BH Tacos. Cada hueco de la web tiene un id; cuando llega la foto se importa aquí
 * (desde public/images/, en WebP) y el hueco la enseña en lugar de la ilustración de reserva.
 *
 * PENDIENTE: las fotos las pasa Brian (las que el local tiene publicadas en Google). Hay que tener
 * el permiso del local antes de publicar la web definitiva.
 */
export const PHOTO_SLOTS = [
  "taco-cortado", // portada y «¿Qué es un French Taco?»
  "taco-clasico",
  "taco-rebozado",
  "tenders",
  "nuggets",
  "mozzarella",
  "patatas-cheddar",
  "local",
  "ps5",
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

export const PHOTOS: Partial<Record<PhotoSlot, Photo>> = {};

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
