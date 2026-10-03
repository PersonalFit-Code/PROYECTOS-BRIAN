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
    "En nuestra carta hay botellas de las cinco. Pincha en una denominación para ver las que tenemos de esa zona.",
  inList: "{count} en carta",
  mapAria: "Mapa de Galicia con las cinco denominaciones de origen de vino",
  /** Los cinco caminos animados del mapa, contados para quien no los ve. */
  mapFlow: "Desde cada una de ellas sale un camino hasta Ourense, donde está Tixola.",
  /** Atribución del contorno de Galicia: la licencia ODbL de OpenStreetMap la EXIGE visible. */
  mapCredit: "Contorno de Galicia: datos de OpenStreetMap, licencia ODbL.",
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
  count: "{count} vinos",

  /* Lo que se ve sin desplegar la ficha: nombre, bodega, denominación, añada y precio. */
  glass: "Copa",
  bottle: "Botella",
  winery: "Bodega",
  vintage: "Añada",

  /* Bloque 1 · uva y elaboración. */
  /* Alternativo de la foto de la botella: la etiqueta ya está en la foto, así que el texto dice
     de qué botella se trata y nada más. */
  bottlePhoto: "Botella de {name}",

  /* ── La denominación, dentro de la ficha de cada vino ──────────────────────────────────────
     De la mitad de la carta no sabemos más que el nombre y el precio, pero de las cinco gallegas
     sabemos mucho y está verificado contra sus consejos reguladores (`WINE_REGIONS`). Así una ficha
     escueta sigue contando algo cierto en vez de abrir un panel vacío. */
  blockRegion: "La denominación",
  regionProvinces: "Dónde",
  regionGrapes: "Uvas preferentes",
  askAboutWine: "Háblame del vino {name}. ¿A qué sabe y con qué plato de la carta lo tomarías?",
  askAboutWineCta: "Preguntar al camarero",
  askAboutWineAria: "Preguntar al camarero virtual por {name}",
  /* Lo que la casa todavía no ha rellenado. Dicho sin rodeos y sin fingir que no falta. */
  pendingSheet: "De esta botella aún no tenemos ficha completa. Pregúntanos en la barra, o al camarero virtual.",

  blockGrape: "Uva y elaboración",
  grapes: "Uva",
  /* Se calcula de la lista de uvas (una sola o varias), no se escribe vino a vino. */
  monovarietal: "Monovarietal",
  blend: "Ensamblaje",
  percent: "{value} %",
  ageing: "Crianza",
  winemaking: "Elaboración",
  methodsTitle: "Viñedo",
  /* "Ecológico" y "vegano" son certificaciones: solo se marcan si la bodega las tiene. */
  methods: {
    ecologico: "Ecológico",
    biodinamico: "Biodinámico",
    natural: "Natural",
    vegano: "Vegano",
    "de-pago": "Vino de pago",
    "de-parcela": "Vino de parcela",
  },
  abv: "Graduación",
  abvValue: "{value} % vol.",
  format: "Formato",
  formatValue: "{cl} cl",

  /* Bloque 2 · cata y servicio. */
  blockTasting: "Cata y servicio",
  notes: "Nota de cata",
  axes: { body: "Cuerpo", acidity: "Acidez", tannin: "Taninos", sweetness: "Dulzor" },
  axisAria: "{axis}: {value} de 5",
  serve: "Temperatura de servicio",
  serveValue: "de {min} a {max} °C",
  serveValueOne: "{min} °C",
  pairsWith: "Marida con",

  /* Bloque 3 · de dónde sale y quién lo hace. */
  blockOrigin: "Origen e historia",
  subzone: "Subzona",
  terroir: "El terreno",
  winemaker: "Enólogo",
  awards: "Puntuaciones y premios",
  story: "La historia",
  priceNote: "Precios con IVA incluido, los mismos que en la carta del local.",

  /* ── Procedencias de fuera de Galicia ── */
  /* Casi todos son nombres propios y se escriben igual en los cuatro idiomas; viven aquí y no en los
     datos porque "Fuera D.O. Ribeiro" no es un nombre, es una frase, y sí hay que traducirla. */
  indexLabel: "Ir a una denominación",
  origins: {
    "fuera-do-ribeiro": "Fuera de D.O. · Ribeiro",
    "ribera-del-duero": "D.O. Ribera del Duero",
    rioja: "D.O. Rioja",
    bierzo: "D.O. Bierzo",
    somontano: "D.O. Somontano",
    dao: "D.O. Dão",
    douro: "D.O. Douro",
    bairrada: "D.O.C. Bairrada",
    rhone: "D.O. Vallée du Rhône",
    argentina: "Argentina",
    sudafrica: "South Africa",
  },
  countries: { espana: "España", portugal: "Portugal", francia: "Francia", ninguno: "" },
  /* Lo dice la carta de papel al pie de las dos caras, y es verdad: la lista no es cerrada. */
  offMenuNote: "Y pregúntanos: solemos tener otras referencias fuera de carta.",

  /* ── SEO (metadatos de /vinos; no se pintan en pantalla) ── */
  seoTitle: "Carta de vinos gallegos en Ourense",
  seoDescription:
    "Vinoteca junto a la Catedral de Ourense: vinos de las cinco denominaciones gallegas —Ribeiro, Valdeorras, Monterrei, Ribeira Sacra y Rías Baixas— para acompañar las tapas.",
} as const;
export default vinos;