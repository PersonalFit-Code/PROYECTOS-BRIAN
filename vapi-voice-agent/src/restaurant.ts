/**
 * Datos del restaurante: unica fuente de verdad.
 *
 * El System Prompt del asistente y la herramienta que calcula el total se
 * generan a partir de aqui, asi que los precios no pueden descuadrarse entre
 * lo que dice el agente y lo que se cobra. Para cambiar la carta, los precios
 * o los horarios, se edita este fichero y nada mas.
 *
 * DATOS DE EJEMPLO: nombre, direccion y carta son de muestra. Hay que
 * sustituirlos por los del restaurante real antes de poner esto en produccion.
 */

/** Los importes se guardan en centimos para no arrastrar errores de coma flotante. */
export interface MenuItem {
  /** Identificador estable que usa la herramienta calcular_total. */
  id: string;
  nombre: string;
  descripcion: string;
  precioCentimos: number;
}

export const restaurante = {
  nombre: "Pizzeria Forno de Pedra",
  ciudad: "Ourense",
  direccion: "Rua do Progreso 42, Ourense",
  zonaReparto: "Ourense capital",
  zonaHoraria: "Europe/Madrid",

  horario: {
    texto:
      "De martes a domingo, de 13:00 a 15:30 y de 20:00 a 23:30. Los lunes cerramos.",
    ultimoPedidoReparto: "23:00",
    diaCierre: "lunes",
  },

  entrega: {
    gastosEnvioCentimos: 250,
    /** A partir de este subtotal el envio sale gratis. */
    envioGratisDesdeCentimos: 2000,
    tiempoReparto: "entre 30 y 40 minutos",
    tiempoRecogida: "entre 15 y 20 minutos",
  },

  pago: "en el momento de la entrega, en efectivo o con tarjeta",

  carta: [
    {
      id: "margarita",
      nombre: "Pizza Margarita",
      descripcion: "tomate, mozzarella y albahaca fresca",
      precioCentimos: 950,
    },
    {
      id: "prosciutto",
      nombre: "Pizza Prosciutto e Funghi",
      descripcion: "tomate, mozzarella, jamon cocido y champinones",
      precioCentimos: 1190,
    },
    {
      id: "cuatro_quesos",
      nombre: "Pizza Cuatro Quesos",
      descripcion: "mozzarella, gorgonzola, parmesano y queso de cabra",
      precioCentimos: 1250,
    },
  ] satisfies MenuItem[],
} as const;

export type PlatoId = (typeof restaurante.carta)[number]["id"];

/** Formatea centimos como "9,50 €", en castellano. */
export function formatearEuros(centimos: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(centimos / 100);
}

export function buscarPlato(id: string): MenuItem | undefined {
  const normalizado = id.trim().toLowerCase();
  return restaurante.carta.find(
    (plato) =>
      plato.id === normalizado || plato.nombre.toLowerCase() === normalizado,
  );
}

/** Fecha y hora actuales en la zona del restaurante, para situar al agente. */
export function momentoActual(): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: restaurante.zonaHoraria,
  }).format(new Date());
}
