/**
 * Negocios de ejemplo para probar el multi-negocio sin datos reales.
 *
 * Viven en src/ y no en el script que los escribe para que el compilador los
 * valide contra Business y para poder usarlos en pruebas. El script
 * scripts/crear-negocio.ts es solo el que los mete en Firestore.
 */

import { LA_VITA_BUONA } from "./lavitabuona";
import type { Business } from "./types";

export const EJEMPLOS: Record<string, Business> = {
  // Su carta son 63 platos y vive aparte, en lavitabuona.ts.
  lavitabuona: LA_VITA_BUONA,

  // La misma carta, pero tomando pedidos a todas horas: para probar una llamada
  // fuera de su horario real (la cocina cierra de 16:00 a 19:00 y los lunes)
  // sin tocar la ficha buena. Es la de la demo en el local, que se hace con la
  // cocina cerrada, y por eso si Oumar pregunta el horario oye el de verdad.
  // NO es un negocio de verdad: no se le pone a un cliente.
  "lavitabuona-prueba": {
    ...LA_VITA_BUONA,
    id: "lavitabuona-prueba",
    horario: {
      texto:
        "Esta llamada es una demostracion: ahora mismo se toman pedidos a cualquier hora. " +
        `Si preguntan por el horario del local, es este: ${LA_VITA_BUONA.horario.texto}`,
      ultimoPedidoReparto: "23:59",
      diaCierre: "ninguno",
    },
  },

  tixola: {
    id: "tixola",
    nombre: "Taperia Tixola",
    ciudad: "Ourense",
    direccion: "Rua Viriato 12, Ourense",
    zonaReparto: "Ourense capital",
    zonaHoraria: "Europe/Madrid",
    tipoLabel: "taperia",
    categorias: "tapas y raciones",
    categoriasSingular: "racion",
    acciones: ["pedidos"],
    horario: {
      texto:
        "De miercoles a domingo, de 12:30 a 16:00 y de 19:30 a 23:00. Lunes y martes cerramos.",
      ultimoPedidoReparto: "22:30",
      diaCierre: "lunes y martes",
    },
    entrega: {
      disponible: true,
      gastosEnvioCentimos: 350,
      envioGratisDesdeCentimos: 3000,
      tiempoReparto: "entre 35 y 45 minutos",
      tiempoRecogida: "entre 15 y 20 minutos",
    },
    pago: "en el momento de la entrega, en efectivo o con tarjeta",
    carta: [
      {
        id: "pulpo",
        nombre: "Pulpo a feira",
        descripcion: "con cachelos, aceite y pimenton de la Vera",
        precioCentimos: 1650,
      },
      {
        id: "tortilla",
        nombre: "Tortilla de Betanzos",
        descripcion: "poco cuajada, de huevo de corral",
        precioCentimos: 900,
      },
      {
        id: "croquetas",
        nombre: "Croquetas de jamon",
        descripcion: "seis unidades, hechas en casa",
        precioCentimos: 800,
      },
      {
        id: "zorza",
        nombre: "Zorza con patatas",
        descripcion: "cerdo adobado con pimenton y patatas fritas",
        precioCentimos: 1100,
      },
    ],
    emailPedidos: "",
  },

  // La pizzeria de las demostraciones: la que se ensena a cualquier local de
  // Ourense antes de tener su carta. Los cuatro platos del pedido de ejemplo
  // del dossier y del carrusel (margarita, barbacoa, pan de ajo con queso y
  // tiramisu, 30 EUR) estan con el mismo precio, para que lo que oiga el dueno
  // cuadre con lo que ha leido. Abierta a todas horas: una demo no puede
  // fallar porque sea lunes. NO es un negocio de verdad.
  "pizzeria-demo": {
    id: "pizzeria-demo",
    nombre: "Pizzeria Demo",
    ciudad: "Ourense",
    direccion: "Rua do Paseo 1, Ourense",
    zonaReparto: "Ourense capital",
    zonaHoraria: "Europe/Madrid",
    tipoLabel: "pizzeria",
    categorias: "pizzas, pastas y entrantes",
    categoriasSingular: "pizza",
    acciones: ["pedidos"],
    saludo:
      "Hola, buenas, gracias por llamar. Esta es la pizzeria de demostracion de Noah. " +
      "Soy Noah, su asistente virtual. Le tomo el pedido para recoger en el local o a domicilio. " +
      "¿Que le apetece hoy?",
    horario: {
      texto: "Abierto todos los dias, a cualquier hora.",
      ultimoPedidoReparto: "23:59",
      diaCierre: "ninguno",
    },
    entrega: {
      disponible: true,
      gastosEnvioCentimos: 250,
      envioGratisDesdeCentimos: 2500,
      tiempoReparto: "entre 30 y 40 minutos",
      tiempoRecogida: "entre 15 y 20 minutos",
    },
    pago: "en el momento de la entrega, en efectivo o con tarjeta",
    carta: [
      // --- Entrantes ---
      { id: "pan-ajo-queso", nombre: "Pan de ajo con queso", descripcion: "pan de masa de pizza con ajo, perejil y mozzarella gratinada", precioCentimos: 450 },
      { id: "patatas-gajo", nombre: "Patatas gajo", descripcion: "con salsa brava y alioli", precioCentimos: 550 },
      { id: "croquetas", nombre: "Croquetas caseras de jamon", descripcion: "ocho unidades", precioCentimos: 700 },
      { id: "caprese", nombre: "Ensalada caprese", descripcion: "tomate, mozzarella fresca, albahaca y aceite de oliva", precioCentimos: 750 },

      // --- Pizzas ---
      // "Cuatro quesos" y "carbonara" estan como pizza y la carbonara tambien
      // como pasta a proposito: sirve para ensenar que Noah pregunta cual es.
      { id: "pz-margarita", nombre: "Pizza margarita", descripcion: "tomate, mozzarella y albahaca", precioCentimos: 900 },
      { id: "pz-barbacoa", nombre: "Pizza barbacoa", descripcion: "salsa barbacoa, mozzarella, carne picada, bacon y cebolla", precioCentimos: 1150 },
      { id: "pz-cuatro-quesos", nombre: "Pizza cuatro quesos", descripcion: "mozzarella, gorgonzola, parmesano y queso de tetilla", precioCentimos: 1100 },
      { id: "pz-jamon-champi", nombre: "Pizza jamon y champinones", descripcion: "tomate, mozzarella, jamon york y champinones", precioCentimos: 1050 },
      { id: "pz-pepperoni", nombre: "Pizza pepperoni", descripcion: "tomate, mozzarella y pepperoni", precioCentimos: 1050 },
      { id: "pz-hawaiana", nombre: "Pizza hawaiana", descripcion: "tomate, mozzarella, jamon york y pina", precioCentimos: 1050 },
      { id: "pz-vegetal", nombre: "Pizza vegetal", descripcion: "tomate, mozzarella, pimiento, cebolla, champinon, aceitunas y calabacin", precioCentimos: 1000 },
      { id: "pz-carbonara", nombre: "Pizza carbonara", descripcion: "nata, mozzarella, bacon, cebolla y huevo", precioCentimos: 1100 },
      { id: "pz-gallega", nombre: "Pizza gallega", descripcion: "tomate, mozzarella, lacon, pimientos de Padron y queso de tetilla", precioCentimos: 1200 },

      // --- Pastas ---
      { id: "pa-carbonara", nombre: "Espaguetis a la carbonara", descripcion: "con bacon, huevo y parmesano", precioCentimos: 950 },
      { id: "pa-lasana", nombre: "Lasana de carne", descripcion: "bolonesa casera, bechamel y queso gratinado", precioCentimos: 1000 },

      // --- Postres ---
      { id: "po-tiramisu", nombre: "Tiramisu", descripcion: "casero, con mascarpone y cafe", precioCentimos: 500, sinCocina: true },
      { id: "po-tarta-queso", nombre: "Tarta de queso", descripcion: "cremosa, al horno", precioCentimos: 500, sinCocina: true },
      { id: "po-brownie", nombre: "Brownie con helado", descripcion: "brownie de chocolate con bola de vainilla", precioCentimos: 550, sinCocina: true },

      // --- Bebidas ---
      { id: "b-cocacola", nombre: "Coca-Cola", descripcion: "lata", precioCentimos: 220, sinCocina: true },
      { id: "b-agua", nombre: "Agua", descripcion: "botella de medio litro", precioCentimos: 150, sinCocina: true },
      { id: "b-estrella", nombre: "Estrella Galicia", descripcion: "botellin de un tercio", precioCentimos: 220, sinCocina: true },
      { id: "b-ribeiro", nombre: "Vino Ribeiro", descripcion: "botella de blanco", precioCentimos: 1400, sinCocina: true },
    ],
    sugerencia: "Si le apetece algo de postre, el tiramisu de la casa esta muy rico.",
    emailPedidos: "",
  },
};
