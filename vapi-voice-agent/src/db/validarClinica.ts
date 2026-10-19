/**
 * Comprobacion del documento de una clinica, campo a campo.
 *
 * Igual que con los negocios de pedidos, esto no lanza: devuelve la lista de
 * lo que no cuadra para poder decirlo en el log. Una clinica a medio rellenar
 * no puede tumbar una llamada en curso, pero tampoco puede atenderla como si
 * nada: sin agenda no hay citas que dar.
 */

import type { Clinica } from "./clinica";

function texto(valor: unknown): boolean {
  return typeof valor === "string" && valor.trim().length > 0;
}

function enteroPositivo(valor: unknown, minimo = 1): boolean {
  return typeof valor === "number" && Number.isInteger(valor) && valor >= minimo;
}

const HORA = /^\d{1,2}:\d{2}$/;

export function camposQueFaltanClinica(valor: unknown): string[] {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return ["(el documento no es un objeto)"];
  }

  const doc = valor as Record<string, unknown>;
  const faltan: string[] = [];

  if (doc.modo !== "citas") faltan.push("modo");

  for (const campo of ["id", "nombre", "ciudad", "direccion", "zonaHoraria", "tipoLabel"]) {
    if (!texto(doc[campo])) faltan.push(campo);
  }

  if (typeof doc.emailCitas !== "string") faltan.push("emailCitas");
  if (doc.nombreAgente !== undefined && !texto(doc.nombreAgente)) {
    faltan.push("nombreAgente");
  }

  const horario = doc.horario;
  if (!horario || typeof horario !== "object" || Array.isArray(horario)) {
    faltan.push("horario");
  } else {
    const h = horario as Record<string, unknown>;
    for (const campo of ["texto", "diaCierre"]) {
      if (!texto(h[campo])) faltan.push(`horario.${campo}`);
    }
  }

  const tipos = doc.tiposCita;
  if (!Array.isArray(tipos) || tipos.length === 0) {
    faltan.push("tiposCita");
  } else {
    for (const [i, tipo] of tipos.entries()) {
      if (!tipo || typeof tipo !== "object" || Array.isArray(tipo)) {
        faltan.push(`tiposCita[${i}]`);
        continue;
      }
      const t = tipo as Record<string, unknown>;
      for (const campo of ["id", "nombre", "descripcion"]) {
        if (!texto(t[campo])) faltan.push(`tiposCita[${i}].${campo}`);
      }
      // Cinco minutos es el suelo: por debajo, o es un error de tecleo o no
      // es una cita.
      if (!enteroPositivo(t.minutos, 5)) faltan.push(`tiposCita[${i}].minutos`);
      // El precio es opcional, pero si esta tiene que ser un entero de
      // centimos: un 45 donde iban 4500 lo dice el agente por telefono tal
      // cual, y eso ya no se arregla con una disculpa.
      if (
        t.precioCentimos !== undefined &&
        (typeof t.precioCentimos !== "number" ||
          !Number.isInteger(t.precioCentimos) ||
          t.precioCentimos < 0)
      ) {
        faltan.push(`tiposCita[${i}].precioCentimos`);
      }
      if (t.profesional !== undefined && !texto(t.profesional)) {
        faltan.push(`tiposCita[${i}].profesional`);
      }
      if (t.esUrgencia !== undefined && typeof t.esUrgencia !== "boolean") {
        faltan.push(`tiposCita[${i}].esUrgencia`);
      }
    }
    // Sin ningun tratamiento agendable el agente no puede dar ni una cita.
    const agendables = tipos.filter(
      (t) => t && typeof t === "object" && !(t as Record<string, unknown>).esUrgencia,
    );
    if (agendables.length === 0) faltan.push("tiposCita (todos son urgencias)");
  }

  const agenda = doc.agenda;
  if (!agenda || typeof agenda !== "object" || Array.isArray(agenda)) {
    faltan.push("agenda");
  } else {
    const a = agenda as Record<string, unknown>;
    if (!texto(a.calendarId)) faltan.push("agenda.calendarId");

    // "primary" seria el calendario de la propia cuenta de servicio, no el de
    // la clinica: las citas se crearian en un calendario que no mira nadie, y
    // sin dar error. Es el fallo mas caro de todos los posibles aqui.
    if (a.calendarId === "primary") faltan.push('agenda.calendarId (no puede ser "primary")');

    for (const campo of ["margenMinutos", "antelacionMinimaHoras"]) {
      const v = a[campo];
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0) faltan.push(`agenda.${campo}`);
    }
    if (!enteroPositivo(a.diasVista)) faltan.push("agenda.diasVista");
    if (!enteroPositivo(a.huecosPorTanda)) faltan.push("agenda.huecosPorTanda");
    if (a.pasoMinutos !== undefined && !enteroPositivo(a.pasoMinutos, 5)) {
      faltan.push("agenda.pasoMinutos");
    }

    const franjas = a.franjas;
    if (!Array.isArray(franjas) || franjas.length === 0) {
      faltan.push("agenda.franjas");
    } else {
      for (const [i, franja] of franjas.entries()) {
        if (!franja || typeof franja !== "object" || Array.isArray(franja)) {
          faltan.push(`agenda.franjas[${i}]`);
          continue;
        }
        const f = franja as Record<string, unknown>;
        const dia = f.dia;
        if (!Number.isInteger(dia) || (dia as number) < 1 || (dia as number) > 7) {
          faltan.push(`agenda.franjas[${i}].dia`);
        }
        for (const campo of ["desde", "hasta"]) {
          const hora = f[campo];
          if (typeof hora !== "string" || !HORA.test(hora)) {
            faltan.push(`agenda.franjas[${i}].${campo}`);
          }
        }
      }
    }
  }

  // Las urgencias son opcionales: una dental las necesita, un centro de
  // estetica no tiene ninguna que derivar. Lo que no se admite es un bloque a
  // medio poner, porque entonces el agente tiene un circuito de urgencias sin
  // la frase que es lo unico que puede decir en el.
  const urgencias = doc.urgencias;
  if (urgencias !== undefined) {
    if (!urgencias || typeof urgencias !== "object" || Array.isArray(urgencias)) {
      faltan.push("urgencias");
    } else {
      const u = urgencias as Record<string, unknown>;
      if (typeof u.telefono !== "string") faltan.push("urgencias.telefono");
      // La escribe el negocio, no nosotros.
      if (!texto(u.queDecir)) faltan.push("urgencias.queDecir");
    }
  }

  // Si hay un tipo marcado como urgencia tiene que haber frase que decir: sin
  // ella el agente llega a ese camino sin nada que hacer.
  if (
    urgencias === undefined &&
    Array.isArray(tipos) &&
    tipos.some((t) => t && typeof t === "object" && (t as Record<string, unknown>).esUrgencia)
  ) {
    faltan.push("urgencias (hay un tipoCita marcado como urgencia)");
  }

  if (doc.comoLlamarAlCliente !== undefined && !texto(doc.comoLlamarAlCliente)) {
    faltan.push("comoLlamarAlCliente");
  }

  return faltan;
}

/** Type guard estructural: el documento sirve como Clinica. */
export function esClinica(valor: unknown): valor is Clinica {
  return camposQueFaltanClinica(valor).length === 0;
}

/** Distingue los dos modos de negocio sin mirar nada mas. */
export function pideCitas(negocio: unknown): negocio is Clinica {
  return (
    !!negocio &&
    typeof negocio === "object" &&
    (negocio as Record<string, unknown>).modo === "citas"
  );
}
