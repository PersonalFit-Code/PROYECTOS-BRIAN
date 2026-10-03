import type esVinos from "@/i18n/messages/es/vinos";
import type { Translation } from "./shape";

/** Textos da página /vinos (vinoteca). Ver o comentário de es/vinos.ts sobre por que se publica sem vinhos. */
const vinos = {
  kicker: "Vinoteca",
  title: "A Carta",
  accent: "de Vinhos",
  description:
    "A Tixola é tapería e vinoteca: o vinho galego não é aqui um acompanhamento, é metade da casa. Carrega numa garrafa para veres a sua adega, a sua casta, o seu estágio e o seu preço.",

  pendingKicker: "Em preparação",
  pendingTitle: "Estamos a fechar a carta de vinhos",
  pendingText:
    "Ainda não está publicada, e preferimos que assim continue mais uns dias: queremos que cada garrafa desta lista seja uma que possamos mesmo abrir, não uma que estava na carta do ano passado.",
  pendingAction: "Entretanto, pergunte-nos: dizemos-lhe o que está aberto hoje e o que combina com o que vai comer.",
  pendingAsk: "Que vinhos têm hoje e qual me recomendam?",
  pendingCta: "Perguntar ao empregado virtual",
  pendingWhatsapp: "Perguntar por WhatsApp",

  regionsKicker: "De onde vem",
  regionsTitle: "As cinco denominações",
  regionsAccent: "da Galiza",
  regionsLead:
    "A Galiza tem cinco denominações de origem e quatro têm vinha na província de Ourense. O próprio município da cidade está dentro da D.O. Ribeiro: o vinho daqui faz-se, literalmente, ao lado.",
  regionsNote:
    "Na nossa carta há garrafas das cinco. Toque numa denominação para ver as que temos dessa zona.",
  inList: "{count} na carta",
  mapAria: "Mapa da Galiza com as cinco denominações de origem de vinho",
  mapFlow: "De cada uma delas sai um caminho até Ourense, onde fica o Tixola.",
  mapCredit: "Contorno da Galiza: dados do OpenStreetMap, licença ODbL.",
  inOurense: "Província de Ourense",
  whites: "Castas brancas",
  reds: "Castas tintas",
  since: "D.O. desde {year}",
  regionAria: "Denominação de origem {name}",
  /** Abreviatura de "denominación de origen", delante del nombre protegido. */
  doPrefix: "D.O.",
  mapAtlantic: "Atlântico",
  mapPortugal: "Portugal",
  mapHere: "Estamos aqui",
  mostly: { blanco: "Sobretudo branco", tinto: "Sobretudo tinto" },
  regionCharacter: {
    "rias-baixas":
      "Clima atlântico e o mar ali ao lado, com a vinha abaixo dos 300 metros. Daí saem brancos de acidez marcada e muito aroma, mais do que de álcool: precisamente o que o marisco pede.",
    ribeiro:
      "Zona de transição, com o ar atlântico suavizado pelas montanhas que a fecham a norte e a oeste. Entre o dia e a noite há muita diferença de temperatura, pelo que a uva amadurece devagar e conserva o aroma e a frescura.",
    "ribeira-sacra":
      "Vinha em socalcos sobre os canhões do Minho e do Sil, em encostas tão abruptas que a isto chamam viticultura heroica. Mais continental do que atlântica: verões longos e quentes, outonos amenos.",
    valdeorras:
      "Mediterrânico com influência atlântica, no vale do Sil e acima dos 450 metros. Em solo de xisto, os vinhos saem com um carácter mineral muito marcado.",
    monterrei:
      "A única das cinco que desagua no Douro, pelo Tâmega, encostada à fronteira com Portugal. Verões quentes e secos, invernos frios, e até 20 graus de diferença entre o dia e a noite quando a uva amadurece.",
  },

  kinds: { blanco: "Brancos", tinto: "Tintos", rosado: "Rosés", espumoso: "Espumantes", dulce: "Doces" },
  count: "{count} vinhos",

  /* ── O buscador ── */
  searchLabel: "Procurar um vinho",
  search: "Procura: godello, Monterrei, mencía…",
  searchClear: "Limpar a procura",
  searchCount: "{count} de {total} vinhos",
  noResults: "Nenhum vinho corresponde a «{query}»",
  noResultsHint:
    "Procura-se por nome, adega, casta (godello, mencía, alvarinho), denominação e província (Monterrei, Ourense). E se não aparecer, pergunta-nos ao balcão: costumamos ter referências fora da carta.",

  /* ── A ficha (folha animada) ── */
  openSheet: "Ver a ficha de {name}",
  closeOverlay: "Fechar a ficha",
  close: "Fechar",
  dragHandle: "Arrasta para baixo para fechar",

  glass: "Copo",
  bottle: "Garrafa",
  winery: "Adega",
  vintage: "Colheita",

  bottlePhoto: "Garrafa de {name}",

  blockRegion: "A denominação",
  regionProvinces: "Onde",
  regionGrapes: "Castas preferentes",
  askAboutWine: "Fala-me do vinho {name}. A que sabe e com que prato da carta o beberias?",
  askAboutWineCta: "Perguntar ao empregado",
  askAboutWineAria: "Perguntar ao empregado virtual sobre {name}",
  pendingSheet: "Desta garrafa ainda não temos ficha completa. Pergunte-nos ao balcão, ou ao empregado virtual.",

  blockGrape: "Casta e elaboração",
  grapes: "Casta",
  monovarietal: "Monovarietal",
  blend: "Mistura",
  percent: "{value} %",
  ageing: "Estágio",
  winemaking: "Elaboração",
  methodsTitle: "Vinha",
  methods: {
    ecologico: "Biológico",
    biodinamico: "Biodinâmico",
    natural: "Natural",
    vegano: "Vegano",
    "de-pago": "Vinho de quinta",
    "de-parcela": "Vinho de parcela",
  },
  abv: "Graduação",
  abvValue: "{value} % vol.",
  format: "Formato",
  formatValue: "{cl} cl",

  blockTasting: "Degustação e serviço",
  notes: "Nota de degustação",
  axes: { body: "Corpo", acidity: "Acidez", tannin: "Taninos", sweetness: "Doçura" },
  axisAria: "{axis}: {value} de 5",
  serve: "Temperatura de serviço",
  serveValue: "de {min} a {max} °C",
  serveValueOne: "{min} °C",
  pairsWith: "Harmoniza com",

  blockOrigin: "Origem e história",
  subzone: "Sub-região",
  terroir: "O terreno",
  winemaker: "Enólogo",
  awards: "Pontuações e prémios",
  story: "A história",
  priceNote: "Preços com IVA incluído, os mesmos que na carta do local.",

  indexLabel: "Ir para uma denominação",
  origins: {
    "fuera-do-ribeiro": "Fora da D.O. · Ribeiro",
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
  countries: { espana: "Espanha", portugal: "Portugal", francia: "França", ninguno: "" },
  offMenuNote: "E pergunte-nos: costumamos ter outras referências fora da carta.",

  seoTitle: "Carta de vinhos galegos em Ourense",
  seoDescription:
    "Vinoteca junto à Catedral de Ourense: vinhos das cinco denominações galegas —Ribeiro, Valdeorras, Monterrei, Ribeira Sacra e Rías Baixas— para acompanhar as tapas.",
} satisfies Translation<typeof esVinos>;
export default vinos;