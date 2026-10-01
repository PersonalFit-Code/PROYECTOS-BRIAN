import type esVinos from "@/i18n/messages/es/vinos";
import type { Translation } from "./shape";

/** Textos da página /vinos (vinoteca). Ver o comentário de es/vinos.ts sobre por que se publica sem vinhos. */
const vinos = {
  kicker: "Vinoteca",
  title: "A Carta",
  accent: "de Vinhos",
  description:
    "A Tixola é tapería e vinoteca: o vinho galego não é aqui um acompanhamento, é metade da casa. Aqui ficará a carta com a sua adega, a sua casta e o seu preço.",

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
    "Este é o mapa do vinho galego, ainda não a nossa carta: quando a fecharmos diremos de quais destas zonas vem cada garrafa.",
  mapAria: "Mapa da Galiza com as cinco denominações de origem de vinho",
  mapTitle: "Galiza",
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
  glass: "Copo",
  bottle: "Garrafa",
  grapes: "Casta",
  vintage: "Colheita",
  ageing: "Estágio",
  abv: "Graduação",
  winery: "Adega",
  pairsWith: "Harmoniza com",
  openWine: "Ver a ficha de {name}",
  closeWine: "Fechar a ficha",
  count: "{count} vinhos",
  priceNote: "Preços com IVA incluído, os mesmos que na carta do local.",

  seoTitle: "Carta de vinhos galegos em Ourense",
  seoDescription:
    "Vinoteca junto à Catedral de Ourense: vinhos das cinco denominações galegas —Ribeiro, Valdeorras, Monterrei, Ribeira Sacra e Rías Baixas— para acompanhar as tapas.",
} satisfies Translation<typeof esVinos>;
export default vinos;
