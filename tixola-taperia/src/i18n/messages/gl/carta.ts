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
    "Toda a carta á vista: filtra por categoría, busca un prato ou pregúntalle ao camareiro virtual. Prezos co IVE incluído.",

  /* ── Chips de categorías ── */
  all: "Toda a carta",
  categories: "Categorías",
  categoriesAria: "Categorías da carta",
  chipCount: "{count} pratos",
  onlyThis: "Só esta",
  sectionCount: "{shown} de {total} pratos",

  /* ── Busca e resultados ── */
  search: "Busca un prato: zamburiñas, croquetas, polbo…",
  searchLabel: "Buscar na carta",
  searchClear: "Borrar a busca",
  results: "{count} pratos",
  resultOne: "1 prato",
  resultsUnit: "pratos",
  resultsUnitOne: "prato",
  resultsLive: "{count} pratos atopados",
  resultsRegion: "Pratos da carta",
  /* Nota corta para junto al precio grande de la ficha de plato: el art. 60.2.c TRLGDCU
     pide precio final con impuestos allí DONDE SE MUESTRE, y la portada enseñaba precios sin
     decirlo (en la carta sí estaba, en `priceNote`). */
  vatIncluded: "IVE incluído",
  priceNote: "Prezos co IVE incluído, os mesmos que na carta do local. A sobremesa do día e as suxestións anúncianse alí.",

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
  allergensAsk: "Consulta os alérxenos co persoal",
  allergensAria: "Alérxenos",

  /* ── Tarxeta de prato ── */
  tagsAria: "Características",
  pairing: "Marida con",
  variants: "Variantes",
  photoOf: "{name}, prato de Tixola Tapería en Ourense",
  /* Abrir la ficha del plato (DishSpotlight) desde la carta: la fila de móvil y la foto de escritorio. */
  openDish: "Ver a ficha de {name}",
  openDishCta: "Ver ficha",
  askAboutDish: "Que me contas do prato {name}? Leva alérxenos e con que viño o marido?",
  askAboutDishCta: "Preguntarlle ao camareiro",
  askAboutDishAria: "Preguntarlle ao camareiro virtual por {name}",

  /* ── Camareiro virtual ── */
  askWaiter: "Pregúntalle ao camareiro virtual",
  askWaiterKicker: "Camareiro virtual",
  askWaiterSub: "Que leva este prato? Media ración ou enteira? Algo vegano? Cóntacho de contado.",
  askWaiterHint: "Proba a preguntar",
  askWaiterCta: "Abrir o chat",
  askWaiterNote: "Responde coa carta e o horario de hoxe. Ante alerxias graves, confirma sempre co persoal.",

  /* ── CTA final ── */
  ctaKicker: "Á beira da Catedral",
  ctaTitle: "Entrouche a fame?",
  ctaLead: "Entrouche a",
  ctaAccent: "fame?",
  ctaText: "Non fai falta reservar: pásate a tomar uns viños á beira da Catedral e sentámoste por orde de chegada.",
  seoTitle: "Carta de tapas e zamburiñas en Ourense",
  seoDescription: "Tapas, tixolas de ferro, zamburiñas, polbo e croquetas caseiras xunto á Catedral de Ourense. Carta completa cos alérxenos prato a prato e filtro por alérxeno.",
};
export default carta;
