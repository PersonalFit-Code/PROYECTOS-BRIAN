/**
 * Datos públicos de Hungceed, tal como salen en hungceed.es (revisada el 3/11/2026) y en el contexto
 * que pasó Brian. Lo que no se ha confirmado con Jose va marcado como PENDIENTE DE CONFIRMAR: en la
 * maqueta se enseña, pero se le dice en la llamada que sale de su web y que lo tiene que validar.
 */
const WHATSAPP_MENSAJE = "Hola, tengo una consulta sobre Hungceed";

export const NEGOCIO = {
  nombre: "Hungceed",
  lema: "Una sola marca. Todo el equipamiento que necesitas.",
  fraseCeo: "En Hungceed desarrollamos lo que nos gustaría encontrar en el mercado y no encontramos.",
  ceo: "Jose P., CEO de Hungceed",
  /* Firma de Jose tal como sale en la portada de hungceed.es (PNG claro sobre transparente). */
  firmaCeo: "https://hungceed.es/wp-content/uploads/2026/04/signature-01.png",
  email: "hungceed@gmail.com",
  instagram: { url: "https://www.instagram.com/hungceed/", handle: "@hungceed" },
  /* PENDIENTE DE CONFIRMAR: que el número del gimnasio sea también el WhatsApp de la tienda. */
  telefono: { display: "621 22 18 20", tel: "tel:+34621221820" },
  whatsapp: `https://wa.me/34621221820?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`,
  webActual: "https://hungceed.es",
  devoluciones: "https://hungceed.es/politica-de-devoluciones-y-reembolso/",
} as const;

/**
 * PENDIENTE DE CONFIRMAR CON JOSE. Los tres primeros salen de su ficha de producto actual
 * («Envío 48-72h», «Garantía 30 días», logos de Visa, Mastercard, PayPal, Apple Pay y Google Pay).
 * Hasta que los confirme, son lo que dice su web, no lo que promete esta maqueta.
 */
export const GARANTIAS = [
  { titulo: "Envío en 48–72 h", texto: "Procesamos el pedido con agilidad y te avisamos en cada fase del envío." },
  { titulo: "Garantía de 30 días", texto: "Si algo no encaja, tienes 30 días. Política de devoluciones clara y a la vista." },
  { titulo: "Pago 100 % seguro", texto: "Tarjeta, PayPal, Apple Pay y Google Pay, con conexión cifrada." },
  { titulo: "Soporte técnico real", texto: "Te ayudamos a elegir y a montar tu equipamiento, antes y después de la compra." },
] as const;

/** Ventajas que destaca la marca (portada actual de hungceed.es). */
export const VENTAJAS = [
  { titulo: "Catálogo completo", texto: "Racks, máquinas, pesas y accesorios en un solo sitio." },
  { titulo: "Compatibilidad garantizada", texto: "Todo diseñado para integrarse entre sí y con los estándares del sector." },
  { titulo: "Calidad sin sobreprecio", texto: "Alto rendimiento a precio justo." },
  { titulo: "Ingeniería industrial", texto: "Mecanizado CNC y materiales de alta resistencia: el equipo nunca es tu límite." },
] as const;

/**
 * Barra de confianza. Las cifras son HUECOS A RELLENAR con los datos reales que dé Jose (pedidos
 * enviados, gimnasios equipados, año de arranque). Mientras `pendiente` sea true, la maqueta lo
 * enseña rotulado como dato por confirmar; nunca se publica un número inventado.
 */
export const CONFIANZA = [
  { cifra: "+000", texto: "pedidos enviados", pendiente: true },
  { cifra: "00", texto: "gimnasios y boxes equipados", pendiente: true },
  { cifra: "20XX", texto: "fabricando en España", pendiente: true },
  { cifra: "4", texto: "series compatibles entre sí", pendiente: false },
] as const;
