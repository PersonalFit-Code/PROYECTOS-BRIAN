import type { Traducion } from "./traducion";

/** Portada (ver `messages/es/home.ts`). `title` + `accent` lense seguidos: «Unllas e beleza en Ourense». */
const home: Traducion<"home"> = {
  seo: {
    title: "Andrea Salón · Unllas e beleza en Ourense",
    description:
      "Salón de unllas en Ourense: manicura rusa, pedicura, nail art, xel e acrylgel, deseño de cellas e lifting de pestanas. Reserva a túa cita en liña nun minuto.",
  },
  hero: {
    kicker: "Rúa Río Mao, 23 · Ourense",
    title: "Unllas e beleza",
    accent: "en Ourense",
    subtitle:
      "Manicura rusa, pedicura, nail art e deseño de mirada. Un salón pequeno, con tempo para ti e mans que saben o que fan.",
    primary: "Reservar cita",
    secondary: "Ver servizos",
    perks: ["Cita en liña nun minuto", "Confirmación por correo", "Cancela ou cambia cun clic"],
    scrollCue: "Despraza",
    logoAlt: "Logotipo de Andrea Salón",
  },
  servicios: {
    kicker: "Servizos",
    title: "O que facemos",
    accent: "con agarimo",
    description:
      "Desde unha manicura completa ata unha extensión de xel, pasando por cellas e pestanas. Prezos pechados na maioría; nos que dependen do traballo, dicímoscho antes de comezar.",
    seeAll: "Ver todos os servizos e prezos",
    pendingNote: "Prezos e duracións pendentes de confirmar co salón.",
  },
  bonos: {
    kicker: "Bonos e agasallos",
    title: "Agasalla mans",
    accent: "bonitas",
    description:
      "Bonos de varias sesións e tarxetas agasallo para quen ti queiras. Moi pronto vas poder mercalos aquí mesmo e chegarán ao teu correo co seu código QR.",
    soon: "Moi pronto",
    cta: "Saber máis sobre os bonos",
  },
  recorrido: {
    kicker: "O salón",
    title: "Pasa e",
    accent: "mira",
    description: "Un paseo polo salón, da porta á cadeira.",
  },
  faq: {
    kicker: "Preguntas frecuentes",
    title: "O que máis",
    accent: "nos preguntades",
  },
  contacto: {
    kicker: "Contacto",
    title: "Ven",
    accent: "vernos",
    description: "Estamos na Rúa Río Mao, 23, en Ourense. Se tes calquera dúbida, chámanos ou escríbenos por WhatsApp.",
  },
  cta: {
    title: "Reservamos",
    accent: "a túa cita?",
    text: "Escolle servizo, profesional, día e hora. Chégache a confirmación ao correo e un recordatorio o día antes.",
    primary: "Reservar cita",
    secondary: "Escribir por WhatsApp",
  },
};
export default home;
