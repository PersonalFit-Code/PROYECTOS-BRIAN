import type { Section } from "./shape";

/**
 * Sección "Proba social" (#opiniones): cabeceira, contadores, columnas de recensións reais en
 * marquee, ligazóns a Google / TripAdvisor e galería de fotos do local.
 * Os marcadores {así} énchense con useFormat(): t(m.social.description, { rating, count }).
 */
const social: Section<"social"> = {
  kicker: "Proba social",
  title: "Dino máis de {count}",
  accent: "clientes",
  description:
    "{rating} sobre 5 en Google con {count} recensións e Travellers' Choice en TripAdvisor. O que se repite en todas: produto da ría, tixolas de ferro que chegan chiando e unha terraza coa Catedral de fondo.",
  /** Resumo de valoración xunto á cabeceira: "Google · 858 opinións" */
  ratingSummary: "Google · {count} opinións",
  stats: {
    reviews: "Recensións de clientes",
    reviewsSub: "en Google",
    rating: "Valoración media",
    ratingSub: "Google · {count} opinións",
    rank: "En zamburiñas da zona",
    rankSub: "segundo os nosos clientes",
    position: "Restaurante de Ourense",
    positionSub: "TripAdvisor · Travellers' Choice",
  },
  statsAria: "Cifras de Tixola",
  reviewsTitle: "Palabra de",
  reviewsAccent: "quen xa veu",
  reviewsNote:
    "Recensións publicadas en TripAdvisor e Google, tal e como as escribiron os seus autores. Só as de cinco estrelas.",
  realReviews: "Recensións reais",
  fiveStars: "Cinco estrelas",
  seeGoogle: "Ver recensións en Google",
  seeTripadvisor: "Ver en TripAdvisor",
  pauseHint: "Pasa o rato para pausar",
  /** Columnas de recensións (ReviewMarquee) */
  marquee: {
    label: "Opinións de clientes",
    summary: "{count} recensións de clientes con cinco estrelas, publicadas en TripAdvisor e Google.",
    pause: "Pausar as reseñas",
    play: "Retomar as reseñas",
  },
  /** Tarxeta de recensión (ReviewCard) */
  card: {
    stars: "{rating} de 5 estrelas",
    on: "Recensión publicada en {source}",
    by: "Recensión de {author}",
    verified: "Recensión verificada",
  },
  /** Ligazóns a plataformas */
  platforms: {
    aria: "Ver máis opinións",
    see: "Ver",
    reviews: "{count} recensións",
    rank: "n.º {rank} de {total}",
  },
  /** Galería de fotos (PhotoGallery) */
  gallery: {
    kicker: "Galería",
    title: "Tixola en",
    accent: "imaxes",
    description: "O local, a terraza e os pratos tal e como son: fotos reais, sen filtros nin retoques.",
    label: "Galería de fotos de Tixola Tapería",
    prev: "Foto anterior",
    next: "Foto seguinte",
    goTo: "Ver a foto {index}: {caption}",
    current: "actual",
    open: "Ampliar a foto: {caption}",
    hint: "Preme unha foto para ampliala",
    swipe: "Ver máis fotos",
    pause: "Pausar a galería",
    play: "Retomar a galería",
    slide: "Foto {index} de {total}",
    /** Anuncio para lectores de pantalla ao cambiar de foto (só coa galería en pausa). */
    status: "Foto {index} de {total}: {caption}",
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
  verified: "Recensión verificada",
};
export default social;
