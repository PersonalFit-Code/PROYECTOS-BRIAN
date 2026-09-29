import type esCommon from "@/i18n/messages/es/common";
import type { Translation } from "./shape";

/**
 * Textos partilhados por todo o site: marca, CTAs, dias, estado de abertura.
 * Os marcadores {assim} são preenchidos com useFormat(): t(m.common.cta.callNumber, { phone }).
 */
const common = {
  brand: "Tixola Tapería",
  brandShort: "Tixola",
  tagline: "A Arte do Petisco no Coração de Ourense",
  /* Meta description de la portada (layout.tsx la completa con la nota de Google): lleva la
     pareja de intención local del brief —tapas + Ourense— y se queda en ≤ 160 caracteres. */
  subtitle:
    "Petiscos e tixolas de ferro, croquetes caseiros, polvo e zamburiñas junto à Catedral de Ourense.",
  /* `keywords` da portada (layout.tsx), uma lista por idioma. */
  seoKeywords: [
    "petiscos Ourense",
    "tapas Ourense",
    "petiscos Catedral de Ourense",
    "zamburiñas Ourense",
    "polvo à galega Ourense",
    "Tixola",
    "vinhos galegos",
    "cerveja artesanal Ourense",
    "onde comer em Ourense centro histórico",
  ],
  cta: {
    menu: "Ir para a Ementa",
    menuShort: "Ver Ementa",
    call: "Ligar",
    callNumber: "Ligar para o {phone}",
    directions: "Como chegar",
    directionsAria: "Como chegar (abre o Google Maps)",
    /* Etiqueta corta para la barra inferior de móvil: "Como chegar" parte en dos líneas y se corta en una rejilla de cuatro columnas a 390 px. */
    directionsShort: "Chegar",
    whatsapp: "WhatsApp",
    whatsappAria: "Escreva-nos pelo WhatsApp",
    chat: "Empregado virtual",
    openMaps: "Abrir no Google Maps",
  },
  misc: {
    close: "Fechar",
    open: "Abrir",
    back: "Voltar",
    loading: "A carregar…",
    seeAll: "Ver tudo",
    seeMore: "Ver mais",
    next: "Seguinte",
    prev: "Anterior",
    skipToContent: "Saltar para o conteúdo",
    language: "Idioma",
    perPerson: "por pessoa",
    reviews: "avaliações",
    onGoogle: "no Google",
    today: "hoje",
    ratingLabel: "{value} em 5 no Google com {count} avaliações",
    quickActions: "Ações rápidas",
    optional: "opcional",
    newTab: "abre num novo separador",
    noBooking: "Não aceitamos reservas: mesa por ordem de chegada.",
  },
  days: {
    mon: "Segunda-feira",
    tue: "Terça-feira",
    wed: "Quarta-feira",
    thu: "Quinta-feira",
    fri: "Sexta-feira",
    sat: "Sábado",
    sun: "Domingo",
  },
  status: {
    openNow: "Aberto agora",
    closingSoon: "Fecha em breve",
    closedNow: "Fechado agora",
    closed: "Fechado",
    opensIn: "Abre daqui a {minutes} min",
    closesAt: "Fecha às {time}",
    opensTodayAt: "Abre hoje às {time}",
    opensTomorrowAt: "Abre amanhã às {time}",
    opensOnAt: "Abre {day} às {time}",
    checkHours: "Consulte o horário",
    checking: "A consultar o horário…",
    moodLunch: "Ideal para almoçar",
    moodDinner: "Ideal para jantar",
    moodWine: "Ideal para uns vinhos",
    hours: "Horário",
  },
  /** Modal "Reserve a sua mesa" (chamada, WhatsApp e formulário → mensagem de WhatsApp). */
  notFound: {
    kicker: "404",
    title: "Esta mesa não existe",
    text: "A página que procura não está na ementa. Volte ao início ou dê uma vista de olhos aos nossos pratos.",
    back: "Voltar ao início",
  },
} satisfies Translation<typeof esCommon>;
export default common;
