/**
 * Galería de trabajos. VEINTE HUECOS con el marcador rosa hasta que Andrea entregue fotos reales
 * (se piden originales, no capturas de Instagram, por calidad y por derechos). Cada entrada lleva ya
 * el `alt` descriptivo del trabajo que irá en ese hueco y el tema, para que al llegar las fotos solo
 * haya que cambiar `src` y quitar `pendiente`: la maqueta, los filtros y el morph futuro no se tocan.
 *
 * `aspect` decide la forma de la celda en la rejilla (y en el morph, cuando llegue): las fotos de
 * manos suelen ser cuadradas o verticales; las del local, horizontales.
 */
export type GaleriaTema = "manos" | "pies" | "nail-art" | "mirada" | "salon";

export interface GaleriaItem {
  id: string;
  src: string;
  alt: string;
  tema: GaleriaTema;
  aspect: "square" | "portrait" | "landscape";
  /** `true` mientras `src` sea el marcador y no una foto real. */
  pendiente: boolean;
}

const PLACEHOLDER = "/images/placeholder.svg";

export const GALERIA: readonly GaleriaItem[] = [
  { id: "g01", src: PLACEHOLDER, alt: "Manicura rusa con esmalte semipermanente en tono nude, acabado en espejo", tema: "manos", aspect: "square", pendiente: true },
  { id: "g02", src: PLACEHOLDER, alt: "Uñas almendradas en rosa empolvado con francesa fina", tema: "manos", aspect: "portrait", pendiente: true },
  { id: "g03", src: PLACEHOLDER, alt: "Nail art floral en blanco sobre base rosa pastel", tema: "nail-art", aspect: "square", pendiente: true },
  { id: "g04", src: PLACEHOLDER, alt: "Interior del salón: sillas de manicura junto a la ventana", tema: "salon", aspect: "landscape", pendiente: true },
  { id: "g05", src: PLACEHOLDER, alt: "Pedicura completa con esmalte carmín", tema: "pies", aspect: "square", pendiente: true },
  { id: "g06", src: PLACEHOLDER, alt: "Extensión de uñas en gel con efecto babyboomer", tema: "manos", aspect: "portrait", pendiente: true },
  { id: "g07", src: PLACEHOLDER, alt: "Diseño de cejas con laminado, antes y después", tema: "mirada", aspect: "square", pendiente: true },
  { id: "g08", src: PLACEHOLDER, alt: "Nail art minimalista con líneas doradas sobre fondo lechoso", tema: "nail-art", aspect: "square", pendiente: true },
  { id: "g09", src: PLACEHOLDER, alt: "Mostrador y expositor de esmaltes del salón", tema: "salon", aspect: "landscape", pendiente: true },
  { id: "g10", src: PLACEHOLDER, alt: "Nivelación con acrylgel en uñas cortas, acabado natural", tema: "manos", aspect: "square", pendiente: true },
  { id: "g11", src: PLACEHOLDER, alt: "Lifting de pestañas con tinte, primer plano de la mirada", tema: "mirada", aspect: "portrait", pendiente: true },
  { id: "g12", src: PLACEHOLDER, alt: "Manicura en rojo clásico con cutícula perfilada", tema: "manos", aspect: "square", pendiente: true },
  { id: "g13", src: PLACEHOLDER, alt: "Nail art de temporada con pequeños detalles pintados a mano", tema: "nail-art", aspect: "portrait", pendiente: true },
  { id: "g14", src: PLACEHOLDER, alt: "Pedicura spa con exfoliación e hidratación", tema: "pies", aspect: "landscape", pendiente: true },
  { id: "g15", src: PLACEHOLDER, alt: "Uñas de gel largas en forma coffin con acabado mate", tema: "manos", aspect: "portrait", pendiente: true },
  { id: "g16", src: PLACEHOLDER, alt: "Fachada del salón en Rúa Río Mao", tema: "salon", aspect: "landscape", pendiente: true },
  { id: "g17", src: PLACEHOLDER, alt: "Francesa invertida en rosa fuerte sobre base transparente", tema: "nail-art", aspect: "square", pendiente: true },
  { id: "g18", src: PLACEHOLDER, alt: "Manicura rusa con esmaltado en tono malva", tema: "manos", aspect: "square", pendiente: true },
  { id: "g19", src: PLACEHOLDER, alt: "Cejas diseñadas y perfiladas, resultado final", tema: "mirada", aspect: "square", pendiente: true },
  { id: "g20", src: PLACEHOLDER, alt: "Zona de pedicura del salón con sillón y luz natural", tema: "salon", aspect: "landscape", pendiente: true },
];
