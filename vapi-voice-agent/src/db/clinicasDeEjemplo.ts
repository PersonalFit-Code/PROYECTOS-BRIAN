/**
 * Negocios de cita de ejemplo, para probar el modo citas sin tener todavia uno
 * real.
 *
 * No son negocios que existan: los nombres estan inventados a proposito, para
 * que nadie confunda una prueba con un cliente. Lo unico que hay que cambiar
 * para que sirva de verdad es el calendarId, que lo da el negocio.
 *
 * Hay dos a proposito, y no es por tener mas ejemplos: una dental y un centro
 * de estetica usan el mismo motor pero al reves en casi todo lo que se nota
 * por telefono. La dental no dice precios y tiene urgencias que derivar; la
 * estetica tiene precio cerrado, es lo primero que preguntan, y no hay ninguna
 * urgencia que mandar a ningun sitio. Teniendo las dos aqui, cualquier cosa
 * que se rompa al cambiar el prompt se ve en las pruebas.
 */

import type { Clinica } from "./clinica";

/** Franjas de manana y tarde, de lunes a viernes. Lo normal en una dental. */
function semanaNormal(): Clinica["agenda"]["franjas"] {
  return [1, 2, 3, 4, 5].flatMap((dia) => [
    { dia, desde: "09:00", hasta: "13:30" },
    { dia, desde: "16:00", hasta: "20:00" },
  ]);
}

export const CLINICAS_DE_EJEMPLO: Record<string, Clinica> = {
  pontenova: {
    modo: "citas",
    id: "pontenova",
    nombre: "Clinica Dental Pontenova",
    ciudad: "Ourense",
    direccion: "Rua do Progreso 48, bajo",
    zonaHoraria: "Europe/Madrid",
    tipoLabel: "clinica dental",

    horario: {
      texto: "de lunes a viernes, de nueve a una y media y de cuatro a ocho",
      diaCierre: "sabados y domingos",
    },

    tiposCita: [
      {
        id: "revision",
        nombre: "una revision",
        descripcion: "primera visita o revision anual, con radiografia si hace falta",
        minutos: 20,
      },
      {
        id: "limpieza",
        nombre: "una limpieza",
        descripcion: "higiene dental, quitar sarro",
        minutos: 45,
      },
      {
        id: "empaste",
        nombre: "un empaste",
        descripcion: "una caries, un arreglo pequeno",
        minutos: 45,
      },
      {
        id: "ortodoncia",
        nombre: "una revision de ortodoncia",
        descripcion: "ajuste de brackets o alineadores, para quien ya lleva tratamiento",
        minutos: 30,
        profesional: "la doctora Figueiras",
      },
      {
        // El agente no busca hueco para esto: deriva con la frase de abajo.
        id: "urgencia",
        nombre: "una urgencia",
        descripcion: "dolor fuerte, un golpe, algo que se ha roto, una hinchazon",
        minutos: 20,
        esUrgencia: true,
      },
    ],

    agenda: {
      // Lo pone la clinica: es el ID que sale en Configuracion del calendario,
      // en "Integrar calendario". Aqui va a proposito un valor que no existe,
      // para que no funcione por accidente contra un calendario cualquiera.
      calendarId: "CAMBIAME@group.calendar.google.com",
      franjas: semanaNormal(),
      margenMinutos: 10,
      antelacionMinimaHoras: 3,
      diasVista: 10,
      huecosPorTanda: 3,
      pasoMinutos: 15,
    },

    urgencias: {
      telefono: "988 00 00 00",
      // La escribe la clinica, no nosotros. Esta es solo un punto de partida
      // razonable para la demo.
      queDecir:
        "Si tiene dolor o se ha dado un golpe, no le doy cita normal: llame directamente a la clinica y le atendemos hoy mismo.",
    },

    nombreAgente: "Noah",
    emailCitas: "",
  },

  // Centro de estetica. Mismo motor, otra manera de hablar: aqui el precio se
  // dice, se llama "clienta" y no hay bloque de urgencias.
  airea: {
    modo: "citas",
    id: "airea",
    nombre: "Centro de Estetica Airea",
    ciudad: "Ourense",
    direccion: "Rua Paz 12, 1 izquierda",
    zonaHoraria: "Europe/Madrid",
    tipoLabel: "centro de estetica",

    horario: {
      texto: "de martes a viernes, de diez a dos y de cuatro a ocho, y los sabados de diez a dos",
      diaCierre: "domingos y lunes",
    },

    tiposCita: [
      {
        id: "manicura",
        nombre: "una manicura",
        descripcion: "manos, esmaltado normal",
        minutos: 45,
        precioCentimos: 1800,
      },
      {
        id: "manicura-semi",
        nombre: "una manicura con semipermanente",
        descripcion: "manos con esmaltado semipermanente, el que dura semanas",
        minutos: 60,
        precioCentimos: 2500,
      },
      {
        id: "pedicura",
        nombre: "una pedicura",
        descripcion: "pies, incluye limado y esmaltado",
        minutos: 50,
        precioCentimos: 2200,
      },
      {
        id: "depilacion-piernas",
        nombre: "una depilacion de piernas enteras",
        descripcion: "cera, piernas completas",
        minutos: 40,
        precioCentimos: 2000,
      },
      {
        id: "cejas",
        nombre: "un diseno de cejas",
        descripcion: "depilacion y perfilado de cejas",
        minutos: 20,
        precioCentimos: 1000,
      },
      {
        id: "limpieza-facial",
        nombre: "una limpieza facial",
        descripcion: "limpieza de cutis, puntos negros, hidratacion",
        minutos: 60,
        precioCentimos: 3500,
      },
      {
        // Sin precio a proposito: lo que cuesta depende de lo que se vea en
        // cabina, y el agente tiene que saber decir que no lo sabe.
        id: "tratamiento-corporal",
        nombre: "una primera visita para un tratamiento corporal",
        descripcion: "valoracion para reductores, anticeluliticos o similares",
        minutos: 30,
        profesional: "Marta",
      },
    ],

    agenda: {
      // Mismo aviso que arriba: este ID no existe a proposito.
      calendarId: "CAMBIAME@group.calendar.google.com",
      franjas: [
        ...[2, 3, 4, 5].flatMap((dia) => [
          { dia, desde: "10:00", hasta: "14:00" },
          { dia, desde: "16:00", hasta: "20:00" },
        ]),
        { dia: 6, desde: "10:00", hasta: "14:00" },
      ],
      // Mas margen que en la dental: entre clienta y clienta hay que recoger
      // la cabina.
      margenMinutos: 15,
      antelacionMinimaHoras: 2,
      diasVista: 14,
      huecosPorTanda: 3,
      pasoMinutos: 15,
    },

    // Sin urgencias a proposito: no hay nada que derivar, y poner una frase
    // que el negocio no ha escrito seria inventarsela.

    comoLlamarAlCliente: "clienta",
    nombreAgente: "Noah",
    emailCitas: "",
  },
};
