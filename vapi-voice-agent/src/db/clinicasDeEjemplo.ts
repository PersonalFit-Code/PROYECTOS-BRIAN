/**
 * Clinicas de ejemplo, para probar el modo citas sin tener todavia una real.
 *
 * No son clinicas que existan: los nombres estan inventados a proposito, para
 * que nadie confunda una prueba con un cliente. Lo unico que hay que cambiar
 * para que sirva de verdad es el calendarId, que lo da la clinica.
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
};
