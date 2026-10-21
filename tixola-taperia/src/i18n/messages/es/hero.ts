/**
 * Portada (hero). Las líneas del titular se declaran a mano para que la composición editorial
 * (máximo 3 líneas, palabra acentuada en cursiva) sea idéntica en todos los idiomas.
 */
const TITLE_LINES: readonly string[] = ["El Arte del Tapeo", "en el Corazón", "de Ourense"];

const hero = {
  kicker: "Tapería · Vinoteca · Ourense",
  /* TÍTULO Y DESCRIPCIÓN DE LA PORTADA EN BUSCADORES, aparte del titular que se lee en pantalla.
     Se separaron el 21-10-2026 por un motivo concreto: el título era «Tixola Tapería · El Arte del
     Tapeo en el Corazón de Ourense» y NO llevaba la palabra «vinoteca», que es justo la que la
     gente escribe. En gastroranking, planomato y paxinasgalegas la casa figura como «Tixola Tapería
     Vinoteca», y ese es el nombre por el que se busca. El nombre completo lo pone el layout desde
     `BUSINESS.legalName`; aquí va solo la cola, corta, para no pasar de 60 caracteres. */
  seoTitle: "Tapas y vinos en Ourense",
  seoDescription:
    "Tapería y vinoteca junto a la Catedral de Ourense: tixolas de hierro, zamburiñas, pulpo y vinos gallegos.",
  /** Titular completo (metadatos, lectores de pantalla). */
  title: "El Arte del Tapeo en el Corazón de Ourense",
  /** Titular partido en líneas de portada (máx. 3). */
  titleLines: TITLE_LINES,
  /** Palabra del título que se resalta en cursiva con degradado de brasa. */
  accent: "Corazón",
  subtitle:
    "Tixolas de hierro que llegan chisporroteando, croquetas caseras, pulpo de la ría y raciones para compartir con un buen vino gallego, a un minuto de la Catedral.",
  ctaPrimary: "Ver la carta",
  ctaSecondary: "Cómo llegar",
  scrollCue: "Descubrir la casa",
  scrollCueAria: "Bajar a los platos estrella",
  since: "Casco histórico de Ourense",
  /** Enlace discreto bajo los CTAs: "4,4 · 858 reseñas en Google". */
  reviewsLink: "Ver las reseñas en Google",
} as const;
export default hero;
