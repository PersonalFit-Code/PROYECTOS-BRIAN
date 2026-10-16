import type { Traducion } from "./traducion";

/**
 * Páxina /bonos, tenda, páxina de grazas e páxina do bono (ver `messages/es/bonos.ts`).
 * «Comprar» vai como «mercar» e «regalo» como «agasallo», que é como se di en Ourense.
 */
const bonos: Traducion<"bonos"> = {
  seo: {
    title: "Bonos e tarxetas agasallo · Andrea Salón, Ourense",
    description:
      "Bonos de varias sesións e tarxetas agasallo de Andrea Salón, Ourense. Moi pronto poderás mercalos en liña e chegarán ao teu correo co seu código QR.",
  },
  kicker: "Bonos e agasallos",
  title: "Moi",
  accent: "pronto",
  description:
    "Estamos preparando a tenda de bonos e tarxetas agasallo. Mentres tanto, podes mercalos no salón: pregúntanos cando veñas ou escríbenos por WhatsApp.",
  how: {
    title: "Como funcionará",
    steps: [
      { title: "Escolles o bono", text: "Sesións soltas ou unha tarxeta agasallo co importe que queiras." },
      { title: "Pagas con tarxeta", text: "Pagamento seguro con tarxeta, Apple Pay ou Google Pay. O diñeiro vai directo ao salón." },
      { title: "Chégache ao correo", text: "Co seu código e un QR para amosar no salón, ou para agasallar reenviándoo." },
      { title: "Úsalo cando queiras", text: "En cada visita descóntase unha sesión. Dicímosche sempre cantas che quedan." },
    ],
  },
  conditionsTitle: "Condicións",
  conditionsPending: "A caducidade e as condicións dos bonos están pendentes de confirmar co salón.",
  cta: "Preguntar por WhatsApp",

  tienda: {
    title: "Bonos e",
    accent: "agasallos",
    description: "Escolle, paga con tarxeta nun minuto e chégache ao correo co seu código QR. Para ti ou para agasallar.",
    sesiones: "{n} sesións",
    sesion: "1 sesión",
    tarjeta: "Tarxeta agasallo de {valor}",
    noCaduca: "Non caduca",
    caduca: "Válido {meses} meses desde a compra",
    elegir: "Escoller este",
    elegido: "Escollido",
    formTitle: "Os teus datos",
    nombre: "O teu nome",
    email: "O teu correo",
    emailHint: "Aquí chégache o bono co seu código QR.",
    regalo: "É un agasallo",
    paraQuien: "Para quen (aparece no bono)",
    mensaje: "Unha mensaxe (opcional)",
    condiciones: "Lin as condicións do bono: {caducidad}. Cánxease no salón presentando o código.",
    privacidad: "Lin a política de privacidade.",
    pagar: "Pagar {precio}",
    redirigiendo: "Abrindo o pagamento seguro…",
    seguro:
      "O pagamento faise na páxina segura de Stripe. Aceptamos tarxeta, Apple Pay e Google Pay. O diñeiro vai directo ao salón.",
    error: "Non puidemos abrir o pagamento. Proba outra vez ou escríbenos por WhatsApp.",
  },
  gracias: {
    seoTitle: "Grazas! · Bonos Andrea Salón",
    title: "Grazas pola túa compra!",
    listo: "O teu bono xa está listo. Tamén cho enviamos a {email}.",
    esperando: "Estamos rematando de preparalo: chégache por correo nun minuto co seu código QR.",
    sinSesion: "Non atopamos esa compra. Se pagaches e non che chega o correo nuns minutos, escríbenos.",
    verBono: "Ver o meu bono",
    volver: "Volver á web",
  },
  bono: {
    seoTitle: "O teu bono · Andrea Salón",
    codigo: "Código",
    quedan: "Quedan {n} de {total} sesións",
    saldo: "Saldo: {saldo} de {total}",
    para: "Para {nombre}",
    estado: {
      active: "Activo",
      used: "Gastado",
      expired: "Caducado",
      refunded: "Devolto",
      void: "Anulado",
    },
    comoUsar:
      "Amósao no salón (vale no móbil). Para reservar, pide a túa cita como sempre e di que vés con bono.",
    reservar: "Reservar cita",
    invalido: "Esta ligazón non é válida. Se tes un bono e non o atopas, escríbenos ou chámanos.",
  },
};
export default bonos;
