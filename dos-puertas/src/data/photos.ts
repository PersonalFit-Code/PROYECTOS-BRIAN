import type { StaticImageData } from "next/image";
import barraAnos70 from "../../public/images/barra-anos-70.webp";
import barraHoy from "../../public/images/barra-dos-puertas.webp";

/**
 * Fotos con su procedencia. Ninguna es propia todavía: van con crédito y enlace a la fuente, y
 * hay que pedir permiso antes de publicar la web definitiva (en las dos salen personas).
 */
export const PHOTO_IDS = ["anos70", "hoy"] as const;
export type PhotoId = (typeof PHOTO_IDS)[number];

export const PHOTOS: Record<PhotoId, { src: StaticImageData; href: string | null }> = {
  /* Pie original de La Voz: «Irene, dentro de la barra del Dos Puertas, a finales de los años setenta». */
  anos70: {
    src: barraAnos70,
    href: "https://www.lavozdegalicia.es/noticia/ourense/ourense/2024/03/01/amancio-ortega-dejo-conquistar-calamares-dos-puertas-ourense/00031709305710141411475.htm",
  },
  /* Según Brian, del Faro de Vigo. PENDIENTE: enlace al artículo original. */
  hoy: { src: barraHoy, href: null },
};
