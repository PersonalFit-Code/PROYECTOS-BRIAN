/**
 * Textos de la página /carta (explorador de la carta, filtros, leyenda de alérgenos,
 * camarero virtual y CTA final). Los marcadores {así} se rellenan con useFormat().
 */
const carta = {
  /* ── Cabecera ── */
  kicker: "Carta digital",
  title: "La Carta",
  accent: "de Tixola",
  description:
    "Toda la carta a la vista: filtra por categoría, busca un plato o pregúntale al camarero virtual. Precios orientativos, IVA incluido.",
  dailyBoard: "Pizarra del día",
  physicalMenu: "Carta física",
  dailyBoardAlt: "Pizarra del día de Tixola Tapería escrita con tiza, con las sugerencias de la lonja y del mercado",
  physicalMenuAlt: "Carta física impresa de Tixola Tapería en Ourense",
  polaroidsAria: "Fotos de la pizarra y de la carta física",

  /* ── Chips de categorías ── */
  all: "Toda la carta",
  categories: "Categorías",
  categoriesAria: "Categorías de la carta",
  chipCount: "{count} platos",
  onlyThis: "Solo esta",
  sectionCount: "{shown} de {total} platos",

  /* ── Búsqueda y resultados ── */
  search: "Busca un plato: zamburiñas, croquetas, godello…",
  searchLabel: "Buscar en la carta",
  searchClear: "Borrar búsqueda",
  results: "{count} platos",
  resultOne: "1 plato",
  resultsUnit: "platos",
  resultsUnitOne: "plato",
  resultsLive: "{count} platos encontrados",
  resultsRegion: "Platos de la carta",
  /* Nota corta para junto al precio grande de la ficha de plato: el art. 60.2.c TRLGDCU
     pide precio final con impuestos allí DONDE SE MUESTRE, y la portada enseñaba precios sin
     decirlo (en la carta sí estaba, en `priceNote`). */
  vatIncluded: "IVA incluido",
  priceNote: "Precios orientativos, IVA incluido. Pregunta por la pizarra del día.",

  /* ── Panel de filtros ── */
  filters: "Filtros",
  filtersAria: "Filtros de la carta",
  filtersActive: "{count} filtros activos",
  filtersOpen: "Mostrar filtros",
  filtersClose: "Ocultar filtros",
  showResults: "Ver {count} platos",
  preferences: "Preferencias",
  preferencesAria: "Etiquetas dietéticas",
  excludeAllergens: "Excluir alérgenos",
  excludeAllergensHint: "Marca un alérgeno y desaparecerán de la carta los platos que lo contienen.",
  excludeAllergensAria: "Alérgenos a excluir",
  excludeOne: "Excluir platos con {name}",
  includeOne: "Volver a mostrar platos con {name}",
  hidingAllergens: "Ocultando {count} alérgenos",
  clear: "Limpiar filtros",

  /* ── Estado vacío ── */
  empty: "Sin resultados con estos filtros",
  emptyHint: "Prueba a quitar algún filtro o pregúntale al camarero virtual.",
  emptyAsk: "No encuentro lo que busco en la carta. ¿Qué me recomiendas?",
  emptyAskQuery: "Busco «{query}» en la carta y no lo encuentro. ¿Qué me recomiendas?",

  /* ── Leyenda de alérgenos (modal) ── */
  legend: "Leyenda de alérgenos",
  legendSub: "Los 14 alérgenos de la UE, plato a plato",
  legendKicker: "Alérgenos",
  legendLink: "Ver leyenda de alérgenos",
  legendFooter: "¿Dudas con algún alérgeno?",
  legendClose: "Cerrar leyenda",
  legendCode: "Código {code}",
  legendNote:
    "Información sobre alérgenos según el Reglamento (UE) 1169/2011. Consulta al personal ante cualquier duda; nuestra cocina manipula todos los alérgenos.",
  /* Lo que se pinta cuando un plato no tiene alérgenos declarados. NO dice "sin alérgenos": la web
     solo declara PRESENCIA, nunca ausencia (no sabemos en qué aceite se fríe ni qué plancha se
     comparte), y una lista vacía que se lea como "esto es seguro" es justo el fallo que manda a
     alguien a urgencias. Es además lo que dice la carta de papel al pie de las dos caras. */
  allergensAsk: "Consulta los alérgenos con el personal",
  allergensAria: "Alérgenos",

  /* ── Tarjeta de plato ── */
  tagsAria: "Características",
  pairing: "Marida con",
  variants: "Variantes",
  photoOf: "{name}, plato de Tixola Tapería en Ourense",
  /* Abrir la ficha del plato (DishSpotlight) desde la carta: la fila de móvil y la foto de escritorio. */
  openDish: "Ver la ficha de {name}",
  openDishCta: "Ver ficha",
  askAboutDish: "¿Qué me cuentas del plato {name}? ¿Lleva alérgenos y con qué vino lo marido?",
  askAboutDishCta: "Preguntar al camarero",
  askAboutDishAria: "Preguntar al camarero virtual por {name}",

  /* ── Camarero virtual ── */
  askWaiter: "Pregúntale al camarero virtual",
  askWaiterKicker: "Camarero virtual",
  askWaiterSub: "¿Qué lleva este plato? ¿Media ración o entera? ¿Algo vegano? Te lo cuenta al momento.",
  askWaiterHint: "Prueba a preguntar",
  askWaiterCta: "Abrir el chat",
  askWaiterNote: "Responde con la carta y el horario de hoy. Ante alergias graves, confirma siempre con el personal.",

  /* ── CTA final ── */
  ctaKicker: "Junto a la Catedral",
  ctaTitle: "¿Te ha entrado hambre?",
  ctaLead: "¿Te ha entrado",
  ctaAccent: "hambre?",
  ctaText: "No hace falta reservar: pásate a tomar unos viños junto a la Catedral y te sentamos por orden de llegada.",
  /* ── SEO (metadatos de /carta; no se pintan en pantalla) ── */
  seoTitle: "Carta de tapas y zamburiñas en Ourense",
  seoDescription: "Tapas, tixolas de hierro, zamburiñas, pulpo y croquetas caseras junto a la Catedral de Ourense. Carta completa con alérgenos y maridajes de vino gallego.",
} as const;
export default carta;
