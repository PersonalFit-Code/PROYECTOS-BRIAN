import type { Section } from "./shape";

/** Textos da páxina /vinos (vinoteca). Ver o comentario de es/vinos.ts sobre por que se publica sen viños. */
const vinos: Section<"vinos"> = {
  kicker: "Vinoteca",
  title: "A Carta",
  accent: "de Viños",
  description:
    "Tixola é tapería e vinoteca: o viño galego non é aquí un acompañamento, é a metade da casa. Pincha nunha botella e verás a súa adega, a súa uva, a súa crianza e o seu prezo.",

  pendingKicker: "En preparación",
  pendingTitle: "Estamos a pechar a carta de viños",
  pendingText:
    "Aínda non está publicada, e preferimos que siga así uns días máis: queremos que cada botella desta lista sexa unha que de verdade poidamos descorchar, non unha que estivese na carta o ano pasado.",
  pendingAction: "Mentres tanto, pregúntanos: contámosche que hai aberto hoxe e que lle vai ben ao que vaias comer.",
  pendingAsk: "Que viños tedes hoxe e cal me recomendades?",
  pendingCta: "Preguntar ao camareiro virtual",
  pendingWhatsapp: "Preguntar por WhatsApp",

  regionsKicker: "De onde vén",
  regionsTitle: "As cinco denominacións",
  regionsAccent: "de Galicia",
  regionsLead:
    "Galicia ten cinco denominacións de orixe e catro teñen viñedo na provincia de Ourense. O propio concello da cidade está dentro da D.O. Ribeiro: o viño de aquí faise, literalmente, ao lado.",
  regionsNote:
    "Na nosa carta hai botellas das cinco. Preme nunha denominación para ver as que temos desa zona.",
  inList: "{count} en carta",
  mapAria: "Mapa de Galicia coas cinco denominacións de orixe de viño",
  mapFlow: "Desde cada unha delas sae un camiño ata Ourense, onde está Tixola.",
  mapCredit: "Contorno de Galicia: datos de OpenStreetMap, licenza ODbL.",

  /* ── O mapa do mundo ── */
  mapWorldKicker: "De onde vén",
  mapWorldTitle: "O mundo, no andel",
  mapWorldLead:
    "{count} botellas de {countries} países. Amplía coa roda ou con dous dedos, arrastra para moverte, e pincha un país —ou a súa chincheta— para ver todos os viños que temos de alí.",
  mapWorldAria: "Mapa do mundo cos {countries} países dos que veñen os {count} viños da carta",
  mapWorldPin: "{country}, {count} viños",
  mapWorldWines: "{count} viños",
  mapWorldOneWine: "1 viño",
  mapWorldOrigins: "{count} denominacións",
  mapWorldOneOrigin: "1 denominación",
  mapWorldPinOne: "{country}, 1 viño",
  mapWorldCredit: "Contorno: Natural Earth (dominio público)",
  mapZoomIn: "Achegar o mapa",
  mapZoomOut: "Afastar o mapa",
  mapReset: "Volver á vista inicial",
  nations: { espana: "España", portugal: "Portugal", francia: "Francia", argentina: "Arxentina", sudafrica: "Sudáfrica" },
  inOurense: "Provincia de Ourense",
  whites: "Uvas brancas",
  reds: "Uvas tintas",
  since: "D.O. desde {year}",
  regionAria: "Denominación de orixe {name}",
  /** Abreviatura de "denominación de origen", delante del nombre protegido. */
  doPrefix: "D.O.",
  mapAtlantic: "Atlántico",
  mapPortugal: "Portugal",
  mapHere: "Estamos aquí",
  mostly: { blanco: "Sobre todo branco", tinto: "Sobre todo tinto" },
  regionCharacter: {
    "rias-baixas":
      "Clima atlántico e o mar ao lado, co viñedo por debaixo dos 300 metros. De aí saen brancos de acidez marcada e moito aroma máis que de moito alcol: xusto o que pide o marisco.",
    ribeiro:
      "Zona de transición, co aire atlántico suavizado polas montañas que a pechan ao norte e ao oeste. Entre o día e a noite hai moita diferenza de temperatura, así que a uva madura amodo e conserva o aroma e o frescor.",
    "ribeira-sacra":
      "Viñedo en socalcos sobre os canóns do Miño e do Sil, en ladeiras tan bruscas que a isto chámanlle viticultura heroica. Máis continental ca atlántica: veráns longos e calorosos, outonos temperados.",
    valdeorras:
      "Mediterráneo con influencia atlántica, no val do Sil e por riba dos 450 metros. Sobre chan de lousa, os viños saen cun carácter mineral moi marcado.",
    monterrei:
      "A única das cinco que verte ao Douro, polo Támega, pegada á fronteira con Portugal. Veráns calorosos e secos, invernos fríos, e ata 20 graos de diferenza entre o día e a noite cando madura a uva.",
  },

  kinds: { blanco: "Brancos", tinto: "Tintos", rosado: "Rosados", espumoso: "Espumosos", dulce: "Doces" },
  count: "{count} viños",

  /* ── O buscador ── */
  searchLabel: "Buscar un viño",
  search: "Busca: godello, Monterrei, mencía…",
  searchClear: "Borrar a busca",

  /* ── O panel de filtros ── */
  filters: "Filtros",
  filtersActive: "{count} filtros activos",
  filtersAria: "Filtrar a carta de viños",
  filterByOrigin: "Denominación",
  filterByKind: "Cor",
  filtersClear: "Quitar os filtros",
  searchCount: "{count} de {total} viños",
  noResults: "Ningún viño casa con «{query}»",
  noResultsHint:
    "Búscase por nome, adega, uva (godello, mencía, albariño), denominación e provincia (Monterrei, Ourense). E se non aparece, pregúntanos na barra: adoitamos ter referencias fóra de carta.",

  /* ── A ficha (folla animada) ── */
  openSheet: "Ver a ficha de {name}",
  closeOverlay: "Pechar a ficha",
  close: "Pechar",
  dragHandle: "Arrastra cara abaixo para pechar",

  glass: "Copa",
  bottle: "Botella",
  winery: "Adega",
  vintage: "Colleita",

  bottlePhoto: "Botella de {name}",

  blockRegion: "A denominación",
  regionProvinces: "Onde",
  regionGrapes: "Uvas preferentes",
  askAboutWine: "Fálame do viño {name}. A que sabe e con que prato da carta o tomarías?",
  askAboutWineCta: "Preguntar ao camareiro",
  askAboutWineAria: "Preguntar ao camareiro virtual por {name}",
  pendingSheet: "Desta botella aínda non temos ficha completa. Pregúntanos na barra, ou ao camareiro virtual.",

  blockGrape: "Uva e elaboración",
  grapes: "Uva",
  monovarietal: "Monovarietal",
  blend: "Ensamblaxe",
  percent: "{value} %",
  ageing: "Crianza",
  winemaking: "Elaboración",
  methodsTitle: "Viñedo",
  methods: {
    ecologico: "Ecolóxico",
    biodinamico: "Biodinámico",
    natural: "Natural",
    vegano: "Vegano",
    "de-pago": "Viño de pago",
    "de-parcela": "Viño de parcela",
  },
  abv: "Graduación",
  abvValue: "{value} % vol.",
  format: "Formato",
  formatValue: "{cl} cl",

  blockTasting: "Cata e servizo",
  notes: "Nota de cata",
  axes: { body: "Corpo", acidity: "Acidez", tannin: "Taninos", sweetness: "Dozura" },
  axisAria: "{axis}: {value} de 5",
  serve: "Temperatura de servizo",
  serveValue: "de {min} a {max} °C",
  serveValueOne: "{min} °C",
  pairsWith: "Marida con",

  blockOrigin: "Orixe e historia",
  subzone: "Subzona",
  terroir: "O terreo",
  winemaker: "Enólogo",
  awards: "Puntuacións e premios",
  story: "A historia",
  priceNote: "Prezos con IVE incluído, os mesmos que na carta do local.",

  origins: {
    "fuera-do-ribeiro": "Fóra de D.O. · Ribeiro",
    "ribera-del-duero": "D.O. Ribera del Duero",
    rioja: "D.O. Rioja",
    bierzo: "D.O. Bierzo",
    somontano: "D.O. Somontano",
    dao: "D.O. Dão",
    douro: "D.O. Douro",
    bairrada: "D.O.C. Bairrada",
    rhone: "D.O. Vallée du Rhône",
    argentina: "Arxentina",
    sudafrica: "South Africa",
  },
  countries: { espana: "España", portugal: "Portugal", francia: "Francia", ninguno: "" },
  offMenuNote: "E pregúntanos: adoitamos ter outras referencias fóra de carta.",

  seoTitle: "Carta de viños galegos en Ourense",
  seoDescription:
    "Vinoteca xunto á Catedral de Ourense: viños das cinco denominacións galegas —Ribeiro, Valdeorras, Monterrei, Ribeira Sacra e Rías Baixas— para acompañar as tapas.",
};
export default vinos;