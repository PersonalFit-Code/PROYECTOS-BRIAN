import type { Section } from "./shape";

/**
 * Portada (hero). As liñas do titular decláranse a man para que a composición editorial
 * (máximo 3 liñas, palabra acentuada en cursiva) sexa idéntica en todos os idiomas.
 */
const TITLE_LINES: readonly string[] = ["A Arte do Tapeo", "no Corazón", "de Ourense"];

const hero: Section<"hero"> = {
  kicker: "Tapería · Vinoteca · Ourense",
  /** Titular completo (metadatos, lectores de pantalla). */
  title: "A Arte do Tapeo no Corazón de Ourense",
  /** Titular partido en liñas de portada (máx. 3). */
  titleLines: TITLE_LINES,
  /** Palabra do título que se resalta en cursiva con degradado de brasa. */
  accent: "Corazón",
  subtitle:
    "Tixolas de ferro que chegan á mesa chiando, croquetas caseiras, polbo da ría e racións para compartir cun bo viño galego, a un minuto da Catedral.",
  ctaPrimary: "Reservar Mesa",
  ctaSecondary: "Ir á Carta",
  scrollCue: "Descubrir a casa",
  scrollCueAria: "Baixar aos pratos estrela",
  enable3d: "Activar 3D",
  enable3dAria: "Activar o efecto 3D co xiroscopio do móbil",
  since: "Casco histórico de Ourense",
  /** Ligazón discreta baixo os CTAs: "4,4 · 858 recensións en Google". */
  reviewsLink: "Ver as recensións en Google",
};
export default hero;
