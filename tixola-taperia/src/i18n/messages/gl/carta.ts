import type { Section } from "./shape";

/**
 * Textos da páxina /carta (explorador da carta, filtros, lenda de alérxenos,
 * camareiro virtual e CTA final). Os marcadores {así} énchense con useFormat().
 */
const carta: Section<"carta"> = {
  /* ── Cabeceira ── */
  kicker: "Carta dixital",
  title: "A Carta",
  accent: "de Tixola",
  description:
    "Toda a carta á vista: filtra por categoría, busca un prato ou pregúntalle ao camareiro virtual. Prezos orientativos, IVE incluído.",
  dailyBoard: "Lousa do día",
  physicalMenu: "Carta física",
  dailyBoardAlt: "Lousa do día de Tixola Tapería escrita con xiz, coas suxestións da lonxa e do mercado",
  physicalMenuAlt: "Carta física impresa de Tixola Tapería en Ourense",
  polaroidsAria: "Fotos da lousa e da carta física",

  /* ── Chips de categorías ── */
  all: "Toda a carta",
  categories: "Categorías",
  categoriesAria: "Categorías da carta",
  chipCount: "{count} pratos",
  onlyThis: "Só esta",
  sectionCount: "{shown} de {total} pratos",

  /* ── Busca e resultados ── */
  search: "Busca un prato: zamburiñas, croquetas, godello…",
  searchLabel: "Buscar na carta",
  searchClear: "Borrar a busca",
  results: "{count} pratos",
  resultOne: "1 prato",
  resultsUnit: "pratos",
  resultsUnitOne: "prato",
  resultsLive: "{count} pratos atopados",
  resultsRegion: "Pratos da carta",
  priceNote: "Prezos orientativos, IVE incluído. Pregunta pola lousa do día.",

  /* ── Panel de filtros ── */
  filters: "Filtros",
  filtersAria: "Filtros da carta",
  filtersActive: "{count} filtros activos",
  filtersOpen: "Mostrar os filtros",
  filtersClose: "Ocultar os filtros",
  showResults: "Ver {count} pratos",
  preferences: "Preferencias",
  preferencesAria: "Etiquetas dietéticas",
  excludeAllergens: "Excluír alérxenos",
  excludeAllergensHint: "Marca un alérxeno e desaparecerán da carta os pratos que o conteñen.",
  excludeAllergensAria: "Alérxenos para excluír",
  excludeOne: "Excluír os pratos con {name}",
  includeOne: "Volver mostrar os pratos con {name}",
  hidingAllergens: "Ocultando {count} alérxenos",
  clear: "Limpar os filtros",

  /* ── Estado baleiro ── */
  empty: "Sen resultados con estes filtros",
  emptyHint: "Proba a quitar algún filtro ou pregúntalle ao camareiro virtual.",
  emptyAsk: "Non atopo o que busco na carta. Que me recomendas?",
  emptyAskQuery: "Busco «{query}» na carta e non o atopo. Que me recomendas?",

  /* ── Lenda de alérxenos (modal) ── */
  legend: "Lenda de alérxenos",
  legendSub: "Os 14 alérxenos da UE, prato a prato",
  legendKicker: "Alérxenos",
  legendLink: "Ver a lenda de alérxenos",
  legendFooter: "Dúbidas con algún alérxeno?",
  legendClose: "Pechar a lenda",
  legendCode: "Código {code}",
  legendNote:
    "Información sobre alérxenos segundo o Regulamento (UE) 1169/2011. Pregúntalle ao persoal ante calquera dúbida; a nosa cociña manipula todos os alérxenos.",
  noAllergens: "Sen alérxenos declarados",
  allergensAria: "Alérxenos",

  /* ── Tarxeta de prato ── */
  tagsAria: "Características",
  pairing: "Marida con",
  variants: "Variantes",
  photoOf: "{name}, prato de Tixola Tapería en Ourense",
  askAboutDish: "Que me contas do prato {name}? Leva alérxenos e con que viño o marido?",
  askAboutDishCta: "Preguntarlle ao camareiro",
  askAboutDishAria: "Preguntarlle ao camareiro virtual por {name}",

  /* ── Camareiro virtual ── */
  askWaiter: "Pregúntalle ao camareiro virtual",
  askWaiterKicker: "Camareiro virtual",
  askWaiterSub: "Sen glute? Que viño vai co polbo? Algo vegano? Cóntacho de contado.",
  askWaiterHint: "Proba a preguntar",
  askWaiterCta: "Abrir o chat",
  askWaiterNote: "Responde coa carta e o horario de hoxe. Ante alerxias graves, confirma sempre co persoal.",

  /* ── CTA final ── */
  ctaKicker: "Á beira da Catedral",
  ctaTitle: "Entrouche a fame?",
  ctaLead: "Entrouche a",
  ctaAccent: "fame?",
  ctaText: "Reserva mesa ou pásate a tomar uns viños á beira da Catedral.",
};
export default carta;
