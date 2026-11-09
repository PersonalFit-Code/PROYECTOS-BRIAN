/**
 * Motor local del asistente: responde con los datos REALES de 720 (dosier 2025-26) por palabras
 * clave. Lo usa /api/asistente cuando no hay clave de Anthropic, y el navegador si la red falla.
 * Las «acciones» son los botones que acompañan cada respuesta: siempre hay un siguiente paso.
 */
import { negocio, pilates } from "@/data/negocio";

export interface Accion {
  etiqueta: string;
  href: string;
}
export interface Respuesta {
  texto: string;
  acciones: Accion[];
}

const A = {
  alta: { etiqueta: "Inscribirme", href: "/alta" },
  prueba: { etiqueta: "Clase gratis", href: "/?tipo=prueba#apuntate" },
  tarifas: { etiqueta: "Ver tarifas", href: "/#tarifas" },
  horario: { etiqueta: "Ver horario", href: "/#horario" },
  pilates: { etiqueta: "720 Pilates", href: "/pilates" },
  entrada: { etiqueta: "Entrada diaria", href: "/alta?plan=entrada-diaria" },
  mapa: { etiqueta: "Cómo llegar", href: negocio.comoLlegar },
  whatsapp: { etiqueta: "WhatsApp", href: `https://wa.me/${negocio.whatsapp}` },
  personal: { etiqueta: "Entrenamiento personal", href: "/conceptos/entrenamiento-personal" },
} satisfies Record<string, Accion>;

const normal = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const reglas: { claves: RegExp; r: Respuesta }[] = [
  {
    claves: /\b(hola|buenas|hey|ola|saludos)\b/,
    r: { texto: "¡Hola! Soy el asistente de 720 GYM CLUB. Te ayudo con horarios, precios, clases o a darte de alta en un minuto. ¿Qué te interesa?", acciones: [A.tarifas, A.horario, A.prueba] },
  },
  {
    claves: /horari|hora|abr[ei]|cierr|domingo|festiv|sabado|365/,
    r: { texto: `Abrimos ${negocio.horario.texto.toLowerCase()}, los 365 días del año, festivos incluidos. Las clases dirigidas tienen su propio horario y puedes reservar plaza desde la web.`, acciones: [A.horario, A.prueba] },
  },
  {
    claves: /pilates|reformer|mat\b|wall|hipopres|suelo pelvic/,
    r: {
      texto: `720 Pilates tiene Reformer, Mat, Wall Unit e Hipopresivos en grupos reducidos y por niveles. Reformer desde 55 €/mes (1 día), Mat desde 40 €/mes e Hipopresivos desde 35 €/mes. Sin matrícula y la primera clase es gratis. Su WhatsApp es el ${pilates.whatsappVisible}.`,
      acciones: [A.pilates, { etiqueta: "Probar Pilates gratis", href: "/pilates?tipo=prueba&actividad=pilates#apuntate" }],
    },
  },
  {
    claves: /entrada|un dia|de paso|turista|pase|semana/,
    r: { texto: "Si estás de paso, la entrada libre cuesta 5 € por día y la sacas online en un minuto. Para estancias más largas tenemos pases temporales: pregúntanos y te damos precio.", acciones: [A.entrada, A.whatsapp] },
  },
  {
    claves: /personal|entrenador|bono|valoraci|pareja|trio/,
    r: {
      texto: "El entrenamiento personal empieza con una sesión de valoración y plan a medida por 35 €. Después, bonos: 10 sesiones por 270 € (27 €/sesión, el recomendado). En pareja, trío o grupo de 4 el precio por persona baja hasta 15 €. Los bonos no caducan.",
      acciones: [{ etiqueta: "Reservar valoración", href: "/alta?plan=valoracion" }, A.personal],
    },
  },
  {
    claves: /precio|cuesta|cuota|tarifa|mensual|cuanto|vale|euros|€|barato|oferta/,
    r: {
      texto: "El gimnasio libre cuesta 35 €/mes (oferta de apertura) con acceso ilimitado los 365 días. Supervisión en grupo, 45 €/mes. Paquete Inicio, 75 € (valoración, plan, 1 sesión personal y un mes). Entrada de un día, 5 €. Te doy de alta ahora mismo si quieres.",
      acciones: [A.alta, A.tarifas],
    },
  },
  {
    claves: /prueba|probar|gratis|primera clase|conocer/,
    r: { texto: "¡Claro! Elige día y hora para tu clase de prueba gratis y te confirmamos por WhatsApp. Sin compromiso.", acciones: [A.prueba, A.alta] },
  },
  {
    claves: /donde|direcci|llegar|ubicaci|aparca|parking|bus|calle/,
    r: { texto: `Estamos en ${negocio.direccion.completa}. Bien comunicados con varias líneas de autobús y es fácil aparcar por la zona.`, acciones: [A.mapa, A.prueba] },
  },
  {
    claves: /aforo|lleno|gente|masific|esper/,
    r: { texto: "Tenemos aforo limitado: el número de socios es el justo para que nunca esperes una máquina. Aquí entrenas a tu ritmo, rodeado de gente como tú.", acciones: [A.alta, A.prueba] },
  },
  {
    claves: /yoga/,
    r: { texto: "720 Yoga: clases en grupo reducido para ganar movilidad y calma. Los precios aún no están publicados en la web; te los paso por WhatsApp o reserva una clase de prueba.", acciones: [{ etiqueta: "Ver 720 Yoga", href: "/conceptos/yoga" }, A.whatsapp] },
  },
  {
    claves: /powerlifting|fuerza|sentadilla|peso muerto|banca|crossgym|crossfit|funcional/,
    r: { texto: "Para fuerza tenemos sala de peso libre con material de competición (720 Powerlifting) y CrossGym 720: fuerza y acondicionamiento en grupo, adaptado a tu nivel.", acciones: [{ etiqueta: "Powerlifting", href: "/conceptos/powerlifting" }, { etiqueta: "CrossGym", href: "/conceptos/crossgym" }] },
  },
  {
    claves: /capoeira|bjj|jiu|acrobac|ninos|nino|peques|halterofilia|club/,
    r: { texto: "Dentro de 720 entrenan clubes con su propio equipo: gimnasia acrobática (Clube Ximnasia Burgas), Capoeira Andaruê, BJJ Mambises y Halterofilia. Te ponemos en contacto con ellos.", acciones: [{ etiqueta: "Ver clubes", href: "/#clubes" }, A.whatsapp] },
  },
  {
    claves: /pago|pagar|cobr|tarjeta|bizum|domicilia|cancelar|baja/,
    r: { texto: "Puedes pagar online con tarjeta, Apple Pay o Google Pay al darte de alta. La cuota se cobra entre el día 1 y el 7 de cada mes y puedes cancelar cuando quieras.", acciones: [A.alta] },
  },
  {
    claves: /alquil|profesional|sala|taller|evento|720p/,
    r: { texto: "Con 720P alquilamos espacio a entrenadores, terapeutas e instructores para cursos, talleres, eventos o clinics. Escríbenos y te contamos disponibilidad.", acciones: [{ etiqueta: "Espacios 720P", href: "/#profesionales" }, A.whatsapp] },
  },
  {
    claves: /telefono|llamar|contacto|email|correo|whatsapp/,
    r: { texto: `Puedes llamarnos al ${negocio.telefonoVisible}, escribirnos por WhatsApp al ${negocio.whatsappVisible} o al email ${negocio.email}.`, acciones: [A.whatsapp] },
  },
];

export function responderLocal(pregunta: string): Respuesta {
  const t = normal(pregunta);
  for (const { claves, r } of reglas) if (claves.test(t)) return r;
  return {
    texto: "Esa no la sé contestar con seguridad, pero el equipo te responde enseguida por WhatsApp. Mientras, puedo ayudarte con horarios, precios, Pilates o tu clase de prueba.",
    acciones: [A.whatsapp, A.prueba],
  };
}

/** Acciones sugeridas para una pregunta (también se adjuntan a las respuestas de Claude). */
export const accionesPara = (pregunta: string) => responderLocal(pregunta).acciones;
