/**
 * Forma de una profesional tal y como la consume `EquipoCarousel`. Es la proyección de la vista
 * `public_staff` (sin datos personales más allá de lo que ella decide publicar). Hoy sale del
 * fixture; en la fase 1b, de la base de datos.
 */
export interface Profesional {
  id: string;
  /** Va en la URL de reserva (`reservar.<dominio>/?con=<slug>`) y en la bio de Instagram. */
  slug: string;
  nombre: string;
  /** «Directora», «Manicurista»… una línea. */
  rol: string;
  bio: string;
  especialidades: readonly string[];
  /** URL completa del perfil de Instagram, si lo publica. */
  instagram: string | null;
  foto: { src: string; alt: string };
  /** Se puede reservar con ella desde la web. */
  reservableOnline: boolean;
  /** Foto o datos provisionales, pendientes de confirmar. */
  pendiente: boolean;
}
