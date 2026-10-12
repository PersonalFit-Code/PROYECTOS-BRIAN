/**
 * El calendario de la clinica.
 *
 * Dos operaciones y nada mas: preguntar que esta ocupado y meter una cita.
 *
 * Para saber que esta ocupado se usa freeBusy y no la lista de eventos, a
 * proposito. freeBusy devuelve solo tramos ("de 10:00 a 10:30"), sin titulos
 * ni invitados: no entra por aqui el nombre de ningun paciente ni el motivo de
 * su consulta, que es dato de salud. Es la diferencia entre tratar datos de
 * salud de media clinica y no tratar ninguno.
 *
 * Dos cosas que Google no perdona y conviene no volver a aprender:
 *
 *  - La ruta es /freeBusy, con B mayuscula. En minuscula da 404.
 *  - Una cuenta de servicio NO puede poner invitados en un evento: devuelve
 *    403. Da igual, porque en una llamada de telefono no tenemos el correo del
 *    paciente. Pero si alguien añade "attendees" alguna vez, esto deja de
 *    funcionar y el error no dice por que.
 */

import { createHash } from "node:crypto";

import type { Intervalo } from "../citas/huecos";

const RAIZ = "https://www.googleapis.com/calendar/v3";

/** Lo que de verdad hace falta: mirar huecos y escribir la cita. Nada mas. */
export const PERMISOS = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
] as const;

/** Algo fue mal hablando con Google. Nunca se traga en silencio. */
export class CalendarioError extends Error {}

export interface DatosCita {
  calendarId: string;
  inicio: Date;
  fin: Date;
  zonaHoraria: string;
  /** Como se vera en la agenda de la clinica. */
  titulo: string;
  /** Lo que la clinica necesita saber al abrirla: paciente, telefono, motivo. */
  detalle: string;
  /**
   * Identificador de la llamada. De aqui sale el id del evento, para que si la
   * misma llamada reintenta no acabe con dos citas iguales.
   */
  referencia: string;
}

export interface ResultadoCita {
  /** false cuando el evento ya existia: la cita esta puesta igualmente. */
  nueva: boolean;
  id: string;
}

export interface ClienteCalendario {
  tramosOcupados(opciones: {
    calendarId: string;
    desde: Date;
    hasta: Date;
    zonaHoraria: string;
  }): Promise<Intervalo[]>;
  crearCita(datos: DatosCita): Promise<ResultadoCita>;
}

/**
 * El id del evento, deducido de la llamada y de la hora.
 *
 * Google exige que sea base32hex (0-9 y a-v). Un resumen en hexadecimal ya lo
 * cumple, porque 0-9a-f cabe dentro de 0-9a-v.
 *
 * Que sea deducible y no aleatorio es justo el punto: si la llamada reintenta
 * porque se corto la red a mitad, el segundo intento calcula el mismo id,
 * Google responde 409 y la clinica se queda con una cita, no con dos.
 */
export function idDeEvento(referencia: string, calendarId: string, inicio: Date): string {
  return createHash("sha256")
    .update(`${referencia}|${calendarId}|${inicio.toISOString()}`)
    .digest("hex")
    .slice(0, 40);
}

interface RespuestaFreeBusy {
  calendars?: Record<string, { busy?: { start?: string; end?: string }[]; errors?: { reason?: string }[] }>;
}

/**
 * Construye el cliente. El token y el fetch entran por parametro para poder
 * probar esto sin credenciales y sin salir a internet, que es la unica forma
 * de tener pruebas del caso que importa: que una cita repetida no se duplique.
 */
export function crearClienteCalendario(dependencias: {
  token: () => Promise<string>;
  http?: typeof fetch;
  limiteMs?: number;
}): ClienteCalendario {
  const http = dependencias.http ?? fetch;
  // El webhook de Vapi corta a los ocho segundos: esto tiene que volver antes.
  const limiteMs = dependencias.limiteMs ?? 5_000;

  async function llamar(ruta: string, cuerpo: unknown): Promise<Response> {
    const token = await dependencias.token();
    try {
      return await http(`${RAIZ}${ruta}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(limiteMs),
      });
    } catch (error) {
      const motivo = error instanceof Error ? error.message : String(error);
      throw new CalendarioError(`no se pudo hablar con Google Calendar: ${motivo}`);
    }
  }

  return {
    async tramosOcupados({ calendarId, desde, hasta, zonaHoraria }) {
      const respuesta = await llamar("/freeBusy", {
        timeMin: desde.toISOString(),
        timeMax: hasta.toISOString(),
        timeZone: zonaHoraria,
        items: [{ id: calendarId }],
      });

      if (!respuesta.ok) {
        throw new CalendarioError(
          `Google respondio ${respuesta.status} al preguntar por los huecos`,
        );
      }

      const datos = (await respuesta.json()) as RespuestaFreeBusy;
      const agenda = datos.calendars?.[calendarId];

      // Si el calendario no esta compartido con nosotros, Google contesta 200
      // con una lista de ocupados vacia y un error dentro. Darlo por bueno
      // seria ofrecer citas encima de las que ya tiene: mejor fallar.
      if (!agenda) {
        throw new CalendarioError(
          `Google no devolvio nada del calendario ${calendarId}. ¿Esta compartido con la cuenta de servicio?`,
        );
      }
      if (agenda.errors?.length) {
        const motivos = agenda.errors.map((e) => e.reason ?? "?").join(", ");
        throw new CalendarioError(
          `Google no deja leer el calendario ${calendarId}: ${motivos}`,
        );
      }

      const tramos: Intervalo[] = [];
      for (const tramo of agenda.busy ?? []) {
        if (!tramo.start || !tramo.end) continue;
        const inicio = new Date(tramo.start);
        const fin = new Date(tramo.end);
        if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) continue;
        tramos.push({ desde: inicio, hasta: fin });
      }
      return tramos;
    },

    async crearCita(datos) {
      const id = idDeEvento(datos.referencia, datos.calendarId, datos.inicio);

      const respuesta = await llamar(
        `/calendars/${encodeURIComponent(datos.calendarId)}/events`,
        {
          id,
          summary: datos.titulo,
          description: datos.detalle,
          start: { dateTime: datos.inicio.toISOString(), timeZone: datos.zonaHoraria },
          end: { dateTime: datos.fin.toISOString(), timeZone: datos.zonaHoraria },
          // Nada de "attendees": una cuenta de servicio no puede ponerlos.
          extendedProperties: { private: { noah: "cita", llamada: datos.referencia } },
        },
      );

      if (respuesta.ok) return { nueva: true, id };

      // 409 significa que ese id ya existe, o sea que esta cita ya se creo en
      // un intento anterior. No es un fallo: es la red reintentando.
      if (respuesta.status === 409) return { nueva: false, id };

      const texto = await respuesta.text().catch(() => "");
      throw new CalendarioError(
        `Google respondio ${respuesta.status} al crear la cita: ${texto.slice(0, 200)}`,
      );
    },
  };
}
