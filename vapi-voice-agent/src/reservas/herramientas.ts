/**
 * Las herramientas del agente de reservas: apuntar una reserva y dejar un
 * recado.
 *
 * El modelo propone el dia, la hora y las personas; aqui se comprueba que ese
 * dia abren, que a esa hora se coge reserva y que no es en el pasado, antes de
 * apuntar nada. Es la misma idea que el total de los pedidos: lo que dice el
 * agente no puede descuadrarse con las reglas del restaurante, porque las
 * reglas no las aplica el modelo.
 *
 * Lo que se devuelve lo lee el modelo, no el cliente, y va en ingles: el agente
 * habla neerlandes, frances, ingles o aleman y lo traduce. Un texto en
 * castellano aqui se le colaba en la conversacion.
 */

import type { FranjaHoraria } from "../db/clinica";
import type { Restaurante } from "../db/restaurante";
import { guardarRecado, guardarReserva, type Reserva } from "../db/reservas";
import { enZona, instanteEnZona, minutosDeHhMm } from "../util/zona";

export const TOOL_REGISTRAR_RESERVA = "registrar_reserva";
export const TOOL_DEJAR_RECADO = "dejar_recado";

const DIAS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function nombreDelDia(diaIso: number): string {
  return DIAS[diaIso] ?? "";
}

function hhmm(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "19:30", "19.30", "19h30", "19u30", "19" -> "19:30" / "19:00". null si no es una hora. */
export function normalizarHora(valor: unknown): string | null {
  const texto = String(valor ?? "").trim().toLowerCase();
  const encaje = /^(\d{1,2})(?:\s*[:.hu]\s*(\d{2}))?\s*(?:h|u|uur)?$/.exec(texto);
  if (!encaje) return null;
  const horas = Number(encaje[1]);
  const minutos = Number(encaje[2] ?? "0");
  if (horas > 23 || minutos > 59) return null;
  return hhmm(horas * 60 + minutos);
}

/** "2026-11-28" -> partes. null si no es una fecha que exista. */
export function leerFecha(valor: unknown): { anio: number; mes: number; dia: number } | null {
  const encaje = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor ?? "").trim());
  if (!encaje) return null;
  const anio = Number(encaje[1]);
  const mes = Number(encaje[2]);
  const dia = Number(encaje[3]);
  const comprobacion = new Date(Date.UTC(anio, mes - 1, dia));
  if (
    comprobacion.getUTCFullYear() !== anio ||
    comprobacion.getUTCMonth() !== mes - 1 ||
    comprobacion.getUTCDate() !== dia
  ) {
    return null;
  }
  return { anio, mes, dia };
}

/** Dia de la semana ISO de una fecha de calendario, sin zona: el calendario es el mismo. */
function diaDeLaSemana(anio: number, mes: number, dia: number): number {
  const domingoCero = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  return domingoCero === 0 ? 7 : domingoCero;
}

function franjasDelDia(franjas: FranjaHoraria[], diaIso: number): FranjaHoraria[] {
  return franjas.filter((f) => f.dia === diaIso);
}

/** Todas las horas a las que se puede empezar una reserva ese dia de la semana. */
export function horasDeReserva(restaurante: Restaurante, diaIso: number): string[] {
  if (restaurante.horario.diasCierre.includes(diaIso)) return [];
  const paso = restaurante.reservas.pasoMinutos;
  const horas = new Set<string>();

  for (const franja of franjasDelDia(restaurante.reservas.franjas, diaIso)) {
    const fin = minutosDeHhMm(franja.hasta);
    for (let m = minutosDeHhMm(franja.desde); m <= fin; m += paso) {
      horas.add(hhmm(m));
    }
  }
  for (const turnos of restaurante.reservas.turnos.filter((t) => t.dia === diaIso)) {
    for (const hora of turnos.horas) {
      const normal = normalizarHora(hora);
      if (normal) horas.add(normal);
    }
  }
  return [...horas].sort();
}

/** Las horas de reserva de un dia dichas en una linea: "12:00-13:30, 18:00 or 20:00". */
export function describirHorasDeReserva(restaurante: Restaurante, diaIso: number): string {
  if (restaurante.horario.diasCierre.includes(diaIso)) return "closed";
  const partes = franjasDelDia(restaurante.reservas.franjas, diaIso).map(
    (f) => `any time from ${f.desde} to ${f.hasta}`,
  );
  for (const turnos of restaurante.reservas.turnos.filter((t) => t.dia === diaIso)) {
    partes.push(`fixed sittings at ${turnos.horas.join(" or ")}`);
  }
  return partes.length ? partes.join("; ") : "no reservations";
}

function dentroDe(franjas: FranjaHoraria[], diaIso: number, minutos: number): boolean {
  return franjasDelDia(franjas, diaIso).some(
    (f) => minutos >= minutosDeHhMm(f.desde) && minutos < minutosDeHhMm(f.hasta),
  );
}

/** Si el local y la cocina estan abiertos en este momento, en una frase para el prompt. */
export function estadoAhora(restaurante: Restaurante, ahora: Date): string {
  const local = enZona(ahora, restaurante.zonaHoraria);
  const minutos = local.hora * 60 + local.minuto;
  if (restaurante.horario.diasCierre.includes(local.diaSemana)) {
    return `Right now the restaurant is CLOSED (it is ${nombreDelDia(local.diaSemana)}, a closing day).`;
  }
  const abierto = dentroDe(restaurante.horario.apertura, local.diaSemana, minutos);
  const cocina = dentroDe(restaurante.horario.cocina, local.diaSemana, minutos);
  if (!abierto) return "Right now the restaurant is CLOSED (outside opening hours).";
  return cocina
    ? "Right now the restaurant is OPEN and the kitchen is serving."
    : "Right now the restaurant is OPEN, but the kitchen is not serving food at this moment.";
}

/**
 * Los proximos dias con su dia de la semana y lo que se puede reservar. Va en
 * el prompt para que el modelo no tenga que calcular que dia cae "el viernes
 * que viene": es justo el tipo de cuenta en la que se equivoca.
 */
export function calendarioProximosDias(restaurante: Restaurante, ahora: Date, dias = 14): string {
  const hoy = enZona(ahora, restaurante.zonaHoraria);
  const lineas: string[] = [];
  for (let i = 0; i < dias; i += 1) {
    const fecha = new Date(Date.UTC(hoy.anio, hoy.mes - 1, hoy.dia + i));
    const anio = fecha.getUTCFullYear();
    const mes = fecha.getUTCMonth() + 1;
    const dia = fecha.getUTCDate();
    const diaIso = diaDeLaSemana(anio, mes, dia);
    const iso = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const etiqueta = i === 0 ? " (today)" : i === 1 ? " (tomorrow)" : "";
    lineas.push(
      `- ${nombreDelDia(diaIso)} ${iso}${etiqueta}: ${describirHorasDeReserva(restaurante, diaIso)}`,
    );
  }
  return lineas.join("\n");
}

export type Comprobacion =
  | { ok: true; fecha: string; hora: string; diaIso: number }
  | { ok: false; motivo: string };

/** Si esa fecha y esa hora se pueden reservar. El motivo lo lee el modelo. */
export function comprobarReserva(
  restaurante: Restaurante,
  fechaBruta: unknown,
  horaBruta: unknown,
  ahora: Date,
): Comprobacion {
  const partes = leerFecha(fechaBruta);
  if (!partes) {
    return {
      ok: false,
      motivo: `The date "${String(fechaBruta ?? "")}" is not valid. Send it as YYYY-MM-DD, using the calendar in your instructions.`,
    };
  }
  const hora = normalizarHora(horaBruta);
  if (!hora) {
    return {
      ok: false,
      motivo: `The time "${String(horaBruta ?? "")}" is not valid. Send it as HH:MM in 24-hour format, for example 19:30.`,
    };
  }

  const { anio, mes, dia } = partes;
  const fecha = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const diaIso = diaDeLaSemana(anio, mes, dia);
  const nombreDia = nombreDelDia(diaIso);

  if (restaurante.horario.diasCierre.includes(diaIso)) {
    const cierre = restaurante.horario.diasCierre.map(nombreDelDia).join(" and ");
    return {
      ok: false,
      motivo: `${nombreDia} ${fecha} is a closing day: the restaurant is closed on ${cierre}. Offer another day.`,
    };
  }

  const [h, m] = hora.split(":").map(Number) as [number, number];
  const instante = instanteEnZona(anio, mes, dia, h, m, restaurante.zonaHoraria);
  const margen = restaurante.reservas.antelacionMinimaMinutos * 60_000;
  if (instante.getTime() < ahora.getTime() + margen) {
    return {
      ok: false,
      motivo: `${nombreDia} ${fecha} at ${hora} is in the past or too soon (at least ${restaurante.reservas.antelacionMinimaMinutos} minutes ahead). Offer a later time or another day.`,
    };
  }
  const limite = ahora.getTime() + restaurante.reservas.diasVista * 86_400_000;
  if (instante.getTime() > limite) {
    return {
      ok: false,
      motivo: `${fecha} is too far ahead: reservations are taken up to ${restaurante.reservas.diasVista} days in advance. Take a message instead so the restaurant can call back.`,
    };
  }

  const validas = horasDeReserva(restaurante, diaIso);
  if (!validas.includes(hora)) {
    return {
      ok: false,
      motivo: `${hora} is not a reservation time on ${nombreDia}. On ${nombreDia} you can reserve: ${describirHorasDeReserva(restaurante, diaIso)}${restaurante.reservas.pasoMinutos ? ` (every ${restaurante.reservas.pasoMinutos} minutes within a range)` : ""}. Offer the closest possible time.`,
    };
  }

  return { ok: true, fecha, hora, diaIso };
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : typeof valor === "number" ? String(valor) : "";
}

function personasDe(valor: unknown): number | null {
  const n = typeof valor === "number" ? valor : Number(String(valor ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

const CIFRAS_MINIMAS_TELEFONO = 8;

function cifras(telefono: string): number {
  return telefono.replace(/\D/g, "").length;
}

export interface ContextoReservas {
  restaurante: Restaurante;
  callId: string;
  /** El numero desde el que llaman, si Vapi lo da. */
  telefonoLlamada: string;
  ahora: Date;
}

/** Apunta la reserva, o dice exactamente que falta o que no cuadra. */
export async function registrarReserva(
  contexto: ContextoReservas,
  argumentos: Record<string, unknown>,
): Promise<string> {
  const { restaurante } = contexto;
  const faltan: string[] = [];

  const personas = personasDe(argumentos.personas);
  if (personas === null) faltan.push("the number of people");
  const nombre = texto(argumentos.nombre);
  if (!nombre) faltan.push("the name");
  // Si no ha dictado telefono, el de la llamada: es lo que hace un camarero.
  const telefono = texto(argumentos.telefono) || contexto.telefonoLlamada;
  if (!telefono) faltan.push("a phone number");
  else if (cifras(telefono) < CIFRAS_MINIMAS_TELEFONO) {
    faltan.push(`a complete phone number ("${telefono}" has too few digits)`);
  }

  const comprobacion = comprobarReserva(restaurante, argumentos.fecha, argumentos.hora, contexto.ahora);
  if (!comprobacion.ok) {
    return `NOT registered: ${comprobacion.motivo}`;
  }
  if (faltan.length > 0) {
    return `NOT registered yet: missing ${faltan.join(", ")}. Ask the caller and call ${TOOL_REGISTRAR_RESERVA} again.`;
  }

  const grupo = (personas as number) > restaurante.reservas.maxPersonas;
  const reserva: Reserva = {
    businessId: restaurante.id,
    fecha: comprobacion.fecha,
    hora: comprobacion.hora,
    personas: personas as number,
    nombre,
    telefono,
    notas: texto(argumentos.notas),
    idioma: texto(argumentos.idioma) || restaurante.idiomas[0] || "",
    estado: grupo ? "pendiente" : "confirmada",
    callId: contexto.callId,
    creadoEnIso: contexto.ahora.toISOString(),
  };

  try {
    await guardarReserva(reserva);
  } catch (error) {
    console.error("[reserva] NO GUARDADA:", JSON.stringify(reserva), error);
    return `NOT registered because of a system error. Apologise, do NOT say the table is booked, and tell the caller to call the restaurant on ${restaurante.telefono} during opening hours or to book on ${restaurante.web}.`;
  }

  const resumen = `${nombreDelDia(comprobacion.diaIso)} ${comprobacion.fecha} at ${comprobacion.hora}, ${reserva.personas} people, name ${nombre}, phone ${telefono}`;
  if (grupo) {
    return `Request noted, NOT confirmed yet (more than ${restaurante.reservas.maxPersonas} people): ${resumen}. Tell the caller the restaurant will call them back to confirm the table. Do not say it is confirmed.`;
  }
  return `Reservation noted: ${resumen}. Tell the caller in one short sentence that it is noted, without repeating every detail again, and ask if there is anything else.`;
}

/** Apunta un recado para que el restaurante devuelva la llamada. */
export async function dejarRecado(
  contexto: ContextoReservas,
  argumentos: Record<string, unknown>,
): Promise<string> {
  const { restaurante } = contexto;
  const nombre = texto(argumentos.nombre);
  const telefono = texto(argumentos.telefono) || contexto.telefonoLlamada;
  const mensaje = texto(argumentos.mensaje);

  const faltan: string[] = [];
  if (!mensaje) faltan.push("what the message is about");
  if (!nombre) faltan.push("the name");
  if (!telefono) faltan.push("a phone number");
  else if (cifras(telefono) < CIFRAS_MINIMAS_TELEFONO) {
    faltan.push(`a complete phone number ("${telefono}" has too few digits)`);
  }
  if (faltan.length > 0) {
    return `Message NOT saved yet: missing ${faltan.join(", ")}. Ask the caller and call ${TOOL_DEJAR_RECADO} again.`;
  }

  try {
    await guardarRecado({
      businessId: restaurante.id,
      nombre,
      telefono,
      mensaje,
      idioma: texto(argumentos.idioma) || restaurante.idiomas[0] || "",
      callId: contexto.callId,
      creadoEnIso: contexto.ahora.toISOString(),
    });
  } catch (error) {
    console.error("[recado] NO GUARDADO:", JSON.stringify({ nombre, telefono, mensaje }), error);
    return `Message NOT saved because of a system error. Apologise and tell the caller to call the restaurant on ${restaurante.telefono} during opening hours.`;
  }
  return `Message saved for the restaurant: ${nombre}, ${telefono}: "${mensaje}". Tell the caller the restaurant will call them back, and ask if there is anything else.`;
}

const idioma = {
  type: "string" as const,
  description: "Language the caller is speaking: nl, fr, en or de.",
};

/** Las dos herramientas, en el formato de Vapi. */
export function herramientasDeReservas() {
  return [
    {
      type: "function" as const,
      function: {
        name: TOOL_REGISTRAR_RESERVA,
        description:
          "Registers a table reservation once you have the day, the time, the number of people, the name and a phone number, and the caller has confirmed them. The server checks the opening days and reservation times and answers whether it was noted.",
        parameters: {
          type: "object" as const,
          properties: {
            fecha: { type: "string" as const, description: "Date of the reservation, YYYY-MM-DD." },
            hora: { type: "string" as const, description: "Time of the reservation, HH:MM, 24-hour format." },
            personas: { type: "integer" as const, description: "Number of people." },
            nombre: { type: "string" as const, description: "Name for the reservation." },
            telefono: {
              type: "string" as const,
              description: "Phone number of the caller, digits only, with country code if they gave one.",
            },
            notas: {
              type: "string" as const,
              description: "Anything the restaurant must know: allergies, high chair, wheelchair, occasion. Empty if nothing.",
            },
            idioma,
          },
          required: ["fecha", "hora", "personas", "nombre", "telefono"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: TOOL_DEJAR_RECADO,
        description:
          "Saves a message for the restaurant so they call the caller back. Use it for anything you cannot answer or do yourself.",
        parameters: {
          type: "object" as const,
          properties: {
            nombre: { type: "string" as const, description: "Name of the caller." },
            telefono: { type: "string" as const, description: "Phone number to call back." },
            mensaje: { type: "string" as const, description: "What the caller wants, in one or two sentences." },
            idioma,
          },
          required: ["nombre", "telefono", "mensaje"],
        },
      },
    },
    // Colgar: herramienta de Vapi, desnuda como en los otros modos.
    { type: "endCall" as const },
  ];
}
