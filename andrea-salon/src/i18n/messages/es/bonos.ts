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
} as const;
export default bonos;
