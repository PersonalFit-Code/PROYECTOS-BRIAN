/**
 * Textos de la página /vinos (vinoteca). Los marcadores {así} se rellenan con useFormat().
 *
 * ESTA PÁGINA SE PUBLICA SIN VINOS, y es una decisión del cliente, no un descuido. La lista
 * definitiva todavía no ha llegado —la dueña va a dejar de comprar algunos de los que hay hoy en la
 * carta de papel—, y publicar una lista que mañana no se pueda servir es exactamente el error que
 * esta web ya corrigió una vez con los platos inventados del FAQ. Así que mientras `WINES_PENDING`
 * siga en pie se enseña un aviso honesto y el contexto de las denominaciones gallegas, que es
 * información verdadera y útil, y no una carta de mentira.
 */
const vinos = {
  /* ── Cabecera ── */
  kicker: "Vinoteca",
  title: "La Carta",
  accent: "de Vinos",
  description:
    "Tixola es tapería y vinoteca: el vino gallego no es aquí un acompañamiento, es la mitad de la casa. Aquí irá la carta con su bodega, su uva y su precio.",

  /* ── Aviso mientras no hay vinos ── */
  pendingKicker: "En preparación",
  pendingTitle: "Estamos cerrando la carta de vinos",
  pendingText:
    "Todavía no está publicada, y preferimos que siga así unos días más: queremos que cada botella de esta lista sea una que de verdad podamos descorcharte, no una que estuviera en la carta el año pasado.",
  pendingAction: "Mientras tanto, pregúntanos: te contamos qué hay abierto hoy y qué le va bien a lo que vayas a comer.",
  pendingAsk: "¿Qué vinos tenéis hoy y cuál me recomendáis?",
  pendingCta: "Preguntar al camarero virtual",
  pendingWhatsapp: "Preguntar por WhatsApp",

  /* ── Las denominaciones de origen gallegas ── */
  regionsKicker: "De dónde viene",
  regionsTitle: "Las cinco denominaciones",
  regionsAccent: "de Galicia",
  /* "Cuatro" no es una floritura: tres están enteras en Ourense (Ribeiro, Valdeorras y Monterrei)
     y la Ribeira Sacra la comparte con Lugo. Y el dato del ayuntamiento es literal: la zona de
     producción del Ribeiro incluye Santa Cruz de Arrabaldo y Untes, que son Ourense capital. */
  regionsLead:
    "Galicia tiene cinco denominaciones de origen y cuatro tienen viñedo en la provincia de Ourense. El propio ayuntamiento de la ciudad está dentro de la D.O. Ribeiro: el vino de aquí se hace, literalmente, al lado.",
  /* La aclaración que impide leer el mapa como si fuera la carta. Va visible, no en letra pequeña. */
  regionsNote:
    "Este es el mapa del vino gallego, no nuestra carta todavía: cuando la cerremos te diremos de cuáles de estas zonas viene cada botella.",
  mapAria: "Mapa de Galicia con las cinco denominaciones de origen de vino",
  mapTitle: "Galicia",
  inOurense: "Provincia de Ourense",
  whites: "Uvas blancas",
  reds: "Uvas tintas",
  since: "D.O. desde {year}",
  regionAria: "Denominación de origen {name}",
  /** Abreviatura de "denominación de origen", delante del nombre protegido. */
  doPrefix: "D.O.",
  mapAtlantic: "Atlántico",
  mapPortugal: "Portugal",
  mapHere: "Estamos aquí",
  mostly: { blanco: "Sobre todo blanco", tinto: "Sobre todo tinto" },
  /* Una frase por denominación, sacada de su pliego de condiciones o de la web de su consejo
     regulador. Explican a qué saben sus vinos y por qué, que es lo que pidió el cliente para quien
     no entiende de vino. No son adornos: si hay que corregirlas, se corrigen contra esas fuentes. */
  regionCharacter: {
    "rias-baixas":
      "Clima atlántico y el mar al lado, con el viñedo por debajo de los 300 metros. De ahí salen blancos de acidez marcada y mucho aroma más que de mucho alcohol: justo lo que pide el marisco.",
    ribeiro:
      "Zona de transición, con el aire atlántico suavizado por las montañas que la cierran al norte y al oeste. Entre el día y la noche hay mucha diferencia de temperatura, así que la uva madura despacio y conserva el aroma y el frescor.",
    "ribeira-sacra":
      "Viñedo en bancales sobre los cañones del Miño y el Sil, en laderas tan bruscas que a esto lo llaman viticultura heroica. Más continental que atlántica: veranos largos y calurosos, otoños templados.",
    valdeorras:
      "Mediterráneo con influencia atlántica, en el valle del Sil y por encima de los 450 metros. Sobre suelo de pizarra, los vinos salen con un carácter mineral muy marcado.",
    monterrei:
      "La única de las cinco que vierte al Duero, por el Támega, pegada a la frontera con Portugal. Veranos calurosos y secos, inviernos fríos, y hasta 20 grados de diferencia entre el día y la noche cuando madura la uva.",
  },

  /* ── Ficha de vino (se usará cuando llegue la carta) ── */
  kinds: {
    blanco: "Blancos",
    tinto: "Tintos",
    rosado: "Rosados",
    espumoso: "Espumosos",
    dulce: "Dulces",
  },
  glass: "Copa",
  bottle: "Botella",
  grapes: "Uva",
  vintage: "Añada",
  ageing: "Crianza",
  abv: "Graduación",
  winery: "Bodega",
  pairsWith: "Marida con",
  openWine: "Ver la ficha de {name}",
  closeWine: "Cerrar la ficha",
  count: "{count} vinos",
  priceNote: "Precios con IVA incluido, los mismos que en la carta del local.",

  /* ── SEO (metadatos de /vinos; no se pintan en pantalla) ── */
  seoTitle: "Carta de vinos gallegos en Ourense",
  seoDescription:
    "Vinoteca junto a la Catedral de Ourense: vinos de las cinco denominaciones gallegas —Ribeiro, Valdeorras, Monterrei, Ribeira Sacra y Rías Baixas— para acompañar las tapas.",
} as const;
export default vinos;
