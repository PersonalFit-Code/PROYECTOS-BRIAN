import { negocio } from "./negocio";

/** Preguntas frecuentes con sus condiciones reales (dosier 2025-26 y PDF de 720 Pilates). */
export const preguntas = [
  { p: "¿Qué horario tiene 720 GYM CLUB?", r: `${negocio.horario.texto}, los 365 días del año, festivos incluidos.` },
  { p: "¿Puedo probar antes de apuntarme?", r: "Sí. Pide tu clase de prueba gratis desde esta web: eliges día y hora y te confirmamos por WhatsApp. En 720 Pilates la primera clase también es gratis y no hay matrícula." },
  { p: "¿Puedo entrenar un solo día si estoy de paso por Ourense?", r: "Sí: la entrada libre cuesta 5 € por día y la pides online en un minuto. Para estancias más largas tenemos pases temporales." },
  { p: "¿Qué significa aforo limitado?", r: "Que el número de socios es el justo para que disfrutes del material sin esperas ni masificaciones. Nunca estará lleno." },
  { p: "¿Cuándo se paga la cuota?", r: "El pago mensual se hace entre el día 1 y el 7, tanto en el gimnasio como en 720 Pilates." },
  { p: "¿Caducan los bonos de entrenamiento personal?", r: "No. Los bonos no caducan. Para cambiar o cancelar una sesión, avisa con 24 h. La cuota del gimnasio va incluida durante tus sesiones." },
  { p: "Si falto a una clase de Pilates, ¿la pierdo?", r: "No: las clases de Pilates se recuperan dentro del mismo mes." },
  { p: "¿Es accesible?", r: "Sí, el centro es accesible en silla de ruedas. Y aquí entrena gente de todas las edades y todos los niveles: cada persona, a su ritmo." },
  { p: "¿Dónde está y cómo llego?", r: `En ${negocio.direccion.completa}, bien comunicado con varias líneas de autobús y con aparcamiento fácil en la zona.` },
];
