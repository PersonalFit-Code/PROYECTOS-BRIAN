import type esSocial from "@/i18n/messages/es/social";
import type { Translation } from "./shape";

/**
 * Secção "Prova social" (#opiniones): cabeçalho, contadores, colunas de avaliações reais em
 * marquee, ligações para Google / TripAdvisor e galeria de fotografias do espaço.
 * Os marcadores {assim} são preenchidos com useFormat(): t(m.social.description, { rating, count }).
 */
const social = {
  kicker: "Prova social",
  title: "Dizem-no mais de 850",
  accent: "clientes",
  description:
    "{rating} em 5 no Google com {count} avaliações e Travellers' Choice no TripAdvisor. O que se repete em todas: produto da ria, tixolas de ferro que chegam a chiar e uma esplanada com a Catedral como pano de fundo.",
  /** Resumo da classificação junto ao cabeçalho: "Google · 858 opiniões" */
  ratingSummary: "Google · {count} opiniões",
  stats: {
    reviews: "Avaliações de clientes",
    reviewsSub: "no Google",
    rating: "Classificação média",
    ratingSub: "Google · 858 opiniões",
    rank: "Em zamburiñas na zona",
    rankSub: "segundo os nossos clientes",
    position: "Restaurante de Ourense",
    positionSub: "TripAdvisor · Travellers' Choice",
  },
  statsAria: "Números da Tixola",
  reviewsTitle: "Palavra de",
  reviewsAccent: "quem já cá veio",
  reviewsNote:
    "Avaliações publicadas no TripAdvisor e no Google, tal como os seus autores as escreveram. Só as de cinco estrelas.",
  realReviews: "Avaliações reais",
  fiveStars: "Cinco estrelas",
  seeGoogle: "Ver avaliações no Google",
  seeTripadvisor: "Ver no TripAdvisor",
  pauseHint: "Passe o rato para pausar",
  /** Colunas de avaliações (ReviewMarquee) */
  marquee: {
    label: "Opiniões de clientes",
    summary: "{count} avaliações de clientes com cinco estrelas, publicadas no TripAdvisor e no Google.",
  },
  /** Cartão de avaliação (ReviewCard) */
  card: {
    stars: "{rating} em 5 estrelas",
    on: "Avaliação publicada no {source}",
    by: "Avaliação de {author}",
    verified: "Avaliação verificada",
  },
  /** Ligações para plataformas */
  platforms: {
    aria: "Ver mais opiniões",
    see: "Ver",
    reviews: "{count} avaliações",
    rank: "n.º {rank} de {total}",
  },
  /** Galeria de fotografias (PhotoGallery) */
  gallery: {
    kicker: "Galeria",
    title: "A Tixola em",
    accent: "imagens",
    description: "O espaço, a esplanada e os pratos tal como são: fotografias reais, sem filtros nem retoques.",
    label: "Galeria de fotografias da Tixola Tapería",
    prev: "Fotografia anterior",
    next: "Fotografia seguinte",
    goTo: "Ver a fotografia {index}: {caption}",
    current: "atual",
    open: "Ampliar a fotografia: {caption}",
    hint: "Toque numa fotografia para a ampliar",
    swipe: "Deslize para ver mais fotografias",
    pause: "Pausar a galeria",
    play: "Retomar a galeria",
    slide: "Fotografia {index} de {total}",
    /** Anúncio para leitores de ecrã ao mudar de fotografia (só com a galeria em pausa). */
    status: "Fotografia {index} de {total}: {caption}",
    /** Visualizador em ecrã inteiro */
    lightbox: {
      label: "Fotografia ampliada: {caption}",
      close: "Fechar a fotografia ampliada",
      prev: "Fotografia anterior",
      next: "Fotografia seguinte",
      counter: "{index} de {total}",
      hint: "Escape para fechar · setas para mudar de fotografia",
    },
  },
  verified: "Avaliação verificada",
} satisfies Translation<typeof esSocial>;
export default social;
