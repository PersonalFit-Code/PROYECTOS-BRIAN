import type { Section } from "./shape";

/**
 * Sección "Proba social" (#opiniones): cabeceira, ligazóns ás fichas de Google / TripAdvisor,
 * contadores e galería de fotos do local.
 * Os marcadores {así} énchense con useFormat(): t(m.social.title, { count }).
 */
const social: Section<"social"> = {
  kicker: "Proba social",
  title: "Así o din máis de {count}",
  accent: "clientes",
  description:
    "O que se repite nas recensións: produto da ría, tixolas de ferro que chegan chiando e unha terraza coa Catedral de fondo.",
  stats: {
    reviews: "Recensións de clientes",
    reviewsSub: "en Google",
    rating: "Valoración media",
    ratingSub: "Google · {count} opinións",
    wines: "Viños na carta",
    winesSub: "galegos e de fóra",
    platos: "Pratos na carta",
    platosSub: "cociña galega de sempre",
  },
  /** Palabra centrada sobre a regra superior da banda de cifras (SocialProof). */
  statsTitle: "En cifras",
  statsAria: "Cifras de Tixola",
  reviewsNote:
    "As opinións dos que viñeron están onde as escribiron: en Google e en TripAdvisor. Alí lense enteiras e ao día.",
  seeGoogle: "Ver recensións en Google",
  seeTripadvisor: "Ver en TripAdvisor",
  /** Etiqueta accesible das estrelas (PlatformBadge) */
  card: {
    stars: "{rating} de 5 estrelas",
  },
  /** Ligazóns a plataformas */
  platforms: {
    aria: "Ver máis opinións",
    see: "Ver",
    reviews: "{count} recensións",
  },
  /** Galería de fotos (PhotoGallery) */
  gallery: {
    kicker: "Galería",
    title: "Tixola en",
    accent: "imaxes",
    description: "O local, a terraza e os pratos tal e como son: fotos reais, sen filtros nin retoques.",
    label: "Galería de fotos de Tixola Tapería",
    count: "{count} fotos",
    themesAria: "Filtrar a galería por tema",
    themes: {
      all: "Todas",
      plato: "Pratos",
      local: "O local",
      vinos: "Viños",
      terraza: "Terraza",
    },
    showAll: "Ver as {count} fotos",
    showLess: "Ver menos",
    open: "Ampliar a foto: {caption}",
    hint: "Preme unha foto para ampliala",
    /** Visor a pantalla completa */
    lightbox: {
      label: "Foto ampliada: {caption}",
      close: "Pechar a foto ampliada",
      prev: "Foto anterior",
      next: "Foto seguinte",
      counter: "{index} de {total}",
      hint: "Escape para pechar · frechas para cambiar de foto",
    },
  },
};
export default social;
