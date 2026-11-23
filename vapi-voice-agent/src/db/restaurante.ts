/**
 * Un restaurante que coge reservas de mesa por telefono.
 *
 * Es el tercer modo del agente, junto a los pedidos (Business) y las citas
 * (Clinica). Se parece a una clinica en que se reserva un dia y una hora, pero
 * aqui no hay agenda de Google de la que salgan huecos: el restaurante tiene
 * franjas y turnos fijos, y la reserva queda apuntada para que la vean en el
 * panel. Conectarse a su programa de reservas es un paso posterior.
 *
 * Como en los pedidos, lo que se puede reservar lo decide el servidor y no el
 * modelo: el agente propone, y la herramienta comprueba que ese dia abren y
 * que a esa hora se coge reserva antes de apuntarla.
 */

import type { FranjaHoraria } from "./clinica";

/** Turnos fijos de un dia: a esas horas, y solo a esas, se reserva. */
export interface TurnosDelDia {
  /** Dia de la semana en formato ISO: 1 lunes ... 7 domingo. */
  dia: number;
  /** Horas de cada turno, "18:00", "20:00". */
  horas: string[];
}

/** La voz de este negocio, si no es la del .env. */
export interface VozDelNegocio {
  proveedor: string;
  voiceId: string;
  modelo: string;
  velocidad: number;
}

/** Un bloque de lo que el agente sabe contestar: la carta, las normas... */
export interface BloqueInformacion {
  titulo: string;
  texto: string;
}

/**
 * Un restaurante, tal como se guarda en Firestore en /businesses/{id} con
 * modo "reservas". Tambien puede vivir en el codigo como restaurante de
 * demostracion (restaurantesDeEjemplo.ts).
 */
export interface Restaurante {
  /** Discrimina de los otros dos modos. Es lo que mira el servidor. */
  modo: "reservas";

  /** Identificador del documento. Es el valor que llega en ?business=. */
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  /** Telefono del restaurante, por si alguien lo pide. */
  telefono: string;
  web: string;
  /** Zona horaria IANA ("Europe/Brussels"). Manda sobre todo lo demas. */
  zonaHoraria: string;
  /** Que clase de local es, en ingles para el prompt: "Belgian seafood restaurant". */
  tipoLabel: string;

  /**
   * Idiomas en los que atiende, en codigo ISO. El primero es el de por
   * defecto, el del saludo. Con mas de uno, el transcriptor escucha en modo
   * multilingue y la voz no se fija a ningun idioma.
   */
  idiomas: string[];
  /** Lo primero que se oye. Tiene que decir que es un asistente automatico. */
  saludo: string;
  /** Voz propia. Vacio = la del .env. */
  voz?: VozDelNegocio;
  /** Nombre propio del asistente. Vacio = el de marca. */
  nombreAgente?: string;

  horario: {
    /** Cuando esta abierto el local. */
    apertura: FranjaHoraria[];
    /** Cuando sale comida de la cocina. */
    cocina: FranjaHoraria[];
    /** Dias de cierre en formato ISO: [2, 3] = martes y miercoles. */
    diasCierre: number[];
  };

  reservas: {
    /** Franjas en las que se puede reservar a cualquier hora (cada pasoMinutos). */
    franjas: FranjaHoraria[];
    /** Turnos fijos. Un dia con turnos solo admite esas horas en esa parte del dia. */
    turnos: TurnosDelDia[];
    /** Cada cuantos minutos puede empezar una reserva dentro de una franja. */
    pasoMinutos: number;
    /**
     * Hasta cuantas personas apunta el agente la reserva sin mas. Por encima,
     * la toma como peticion y el restaurante llama para confirmarla.
     */
    maxPersonas: number;
    /** Con cuanta antelacion minima se acepta una reserva. */
    antelacionMinimaMinutos: number;
    /** Cuantos dias hacia delante se aceptan reservas. */
    diasVista: number;
    /** Lo que el agente tiene que saber de las reservas y no cabe en lo anterior. */
    notas: string[];
  };

  /** Lo que sabe contestar: carta, normas, aparcamiento, vales regalo... */
  informacion: BloqueInformacion[];
  /** Palabras que el transcriptor tiene que esperar oir: el nombre, los platos. */
  palabrasClave: string[];
}

/** Distingue este modo sin mirar nada mas. */
export function pideReservas(negocio: unknown): negocio is Restaurante {
  return (
    !!negocio &&
    typeof negocio === "object" &&
    (negocio as Record<string, unknown>).modo === "reservas"
  );
}

const HORA = /^\d{1,2}:\d{2}$/;

function textoNoVacio(valor: unknown): boolean {
  return typeof valor === "string" && valor.trim().length > 0;
}

function franjasValidas(valor: unknown): boolean {
  return (
    Array.isArray(valor) &&
    valor.every(
      (f) =>
        !!f &&
        typeof f === "object" &&
        Number.isInteger((f as FranjaHoraria).dia) &&
        (f as FranjaHoraria).dia >= 1 &&
        (f as FranjaHoraria).dia <= 7 &&
        HORA.test(String((f as FranjaHoraria).desde)) &&
        HORA.test(String((f as FranjaHoraria).hasta)),
    )
  );
}

/**
 * Los campos que faltan o vienen mal, para decir en el log exactamente que no
 * cuadra. Un restaurante mal escrito en Firestore no puede tumbar una llamada.
 */
export function camposQueFaltanRestaurante(valor: unknown): string[] {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return ["(el documento no es un objeto)"];
  }
  const doc = valor as Record<string, unknown>;
  const faltan: string[] = [];

  for (const campo of ["id", "nombre", "ciudad", "direccion", "zonaHoraria", "tipoLabel"]) {
    if (!textoNoVacio(doc[campo])) faltan.push(campo);
  }
  if (doc.modo !== "reservas") faltan.push("modo");

  if (
    !Array.isArray(doc.idiomas) ||
    doc.idiomas.length === 0 ||
    !doc.idiomas.every((i) => typeof i === "string" && /^[a-z]{2}$/.test(i))
  ) {
    faltan.push("idiomas");
  }

  // Avisar de que no es una persona es obligacion legal: un saludo que no lo
  // diga no pasa. Se acepta la palabra en los idiomas que atiende.
  if (
    !textoNoVacio(doc.saludo) ||
    !/automati|virtu|digita/i.test(String(doc.saludo))
  ) {
    faltan.push('saludo (tiene que decir que es un asistente automatico)');
  }

  const horario = doc.horario as Record<string, unknown> | undefined;
  if (!horario || typeof horario !== "object") {
    faltan.push("horario");
  } else {
    if (!franjasValidas(horario.apertura)) faltan.push("horario.apertura");
    if (!franjasValidas(horario.cocina)) faltan.push("horario.cocina");
    if (
      !Array.isArray(horario.diasCierre) ||
      !horario.diasCierre.every((d) => Number.isInteger(d) && d >= 1 && d <= 7)
    ) {
      faltan.push("horario.diasCierre");
    }
  }

  const reservas = doc.reservas as Record<string, unknown> | undefined;
  if (!reservas || typeof reservas !== "object") {
    faltan.push("reservas");
  } else {
    if (!franjasValidas(reservas.franjas)) faltan.push("reservas.franjas");
    if (
      !Array.isArray(reservas.turnos) ||
      !reservas.turnos.every(
        (t) =>
          !!t &&
          typeof t === "object" &&
          Number.isInteger((t as TurnosDelDia).dia) &&
          Array.isArray((t as TurnosDelDia).horas) &&
          (t as TurnosDelDia).horas.every((h) => HORA.test(String(h))),
      )
    ) {
      faltan.push("reservas.turnos");
    }
    for (const campo of ["pasoMinutos", "maxPersonas", "diasVista"]) {
      const n = reservas[campo];
      if (typeof n !== "number" || !Number.isInteger(n) || n <= 0) {
        faltan.push(`reservas.${campo}`);
      }
    }
    const antelacion = reservas.antelacionMinimaMinutos;
    if (typeof antelacion !== "number" || antelacion < 0) {
      faltan.push("reservas.antelacionMinimaMinutos");
    }
    if (!Array.isArray(reservas.notas)) faltan.push("reservas.notas");
  }

  if (
    !Array.isArray(doc.informacion) ||
    !doc.informacion.every(
      (b) => !!b && typeof b === "object" && textoNoVacio((b as BloqueInformacion).titulo) &&
        textoNoVacio((b as BloqueInformacion).texto),
    )
  ) {
    faltan.push("informacion");
  }
  if (!Array.isArray(doc.palabrasClave)) faltan.push("palabrasClave");

  return faltan;
}

export function esRestaurante(valor: unknown): valor is Restaurante {
  return camposQueFaltanRestaurante(valor).length === 0;
}
