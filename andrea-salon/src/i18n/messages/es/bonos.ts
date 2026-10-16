/** Página /bonos. Sin compra todavía: llega en la fase 2 (Stripe). */
const bonos = {
  seo: {
    title: "Bonos y tarjetas regalo · Andrea Salón, Ourense",
    description:
      "Bonos de varias sesiones y tarjetas regalo de Andrea Salón, Ourense. Muy pronto se podrán comprar online y llegan al correo con su código QR.",
  },
  kicker: "Bonos y regalos",
  title: "Muy",
  accent: "pronto",
  description:
    "Estamos preparando la tienda de bonos y tarjetas regalo. Mientras tanto, puedes comprarlos en el salón: pregúntanos al venir o escríbenos por WhatsApp.",
  how: {
    title: "Cómo funcionará",
    steps: [
      { title: "Eliges el bono", text: "Sesiones sueltas o una tarjeta regalo con el importe que quieras." },
      { title: "Pagas con tarjeta", text: "Pago seguro con tarjeta, Apple Pay o Google Pay. El dinero va directo al salón." },
      { title: "Te llega al correo", text: "Con su código y un QR para enseñar en el salón, o para regalar reenviándolo." },
      { title: "Lo canjeas cuando quieras", text: "En cada visita se descuenta una sesión. Te decimos siempre cuántas te quedan." },
    ],
  },
  conditionsTitle: "Condiciones",
  conditionsPending: "La caducidad y las condiciones de los bonos están pendientes de confirmar con el salón.",
  cta: "Preguntar por WhatsApp",

  /* ── Tienda (cuando hay bonos en el catálogo y Stripe está conectado) ── */
  tienda: {
    title: "Bonos y",
    accent: "regalos",
    description: "Elige, paga con tarjeta en un minuto y te llega al correo con su código QR. Para ti o para regalar.",
    sesiones: "{n} sesiones",
    sesion: "1 sesión",
    tarjeta: "Tarjeta regalo de {valor}",
    noCaduca: "No caduca",
    caduca: "Válido {meses} meses desde la compra",
    elegir: "Elegir este",
    elegido: "Elegido",
    formTitle: "Tus datos",
    nombre: "Tu nombre",
    email: "Tu correo",
    emailHint: "Aquí te llega el bono con su código QR.",
    regalo: "Es un regalo",
    paraQuien: "Para quién (aparece en el bono)",
    mensaje: "Un mensaje (opcional)",
    condiciones: "He leído las condiciones del bono: {caducidad}. Se canjea en el salón presentando el código.",
    privacidad: "He leído la política de privacidad.",
    pagar: "Pagar {precio}",
    redirigiendo: "Abriendo el pago seguro…",
    seguro: "El pago se hace en la página segura de Stripe. Aceptamos tarjeta, Apple Pay y Google Pay. El dinero va directo al salón.",
    error: "No hemos podido abrir el pago. Prueba otra vez o escríbenos por WhatsApp.",
  },
  gracias: {
    seoTitle: "¡Gracias! · Bonos Andrea Salón",
    title: "¡Gracias por tu compra!",
    listo: "Tu bono ya está listo. También te lo hemos enviado a {email}.",
    esperando: "Estamos terminando de prepararlo: te llega por correo en un minuto con su código QR.",
    sinSesion: "No encontramos esa compra. Si has pagado y no te llega el correo en unos minutos, escríbenos.",
    verBono: "Ver mi bono",
    volver: "Volver a la web",
  },
  bono: {
    seoTitle: "Tu bono · Andrea Salón",
    codigo: "Código",
    quedan: "Quedan {n} de {total} sesiones",
    saldo: "Saldo: {saldo} de {total}",
    para: "Para {nombre}",
    estado: {
      active: "Activo",
      used: "Gastado",
      expired: "Caducado",
      refunded: "Devuelto",
      void: "Anulado",
    },
    comoUsar: "Enséñalo en el salón (vale en el móvil). Para reservar, pide tu cita como siempre y di que vienes con bono.",
    reservar: "Reservar cita",
    invalido: "Este enlace no es válido. Si tienes un bono y no lo encuentras, escríbenos o llámanos.",
  },
} as const;
export default bonos;
