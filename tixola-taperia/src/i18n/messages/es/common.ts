/**
 * Textos compartidos por toda la web: marca, CTAs, días, estado de apertura.
 * Los marcadores {así} se rellenan con useFormat(): t(m.common.cta.callNumber, { phone }).
 */
const common = {
  brand: "Tixola Tapería",
  brandShort: "Tixola",
  tagline: "El Arte del Tapeo en el Corazón de Ourense",
  /* Meta description de la portada (layout.tsx la completa con la nota de Google): lleva la
     pareja de intención local del brief —tapas + Ourense— y se queda en ≤ 160 caracteres. */
  subtitle:
    "Tapas y tixolas de hierro, croquetas caseras, pulpo y zamburiñas junto a la Catedral de Ourense.",
  /* `keywords` de la portada (layout.tsx). Una lista por idioma: la heredan /carta y las páginas
     legales, así que una única lista en español acababa en las versiones inglesa, gallega y portuguesa. */
  seoKeywords: [
    "tapería Ourense",
    "tapas Ourense",
    "zamburiñas Ourense",
    "pulpo a la gallega Ourense",
    "bar de tapas catedral Ourense",
    "Tixola",
    "vinos gallegos",
    "cerveza artesanal Ourense",
    "tapas Ourense casco histórico",
  ],
  cta: {
    menu: "Ir a la Carta",
    menuShort: "Ver Carta",
    call: "Llamar",
    callNumber: "Llamar al {phone}",
    directions: "Cómo llegar",
    directionsAria: "Cómo llegar (abre Google Maps)",
    /* Etiqueta corta para la barra inferior de móvil: "Cómo llegar" parte en dos líneas y se corta en una rejilla de cuatro columnas a 390 px. */
    directionsShort: "Llegar",
    whatsapp: "WhatsApp",
    whatsappAria: "Escríbenos por WhatsApp",
    chat: "Camarero virtual",
    openMaps: "Abrir en Google Maps",
  },
  misc: {
    close: "Cerrar",
    open: "Abrir",
    back: "Volver",
    loading: "Cargando…",
    seeAll: "Ver todo",
    seeMore: "Ver más",
    next: "Siguiente",
    prev: "Anterior",
    skipToContent: "Saltar al contenido",
    language: "Idioma",
    perPerson: "por persona",
    reviews: "reseñas",
    onGoogle: "en Google",
    today: "hoy",
    ratingLabel: "{value} de 5 en Google con {count} reseñas",
    quickActions: "Acciones rápidas",
    optional: "opcional",
    newTab: "se abre en una pestaña nueva",
    /* Tixola no coge reservas: es por orden de llegada. Una sola frase para el pie, la
       tarjeta de "ahora mismo" y las preguntas frecuentes, para que no se contradigan. */
    noBooking: "No cogemos reservas: mesa por orden de llegada.",
  },
  days: {
    mon: "Lunes",
    tue: "Martes",
    wed: "Miércoles",
    thu: "Jueves",
    fri: "Viernes",
    sat: "Sábado",
    sun: "Domingo",
  },
  status: {
    openNow: "Abierto ahora",
    closingSoon: "Cierra pronto",
    closedNow: "Cerrado ahora",
    closed: "Cerrado",
    opensIn: "Abre en {minutes} min",
    closesAt: "Cierra a las {time}",
    opensTodayAt: "Abre hoy a las {time}",
    opensTomorrowAt: "Abre mañana a las {time}",
    opensOnAt: "Abre el {day} a las {time}",
    checkHours: "Consulta horarios",
    checking: "Consultando horario…",
    moodLunch: "Ideal para comer",
    moodDinner: "Ideal para cenar",
    moodWine: "Ideal para unos vinos",
    hours: "Horario",
  },
  /** Modal "Reserva tu mesa" (llamada, WhatsApp y formulario → mensaje de WhatsApp). */
  /** Página 404 dentro de un idioma válido (slug legal desconocido, enlace roto). */
  notFound: {
    kicker: "404",
    title: "Esta mesa no existe",
    text: "La página que buscas no está en la carta. Vuelve al inicio o echa un vistazo a nuestros platos.",
    back: "Volver al inicio",
  },
} as const;
export default common;
