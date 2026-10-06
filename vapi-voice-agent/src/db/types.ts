/**
 * Tipos del negocio que atiende el agente de voz.
 *
 * A diferencia de src/restaurant.ts, aqui los tipos son estructurales: sin
 * "as const" y sin tipos literales, para que un objeto cargado de Firestore en
 * tiempo de ejecucion pueda satisfacerlos. Esta es la forma a la que iran
 * migrando el System Prompt y el calculo del total.
 */

/** Un plato o producto de la carta. Los importes van en centimos. */
export interface MenuItem {
  /** Identificador estable. Es lo que el modelo manda en los tool-calls. */
  id: string;
  /** Nombre que el agente dice en voz alta. */
  nombre: string;
  /** Ingredientes o detalle breve, para cuando el cliente pregunta que lleva. */
  descripcion: string;
  /** Precio por unidad, en centimos. */
  precioCentimos: number;
}

/** Horario de apertura, tal como el agente lo recita y lo comprueba. */
export interface Horario {
  /** Frase lista para leer: "De martes a domingo, de 13:00 a 15:30...". */
  texto: string;
  /** Hora a la que se deja de aceptar reparto, p. ej. "23:00". */
  ultimoPedidoReparto: string;
  /** Dia de cierre, para que el agente lo mencione si llaman ese dia. */
  diaCierre: string;
}

/** Condiciones de entrega y recogida. */
export interface Entrega {
  /** Si es false, el agente solo ofrece recogida en el local. */
  disponible: boolean;
  /** Gastos de envio en centimos, cuando no toca envio gratis. */
  gastosEnvioCentimos: number;
  /** Subtotal en centimos desde el que el envio sale gratis. */
  envioGratisDesdeCentimos: number;
  /** Margen que el agente da para el reparto: "entre 30 y 40 minutos". */
  tiempoReparto: string;
  /** Margen que el agente da para la recogida: "entre 15 y 20 minutos". */
  tiempoRecogida: string;
}

/** Lo que el agente sabe hacer en la llamada. */
export type Accion = "pedidos" | "reservas";

/**
 * Un negocio. Es lo que se guarda en Firestore en /businesses/{id} y lo que
 * alimenta el System Prompt, de modo que el mismo agente sirva para una
 * pizzeria, una taperia o cualquier otro local.
 */
export interface Business {
  /** Identificador del documento. Es el valor que llega en ?business=. */
  id: string;
  /** Nombre comercial. El agente lo dice al descolgar. */
  nombre: string;
  /** Ciudad, para situar al agente y resolver la zona horaria en el saludo. */
  ciudad: string;
  /** Direccion completa. El agente la da para las recogidas. */
  direccion: string;
  /** Zona a la que se reparte: "Ourense capital". Fuera de ahi, no promete. */
  zonaReparto: string;
  /** Zona horaria IANA ("Europe/Madrid"), para calcular la hora actual. */
  zonaHoraria: string;
  /** Que clase de negocio es: "pizzeria", "taperia", "restaurante italiano". */
  tipoLabel: string;
  /** Que vende, en plural: "pizzas", "tapas y raciones". */
  categorias: string;
  /** Lo mismo en singular: "pizza", "tapa". */
  categoriasSingular: string;
  /** Lo que el agente puede gestionar. Por ahora solo ["pedidos"]. */
  acciones: Accion[];
  horario: Horario;
  entrega: Entrega;
  /** Como se paga: "en el momento de la entrega, en efectivo o con tarjeta". */
  pago: string;
  /** La carta. Es la unica lista de la que el agente puede tomar pedidos. */
  carta: MenuItem[];
  /** Direccion a la que se avisara de los pedidos. Vacio = sin aviso. */
  emailPedidos: string;
}
