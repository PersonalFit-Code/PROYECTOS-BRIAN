/**
 * El reparto de las citas "me da igual" entre las profesionales.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { elegirProfesional, minutosOcupadosEnDia } from "../assign";
import { descomponerFechaLocal, instanteEnZona, minutosDeHhMm } from "../tz";
import type { Intervalo } from "../types";

const ZONA = "Europe/Madrid";

function en(fecha: string, hhmm: string): Date {
  const { anio, mes, dia } = descomponerFechaLocal(fecha);
  const minutos = minutosDeHhMm(hhmm);
  return instanteEnZona(anio, mes, dia, Math.floor(minutos / 60), minutos % 60, ZONA);
}

function tramo(fecha: string, desde: string, hasta: string): Intervalo {
  return { desde: en(fecha, desde), hasta: en(fecha, hasta) };
}

describe("minutosOcupadosEnDia", () => {
  it("suma solo lo que cae dentro del día local", () => {
    const ocupado = {
      ana: [tramo("2026-10-19", "09:30", "12:30"), tramo("2026-10-19", "16:00", "17:00"), tramo("2026-10-20", "09:30", "13:30")],
      // Una ausencia que empieza la víspera y acaba a mediodía: solo cuentan las 12 horas del día.
      bea: [{ desde: en("2026-10-18", "20:00"), hasta: en("2026-10-19", "12:00") }],
    };
    assert.equal(minutosOcupadosEnDia("ana", "2026-10-19", ocupado, ZONA), 240);
    assert.equal(minutosOcupadosEnDia("ana", "2026-10-20", ocupado, ZONA), 240);
    assert.equal(minutosOcupadosEnDia("ana", "2026-10-21", ocupado, ZONA), 0);
    assert.equal(minutosOcupadosEnDia("bea", "2026-10-19", ocupado, ZONA), 720);
    assert.equal(minutosOcupadosEnDia("bea", "2026-10-18", ocupado, ZONA), 240);
    assert.equal(minutosOcupadosEnDia("nadie", "2026-10-19", ocupado, ZONA), 0, "sin entrada, cero");
  });

  it("los tramos que se solapan se cuentan una vez", () => {
    const ocupado = { ana: [tramo("2026-10-19", "10:00", "11:00"), tramo("2026-10-19", "10:30", "11:30")] };
    assert.equal(minutosOcupadosEnDia("ana", "2026-10-19", ocupado, ZONA), 90);
  });

  it("el día dura lo que dura: 25 horas el 25-oct-2026 y 23 el 28-mar-2027", () => {
    const ocupado = {
      ana: [{ desde: en("2026-10-20", "00:00"), hasta: en("2026-11-01", "00:00") }],
      bea: [{ desde: en("2027-03-22", "00:00"), hasta: en("2027-04-01", "00:00") }],
    };
    assert.equal(minutosOcupadosEnDia("ana", "2026-10-24", ocupado, ZONA), 1440);
    assert.equal(minutosOcupadosEnDia("ana", "2026-10-25", ocupado, ZONA), 1500);
    assert.equal(minutosOcupadosEnDia("ana", "2026-10-26", ocupado, ZONA), 1440);
    assert.equal(minutosOcupadosEnDia("bea", "2027-03-27", ocupado, ZONA), 1440);
    assert.equal(minutosOcupadosEnDia("bea", "2027-03-28", ocupado, ZONA), 1380);
    assert.equal(minutosOcupadosEnDia("bea", "2027-03-29", ocupado, ZONA), 1440);
  });

  it("avisa si la fecha no es válida", () => {
    assert.throws(() => minutosOcupadosEnDia("ana", "19/10/2026", {}, ZONA));
  });
});

describe("elegirProfesional", () => {
  const inicio = en("2026-10-19", "16:00");

  it("elige a la que menos minutos tiene ocupados ese día", () => {
    const ocupado = {
      ana: [tramo("2026-10-19", "09:30", "12:30")],
      bea: [tramo("2026-10-19", "09:30", "10:30")],
    };
    assert.equal(elegirProfesional(inicio, ["ana", "bea"], ocupado, ZONA), "bea");
    assert.equal(elegirProfesional(inicio, ["bea", "ana"], ocupado, ZONA), "bea");
    // Lo de otros días no pesa: el martes bea está a tope y no importa.
    const conMartes = { ...ocupado, bea: [...ocupado.bea, tramo("2026-10-20", "09:30", "19:30")] };
    assert.equal(elegirProfesional(inicio, ["ana", "bea"], conMartes, ZONA), "bea");
  });

  it("en caso de empate se queda la primera de la lista", () => {
    assert.equal(elegirProfesional(inicio, ["ana", "bea"], {}, ZONA), "ana");
    assert.equal(elegirProfesional(inicio, ["bea", "ana"], {}, ZONA), "bea");
    const iguales = { ana: [tramo("2026-10-19", "10:00", "11:00")], bea: [tramo("2026-10-19", "17:00", "18:00")] };
    assert.equal(elegirProfesional(inicio, ["ana", "bea"], iguales, ZONA), "ana");
  });

  it("una profesional sin citas gana a una con una sola", () => {
    const ocupado = { ana: [tramo("2026-10-19", "10:00", "10:30")] };
    assert.equal(elegirProfesional(inicio, ["ana", "cris"], ocupado, ZONA), "cris");
  });

  it("mira el día local de la cita, no el día UTC", () => {
    // Las 00:30 del martes 20 en Madrid son todavía lunes 19 en UTC.
    const madrugada = en("2026-10-20", "00:30");
    const ocupado = { ana: [tramo("2026-10-20", "09:30", "13:30")], bea: [tramo("2026-10-19", "09:30", "19:30")] };
    assert.equal(elegirProfesional(madrugada, ["ana", "bea"], ocupado, ZONA), "bea");
  });

  it("sin candidatas no hay a quién asignar", () => {
    assert.throws(() => elegirProfesional(inicio, [], {}, ZONA));
  });
});
