/**
 * La Vita Buona: restaurante italiano de Ourense, Rua Ramon Puga 75.
 *
 * Esta es la carta de verdad, la que paso el restaurante el 23 de octubre de
 * 2026: 63 platos con sus precios de casa. Vive en su propio fichero y no
 * dentro de negociosDeEjemplo porque 63 platos tapan todo lo demas.
 *
 * Dos avisos para quien lo toque:
 *
 * 1. Los precios son los de la carta del local, NO los de Glovo. En Glovo
 *    cada pizza, pasta y ensalada sale un 20% mas barata, asi que si algun
 *    dia se cogen precios de ahi el agente cobrara de menos.
 * 2. El horario y las condiciones de reparto salen de su web, que es la
 *    fuente publica mas concreta que hay, pero NO estan confirmadas por el
 *    restaurante. Los campos marcados abajo hay que repasarlos con Oumar
 *    antes de coger una sola llamada de verdad.
 */

import type { Business } from "./types";

export const LA_VITA_BUONA: Business = {
  id: "lavitabuona",
  nombre: "La Vita Buona",
  ciudad: "Ourense",
  direccion: "Rua Ramon Puga 75, Ourense",

  // PENDIENTE DE CONFIRMAR con el restaurante.
  zonaReparto: "Ourense capital",
  zonaHoraria: "Europe/Madrid",
  tipoLabel: "restaurante italiano",
  categorias: "pizzas, pastas y platos italianos",
  categoriasSingular: "plato",
  acciones: ["pedidos"],

  horario: {
    // De su propia web. El Faro de Vigo publico otro horario el dia de la
    // apertura (cocina de 13 a 16 y de 20 a 23:30), asi que esto hay que
    // preguntarlo: hoy mismo un cliente recibe dos respuestas distintas
    // segun donde mire.
    texto:
      "De martes a jueves, de 13:00 a 16:00 y de 19:00 a 23:00. Viernes, sabado y domingo, de 13:00 a 16:00 y de 19:00 a 23:30. Los lunes cerramos.",
    // PENDIENTE DE CONFIRMAR.
    ultimoPedidoReparto: "22:45",
    diaCierre: "lunes",
  },

  // PENDIENTE DE CONFIRMAR, todo el bloque. Lo unico que se sabe de fuente
  // publica es que el reparto lo hacen ellos: en su ficha de Glovo pone que
  // "el establecimiento entrega los pedidos directamente".
  entrega: {
    disponible: true,
    gastosEnvioCentimos: 250,
    envioGratisDesdeCentimos: 2500,
    tiempoReparto: "entre 35 y 45 minutos",
    tiempoRecogida: "entre 15 y 20 minutos",
  },

  pago: "en el momento de la entrega, en efectivo o con tarjeta",

  carta: [

      // --- Entrantes ---
      {
        id: "bruschetta-pomodoro",
        nombre: "Bruschetta de pomodoro",
        descripcion: "tosta de pan con tomate picado, albahaca, sal y aceite de oliva virgen extra",
        precioCentimos: 450,
      },
      {
        id: "bruschetta-parma",
        nombre: "Bruschetta di parma",
        descripcion: "tosta de pan con queso burrata y jamon serrano",
        precioCentimos: 500,
      },
      {
        id: "provola",
        nombre: "Cazuela de provola al horno",
        descripcion: "salsa de tomate, provolone, parmesano y oregano, acompanada de pan",
        precioCentimos: 1100,
      },
      {
        id: "pan-ajo",
        nombre: "Pan de ajo",
        descripcion: "masa de pizza con aceite de oliva y ajo picado",
        precioCentimos: 450,
      },
      {
        id: "pan-ajo-queso",
        nombre: "Pan de ajo con queso",
        descripcion: "rebanadas de pan con mantequilla, ajo picado y mozzarella",
        precioCentimos: 550,
      },
      {
        id: "embutido",
        nombre: "Plato de embutido, para dos personas",
        descripcion: "jamon york, jamon serrano, bresaola, salami picante, mortadela, burrata, provolone, queso tetilla, nueces y aceitunas negras, con pan",
        precioCentimos: 1400,
      },

      // --- Ensaladas ---
      {
        id: "ens-capresina",
        nombre: "Ensalada capresina",
        descripcion: "tomate en rodajas, mozzarella de bufala y albahaca",
        precioCentimos: 1200,
      },
      {
        id: "ens-burrata",
        nombre: "Ensalada de burrata",
        descripcion: "tomate natural, burrata y aceitunas negras",
        precioCentimos: 1390,
      },
      {
        id: "ens-ventresca",
        nombre: "Ensalada de ventresca",
        descripcion: "lechuga, tomate natural, alcaparras, aceitunas negras, cebolla, ventresca y vinagreta",
        precioCentimos: 1350,
      },
      {
        id: "ens-parma",
        nombre: "Ensalada di parma",
        descripcion: "lechuga, tomate natural, bufala y jamon serrano",
        precioCentimos: 1220,
      },

      // --- Piadinas ---
      {
        id: "piadina-caprese",
        nombre: "Piadina caprese",
        descripcion: "aceite de oliva, tomate natural, mozzarella de bufala y oregano",
        precioCentimos: 900,
      },
      {
        id: "piadina-casa",
        nombre: "Piadina de la casa",
        descripcion: "queso fresco, rucula, jamon york y parmesano en escamas",
        precioCentimos: 890,
      },
      {
        id: "piadina-simple",
        nombre: "Piadina simple",
        descripcion: "queso fresco y jamon york",
        precioCentimos: 800,
      },
      {
        id: "piadina-tradicional",
        nombre: "Piadina tradicional",
        descripcion: "queso fresco, rucula, jamon serrano y parmesano",
        precioCentimos: 950,
      },

      // --- Pizzas tradicionales ---
      {
        id: "p-5formaggio",
        nombre: "Pizza 5 formaggio",
        descripcion: "base de nata, mozzarella, provolone, ricotta, gorgonzola, parmesano crujiente y mermelada de albaricoque",
        precioCentimos: 1490,
      },
      {
        id: "p-bbq",
        nombre: "Pizza BBQ",
        descripcion: "tomate, mozzarella, bacon, carne picada y salsa barbacoa",
        precioCentimos: 1280,
      },
      {
        id: "p-caprese",
        nombre: "Pizza caprese",
        descripcion: "tomate, bufala, tomate cherry y albahaca",
        precioCentimos: 1350,
      },
      {
        id: "p-caprichosa",
        nombre: "Pizza caprichosa",
        descripcion: "tomate, mozzarella, huevo cocido, aceitunas negras y salami dulce",
        precioCentimos: 1380,
      },
      {
        id: "p-fuogo",
        nombre: "Pizza Fuogo",
        descripcion: "tomate, mozzarella, salami picante, nduja y cebolla",
        precioCentimos: 1300,
      },
      {
        id: "p-genovese",
        nombre: "Pizza genovese",
        descripcion: "pesto, tomate cherry y parmesano en escamas",
        precioCentimos: 1450,
      },
      {
        id: "p-bufalina",
        nombre: "Pizza la bufalina",
        descripcion: "tomate, bufala y albahaca",
        precioCentimos: 1250,
      },
      {
        id: "p-carbonara",
        nombre: "Pizza la carbonara originale",
        descripcion: "nata, mozzarella, guanciale, yema de huevo y parmesano",
        precioCentimos: 1350,
      },
      {
        id: "p-ricotta-cabra",
        nombre: "Pizza la ricotta y cabra",
        descripcion: "base de nata, ricotta, queso de cabra, mozzarella, miel y nueces",
        precioCentimos: 1400,
      },
      {
        id: "p-mare-monte",
        nombre: "Pizza mare monte",
        descripcion: "tomate, mozzarella, atun, cebolla y aceitunas negras",
        precioCentimos: 1180,
      },
      {
        id: "p-margaritha",
        nombre: "Pizza margaritha",
        descripcion: "tomate, mozzarella y albahaca",
        precioCentimos: 950,
      },
      {
        id: "p-peque",
        nombre: "Pizza peque",
        descripcion: "tomate, mozzarella, salchicha frankfurt, jamon york y salsa barbacoa",
        precioCentimos: 1200,
      },
      {
        id: "p-napoli",
        nombre: "Pizza napoli",
        descripcion: "tomate, mozzarella, aceitunas negras, alcaparras, anchoas y oregano",
        precioCentimos: 1190,
      },
      {
        id: "p-prosciutto",
        nombre: "Pizza prosciutto",
        descripcion: "tomate, mozzarella y jamon york",
        precioCentimos: 1050,
      },
      {
        id: "p-prosciutto-funghi",
        nombre: "Pizza prosciutto y funghi",
        descripcion: "tomate, mozzarella, jamon york y champinones",
        precioCentimos: 1150,
      },
      {
        id: "p-puccinella",
        nombre: "Pizza puccinella",
        descripcion: "tomate, mozzarella, champinones y bacon",
        precioCentimos: 1170,
      },
      {
        id: "p-vegetariana",
        nombre: "Pizza vegetariana",
        descripcion: "tomate, mozzarella, calabacin y berenjena a la plancha y pimientos",
        precioCentimos: 1200,
      },

      // --- Pizzas gourmet ---
      {
        id: "g-davinci",
        nombre: "Pizza Da Vinci",
        descripcion: "base blanca, mozzarella, rucula, mozzarella en perlas, bresaola marinada en limon y ajo de veinticuatro a cuarenta y ocho horas, y parmesano en escamas",
        precioCentimos: 1600,
      },
      {
        id: "g-gianni",
        nombre: "Pizza Gianni",
        descripcion: "crema de calabaza, mozzarella, salami picante y escamas de parmesano",
        precioCentimos: 1400,
      },
      {
        id: "g-giovani",
        nombre: "Pizza Giovani",
        descripcion: "tomate amarillo, mozzarella, rucula, tomate seco y mozzarella de bufala",
        precioCentimos: 1700,
      },
      {
        id: "g-tartufo",
        nombre: "Pizza gourmet tartufo",
        descripcion: "base blanca, burrata, jamon serrano, salsa de trufa y nueces",
        precioCentimos: 1600,
      },
      {
        id: "g-mortazza",
        nombre: "Pizza la mortazza",
        descripcion: "base de nata, mozzarella, burrata, mortadela, crema de pistacho y granola de pistacho",
        precioCentimos: 1600,
      },
      {
        id: "g-zeyna",
        nombre: "Pizza Zeyna",
        descripcion: "base de mozzarella, ventresca, alioli, cebolla crujiente, polvo de limon y champinones",
        precioCentimos: 1490,
      },
      {
        id: "g-dos-sicilias",
        nombre: "Pizza Reino de las Dos Sicilias",
        descripcion: "crema de tomate cherry amarillo, cherry semi seco, mozzarella, burrata, jamon serrano, parmesano crujiente, miel y polvo de cafe. Fue campeona en 2024",
        precioCentimos: 1690,
      },

      // --- Risottos ---
      {
        id: "r-porcini",
        nombre: "Risotto al funghi porcini",
        descripcion: "arroz cremoso con setas porcini",
        precioCentimos: 1490,
      },
      {
        id: "r-guanciale",
        nombre: "Risotto guanciale y tartufo",
        descripcion: "arroz cremoso con guanciale crujiente, aroma de trufa y parmesano en polvo",
        precioCentimos: 1590,
      },

      // --- Pastas ---
      {
        id: "pa-gnocchi-4q",
        nombre: "Gnocchi cuatro quesos",
        descripcion: "gnocchi de patata con salsa de cuatro quesos",
        precioCentimos: 1200,
      },
      {
        id: "pa-gnocchi-bolo",
        nombre: "Gnocchi bolonesa",
        descripcion: "gnocchi de patata con salsa bolonesa",
        precioCentimos: 1290,
      },
      {
        id: "pa-lasana",
        nombre: "Lasana ragu",
        descripcion: "pasta fresca con ragu de carne, bechamel y parmesano, gratinada al horno",
        precioCentimos: 1290,
      },
      {
        id: "pa-porcini",
        nombre: "Linguini funghi porcini",
        descripcion: "cuatro variedades de setas, nata y parmesano",
        precioCentimos: 1400,
      },
      {
        id: "pa-pesto",
        nombre: "Pasta al pesto",
        descripcion: "linguini con pesto de albahaca, pinones, parmesano y aceite de oliva virgen extra",
        precioCentimos: 1300,
      },
      {
        id: "pa-alioli",
        nombre: "Pasta alioli",
        descripcion: "linguini salteados con ajo, aceite de oliva virgen extra y perejil fresco",
        precioCentimos: 1090,
      },
      {
        id: "pa-carbonara",
        nombre: "Pasta carbonara",
        descripcion: "linguini con guanciale, yema de huevo y pecorino",
        precioCentimos: 1400,
      },
      {
        id: "pa-pomodoro",
        nombre: "Pasta pomodoro",
        descripcion: "penne con salsa de tomate",
        precioCentimos: 1050,
      },
      {
        id: "pa-ragu",
        nombre: "Pasta ragu",
        descripcion: "linguini con ragu de carne cocinado lentamente con tomate, verduras y hierbas",
        precioCentimos: 1290,
      },
      {
        id: "pa-amatriciana",
        nombre: "Penne amatriciana",
        descripcion: "salsa de tomate, guanciale y pecorino, picante si se quiere",
        precioCentimos: 1350,
      },
      {
        id: "pa-ravioli",
        nombre: "Ravioli de bufala, ricotta y espinaca",
        descripcion: "con crema de trufa y cebolla caramelizada",
        precioCentimos: 1390,
      },

      // --- Panuozzos ---
      {
        id: "pan-parma",
        nombre: "Panuozzo di parma",
        descripcion: "tomate, mozzarella, rucula, jamon serrano, bufala y parmesano en polvo",
        precioCentimos: 1390,
      },
      {
        id: "pan-semplice",
        nombre: "Panuozzo semplice",
        descripcion: "jamon york, tomate natural, mozzarella de bufala, aceite, sal y oregano",
        precioCentimos: 1390,
      },
      {
        id: "pan-vegetal",
        nombre: "Panuozzo vegetal",
        descripcion: "rucula, tomate seco marinado y mozzarella de bufala",
        precioCentimos: 1290,
      },

      // --- Calzones ---
      {
        id: "c-prosciutto",
        nombre: "Calzone prosciutto y bacon",
        descripcion: "bacon, jamon, mozzarella y salsa de tomate",
        precioCentimos: 1200,
      },
      {
        id: "c-speziato",
        nombre: "Calzone speziato",
        descripcion: "salami picante, pimientos, salsa de tomate y mozzarella",
        precioCentimos: 1290,
      },
      {
        id: "c-vegetariana",
        nombre: "Calzone vegetariana",
        descripcion: "salsa de tomate, mozzarella, calabacin, cherry rojo y pimiento rojo",
        precioCentimos: 1100,
      },

      // --- Postres ---
      {
        id: "po-nutella",
        nombre: "Calzone de nutella",
        descripcion: "masa italiana rellena de nutella, horneada y con azucar glas",
        precioCentimos: 750,
      },
      {
        id: "po-cannoli",
        nombre: "Cannoli siciliano",
        descripcion: "crujiente relleno de crema suave de ricotta",
        precioCentimos: 430,
      },
      {
        id: "po-pannacotta",
        nombre: "Panna cotta",
        descripcion: "panna cotta italiana con coulis de frutos rojos",
        precioCentimos: 450,
      },
      {
        id: "po-tarta-nutella",
        nombre: "Tarta de nutella",
        descripcion: "tarta cremosa con sabor intenso a nutella",
        precioCentimos: 590,
      },
      {
        id: "po-tarta-queso",
        nombre: "Tarta de queso",
        descripcion: "tarta de queso suave, entre dulce y cremosa",
        precioCentimos: 590,
      },
      {
        id: "po-tiramisu",
        nombre: "Tiramisu",
        descripcion: "bizcochos banados en cafe, crema de mascarpone y un toque de cacao",
        precioCentimos: 600,
      },  ],

  emailPedidos: "",
};
