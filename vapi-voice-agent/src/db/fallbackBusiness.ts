/**
 * Negocio de EJEMPLO para desarrollo. No usar en produccion.
 *
 * Replica exactamente los datos de src/restaurant.ts, pero ya tipado como
 * Business: sin "as const" y sin tipos literales. Es lo que devuelve
 * getBusiness() cuando no hay Firebase configurado, cuando no llega un
 * identificador de negocio o cuando el documento pedido no sirve.
 */

import type { Business } from "./types";

export const fallbackBusiness: Business = {
  id: "forno-de-pedra-demo",

  nombre: "Pizzeria Forno de Pedra",
  ciudad: "Ourense",
  direccion: "Rua do Progreso 42, Ourense",
  zonaReparto: "Ourense capital",
  zonaHoraria: "Europe/Madrid",

  tipoLabel: "pizzeria",
  categorias: "pizzas",
  categoriasSingular: "pizza",
  acciones: ["pedidos"],

  horario: {
    texto:
      "De martes a domingo, de 13:00 a 15:30 y de 20:00 a 23:30. Los lunes cerramos.",
    ultimoPedidoReparto: "23:00",
    diaCierre: "lunes",
  },

  entrega: {
    disponible: true,
    gastosEnvioCentimos: 250,
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
  ],

  // Se rellenara cuando se monte el aviso de pedidos por correo.
  emailPedidos: "",
};
