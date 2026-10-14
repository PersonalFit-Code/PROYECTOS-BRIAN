/**
 * Sección "Prueba social" (#opiniones): cabecera, enlaces a las fichas de Google / TripAdvisor,
 * contadores y galería de fotos del local.
 * Los marcadores {así} se rellenan con useFormat(): t(m.social.title, { count }).
 */
const social = {
  kicker: "Prueba social",
  title: "Lo dicen más de {count}",
  accent: "clientes",
  description:
    "Lo que se repite en las reseñas: producto de la ría, tixolas de hierro que llegan chisporroteando y una terraza con la Catedral de fondo.",
  stats: {
    reviews: "Reseñas de clientes",
    reviewsSub: "en Google",
    rating: "Valoración media",
    ratingSub: "Google · {count} opiniones",
    wines: "Vinos en carta",
    winesSub: "gallegos y de fuera",
    platos: "Platos en la carta",
    platosSub: "cocina gallega de siempre",
  },
  /** Palabra centrada sobre la regla superior de la banda de cifras (SocialProof). */
  statsTitle: "En cifras",
  statsAria: "Cifras de Tixola",
  reviewsNote:
    "Las opiniones de quienes han venido están donde las escribieron: en Google y en TripAdvisor. Ahí se leen enteras y al día.",
  seeGoogle: "Ver reseñas en Google",
  seeTripadvisor: "Ver en TripAdvisor",
  /** Etiqueta accesible de las estrellas (PlatformBadge) */
  card: {
    stars: "{rating} de 5 estrellas",
  },
  /** Enlaces a plataformas */
  platforms: {
    aria: "Ver más opiniones",
    see: "Ver",
    reviews: "{count} reseñas",
  },
  /** Galería de fotos (PhotoGallery) */
  gallery: {
    kicker: "Galería",
    title: "Tixola en",
    accent: "imágenes",
    description: "El local, la terraza y los platos tal cual son: fotos reales, sin filtros ni retoques.",
    label: "Galería de fotos de Tixola Tapería",
    /** Recuento de fotos: va en las chapas del filtro (para lectores de pantalla) */
    count: "{count} fotos",
    /** Filtro por tema del mural */
    themesAria: "Filtrar la galería por tema",
    themes: {
      all: "Todas",
      plato: "Platos",
      local: "El local",
      vinos: "Vinos",
      terraza: "Terraza",
    },
    showAll: "Ver las {count} fotos",
    showLess: "Ver menos",
    open: "Ampliar la foto: {caption}",
    hint: "Pulsa una foto para ampliarla",
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
} as const;
export default social;
