import type { Section } from "./shape";

/**
 * Textos do camareiro virtual: lanzador, widget e patróns do motor sen conexión (`offline.*`).
 * Os marcadores {así} énchense con useFormat() / format().
 */
const chat: Section<"chat"> = {
  launcher: "Camareiro virtual",
  launcherAria: "Abrir o camareiro virtual de Tixola",
  closeAria: "Pechar o camareiro virtual",
  title: "Camareiro virtual",
  subtitle: "Axúdote coa carta, os alérxenos, o horario e como chegar",
  placeholder: "Escribe a túa pregunta…",
  inputLabel: "A túa pregunta para o camareiro virtual",
  inputHint: "Intro para enviar · Maiús + Intro para saltar de liña",
  send: "Enviar",
  stop: "Deter a resposta",
  thinking: "Escribindo…",
  welcome:
    "Ola! Son o camareiro virtual de Tixola. Pregúntame pola carta, os alérxenos, que viño recomendamos ou como chegar.",
  quickReplies: [
    "Que pratos non levan glute?",
    "Que me recomendas para compartir?",
    "Que viño me recomendas?",
    "A que hora abrides hoxe?",
    "Tedes opcións veganas?",
  ],
  quickRepliesLabel: "Preguntas frecuentes",
  messagesLabel: "Conversa co camareiro virtual",
  you: "Ti",
  waiter: "Camareiro virtual",
  offlineNote: "Modo sen conexión: respondo coa información da carta e do horario.",
  fallbackNote: "O asistente con IA non está dispoñible agora mesmo; respondo coa información da carta e do horario.",
  error: "Non puiden responder agora mesmo. Téntao de novo ou chámanos.",
  rateLimited: "Fixeches moitas preguntas seguidas. Agarda un minuto ou chámanos e atendémoste de contado.",
  retry: "Tentar de novo",
  disclaimer: "As respostas son orientativas. Ante alerxias graves, consulta sempre co persoal.",
  privacyNote: "O que escribas envíase ao noso provedor de IA para redactar a resposta e queda no teu navegador mentres dure a visita. Non o gardamos nin fai falta que nos deas datos persoais.",
  privacyLink: "Como tratamos os teus datos",
  callCta: "Chamar",
  clear: "Nova conversa",
  cleared: "Conversa reiniciada.",
  poweredBy: "Asistente con IA",
  /** Patróns do motor determinista (sen clave de API ou se o modelo falla). */
  offline: {
    greeting:
      "Ola! Son o camareiro virtual de Tixola. Podo contarche que leva cada prato, cales non levan glute nin lácteos, que viños recomendamos, o horario e como chegar. Por onde empezamos?",
    thanks: "Grazas a ti! Aquí me tes para o que necesites. E se te animas a vir, estamos a un minuto da Catedral.",
    allergenFree: "Estes pratos **non levan {allergen} entre os seus alérxenos declarados**:",
    allergenFreeEmpty:
      "Agora mesmo non atopo pratos sen {allergen} na carta. Pregúntalle ao persoal: en cociña poden adaptar algún prato.",
    diet: "Estas son as nosas opcións **{diet}**:",
    dietEmpty: "Non teño opcións marcadas como {diet} na carta, pero pregúntalle ao persoal: en cociña axúdante encantados.",
    /** forma en plural para a frase "opcións {diet}" */
    dietLabels: {
      vegano: "veganas",
      vegetariano: "vexetarianas",
      picante: "picantes",
    },
    category: "En **{category}** ({kicker}) temos:",
    categoryEmpty: "Non atopo esa categoría na carta.",
    recommend: "Para compartir, o que máis triunfa en Tixola:",
    recommendOutro: "Con dúas ou tres racións destas, dúas persoas comen de marabilla. Cóntoche con que viño van?",
    pairingDish: "Con **{dish}** recoméndoche **{wine}**: {why}",
    pairingDishSimple: "Con **{dish}** recoméndoche **{wine}**, un viño galego da nosa vinoteca.",
    pairingWine: "O **{wine}** vai de marabilla con:",
    pairingIntro: "As nosas maridaxes da casa, con viños galegos da vinoteca:",
    wineListPending:
      "A carta de viños aínda non está na web. Pregúntanos no local ou chámanos e contámosche o que temos aberto.",
    hoursIntro: "O noso horario (hora de Ourense):",
    hoursNow: "Agora mesmo: {status}.",
    location: "Estamos en **{address}**, {landmark}. [Como chegar]({url})",
    locationExtra:
      "Temos terraza con vistas á Catedral. O casco histórico é peonil: o mellor é aparcar preto e vir dando un paseo.",
    booking:
      "Non collemos reservas: as mesas ocúpanse por orde de chegada, así que abonda con vir. Se sodes grupo grande, chámanos e dicímosche a mellor hora: [Chamar ao {phone}]({tel}).",
    bookingExtra: "Os mellores momentos para atopar sitio son ao abrir, ás 13:00 e ás 20:00.",
    prices: "A nosa franxa de prezos é de **{range} por persoa**, con racións pensadas para compartir. Algúns exemplos:",
    pricesExtra: "Os prezos son orientativos, con IVE incluído. Aceptamos tarxeta.",
    dishInfo: "**{name}** — {price}. {description}",
    dishAllergens: "Alérxenos: {allergens}.",
    dishNoAllergens: "Consulta os alérxenos co persoal.",
    dishPairing: "Marida con **{wine}**.",
    safety: "Ante alerxias ou intolerancias, confírmao sempre co persoal: a nosa cociña manipula todos os alérxenos.",
    fallback: "Non estou seguro de entenderte. Podo axudarte con:",
    fallbackItems: [
      "Pratos sen glute, sen lactosa, veganos ou vexetarianos",
      "Que hai en cada categoría: croquetas, tixolas, do mar, sobremesas…",
      "Que viños recomendamos cos nosos pratos",
      "Horario, como chegar e se fai falta reservar",
    ],
    fullMenu: "Tes a carta completa, cos alérxenos prato a prato, na [carta dixital]({url}).",
    line: "**{name}** — {price}",
    lineUnit: "**{name}** — {price} · {unit}",
    lineVariants: "**{name}** — {variants}",
    linePairing: "**{name}** → {wine}",
    andMore: "…e {count} máis na [carta dixital]({url}).",
    andMoreCarta: "…e {count} máis aquí, na carta.",
    more: "Cóntoche algo máis? Podo axudarte coa carta, os alérxenos, os viños, o horario ou como chegar.",
  },
};
export default chat;
