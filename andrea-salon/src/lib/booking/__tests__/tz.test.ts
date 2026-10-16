/**
 * Hora local del salón y fechas civiles.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  descomponerFechaLocal,
  desfaseMinutos,
  desplazarFechaLocal,
  diaSemanaIso,
  enZona,
  fechaLocal,
  formatearFechaLocal,
  instanteEnZona,
  minutosDeHhMm,
} from "../tz";

const ZONA = "Europe/Madrid";

describe("desfaseMinutos", () => {
  it("es +120 en verano y +60 en invierno", () => {
    assert.equal(desfaseMinutos(new Date("2026-07-01T12:00:00Z"), ZONA), 120);
    assert.equal(desfaseMinutos(new Date("2026-01-15T12:00:00Z"), ZONA), 60);
    assert.equal(desfaseMinutos(new Date("2026-01-15T12:00:00Z"), "UTC"), 0);
    assert.equal(desfaseMinutos(new Date("2026-01-15T12:00:00Z"), "Atlantic/Canary"), 0);
  });

  it("cambia a la hora exacta: el 25-oct-2026 a la 01:00 UTC y el 28-mar-2027 a la 01:00 UTC", () => {
    assert.equal(desfaseMinutos(new Date("2026-10-25T00:59:59Z"), ZONA), 120);
    assert.equal(desfaseMinutos(new Date("2026-10-25T01:00:00Z"), ZONA), 60);
    assert.equal(desfaseMinutos(new Date("2027-03-28T00:59:59Z"), ZONA), 60);
    assert.equal(desfaseMinutos(new Date("2027-03-28T01:00:00Z"), ZONA), 120);
  });

  it("no se deja engañar por los milisegundos", () => {
    assert.equal(desfaseMinutos(new Date("2026-07-01T12:00:00.750Z"), ZONA), 120);
  });
});

describe("enZona", () => {
  it("descompone un instante en la hora del salón", () => {
    assert.deepEqual(enZona(new Date("2026-10-15T22:30:00Z"), ZONA), {
      anio: 2026,
      mes: 10,
      dia: 16,
      hora: 0,
      minuto: 30,
      diaSemana: 5,
    });
    // Las 02:30 del 25 de octubre ocurren dos veces; la segunda ya es hora de invierno.
    const repetida = enZona(new Date("2026-10-25T01:30:00Z"), ZONA);
    assert.deepEqual([repetida.dia, repetida.hora, repetida.minuto, repetida.diaSemana], [25, 2, 30, 7]);
  });
});

describe("instanteEnZona", () => {
  it("las nueve y media siguen siendo las nueve y media a los dos lados del cambio", () => {
    assert.equal(instanteEnZona(2026, 10, 24, 9, 30, ZONA).toISOString(), "2026-10-24T07:30:00.000Z");
    assert.equal(instanteEnZona(2026, 10, 25, 9, 30, ZONA).toISOString(), "2026-10-25T08:30:00.000Z");
    assert.equal(instanteEnZona(2027, 3, 27, 9, 30, ZONA).toISOString(), "2027-03-27T08:30:00.000Z");
    assert.equal(instanteEnZona(2027, 3, 28, 9, 30, ZONA).toISOString(), "2027-03-28T07:30:00.000Z");
  });

  it("es la inversa de enZona", () => {
    for (const iso of ["2026-10-19T06:00:00Z", "2026-12-31T23:15:00Z", "2027-03-28T15:45:00Z"]) {
      const instante = new Date(iso);
      const l = enZona(instante, ZONA);
      assert.equal(instanteEnZona(l.anio, l.mes, l.dia, l.hora, l.minuto, ZONA).toISOString(), instante.toISOString());
    }
  });
});

describe("minutosDeHhMm", () => {
  it("convierte HH:MM a minutos y rechaza lo demás", () => {
    assert.equal(minutosDeHhMm("09:30"), 570);
    assert.equal(minutosDeHhMm("9:05"), 545);
    assert.equal(minutosDeHhMm(" 19:30 "), 1170);
    assert.equal(minutosDeHhMm("00:00"), 0);
    assert.throws(() => minutosDeHhMm("24:00"));
    assert.throws(() => minutosDeHhMm("09:60"));
    assert.throws(() => minutosDeHhMm("9h30"));
    assert.throws(() => minutosDeHhMm(""));
  });
});

describe("fechas civiles", () => {
  it("fechaLocal es el día del salón, no el de UTC", () => {
    assert.equal(fechaLocal(new Date("2026-10-15T22:30:00Z"), ZONA), "2026-10-16");
    assert.equal(fechaLocal(new Date("2026-01-15T23:30:00Z"), ZONA), "2026-01-16");
    assert.equal(fechaLocal(new Date("2026-10-15T21:59:59Z"), ZONA), "2026-10-15");
    assert.equal(fechaLocal(new Date("2026-10-15T22:30:00Z"), "UTC"), "2026-10-15");
  });

  it("descomponerFechaLocal exige una fecha real con el formato exacto", () => {
    assert.deepEqual(descomponerFechaLocal("2026-10-05"), { anio: 2026, mes: 10, dia: 5 });
    assert.deepEqual(descomponerFechaLocal(" 2024-02-29 "), { anio: 2024, mes: 2, dia: 29 });
    assert.throws(() => descomponerFechaLocal("2026-02-29"));
    assert.throws(() => descomponerFechaLocal("2026-02-31"));
    assert.throws(() => descomponerFechaLocal("2026-13-01"));
    assert.throws(() => descomponerFechaLocal("2026-2-3"));
    assert.throws(() => descomponerFechaLocal("19/10/2026"));
    assert.throws(() => descomponerFechaLocal("2026-10-19T00:00:00Z"));
  });

  it("formatearFechaLocal rellena con ceros", () => {
    assert.equal(formatearFechaLocal({ anio: 2027, mes: 3, dia: 8 }), "2027-03-08");
  });

  it("desplazarFechaLocal pasa de mes y de año sin mirar la zona", () => {
    assert.equal(desplazarFechaLocal("2026-10-31", 1), "2026-11-01");
    assert.equal(desplazarFechaLocal("2026-12-31", 1), "2027-01-01");
    assert.equal(desplazarFechaLocal("2026-03-01", -1), "2026-02-28");
    assert.equal(desplazarFechaLocal("2026-10-19", 44), "2026-12-02");
    assert.equal(desplazarFechaLocal("2026-10-19", 0), "2026-10-19");
  });

  it("diaSemanaIso: lunes 1 ... domingo 7", () => {
    assert.equal(diaSemanaIso("2026-10-15"), 4);
    assert.equal(diaSemanaIso("2026-10-19"), 1);
    assert.equal(diaSemanaIso("2026-10-24"), 6);
    assert.equal(diaSemanaIso("2026-10-25"), 7);
    assert.equal(diaSemanaIso("2027-03-28"), 7);
    assert.throws(() => diaSemanaIso("hoy"));
  });
});
