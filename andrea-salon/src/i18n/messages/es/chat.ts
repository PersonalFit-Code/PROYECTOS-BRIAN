/**
 * Textos del asistente de preguntas frecuentes: lanzador, panel y plantillas del motor sin IA
 * (`offline.*`). Los marcadores {así} se rellenan con useFormat() / format().
 *
 * Voz: la del salón, de tú y cercana. Cuando habla el equipo, en femenino plural («te atendemos
 * encantadas»), como en las preguntas frecuentes de `data/faq.ts`. El asistente se presenta siempre
 * como lo que es: un asistente automático, no una persona.
 */
const chat = {
  launcher: "Asistente virtual",
  /* La llamada que sale sola a los pocos segundos junto al disco. Corta a propósito: se lee de un
     vistazo y cabe entre el disco y el botón de WhatsApp en una pantalla de 320 px. No dice «¿te
     reservo?» porque el asistente NO reserva: invita a preguntar, que es lo que sí hace. */
  cue: "¿Tienes alguna duda?",
  launcherAria: "Abrir el asistente virtual de Andrea Salón",
  closeAria: "Cerrar el asistente virtual",
  title: "Asistente virtual",
  subtitle: "Servicios, precios, horario, citas y bonos",
  placeholder: "Escribe tu pregunta…",
  inputLabel: "Tu pregunta para el asistente virtual",
  inputHint: "Intro para enviar · Mayús + Intro para saltar de línea",
  send: "Enviar",
  stop: "Detener la respuesta",
  thinking: "Escribiendo…",
  /* Vale para los dos modos (con y sin IA): «respondo de forma automática» es verdad en ambos, y
     dejar claro que no es una persona es lo que pide el art. 50 del Reglamento de IA. */
  welcome:
    "¡Hola! Soy el asistente virtual de Andrea Salón: respondo de forma automática, no soy una persona. Pregúntame por los servicios y precios, el horario, cómo reservar o cambiar tu cita, los bonos regalo o dónde estamos.",
  quickReplies: [
    "¿Qué horario tenéis?",
    "¿Cómo reservo cita?",
    "¿Cuánto cuesta la manicura?",
    "¿Cuánto dura una manicura?",
    "¿Tenéis bonos regalo?",
    "¿Dónde estáis?",
    "¿Puedo cancelar mi cita?",
  ],
  quickRepliesLabel: "Preguntas frecuentes",
  messagesLabel: "Conversación con el asistente virtual",
  you: "Tú",
  assistant: "Asistente virtual",
  /* Solo se enseña cuando HAY clave y el modelo ha fallado. Sin clave, responder con las preguntas
     frecuentes es el modo normal y no merece un aviso de avería. */
  fallbackNote: "El asistente con IA no está disponible ahora mismo: te respondo con la información básica de la web.",
  error: "No he podido responder ahora mismo. Inténtalo de nuevo o escríbenos.",
  rateLimited: "Has hecho muchas preguntas seguidas. Espera unos minutos o escríbenos por WhatsApp y te contestamos.",
  retry: "Reintentar",
  callCta: "Llamar",
  disclaimer: "Respuestas orientativas: lo que vale es lo que te digamos en el salón.",
  /* PRIMERA CAPA de información (art. 13 RGPD), en el sitio donde se escribe y no a dos clics. Hay
     DOS versiones y el panel elige según lo que de verdad pasa con el texto: con la IA activada sale
     hacia Anthropic; sin ella se responde en nuestro servidor y no sale a nadie. Que la conversación
     «vive solo en esta pestaña» es literal: no se guarda ni en el navegador (ver `useChatSession`). */
  privacyNoteIA:
    "Lo que escribas se envía a nuestro proveedor de IA (Anthropic, en EE. UU.) para redactar la respuesta. Nosotros no lo guardamos: la conversación vive solo en esta pestaña y se borra al recargar o cerrarla; el proveedor lo elimina de sus sistemas, por norma, en 30 días como máximo. No escribas datos personales ni de salud.",
  privacyNoteLocal:
    "Tus preguntas se responden en nuestro servidor con la información de esta web: no se guardan ni se envían a nadie más. La conversación vive solo en esta pestaña y se borra al recargar o cerrarla. No escribas datos personales ni de salud.",
  privacyLink: "Cómo tratamos tus datos",
  poweredByIA: "Asistente con IA",
  poweredByLocal: "Respuestas automáticas",
  clear: "Nueva conversación",

  /** Plantillas del motor determinista (sin clave de API o si el modelo falla). */
  offline: {
    greeting:
      "¡Hola! Soy el asistente virtual de Andrea Salón. Puedo contarte qué servicios hacemos y cuánto cuestan, el horario, cómo reservar o cambiar tu cita, los bonos regalo y dónde estamos. ¿Qué te gustaría saber?",
    thanks: "¡A ti! Aquí estoy para cualquier otra duda. Cuando quieras, [reserva tu cita]({reservar}) en un minuto.",

    /* RESERVAR. El asistente no ve la agenda ni puede apuntar a nadie, y lo dice: una promesa de
       hueco que luego no existe es peor que mandar a la reserva, que sí lo sabe. */
    booking:
      "Desde aquí no puedo reservar ni ver qué huecos quedan, pero en un minuto lo haces tú en [la reserva online]({reservar}): eliges servicio, profesional y hora, y te llega la confirmación al correo. Está abierta las 24 horas y **no pide tarjeta**.",
    bookingAlt: "Si lo prefieres, llámanos al [{phone}]({tel}) o escríbenos por [WhatsApp]({whatsapp}).",
    cancelExtra:
      "Yo no puedo cambiar ni cancelar citas desde aquí: hazlo desde el enlace del correo de confirmación o llámanos al [{phone}]({tel}).",
    walkInExtra: "Puedes [reservar online]({reservar}) ahora mismo.",

    /* SALUD. La respuesta del FAQ de alergias va primero; esto la remata. Sin diagnosticar y sin
       valorar si un producto le va bien a nadie: eso lo hace el equipo en persona o su médico. */
    healthExtra:
      "No puedo darte consejo médico ni valorar si un producto o un servicio te va bien: coméntalo en las notas al reservar o [llámanos]({tel}) y el equipo te asesora. Para cualquier duda de salud, consulta con tu médico.",
    healthFallback: "Cuéntanoslo en las **notas de la reserva** o al llegar, y el equipo buscará contigo la mejor alternativa.",

    hoursIntro: "Nuestro horario (hora de Ourense):",
    hoursNow: "Ahora mismo: {status}.",
    hoursPending: "Es un horario orientativo, **pendiente de confirmar** con el salón: si vas a venir justo a una hora límite, llámanos antes al [{phone}]({tel}).",

    location: "Estamos en **{address}**. [Cómo llegar]({directions})",
    /* Cuando la pregunta frecuente de aparcar ya dice la dirección, solo falta el enlace. */
    locationDirections: "[Cómo llegar con Google Maps]({directions})",

    pricesIntro: "Estos son nuestros precios (IVA incluido):",
    pricesMatchIntro: "Esto es lo que cuesta (IVA incluido):",
    pricesNone:
      "Ahora mismo no tengo la lista de precios a mano. La tienes en [servicios y precios]({servicios}) o pregúntanos por [WhatsApp]({whatsapp}).",
    pricesUnknown: "Los que no llevan precio dependen del trabajo: pregúntanos por [WhatsApp]({whatsapp}) o en el salón y te lo decimos.",
    pricesPending: "Es una lista provisional: los precios están **pendientes de confirmar** con el salón.",
    pricesOutro: "Todos los servicios, con su descripción, en [servicios y precios]({servicios}).",

    durationIntro: "Duración aproximada:",
    durationOutro: "Al reservar verás la duración de cada servicio antes de elegir la hora.",
    durationPending: "Son duraciones orientativas, **pendientes de confirmar** con el salón.",

    servicesIntro: "Esto es lo que hacemos:",
    servicesOutro: "Precios y detalles en [servicios y precios]({servicios}). ¿Te cuento algo de alguno?",
    servicesOutroHere: "Los tienes todos, con su precio, aquí mismo en esta página. ¿Te cuento algo de alguno?",
    servicesNone: "Ahora mismo no tengo la lista de servicios a mano. La tienes en [servicios y precios]({servicios}).",

    serviceInfo: "**{name}**: {description}",
    serviceTitle: "**{name}**",
    servicePrice: "Precio: {price}{pending}.",
    servicePriceUnknown: "Precio: depende del trabajo, pregúntanos.",
    serviceDuration: "Duración: unos {minutes} min{pending}.",
    serviceBook: "[Reservar {name}]({url})",
    serviceNotOnline: "Este se pide en el salón: llámanos al [{phone}]({tel}).",
    /* Va detrás del dato que todavía no ha confirmado Andrea (se rellena en {pending}). */
    pendingSuffix: " (pendiente de confirmar)",

    line: "**{name}** — {price}",
    linePriceUnknown: "**{name}** — precio en el salón, pregúntanos",
    lineDuration: "**{name}** — unos {minutes} min",
    lineDurationUnknown: "**{name}** — pregúntanos cuánto dura",
    lineCategory: "**{category}**",

    bonosLink: "Tienes toda la información en [la página de bonos]({bonos}).",
    bonosLinkHere: "Tienes toda la información aquí mismo, en esta página.",

    contact:
      "Puedes llamarnos al [{phone}]({tel}) o escribirnos por [WhatsApp]({whatsapp}). También estamos en Instagram: [{instagramHandle}]({instagram}).",
    gallery: "Nuestros trabajos están en la [galería]({galeria}) y, al día, en Instagram: [{instagramHandle}]({instagram}).",
    team: "Te presentamos al equipo en [la página del equipo]({equipo}). Al reservar puedes elegir profesional o dejar que te demos la primera que esté libre.",

    fallback: "No sé si te he entendido bien. Puedo ayudarte con:",
    fallbackItems: [
      "Servicios, precios y cuánto dura cada uno",
      "Horario y cómo llegar",
      "Cómo reservar, cambiar o cancelar tu cita",
      "Bonos y tarjetas regalo",
    ],
    fallbackContact: "Para cualquier otra cosa, escríbenos por [WhatsApp]({whatsapp}) o llámanos al [{phone}]({tel}).",
  },
} as const;
export default chat;
