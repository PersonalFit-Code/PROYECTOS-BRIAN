import type esChat from "@/i18n/messages/es/chat";
import type { Translation } from "./shape";

/**
 * Textos do empregado virtual: lançador, widget e modelos do motor sem ligação (`offline.*`).
 * Os marcadores {assim} são preenchidos com useFormat() / format().
 */
const chat = {
  launcher: "Empregado virtual",
  launcherAria: "Abrir o empregado virtual da Tixola",
  closeAria: "Fechar o empregado virtual",
  title: "Empregado virtual",
  subtitle: "Ajudo com a ementa, os alergénios, o horário e as reservas",
  placeholder: "Escreva a sua pergunta…",
  inputLabel: "A sua pergunta para o empregado virtual",
  inputHint: "Enter para enviar · Shift + Enter para mudar de linha",
  send: "Enviar",
  stop: "Parar a resposta",
  thinking: "A escrever…",
  welcome:
    "Olá! Sou o empregado virtual da Tixola. Pergunte-me pela ementa, pelos alergénios, que vinho harmoniza com cada prato ou como chegar.",
  quickReplies: [
    "Que pratos não têm glúten?",
    "O que me recomendas para partilhar?",
    "Que vinho vai bem com o polvo?",
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
  reserveCta: "Reservar mesa",
  callCta: "Ligar",
  clear: "Nova conversa",
  cleared: "Conversa reiniciada.",
  poweredBy: "Assistente com IA",
  /** Modelos do motor determinista (sem chave de API ou se o modelo falhar). */
  offline: {
    greeting:
      "Olá! Sou o empregado virtual da Tixola. Posso dizer-lhe o que leva cada prato, o que não tem glúten ou laticínios, que vinho harmoniza com cada um, o horário e como chegar. Por onde começamos?",
    thanks: "Eu é que agradeço! Estou aqui para o que precisar. E se se animar a vir, estamos a um minuto da Catedral.",
    allergenFree: "Segundo a nossa ementa, estes pratos **não contêm {allergen}**:",
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
    hoursIntro: "O nosso horário (hora de Ourense):",
    hoursNow: "Neste momento: {status}.",
    location: "Estamos na **{address}**, {landmark}. [Como chegar]({url})",
    locationExtra:
      "Temos esplanada com vista para a Catedral. O centro histórico é pedonal: o melhor é estacionar perto e vir a pé.",
    booking:
      "As reservas fazem-se por telefone ou WhatsApp, para lhe confirmarmos na hora: [Ligar para o {phone}]({tel}) · [Escrever pelo WhatsApp]({whatsapp}).",
    bookingExtra: "Diga-nos quantos são, o dia e a hora, e se preferem esplanada.",
    prices: "A nossa faixa de preços é de **{range} por pessoa**, com doses pensadas para partilhar. Alguns exemplos:",
    pricesExtra: "Os preços são indicativos, com IVA incluído. Aceitamos cartão.",
    dishInfo: "**{name}** — {price}. {description}",
    dishAllergens: "Alergénios: {allergens}.",
    dishNoAllergens: "Sem alergénios declarados.",
    dishPairing: "Harmoniza com **{wine}**.",
    safety: "Em caso de alergias ou intolerâncias, confirme sempre com o pessoal: a nossa cozinha manipula todos os alergénios.",
    fallback: "Não tenho a certeza de ter percebido. Posso ajudar com:",
    fallbackItems: [
      "Pratos sem glúten, sem lactose, veganos ou vegetarianos",
      "O que há em cada categoria: croquetes, tixolas, do mar, sobremesas…",
      "Que vinho harmoniza com cada prato",
      "Horário, como chegar e reservas",
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
