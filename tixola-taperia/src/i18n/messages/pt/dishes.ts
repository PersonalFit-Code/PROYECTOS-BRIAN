import type esDishes from "@/i18n/messages/es/dishes";
import type { Translation } from "./shape";

/**
 * Secção "Pratos estrela" (#platos): carrossel de fotografias reais + detalhe (DishSpotlight).
 * Os marcadores {assim} são preenchidos com useFormat(): t(m.dishes.slide, { index, total }).
 */
const dishes = {
  kicker: "Pratos estrela",
  title: "O que ninguém sai sem provar",
  accent: "na Tixola",
  description:
    "Produto galego da ria e do campo, marcado nas nossas tixolas de ferro até àquele ponto de brasa que só o ferro quente dá.",
  hint: "Toque para ver detalhes",
  ingredients: "Ingredientes",
  allergens: "Alergénios",
  noAllergens: "Sem alergénios declarados",
  allergensNote: "Em caso de alergia ou intolerância, diga-nos ao pedir: preparamos tudo com cuidado.",
  pairing: "Harmonização recomendada",
  pairingWhy: "Porque resulta",
  seeInMenu: "Ver na ementa",
  ctaMenu: "Ver ementa completa com alergénios",
  ctaNote: "Mais de 80 tapas, doses e vinhos galegos, com os 14 alergénios da UE assinalados prato a prato.",
  photoOf: "Fotografia de {name} na Tixola Tapería, Ourense",
  slide: "Prato {index} de {total}",
  /** Carrossel (DishCarousel) */
  carousel: {
    label: "Carrossel de pratos estrela",
    prev: "Prato anterior",
    next: "Prato seguinte",
    goTo: "Ir para {name}",
    current: "atual",
    hint: "Toque num prato para ver ingredientes, alergénios e harmonização",
    swipe: "Deslize para descobrir mais",
    open: "Ver detalhes de {name}",
    pause: "Pausar o carrossel",
    play: "Retomar o carrossel",
    /** Anúncio para leitores de ecrã ao mudar de prato (só com o carrossel em pausa). */
    status: "{name}, prato {index} de {total}",
  },
  /** Detalhe do prato (DishSpotlight) */
  spotlight: {
    dialogLabel: "Detalhes de {name}",
    close: "Fechar detalhes do prato",
    closeOverlay: "Fechar",
    dragHandle: "Arraste para baixo para fechar",
    perUnit: "/ {unit}",
    askWaiter: "Dúvidas? Pergunte ao empregado virtual",
    askWaiterPrefill: "Fala-me mais sobre {name}: como o preparam e que vinho me recomendam para acompanhar.",
    allergenContains: "Contém {label}",
    /** Lista de alergénios em texto, já localizada: "Contém: glúten, ovos" */
    contains: "Contém: {list}",
    priceLabel: "Preço",
  },
  /** Visual composto (tixola de ferro + ícone) quando o prato ainda não tem fotografia */
  visual: {
    label: "Ilustração de {name} numa tixola de ferro",
  },
} satisfies Translation<typeof esDishes>;
export default dishes;
