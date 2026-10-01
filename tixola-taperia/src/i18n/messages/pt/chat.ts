import type esChat from "@/i18n/messages/es/chat";
import type { Translation } from "./shape";

/**
 * Textos do empregado virtual: lançador, widget e modelos do motor sem ligação (`offline.*`).
 * Os marcadores {assim} são preenchidos com useFormat() / format().
 */
const chat = {
  launcher: "Empregado virtual",
  cue: "Ajudo-te a escolher?",
  launcherAria: "Abrir o empregado virtual da Tixola",
  closeAria: "Fechar o empregado virtual",
  title: "Empregado virtual",
  subtitle: "Ajudo com a ementa, os alergénios, o horário e como chegar",
  placeholder: "Escreva a sua pergunta…",
  inputLabel: "A sua pergunta para o empregado virtual",
  inputHint: "Enter para enviar · Shift + Enter para mudar de linha",
  send: "Enviar",
  stop: "Parar a resposta",
  thinking: "A escrever…",
  welcome:
    "Olá! Sou o empregado virtual da Tixola. Pergunte-me pela ementa, pelos alergénios, que vinho recomendamos ou como chegar.",
  quickReplies: [
    "Que pratos não têm glúten?",
    "O que me recomendas para partilhar?",
    "Que vinho me recomenda?",
    "A que horas abrem hoje?",
    "Têm opções veganas?",
  ],
  quickRepliesLabel: "Perguntas frequentes",
  messagesLabel: "Conversa com o empregado virtual",
  you: "Você",
  waiter: "Empregado virtual",
  offlineNote: "Modo sem ligação: respondo com a informação da ementa e do horário.",
  fallbackNote: "O assistente com IA não está disponível neste momento; respondo com a informação da ementa e do horário.",
  error: "Não consegui responder neste momento. Tente de novo ou ligue-nos.",
  rateLimited: "Fez muitas perguntas seguidas. Aguarde um minuto ou ligue-nos e atendemos na hora.",
  retry: "Tentar de novo",
  disclaimer: "As respostas são indicativas. Em caso de alergias graves, consulte sempre o pessoal.",
  privacyNote:
    "O que escrever é enviado ao nosso fornecedor de IA para redigir a resposta e fica no seu navegador enquanto durar a visita. Não o guardamos nem precisa de nos dar dados pessoais.",
  privacyLink: "Como tratamos os seus dados",
  callCta: "Ligar",
  clear: "Nova conversa",
  cleared: "Conversa reiniciada.",
  poweredBy: "Assistente com IA",
  /** Modelos do motor determinista (sem chave de API ou se o modelo falhar). */
  offline: {
    greeting:
      "Olá! Sou o empregado virtual da Tixola. Posso dizer-lhe o que leva cada prato, o que não tem glúten ou laticínios, que vinhos recomendamos, o horário e como chegar. Por onde começamos?",
    thanks: "Eu é que agradeço! Estou aqui para o que precisar. E se se animar a vir, estamos a um minuto da Catedral.",
    allergenFree: "Estes pratos **não declaram {allergen} entre os seus alergénios**:",
    allergenFreeEmpty:
      "Neste momento não encontro pratos sem {allergen} na ementa. Pergunte ao pessoal: na cozinha podem adaptar algum prato.",
    diet: "Estas são as nossas opções **{diet}**:",
    dietEmpty: "Não tenho opções marcadas como {diet} na ementa, mas pergunte ao pessoal: na cozinha ajudam com todo o gosto.",
    /** forma no plural para a frase "opções {diet}" */
    dietLabels: {
      vegano: "veganas",
      vegetariano: "vegetarianas",
      picante: "picantes",
    },
    category: "Em **{category}** ({kicker}) temos:",
    categoryEmpty: "Não encontro essa categoria na ementa.",
    recommend: "Para partilhar, o que mais sucesso faz na Tixola:",
    recommendOutro: "Com duas ou três destas doses, duas pessoas comem às mil maravilhas. Quer que lhe diga que vinho vai com elas?",
    pairingDish: "Com **{dish}** recomendo **{wine}**: {why}",
    pairingDishSimple: "Com **{dish}** recomendo **{wine}**, um vinho galego da nossa garrafeira.",
    pairingWine: "O **{wine}** vai às mil maravilhas com:",
    pairingIntro: "As nossas harmonizações da casa, com vinhos galegos da garrafeira:",
    wineListPending:
      "A carta de vinhos ainda não está no site. Pergunte-nos no local ou ligue-nos e dizemos-lhe o que temos aberto.",
    hoursIntro: "O nosso horário (hora de Ourense):",
    hoursNow: "Neste momento: {status}.",
    location: "Estamos na **{address}**, {landmark}. [Como chegar]({url})",
    locationExtra:
      "Temos esplanada com vista para a Catedral. O centro histórico é pedonal: o melhor é estacionar perto e vir a pé.",
    booking:
      "Não aceitamos reservas: as mesas ocupam-se por ordem de chegada, basta aparecer. Se forem um grupo grande, ligue-nos e dizemos-lhe a melhor hora: [Ligar para {phone}]({tel}).",
    bookingExtra: "As melhores alturas para encontrar lugar são à abertura, às 13:00 e às 20:00.",
    prices: "A nossa faixa de preços é de **{range} por pessoa**, com doses pensadas para partilhar. Alguns exemplos:",
    pricesExtra: "Os preços são indicativos, com IVA incluído. Aceitamos cartão.",
    dishInfo: "**{name}** — {price}. {description}",
    dishAllergens: "Alergénios: {allergens}.",
    dishNoAllergens: "Consulte os alergénios com o pessoal.",
    dishPairing: "Harmoniza com **{wine}**.",
    safety: "Em caso de alergias ou intolerâncias, confirme sempre com o pessoal: a nossa cozinha manipula todos os alergénios.",
    fallback: "Não tenho a certeza de ter percebido. Posso ajudar com:",
    fallbackItems: [
      "Pratos sem glúten, sem lactose, veganos ou vegetarianos",
      "O que há em cada categoria: croquetes, tixolas, do mar, sobremesas…",
      "Que vinhos recomendamos com os nossos pratos",
      "Horário, como chegar e se é preciso reservar",
    ],
    fullMenu: "Tem a ementa completa, com os alergénios prato a prato, na [ementa digital]({url}).",
    line: "**{name}** — {price}",
    lineUnit: "**{name}** — {price} · {unit}",
    lineVariants: "**{name}** — {variants}",
    linePairing: "**{name}** → {wine}",
    andMore: "…e mais {count} na [ementa digital]({url}).",
    andMoreCarta: "…e mais {count} aqui, na ementa.",
    more: "Quer saber mais alguma coisa? Posso ajudar com a ementa, os alergénios, os vinhos, o horário ou como chegar.",
  },
} satisfies Translation<typeof esChat>;
export default chat;
