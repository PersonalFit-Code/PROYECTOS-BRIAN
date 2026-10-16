/**
 * Preguntas frecuentes del salón. Van en `data/` y no en los mensajes porque son DATOS del negocio
 * (igual que las reseñas): alimentan la sección visible de la portada, el `FAQPage` de JSON-LD y, en
 * la fase 3, el conocimiento del asistente (`lib/asistente/knowledge.ts`). Las tres cosas tienen
 * que decir exactamente lo mismo, y para eso hay una sola fuente.
 *
 * Las respuestas admiten `**negrita**` (la portada la pinta en `<strong>`; el JSON-LD la quita) y
 * los marcadores {phone}, {address}, {hours} y {whatsapp}, que se rellenan desde `BUSINESS`.
 *
 * Lo que depende de una decisión de Andrea (plazo de cancelación, señal, caducidad de bonos) está
 * redactado con cautela y marcado `pendiente`: la respuesta vale hoy y se afina cuando confirme.
 */
export interface FaqItem {
  id: string;
  q: string;
  a: string;
  /** La respuesta depende de algo que Andrea aún no ha confirmado. */
  pendiente?: boolean;
}

export const FAQ: readonly FaqItem[] = [
  {
    id: "duracion",
    q: "¿Cuánto dura una manicura?",
    a: "Una **manicura completa** con semipermanente, alrededor de **una hora**. La manicura rusa y la nivelación piden algo más, y una extensión en gel o acrylgel puede llegar a las dos horas. Al reservar verás la duración de cada servicio antes de elegir la hora.",
  },
  {
    id: "cancelar",
    q: "¿Puedo cambiar o cancelar mi cita?",
    a: "Sí. En el correo de confirmación tienes un enlace para **cambiarla o cancelarla** sin llamar, hasta el plazo que se indica en la propia reserva. Si se te pasa el plazo, llámanos al {phone}: lo que podamos recolocar, lo recolocamos.",
    pendiente: true,
  },
  {
    id: "alergias",
    q: "Tengo alergia a algún producto, ¿qué hago?",
    a: "Cuéntanoslo en las **notas de la reserva** o al llegar. Trabajamos con productos de calidad y tenemos alternativas para la mayoría de sensibilidades (acrílico, HEMA, adhesivos). Esa nota la ve solo el equipo que te atiende y la borramos cuando nos lo pidas.",
  },
  {
    id: "manicura-rusa",
    q: "¿Qué es la manicura rusa?",
    a: "Es una técnica de **cutícula con torno** que deja la piel limpia sin cortar y permite esmaltar al ras: el resultado se ve más pulido y **dura más**, porque el crecimiento se nota más tarde. Es nuestra especialidad y la que más nos piden.",
  },
  {
    id: "pago",
    q: "¿Cómo se paga?",
    a: "En el salón, con **tarjeta, efectivo o Bizum**. Reservar online **no cuesta nada ni pide tarjeta**. Los bonos y tarjetas regalo, cuando estén en la web, se pagarán con tarjeta, Apple Pay o Google Pay en una página segura.",
  },
  {
    id: "aparcar",
    q: "¿Dónde aparco?",
    a: "Estamos en {address}. Hay **zona azul** en las calles de alrededor y aparcamiento público a pocos minutos a pie. Si vienes con el tiempo justo, cuenta cinco minutos para aparcar.",
  },
  {
    id: "bonos",
    q: "¿Tenéis bonos o tarjetas regalo?",
    a: "Sí: bonos de **varias sesiones** y **tarjetas regalo** con el importe que quieras. Muy pronto se podrán comprar aquí mismo y llegan al correo con un código QR para enseñar en el salón. Mientras tanto, pregúntanos al venir o por WhatsApp.",
    pendiente: true,
  },
  {
    id: "ninos",
    q: "¿Puedo venir con niños?",
    a: "Claro, si no les importa esperar un rato. El salón es pequeño y trabajamos con productos y aparatos que no son para jugar, así que te pedimos que estén acompañados y cerca de ti.",
  },
  {
    id: "sin-cita",
    q: "¿Atendéis sin cita?",
    a: "Trabajamos **con cita** para no hacerte esperar. Si pasas por delante y hay un hueco, te atendemos encantadas, pero lo seguro es reservar: la cita online está abierta las 24 horas y tarda un minuto.",
  },
  {
    id: "horario",
    q: "¿Qué horario tenéis?",
    a: "{hours}. Lo tienes siempre actualizado en el pie de la web, con el «abierto ahora» en vivo.",
    pendiente: true,
  },
];
