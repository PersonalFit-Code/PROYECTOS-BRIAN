/**
 * Sección "Prueba social" (#opiniones): cabecera, contadores, columnas de reseñas reales en
 * marquee, enlaces a Google / TripAdvisor y galería de fotos del local.
 * Los marcadores {así} se rellenan con useFormat(): t(m.social.description, { rating, count }).
 */
const social = {
  kicker: "Prueba social",
  title: "Lo dicen más de 850",
  accent: "clientes",
  description:
    "{rating} sobre 5 en Google con {count} reseñas y Travellers' Choice en TripAdvisor. Lo que se repite en todas: producto de la ría, tixolas de hierro que llegan chisporroteando y una terraza con la Catedral de fondo.",
  /** Resumen de valoración junto a la cabecera: "Google · 858 opiniones" */
  ratingSummary: "Google · {count} opiniones",
  stats: {
    reviews: "Reseñas de clientes",
    reviewsSub: "en Google",
    rating: "Valoración media",
    ratingSub: "Google · 858 opiniones",
    rank: "En zamburiñas de la zona",
    rankSub: "según nuestros clientes",
    position: "Restaurante de Ourense",
    positionSub: "TripAdvisor · Travellers' Choice",
  },
  statsAria: "Cifras de Tixola",
  reviewsTitle: "Palabra de",
  reviewsAccent: "quien ya ha venido",
  reviewsNote:
    "Reseñas publicadas en TripAdvisor y Google, tal y como las escribieron sus autores. Solo las de cinco estrellas.",
  realReviews: "Reseñas reales",
  fiveStars: "Cinco estrellas",
  seeGoogle: "Ver reseñas en Google",
  seeTripadvisor: "Ver en TripAdvisor",
  pauseHint: "Pasa el ratón para pausar",
  /** Columnas de reseñas (ReviewMarquee) */
  marquee: {
    label: "Opiniones de clientes",
    summary: "{count} reseñas de clientes con cinco estrellas, publicadas en TripAdvisor y Google.",
    column: "Columna {index} de opiniones",
  },
  /** Tarjeta de reseña (ReviewCard) */
  card: {
    stars: "{rating} de 5 estrellas",
    on: "Reseña publicada en {source}",
    by: "Reseña de {author}",
    verified: "Reseña verificada",
  },
  /** Enlaces a plataformas */
  platforms: {
    aria: "Ver más opiniones",
    see: "Ver",
    reviews: "{count} reseñas",
    rank: "nº {rank} de {total}",
  },
  /** Galería de fotos (PhotoGallery) */
  gallery: {
    kicker: "Galería",
    title: "Tixola en",
    accent: "imágenes",
    description: "El local, la terraza y los platos tal cual son: fotos reales, sin filtros ni retoques.",
    label: "Galería de fotos de Tixola Tapería",
    prev: "Foto anterior",
    next: "Foto siguiente",
    goTo: "Ver la foto {index}: {caption}",
    current: "actual",
    open: "Ampliar la foto: {caption}",
    hint: "Pulsa una foto para ampliarla",
    swipe: "Desliza para ver más fotos",
    pause: "Pausar la galería",
    play: "Reanudar la galería",
    slide: "Foto {index} de {total}",
    /** Anuncio para lectores de pantalla al cambiar de foto (solo con la galería en pausa). */
    status: "Foto {index} de {total}: {caption}",
    /** Visor a pantalla completa */
    lightbox: {
      label: "Foto ampliada: {caption}",
      close: "Cerrar la foto ampliada",
      prev: "Foto anterior",
      next: "Foto siguiente",
      counter: "{index} de {total}",
      hint: "Escape para cerrar · flechas para cambiar de foto",
    },
  },
  verified: "Reseña verificada",
} as const;
export default social;
