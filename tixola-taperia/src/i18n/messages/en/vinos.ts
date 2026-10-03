import type esVinos from "@/i18n/messages/es/vinos";
import type { Translation } from "./shape";

/** Texts for the /vinos page (wine bar). See the comment in es/vinos.ts on why it ships with no wines. */
const vinos = {
  kicker: "Wine bar",
  title: "The Wine",
  accent: "List",
  description:
    "Tixola is a tapas bar and a wine bar: Galician wine isn't a side here, it's half the house. This is where the list will live, with each bottle's winery, grape and price.",

  pendingKicker: "In the works",
  pendingTitle: "We're still finalising the wine list",
  pendingText:
    "It isn't published yet, and we'd rather keep it that way a few more days: we want every bottle on this list to be one we can actually open for you, not one that was on last year's menu.",
  pendingAction: "In the meantime, just ask: we'll tell you what's open today and what goes well with whatever you're eating.",
  pendingAsk: "What wines do you have today, and which one would you recommend?",
  pendingCta: "Ask the virtual waiter",
  pendingWhatsapp: "Ask on WhatsApp",

  regionsKicker: "Where it comes from",
  regionsTitle: "Galicia's five",
  regionsAccent: "wine regions",
  regionsLead:
    "Galicia has five denominations of origin and four of them have vineyards in the province of Ourense. The city's own municipality sits inside D.O. Ribeiro: the wine here is made, quite literally, next door.",
  regionsNote:
    "Our list has bottles from all five. Tap a denomination to see the ones we pour from that area.",
  inList: "{count} on the list",
  mapAria: "Map of Galicia with its five wine denominations of origin",
  mapFlow: "A trail runs from each one to Ourense, where Tixola is.",
  mapCredit: "Outline of Galicia: data from OpenStreetMap, ODbL licence.",
  inOurense: "Province of Ourense",
  whites: "White grapes",
  reds: "Red grapes",
  since: "D.O. since {year}",
  regionAria: "{name} denomination of origin",
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
      "A transition zone, its Atlantic air softened by the mountains that close it off to the north and west. Day and night differ widely in temperature, so the grape ripens slowly and keeps its aroma and freshness.",
    "ribeira-sacra":
      "Vines on terraces above the Miño and Sil canyons, on slopes so steep the work is known as heroic viticulture. More continental than Atlantic: long hot summers, mild autumns.",
    valdeorras:
      "Mediterranean with an Atlantic influence, in the Sil valley and above 450 metres. On slate soils, the wines come out with a pronounced mineral character.",
    monterrei:
      "The only one of the five that drains into the Douro, via the Támega, hard against the Portuguese border. Hot dry summers, cold winters, and up to 20 degrees between day and night as the grape ripens.",
  },

  kinds: { blanco: "Whites", tinto: "Reds", rosado: "Rosés", espumoso: "Sparkling", dulce: "Sweet" },
  count: "{count} wines",

  glass: "Glass",
  bottle: "Bottle",
  winery: "Winery",
  vintage: "Vintage",

  bottlePhoto: "Bottle of {name}",

  blockRegion: "The appellation",
  regionProvinces: "Where",
  regionGrapes: "Preferred grapes",
  askAboutWine: "Tell me about {name}. What does it taste like and which dish would you have it with?",
  askAboutWineCta: "Ask the waiter",
  askAboutWineAria: "Ask the virtual waiter about {name}",
  pendingSheet: "We don't have a full sheet for this bottle yet. Ask us at the bar, or ask the virtual waiter.",

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

  indexLabel: "Jump to a denomination",
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

  seoTitle: "Galician wine list in Ourense",
  seoDescription:
    "Wine bar next to Ourense Cathedral: wines from Galicia's five denominations — Ribeiro, Valdeorras, Monterrei, Ribeira Sacra and Rías Baixas — to go with the tapas.",
} satisfies Translation<typeof esVinos>;
export default vinos;