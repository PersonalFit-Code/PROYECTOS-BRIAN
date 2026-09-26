import type esCarta from "@/i18n/messages/es/carta";
import type { Translation } from "./shape";

/**
 * Textos da página /carta (explorador da ementa, filtros, legenda de alergénios,
 * empregado virtual e CTA final). Os marcadores {assim} são preenchidos com useFormat().
 */
const carta = {
  /* ── Cabeçalho ── */
  kicker: "Ementa digital",
  title: "A Ementa",
  accent: "da Tixola",
  description:
    "Toda a ementa à vista: filtre por categoria, procure um prato ou pergunte ao empregado virtual. Preços indicativos, IVA incluído.",
  dailyBoard: "Sugestões do dia",
  physicalMenu: "Ementa física",
  dailyBoardAlt: "Quadro de sugestões do dia da Tixola Tapería escrito a giz, com as sugestões da lota e do mercado",
  physicalMenuAlt: "Ementa física impressa da Tixola Tapería em Ourense",
  polaroidsAria: "Fotografias do quadro de sugestões e da ementa física",

  /* ── Chips de categorias ── */
  all: "Toda a ementa",
  categories: "Categorias",
  categoriesAria: "Categorias da ementa",
  chipCount: "{count} pratos",
  onlyThis: "Só esta",
  sectionCount: "{shown} de {total} pratos",

  /* ── Pesquisa e resultados ── */
  search: "Procure um prato: zamburiñas, croquetes, godello…",
  searchLabel: "Pesquisar na ementa",
  searchClear: "Limpar pesquisa",
  results: "{count} pratos",
  resultOne: "1 prato",
  resultsUnit: "pratos",
  resultsUnitOne: "prato",
  resultsLive: "{count} pratos encontrados",
  resultsRegion: "Pratos da ementa",
  priceNote: "Preços indicativos, IVA incluído. Pergunte pelas sugestões do dia.",

  /* ── Painel de filtros ── */
  filters: "Filtros",
  filtersAria: "Filtros da ementa",
  filtersActive: "{count} filtros ativos",
  filtersOpen: "Mostrar filtros",
  filtersClose: "Ocultar filtros",
  showResults: "Ver {count} pratos",
  preferences: "Preferências",
  preferencesAria: "Etiquetas alimentares",
  excludeAllergens: "Excluir alergénios",
  excludeAllergensHint: "Marque um alergénio e os pratos que o contêm desaparecem da ementa.",
  excludeAllergensAria: "Alergénios a excluir",
  excludeOne: "Excluir pratos com {name}",
  includeOne: "Voltar a mostrar pratos com {name}",
  hidingAllergens: "A ocultar {count} alergénios",
  clear: "Limpar filtros",

  /* ── Estado vazio ── */
  empty: "Sem resultados com estes filtros",
  emptyHint: "Experimente retirar algum filtro ou pergunte ao empregado virtual.",
  emptyAsk: "Não encontro o que procuro na ementa. O que me recomendas?",
  emptyAskQuery: "Procuro «{query}» na ementa e não o encontro. O que me recomendas?",

  /* ── Legenda de alergénios (modal) ── */
  legend: "Legenda de alergénios",
  legendSub: "Os 14 alergénios da UE, prato a prato",
  legendKicker: "Alergénios",
  legendLink: "Ver legenda de alergénios",
  legendFooter: "Dúvidas sobre algum alergénio?",
  legendClose: "Fechar legenda",
  legendCode: "Código {code}",
  legendNote:
    "Informação sobre alergénios de acordo com o Regulamento (UE) n.º 1169/2011. Em caso de dúvida, consulte o pessoal; a nossa cozinha manipula todos os alergénios.",
  noAllergens: "Sem alergénios declarados",
  allergensAria: "Alergénios",

  /* ── Cartão de prato ── */
  tagsAria: "Características",
  pairing: "Harmoniza com",
  variants: "Variantes",
  photoOf: "{name}, prato da Tixola Tapería em Ourense",
  askAboutDish: "O que me podes dizer sobre o prato {name}? Tem alergénios e com que vinho o harmonizo?",
  askAboutDishCta: "Perguntar ao empregado",
  askAboutDishAria: "Perguntar ao empregado virtual sobre {name}",

  /* ── Empregado virtual ── */
  askWaiter: "Pergunte ao empregado virtual",
  askWaiterKicker: "Empregado virtual",
  askWaiterSub: "Sem glúten? Que vinho vai com o polvo? Algo vegano? Responde-lhe na hora.",
  askWaiterHint: "Experimente perguntar",
  askWaiterCta: "Abrir o chat",
  askWaiterNote: "Responde com a ementa e o horário de hoje. Em caso de alergias graves, confirme sempre com o pessoal.",

  /* ── CTA final ── */
  ctaKicker: "Junto à Catedral",
  ctaTitle: "Ficou com fome?",
  ctaLead: "Ficou com",
  ctaAccent: "fome?",
  ctaText: "Reserve mesa ou passe por cá para uns vinhos junto à Catedral.",
} satisfies Translation<typeof esCarta>;
export default carta;
