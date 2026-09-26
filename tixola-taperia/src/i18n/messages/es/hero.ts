/**
 * Portada (hero). Las líneas del titular se declaran a mano para que la composición editorial
 * (máximo 3 líneas, palabra acentuada en cursiva) sea idéntica en todos los idiomas.
 */
const TITLE_LINES: readonly string[] = ["El Arte del Tapeo", "en el Corazón", "de Ourense"];

const hero = {
  kicker: "Tapería · Vinoteca · Ourense",
  /** Titular completo (metadatos, lectores de pantalla). */
  title: "El Arte del Tapeo en el Corazón de Ourense",
  /** Titular partido en líneas de portada (máx. 3). */
  titleLines: TITLE_LINES,
  /** Palabra del título que se resalta en cursiva con degradado de brasa. */
  accent: "Corazón",
  subtitle:
    "Tixolas de hierro que llegan chisporroteando, croquetas caseras, pulpo de la ría y raciones para compartir con un buen vino gallego, a un minuto de la Catedral.",
  ctaPrimary: "Reservar Mesa",
  ctaSecondary: "Ir a la Carta",
  scrollCue: "Descubrir la casa",
  scrollCueAria: "Bajar a los platos estrella",
  enable3d: "Activar 3D",
  enable3dAria: "Activar el efecto 3D con el giroscopio del móvil",
  since: "Casco histórico de Ourense",
  /** Enlace discreto bajo los CTAs: "4,4 · 858 reseñas en Google". */
  reviewsLink: "Ver las reseñas en Google",
} as const;
export default hero;
