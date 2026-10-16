/**
 * Textos compartidos por toda la web: marca, CTAs, días, estado de apertura, navegación por
 * capítulos. Los marcadores {así} se rellenan con useFormat(): t(m.common.cta.callNumber, { phone }).
 *
 * Voz: la del salón, de tú, cercana. No es la de la propuesta comercial.
 */
const common = {
  brand: "Andrea Salón",
  brandShort: "Andrea",
  tagline: "Uñas y belleza en Ourense",
  /* Meta description de la portada: ≤ 160 caracteres, con la pareja de intención local (uñas +
     Ourense) y los tres servicios por los que más se busca. */
  subtitle:
    "Manicura rusa, pedicura, nail art y diseño de mirada en Rúa Río Mao, Ourense. Reserva tu cita online en un minuto.",
  /* `keywords` de la portada (layout.tsx). Las heredan las demás páginas. */
  seoKeywords: [
    "salón de uñas Ourense",
    "manicura Ourense",
    "manicura rusa Ourense",
    "pedicura Ourense",
    "nail art Ourense",
    "uñas de gel Ourense",
    "diseño de cejas Ourense",
    "lifting de pestañas Ourense",
    "Andrea Salón",
  ],
  /** Texto alternativo de la imagen al compartir el enlace. */
  ogAlt: "Andrea Salón, salón de uñas y belleza en Ourense",
  cta: {
    book: "Cita previa",
    bookShort: "Reservar",
    /** Enlace de reserva con una profesional concreta (carrusel del equipo). */
    bookWith: "Reservar con {name}",
    call: "Llamar",
    callNumber: "Llamar al {phone}",
    whatsapp: "WhatsApp",
    whatsappAria: "Escríbenos por WhatsApp",
    directions: "Cómo llegar",
    directionsAria: "Cómo llegar (abre Google Maps)",
    openMaps: "Abrir en Google Maps",
    instagram: "Síguenos en Instagram",
    services: "Ver servicios",
    allServices: "Ver todos los servicios",
    team: "Conoce al equipo",
    gallery: "Ver la galería",
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
    today: "Hoy",
    quickActions: "Acciones rápidas",
    newTab: "se abre en una pestaña nueva",
    /* Marca de dato sin confirmar: la UI lo enseña tal cual al lado del dato. */
    pending: "Pendiente de confirmar",
    photoPending: "Foto real próximamente",
    priceFrom: "desde",
    priceOnRequest: "Precio en el salón",
    minutes: "{minutes} min",
    loadMap: "Cargar mapa",
    loadMapNote: "El mapa lo sirve Google, que puede usar sus cookies.",
    loadMapPolicy: "Política de cookies",
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
    open: "Abierto ahora",
    closesAt: "hasta las {time}",
    closingSoon: "Cierra pronto",
    opensToday: "Abre hoy a las {time}",
    closedToday: "Hoy cerrado",
    opensOn: "Abrimos el {day} a las {time}",
    opensTomorrow: "Abrimos mañana a las {time}",
    closed: "Cerrado",
    closedDay: "Cerrado",
    hours: "Horario",
    /* Mientras Andrea no confirme el horario, se enseña con este aviso al lado. */
    hoursPending: "Horario orientativo, pendiente de confirmar con el salón.",
    hoursCaption: "Horario semanal de {name}",
  },
  /** Navegación por capítulos de la portada (ChapterNav) y barra de progreso. */
  scroll: {
    chapters: {
      hero: "Inicio",
      servicios: "Servicios",
      bonos: "Bonos",
      resenas: "Reseñas",
      contacto: "Contacto",
      footer: "Pie",
    },
    nav: {
      label: "Capítulos de la página",
      goTo: "Ir al capítulo {chapter}",
      current: "capítulo actual",
    },
    progress: "Progreso de la página",
    progressValue: "{percent} % de la página",
  },
} as const;
export default common;
