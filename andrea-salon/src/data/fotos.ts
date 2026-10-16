/**
 * Fotos de la línea editorial (portada, servicios, local). Las de trabajos van en `galeria.ts` y las
 * del equipo en la tabla `staff`.
 *
 * Mientras `pendiente` sea `true`, `FotoEditorial` pinta un marco nude con monograma en vez de la
 * foto. Cuando Brian pase las de Andrea: WebP de ~1600 px el lado largo y ≤ 200 KB en
 * `public/images/`, `src` a esa ruta, `ancho`/`alto` reales y `pendiente: false`. El `alt` ya dice
 * qué tiene que verse en cada una.
 */
export interface Foto {
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  pendiente: boolean;
}

const pendiente = (alt: string, ancho = 1200, alto = 1500): Foto => ({ src: "/images/placeholder.svg", alt, ancho, alto, pendiente: true });

export const FOTO_PORTADA: Foto = pendiente(
  "Manos de una clienta con manicura rusa en tono nude, cutícula perfecta, sobre una toalla blanca con luz natural",
  1600,
  1000,
);

/** Una por servicio de la lista editorial de la portada (misma clave que `SERVICIOS_EDITORIAL`). */
export const FOTOS_SERVICIO: Record<string, Foto> = {
  "manicura-rusa": pendiente("Primer plano de una manicura rusa terminada, con el torno al lado"),
  "nail-art": pendiente("Nail art pintado a mano con detalles finos sobre base lechosa"),
  pedicura: pendiente("Pedicura completa con esmalte claro, pies sobre una toalla blanca"),
  mirada: pendiente("Mirada con laminado de cejas y lifting de pestañas, de perfil"),
};

export const FOTO_SALON: Foto = pendiente("Interior del salón: mesa de manicura junto a la ventana y expositor de esmaltes", 1600, 1067);

export const FOTO_BONO: Foto = pendiente("Tarjeta regalo de Andrea Salón en su sobre, junto a un esmalte nude");
