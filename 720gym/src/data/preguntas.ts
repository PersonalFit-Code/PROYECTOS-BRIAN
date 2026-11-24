import { negocio } from "./negocio";

/** Preguntas frecuentes con sus condiciones reales (dosier 2025-26 y PDF de 720 Pilates). */
export const preguntas = [
  { p: "¿Qué horario tiene 720 GYM CLUB?", r: `${negocio.horario.texto}, los 365 días del año, festivos incluidos.` },
  { p: "¿Puedo conocer el centro antes de apuntarme?", r: "Sí. Escríbenos por WhatsApp y concertamos una visita para enseñarte el espacio y explicarte cómo funciona. En 720 Pilates la primera clase es gratuita y no hay matrícula." },
  { p: "¿Puedo entrenar un solo día si estoy de paso por Ourense?", r: "Sí: la entrada libre cuesta 5 € por día y la pides por WhatsApp. Para estancias más largas tenemos pases temporales." },
  { p: "¿Qué significa aforo limitado?", r: "Limitamos el número de socios para cuidar la ocupación de la sala y que puedas entrenar con comodidad." },
  { p: "¿Cuándo se paga la cuota?", r: "El pago mensual se hace entre el día 1 y el 7, tanto en el gimnasio como en 720 Pilates." },
  { p: "¿Caducan los bonos de entrenamiento personal?", r: "No. Los bonos no caducan. Para cambiar o cancelar una sesión, avisa con 24 h. La cuota del gimnasio va incluida durante tus sesiones." },
  { p: "Si falto a una clase de Pilates, ¿la pierdo?", r: "No: las clases de Pilates se recuperan dentro del mismo mes." },
  { p: "¿Es accesible?", r: "Sí, el centro es accesible en silla de ruedas. Y aquí entrena gente de todas las edades y todos los niveles: cada persona, a su ritmo." },
  { p: "¿Dónde está y cómo llego?", r: `En ${negocio.direccion.completa}, bien comunicado con varias líneas de autobús.` },
];
