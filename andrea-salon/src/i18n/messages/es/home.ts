/**
 * Portada: hero, servicios destacados, bonos, recorrido (hueco), reseñas, preguntas, contacto corto
 * y cierre. Los marcadores {así} se rellenan con useFormat().
 */
const home = {
  seo: {
    title: "Andrea Salón · Uñas y belleza en Ourense",
    description:
      "Salón de uñas en Ourense: manicura rusa, pedicura, nail art, gel y acrylgel, diseño de cejas y lifting de pestañas. Reserva tu cita online en un minuto.",
  },
  hero: {
    kicker: "Rúa Río Mao, 23 · Ourense",
    title: "Uñas y belleza",
    accent: "en Ourense",
    subtitle:
      "Manicura rusa, pedicura, nail art y diseño de mirada. Un salón pequeño, con tiempo para ti y manos que saben lo que hacen.",
    primary: "Reservar cita",
    secondary: "Ver servicios",
    /** Tres promesas cortas bajo los botones. */
    perks: ["Cita online en un minuto", "Confirmación por correo", "Cancela o cambia con un clic"],
    scrollCue: "Desliza",
    logoAlt: "Logotipo de Andrea Salón",
  },
  servicios: {
    kicker: "Servicios",
    title: "Lo que hacemos",
    accent: "con mimo",
    description:
      "Desde una manicura completa hasta una extensión de gel, pasando por cejas y pestañas. Precios cerrados en la mayoría; en los que dependen del trabajo, te lo decimos antes de empezar.",
    seeAll: "Ver todos los servicios y precios",
    /* Mientras la lista salga del fixture y no de la base de datos. */
    pendingNote: "Precios y duraciones pendientes de confirmar con el salón.",
  },
  bonos: {
    kicker: "Bonos y regalos",
    title: "Regala manos",
    accent: "bonitas",
    description:
      "Bonos de varias sesiones y tarjetas regalo para quien quieras. Muy pronto se podrán comprar aquí mismo y llegan al correo con su código QR.",
    soon: "Muy pronto",
    cta: "Saber más sobre los bonos",
  },
  recorrido: {
    kicker: "El salón",
    title: "Pasa y",
    accent: "mira",
    description: "Un paseo por el salón, de la puerta a la silla.",
  },
  faq: {
    kicker: "Preguntas frecuentes",
    title: "Lo que nos preguntáis",
    accent: "más",
  },
  contacto: {
    kicker: "Contacto",
    title: "Ven a",
    accent: "vernos",
    description: "Estamos en Rúa Río Mao, 23, en Ourense. Si tienes cualquier duda, llámanos o escríbenos por WhatsApp.",
  },
  cta: {
    title: "¿Reservamos",
    accent: "tu cita?",
    text: "Elige servicio, profesional, día y hora. Te llega la confirmación al correo y un recordatorio el día antes.",
    primary: "Reservar cita",
    secondary: "Escribir por WhatsApp",
  },
} as const;
export default home;
