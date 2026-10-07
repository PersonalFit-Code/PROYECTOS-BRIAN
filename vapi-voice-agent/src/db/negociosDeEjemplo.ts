/**
 * Negocios de ejemplo para probar el multi-negocio sin datos reales.
 *
 * Viven en src/ y no en el script que los escribe para que el compilador los
 * valide contra Business y para poder usarlos en pruebas. El script
 * scripts/crear-negocio.ts es solo el que los mete en Firestore.
 */

import type { Business } from "./types";

export const EJEMPLOS: Record<string, Business> = {
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
};
