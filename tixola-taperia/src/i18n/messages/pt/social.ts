import type esSocial from "@/i18n/messages/es/social";
import type { Translation } from "./shape";

/**
 * Secção "Prova social" (#opiniones): cabeçalho, ligações para as fichas de Google / TripAdvisor,
 * contadores e galeria de fotografias do espaço.
 * Os marcadores {assim} são preenchidos com useFormat(): t(m.social.description, { rating, count }).
 */
const social = {
  kicker: "Prova social",
  title: "É o que dizem mais de {count}",
  accent: "clientes",
  description:
    "O que se repete nas avaliações: produto da ria, tixolas de ferro que chegam a chiar e uma esplanada com a Catedral como pano de fundo.",
  stats: {
    reviews: "Avaliações de clientes",
    reviewsSub: "no Google",
    rating: "Classificação média",
    ratingSub: "Google · {count} opiniões",
    wines: "Vinhos na carta",
    winesSub: "galegos e de fora",
    platos: "Pratos na ementa",
    platosSub: "cozinha galega de sempre",
  },
  /** Palavra centrada sobre a régua superior da faixa de números (SocialProof). */
  statsTitle: "Em números",
  statsAria: "Números da Tixola",
  reviewsNote:
    "As opiniões de quem cá esteve estão onde foram escritas: no Google e no TripAdvisor. Aí leem-se na íntegra e sempre atualizadas.",
  seeGoogle: "Ver avaliações no Google",
  seeTripadvisor: "Ver no TripAdvisor",
  /** Etiqueta acessível das estrelas (PlatformBadge) */
  card: {
    stars: "{rating} em 5 estrelas",
  },
  /** Ligações para plataformas */
  platforms: {
    aria: "Ver mais opiniões",
    see: "Ver",
    reviews: "{count} avaliações",
  },
  /** Galeria de fotografias (PhotoGallery) */
  gallery: {
    kicker: "Galeria",
    title: "A Tixola em",
    accent: "imagens",
    description: "O espaço, a esplanada e os pratos tal como são: fotografias reais, sem filtros nem retoques.",
    label: "Galeria de fotografias da Tixola Tapería",
    count: "{count} fotografias",
    themesAria: "Filtrar a galeria por tema",
    themes: {
      all: "Todas",
      plato: "Pratos",
      local: "O espaço",
      vinos: "Vinhos",
      terraza: "Esplanada",
    },
    showAll: "Ver as {count} fotografias",
    showLess: "Ver menos",
    open: "Ampliar a fotografia: {caption}",
    hint: "Toque numa fotografia para a ampliar",
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
} satisfies Translation<typeof esSocial>;
export default social;
