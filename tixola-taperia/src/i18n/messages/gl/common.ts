import type { Section } from "./shape";

/**
 * Textos compartidos por toda a web: marca, CTAs, días, estado de apertura.
 * Os marcadores {así} énchense con useFormat(): t(m.common.cta.callNumber, { phone }).
 */
const common: Section<"common"> = {
  brand: "Tixola Tapería",
  brandShort: "Tixola",
  tagline: "A Arte do Tapeo no Corazón de Ourense",
  /* Meta description de la portada (layout.tsx la completa con la nota de Google): lleva la
     pareja de intención local del brief —tapas + Ourense— y se queda en ≤ 160 caracteres. */
  subtitle:
    "Tapas e tixolas de ferro, croquetas caseiras, polbo e zamburiñas xunto á Catedral de Ourense.",
  /* `keywords` da portada (layout.tsx), unha lista por idioma. */
  seoKeywords: [
    "tapería Ourense",
    "tapas Ourense",
    "zamburiñas Ourense",
    "polbo á galega Ourense",
    "bar de tapas catedral Ourense",
    "Tixola",
    "viños galegos",
    "cervexa artesá Ourense",
    "tapas Ourense casco histórico",
  ],
  cta: {
    menu: "Ir á Carta",
    menuShort: "Ver Carta",
    call: "Chamar",
    callNumber: "Chamar ao {phone}",
    directions: "Como chegar",
    directionsAria: "Como chegar (abre Google Maps)",
    /* Etiqueta corta para la barra inferior de móvil: "Como chegar" parte en dos líneas y se corta en una rejilla de cuatro columnas a 390 px. */
    directionsShort: "Chegar",
    whatsapp: "WhatsApp",
    whatsappAria: "Escríbenos por WhatsApp",
    chat: "Camareiro virtual",
    openMaps: "Abrir en Google Maps",
  },
  misc: {
    close: "Pechar",
    open: "Abrir",
    back: "Volver",
    loading: "Cargando…",
    seeAll: "Ver todo",
    seeMore: "Ver máis",
    next: "Seguinte",
    prev: "Anterior",
    skipToContent: "Saltar ao contido",
    language: "Idioma",
    perPerson: "por persoa",
    reviews: "recensións",
    onGoogle: "en Google",
    today: "hoxe",
    ratingLabel: "{value} de 5 en Google con {count} recensións",
    quickActions: "Accións rápidas",
    optional: "opcional",
    newTab: "ábrese nunha lapela nova",
    noBooking: "Non collemos reservas: mesa por orde de chegada.",
  },
  days: {
    mon: "Luns",
    tue: "Martes",
    wed: "Mércores",
    thu: "Xoves",
    fri: "Venres",
    sat: "Sábado",
    sun: "Domingo",
  },
  status: {
    openNow: "Aberto agora",
    closingSoon: "Pecha en breve",
    closedNow: "Pechado agora",
    closed: "Pechado",
    opensIn: "Abre en {minutes} min",
    closesAt: "Pecha ás {time}",
    opensTodayAt: "Abre hoxe ás {time}",
    opensTomorrowAt: "Abre mañá ás {time}",
    opensOnAt: "Abre o {day} ás {time}",
    checkHours: "Consulta os horarios",
    checking: "Consultando o horario…",
    moodLunch: "Ideal para xantar",
    moodDinner: "Ideal para cear",
    moodWine: "Ideal para uns viños",
    hours: "Horario",
  },
  /** Modal "Reserva a túa mesa" (chamada, WhatsApp e formulario → mensaxe de WhatsApp). */
  notFound: {
    kicker: "404",
    title: "Esta mesa non existe",
    text: "A páxina que buscas non está na carta. Volve ao inicio ou bótalle unha ollada aos nosos pratos.",
    back: "Volver ao inicio",
  },
};
export default common;
