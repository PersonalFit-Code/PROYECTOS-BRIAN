import type { Traducion } from "./traducion";

/**
 * Asistente de preguntas frecuentes (ver `messages/es/chat.ts`). Voz: de ti e próxima; cando fala o
 * equipo, en feminino plural. Preséntase sempre como asistente automático, non como unha persoa
 * (art. 50 do Regulamento de IA). Os marcadores `{así}` e os destinos dos enlaces non se traducen.
 */
const chat: Traducion<"chat"> = {
  launcher: "Asistente virtual",
  cue: "Tes algunha dúbida?",
  launcherAria: "Abrir o asistente virtual de Andrea Salón",
  closeAria: "Pechar o asistente virtual",
  title: "Asistente virtual",
  subtitle: "Servizos, prezos, horario, citas e bonos",
  placeholder: "Escribe a túa pregunta…",
  inputLabel: "A túa pregunta para o asistente virtual",
  inputHint: "Intro para enviar · Maiús + Intro para saltar de liña",
  send: "Enviar",
  stop: "Deter a resposta",
  thinking: "Escribindo…",
  welcome:
    "Ola! Son o asistente virtual de Andrea Salón: respondo de forma automática, non son unha persoa. Pregúntame polos servizos e prezos, o horario, como reservar ou cambiar a túa cita, os bonos agasallo ou onde estamos.",
  quickReplies: [
    "Que horario tedes?",
    "Como reservo cita?",
    "Canto custa a manicura?",
    "Canto dura unha manicura?",
    "Tedes bonos agasallo?",
    "Onde estades?",
    "Podo cancelar a miña cita?",
  ],
  quickRepliesLabel: "Preguntas frecuentes",
  messagesLabel: "Conversa co asistente virtual",
  you: "Ti",
  assistant: "Asistente virtual",
  fallbackNote: "O asistente con IA non está dispoñible agora mesmo: respóndoche coa información básica da web.",
  error: "Non puiden responder agora mesmo. Téntao de novo ou escríbenos.",
  rateLimited: "Fixeches moitas preguntas seguidas. Agarda uns minutos ou escríbenos por WhatsApp e contestámosche.",
  retry: "Tentar de novo",
  callCta: "Chamar",
  disclaimer: "Respostas orientativas: o que vale é o que che digamos no salón.",
  privacyNoteIA:
    "O que escribas envíase ao noso provedor de IA (Anthropic, nos EUA) para redactar a resposta. Nós non o gardamos: a conversa vive só nesta lapela e bórrase ao recargar ou pechala; o provedor elimínao dos seus sistemas, por norma, en 30 días como máximo. Non escribas datos persoais nin de saúde.",
  privacyNoteLocal:
    "As túas preguntas respóndense no noso servidor coa información desta web: non se gardan nin se envían a ninguén máis. A conversa vive só nesta lapela e bórrase ao recargar ou pechala. Non escribas datos persoais nin de saúde.",
  privacyLink: "Como tratamos os teus datos",
  poweredByIA: "Asistente con IA",
  poweredByLocal: "Respostas automáticas",
  clear: "Nova conversa",

  offline: {
    greeting:
      "Ola! Son o asistente virtual de Andrea Salón. Podo contarche que servizos facemos e canto custan, o horario, como reservar ou cambiar a túa cita, os bonos agasallo e onde estamos. Que che gustaría saber?",
    thanks: "A ti! Aquí estou para calquera outra dúbida. Cando queiras, [reserva a túa cita]({reservar}) nun minuto.",
    booking:
      "Desde aquí non podo reservar nin ver que ocos quedan, pero nun minuto faino ti na [reserva en liña]({reservar}): escolles servizo, profesional e hora, e chégache a confirmación ao correo. Está aberta as 24 horas e **non pide tarxeta**.",
    bookingAlt: "Se o prefires, chámanos ao [{phone}]({tel}) ou escríbenos por [WhatsApp]({whatsapp}).",
    cancelExtra:
      "Eu non podo cambiar nin cancelar citas desde aquí: faino desde a ligazón do correo de confirmación ou chámanos ao [{phone}]({tel}).",
    walkInExtra: "Podes [reservar en liña]({reservar}) agora mesmo.",
    healthExtra:
      "Non podo darche consello médico nin valorar se un produto ou un servizo che vai ben: coméntao nas notas ao reservar ou [chámanos]({tel}) e o equipo asesórate. Para calquera dúbida de saúde, consulta co teu médico.",
    healthFallback: "Cóntanolo nas **notas da reserva** ou ao chegar, e o equipo buscará contigo a mellor alternativa.",
    hoursIntro: "O noso horario (hora de Ourense):",
    hoursNow: "Agora mesmo: {status}.",
    hoursPending:
      "É un horario orientativo, **pendente de confirmar** co salón: se vas vir xusto a unha hora límite, chámanos antes ao [{phone}]({tel}).",
    location: "Estamos en **{address}**. [Como chegar]({directions})",
    locationDirections: "[Como chegar con Google Maps]({directions})",
    pricesIntro: "Estes son os nosos prezos (IVE incluído):",
    pricesMatchIntro: "Isto é o que custa (IVE incluído):",
    pricesNone:
      "Agora mesmo non teño a lista de prezos a man. Tela en [servizos e prezos]({servicios}) ou pregúntanos por [WhatsApp]({whatsapp}).",
    pricesUnknown: "Os que non levan prezo dependen do traballo: pregúntanos por [WhatsApp]({whatsapp}) ou no salón e dicímoscho.",
    pricesPending: "É unha lista provisional: os prezos están **pendentes de confirmar** co salón.",
    pricesOutro: "Todos os servizos, coa súa descrición, en [servizos e prezos]({servicios}).",
    durationIntro: "Duración aproximada:",
    durationOutro: "Ao reservar verás a duración de cada servizo antes de escoller a hora.",
    durationPending: "Son duracións orientativas, **pendentes de confirmar** co salón.",
    servicesIntro: "Isto é o que facemos:",
    servicesOutro: "Prezos e detalles en [servizos e prezos]({servicios}). Cóntoche algo dalgún?",
    servicesOutroHere: "Telos todos, co seu prezo, aquí mesmo nesta páxina. Cóntoche algo dalgún?",
    servicesNone: "Agora mesmo non teño a lista de servizos a man. Tela en [servizos e prezos]({servicios}).",
    serviceInfo: "**{name}**: {description}",
    serviceTitle: "**{name}**",
    servicePrice: "Prezo: {price}{pending}.",
    servicePriceUnknown: "Prezo: depende do traballo, pregúntanos.",
    serviceDuration: "Duración: uns {minutes} min{pending}.",
    serviceBook: "[Reservar {name}]({url})",
    serviceNotOnline: "Este pídese no salón: chámanos ao [{phone}]({tel}).",
    pendingSuffix: " (pendente de confirmar)",
    line: "**{name}** — {price}",
    linePriceUnknown: "**{name}** — prezo no salón, pregúntanos",
    lineDuration: "**{name}** — uns {minutes} min",
    lineDurationUnknown: "**{name}** — pregúntanos canto dura",
    lineCategory: "**{category}**",
    bonosLink: "Tes toda a información na [páxina de bonos]({bonos}).",
    bonosLinkHere: "Tes toda a información aquí mesmo, nesta páxina.",
    contact:
      "Podes chamarnos ao [{phone}]({tel}) ou escribirnos por [WhatsApp]({whatsapp}). Tamén estamos en Instagram: [{instagramHandle}]({instagram}).",
    gallery: "Os nosos traballos están na [galería]({galeria}) e, ao día, en Instagram: [{instagramHandle}]({instagram}).",
    team: "Presentámosche o equipo na [páxina do equipo]({equipo}). Ao reservar podes escoller profesional ou deixar que che deamos a primeira que estea libre.",
    fallback: "Non sei se te entendín ben. Podo axudarche con:",
    fallbackItems: [
      "Servizos, prezos e canto dura cada un",
      "Horario e como chegar",
      "Como reservar, cambiar ou cancelar a túa cita",
      "Bonos e tarxetas agasallo",
    ],
    fallbackContact: "Para calquera outra cousa, escríbenos por [WhatsApp]({whatsapp}) ou chámanos ao [{phone}]({tel}).",
  },
};
export default chat;
