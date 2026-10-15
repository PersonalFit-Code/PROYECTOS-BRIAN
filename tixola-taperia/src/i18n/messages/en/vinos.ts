import type esVinos from "@/i18n/messages/es/vinos";
import type { Translation } from "./shape";

/** Texts for the /vinos page (wine bar). See the comment in es/vinos.ts on the `pending*` keys. */
const vinos = {
  kicker: "Wine bar",
  title: "The Wine",
  accent: "List",
  description:
    "Tixola is a tapas bar and a wine bar: Galician wine isn't an afterthought here, it's half of what we are. Tap a bottle to see its winery, grape and ageing. We also serve by the glass; we'll tell you the price, by bottle or by glass, at the bar.",

  pendingKicker: "In the works",
  pendingTitle: "We're still finalising the wine list",
  pendingText:
    "It isn't published yet, and we'd rather keep it that way a few more days: we want every bottle on this list to be one we can actually open for you, not one that was on last year's list.",
  pendingAction: "In the meantime, just ask: we'll tell you which bottles we have open today and what goes well with whatever you're eating.",
  pendingAsk: "What wines do you have today, and which one would you recommend?",
  pendingCta: "Ask the virtual waiter",
  pendingWhatsapp: "Ask on WhatsApp",

  regionsKicker: "Where it comes from",
  regionsTitle: "Galicia's five",
  regionsAccent: "appellations",
  regionsLead:
    "Galicia has five wine appellations and four of them have vineyards in the province of Ourense. The city's own municipality sits inside D.O. Ribeiro: the wine here is made, quite literally, next door.",
  regionsNote:
    "Our list has bottles from all five. Tap an appellation to see the ones we have from that area.",
  inList: "{count} on the list",
  mapAria: "Map of Galicia with its five wine appellations",
  mapFlow: "A trail runs from each one to Ourense, where Tixola is.",
  mapCredit: "Outline of Galicia: data from OpenStreetMap, ODbL licence.",

  /* ── The world map ── */
  mapWorldKicker: "Every origin",
  mapWorldTitle: "The world, on the shelf",
  mapWorldLead:
    "{count} bottles from {countries} countries. Zoom with the wheel or two fingers, drag to move around, and tap a country — or its pin — to see every wine we have from there.",
  mapWorldAria: "World map showing the {countries} countries the {count} wines on the list come from",
  mapWorldPin: "{country}, {count} wines",
  mapWorldWines: "{count} wines",
  mapWorldOneWine: "1 wine",
  mapWorldOrigins: "{count} appellations",
  mapWorldOneOrigin: "1 appellation",
  mapWorldPinOne: "{country}, 1 wine",
  mapWorldCredit: "Outline: Natural Earth (public domain)",
  mapZoomIn: "Zoom in",
  mapZoomOut: "Zoom out",
  mapReset: "Reset the view",
  nations: { espana: "Spain", portugal: "Portugal", francia: "France", argentina: "Argentina", sudafrica: "South Africa" },
  inOurense: "Province of Ourense",
  whites: "White grapes",
  reds: "Red grapes",
  since: "D.O. since {year}",
  regionAria: "{name} appellation",
  /** Abreviatura de "denominación de origen", delante del nombre protegido. */
  doPrefix: "D.O.",
  mapAtlantic: "Atlantic",
  mapPortugal: "Portugal",
  mapHere: "We're here",
  mostly: { blanco: "Mostly white", tinto: "Mostly red" },
  regionCharacter: {
    "rias-baixas":
      "An Atlantic climate with the sea right there, and vineyards below 300 metres. The whites that come out are about sharp acidity and aroma rather than alcohol — exactly what shellfish asks for.",
    ribeiro:
      "A transition zone, its Atlantic air softened by the mountains that close it off to the north and west. The swing between day and night temperatures is wide, so the grapes ripen slowly and keep their aroma and freshness.",
    "ribeira-sacra":
      "Vines on terraces above the Miño and Sil canyons, on slopes so steep the work is known as heroic viticulture. More continental than Atlantic: long hot summers, mild autumns.",
    valdeorras:
      "Mediterranean with an Atlantic influence, in the Sil valley and above 450 metres. On slate soils, the wines come out with a pronounced mineral character.",
    monterrei:
      "The only one of the five that drains into the Douro, via the Támega, hard against the Portuguese border. Hot dry summers, cold winters, and as much as 20 degrees between day and night while the grapes ripen.",
  },

  kinds: { blanco: "Whites", tinto: "Reds", rosado: "Rosés", espumoso: "Sparkling", dulce: "Sweet" },
  count: "{count} wines",

  /* ── Search ── */
  searchLabel: "Search the wine list",
  search: "Try: godello, Monterrei, mencía…",
  searchClear: "Clear the search",

  /* ── The filter panel ── */
  filters: "Filters",
  filtersActive: "{count} active filters",
  filtersAria: "Filter the wine list",
  filterByOrigin: "Appellation",
  /* The first chip in the row, the one that brings the whole list back. */
  allOrigins: "All",
  filterByKind: "Colour",
  filtersClear: "Clear the filters",
  searchCount: "{count} of {total} wines",
  noResults: "No wine matches “{query}”",
  noResultsHint:
    "You can search by name, winery, grape (godello, mencía, albariño), appellation and province (Monterrei, Ourense). And if it isn't there, ask us at the bar: we usually have bottles that aren't on the list.",

  /* ── The sheet (animated panel) ── */
  openSheet: "See the details for {name}",
  closeOverlay: "Close the wine details",
  close: "Close",
  dragHandle: "Drag down to close",

  glass: "Glass",
  bottle: "Bottle",
  winery: "Winery",
  vintage: "Vintage",

  bottlePhoto: "Bottle of {name}",

  blockRegion: "The appellation",
  regionProvinces: "Where",
  regionGrapes: "Main grapes",
  askAboutWine: "Tell me about {name}. What does it taste like, and which dish on the menu would you have it with?",
  askAboutWineCta: "Ask the waiter",
  askAboutWineAria: "Ask the virtual waiter about {name}",
  pendingSheet: "We haven't got the full details for this bottle yet. Ask us at the bar, or ask the virtual waiter.",

  blockGrape: "Grapes and winemaking",
  grapes: "Grape",
  monovarietal: "Single variety",
  blend: "Blend",
  percent: "{value}%",
  ageing: "Ageing",
  winemaking: "Winemaking",
  methodsTitle: "Vineyard",
  methods: {
    ecologico: "Organic",
    biodinamico: "Biodynamic",
    natural: "Natural",
    vegano: "Vegan",
    "de-pago": "Single estate",
    "de-parcela": "Single plot",
  },
  abv: "ABV",
  abvValue: "{value}% vol.",
  format: "Bottle size",
  formatValue: "{cl} cl",

  blockTasting: "Tasting and serving",
  notes: "Tasting note",
  axes: { body: "Body", acidity: "Acidity", tannin: "Tannin", sweetness: "Sweetness" },
  axisAria: "{axis}: {value} out of 5",
  serve: "Serving temperature",
  serveValue: "{min} to {max} °C",
  serveValueOne: "{min} °C",
  pairsWith: "Pairs with",

  blockOrigin: "Origin and story",
  subzone: "Subzone",
  terroir: "The land",
  winemaker: "Winemaker",
  awards: "Scores and awards",
  story: "The story",
  priceNote: "Prices include VAT, the same as on the menu in the bar.",

  origins: {
    "fuera-do-ribeiro": "Outside D.O. · Ribeiro",
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
  countries: { espana: "Spain", portugal: "Portugal", francia: "France", ninguno: "" },
  offMenuNote: "And do ask: we usually have other bottles that aren't on the list.",

  /* Responsible-drinking notice: see the comment in the component that renders it. */
  responsibleNote:
    "The sale and consumption of alcoholic drinks is for over-18s only. Please drink responsibly.",

  seoTitle: "Galician wine list in Ourense",
  seoDescription:
    "Wine bar next to Ourense Cathedral: wines from Galicia's five appellations — Ribeiro, Valdeorras, Monterrei, Ribeira Sacra and Rías Baixas — to go with the tapas.",
} satisfies Translation<typeof esVinos>;
export default vinos;