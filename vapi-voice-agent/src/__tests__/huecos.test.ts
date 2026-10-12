/**
 * Los huecos que se le ofrecen al paciente.
 *
 * Es el calculo del que depende que una cita exista o se pise con otra, asi
 * que se prueba con fechas concretas y comprobando el instante exacto, no solo
 * que "haya algo". Incluye el cambio de hora, que es donde una agenda mal
 * hecha empieza a dar citas corridas sin que nadie se entere hasta que llega
 * un paciente a deshora.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calcularHuecos, repartirHuecos, AgendaInvalidaError } from "../citas/huecos";
import type { Intervalo } from "../citas/huecos";
import type { Clinica, TipoCita } from "../db/clinica";
import { enZona, instanteEnZona, desfaseMinutos } from "../util/zona";

const LIMPIEZA: TipoCita = {
  id: "limpieza",
  nombre: "una limpieza",
  descripcion: "higiene dental",
  minutos: 30,
};

function clinicaDePrueba(cambios: Partial<Clinica["agenda"]> = {}): Clinica {
  return {
    modo: "citas",
    id: "prueba",
    nombre: "Clinica de prueba",
    ciudad: "Ourense",
    direccion: "Rua Falsa 1",
    zonaHoraria: "Europe/Madrid",
    tipoLabel: "clinica dental",
    horario: { texto: "de lunes a viernes", diaCierre: "sabado y domingo" },
    tiposCita: [LIMPIEZA],
    agenda: {
      calendarId: "prueba@group.calendar.google.com",
      // Lunes a viernes, manana y tarde.
      franjas: [1, 2, 3, 4, 5].flatMap((dia) => [
        { dia, desde: "09:00", hasta: "13:30" },
        { dia, desde: "16:00", hasta: "20:00" },
      ]),
      margenMinutos: 0,
      antelacionMinimaHoras: 2,
      diasVista: 3,
      huecosPorTanda: 3,
      pasoMinutos: 15,
      ...cambios,
    },
    urgencias: { telefono: "988 00 00 00", queDecir: "Llame a urgencias." },
    emailCitas: "",
  };
}

/** Atajo para leer un hueco como "19/10 10:00". */
function comoTexto(instante: Date): string {
  const l = enZona(instante, "Europe/Madrid");
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${dos(l.dia)}/${dos(l.mes)} ${dos(l.hora)}:${dos(l.minuto)}`;
}

describe("calcularHuecos", () => {
  it("no ofrece nada fuera del horario de la clinica", () => {
    // Lunes 19 de octubre de 2026, 06:00 UTC = 08:00 en Madrid.
    const ahora = new Date("2026-10-19T06:00:00Z");
    const huecos = calcularHuecos({
      clinica: clinicaDePrueba(),
      tipoCita: LIMPIEZA,
      ocupado: [],
      ahora,
    });

    for (const hueco of huecos) {
      const l = enZona(hueco.inicio, "Europe/Madrid");
      const minutos = l.hora * 60 + l.minuto;
      const dentro =
        (minutos >= 9 * 60 && minutos + 30 <= 13 * 60 + 30) ||
        (minutos >= 16 * 60 && minutos + 30 <= 20 * 60);
      assert.ok(dentro, `${comoTexto(hueco.inicio)} cae fuera del horario`);
      assert.ok(l.diaSemana >= 1 && l.diaSemana <= 5, "no deberia haber huecos en fin de semana");
    }
    assert.ok(huecos.length > 0, "con la agenda vacia tiene que haber huecos");
  });

  it("respeta la antelacion minima", () => {
    const ahora = new Date("2026-10-19T06:00:00Z"); // 08:00 local
    const huecos = calcularHuecos({
      clinica: clinicaDePrueba({ antelacionMinimaHoras: 2 }),
      tipoCita: LIMPIEZA,
      ocupado: [],
      ahora,
    });
    const primero = huecos[0];
    assert.ok(primero);
    // 08:00 + 2h = 10:00 local. La clinica abre a las 9, pero las 9 y las 9:45
    // quedan descartadas por la antelacion.
    assert.equal(comoTexto(primero.inicio), "19/10 10:00");
  });

  it("no ofrece un hueco que choca con una cita ya puesta", () => {
    const ahora = new Date("2026-10-19T06:00:00Z");
    // Ocupado de 10:00 a 11:00 local (08:00-09:00 UTC en horario de verano).
    const ocupado: Intervalo[] = [
      { desde: new Date("2026-10-19T08:00:00Z"), hasta: new Date("2026-10-19T09:00:00Z") },
    ];
    const huecos = calcularHuecos({ clinica: clinicaDePrueba(), tipoCita: LIMPIEZA, ocupado, ahora });
    const delLunes = huecos
      .filter((h) => enZona(h.inicio, "Europe/Madrid").dia === 19)
      .map((h) => comoTexto(h.inicio));

    assert.ok(!delLunes.includes("19/10 10:00"), "no puede ofrecer el hueco ocupado");
    assert.ok(!delLunes.includes("19/10 10:30"), "ni el que se le solapa");
    assert.ok(!delLunes.includes("19/10 10:45"), "ni el que empieza dentro");
    assert.ok(delLunes.includes("19/10 11:00"), "justo al acabar si deberia poder");
  });

  it("el margen entre citas se respeta por los dos lados", () => {
    const ahora = new Date("2026-10-19T06:00:00Z");
    const ocupado: Intervalo[] = [
      { desde: new Date("2026-10-19T09:00:00Z"), hasta: new Date("2026-10-19T09:30:00Z") }, // 11:00-11:30
    ];
    const conMargen = calcularHuecos({
      clinica: clinicaDePrueba({ margenMinutos: 15 }),
      tipoCita: LIMPIEZA,
      ocupado,
      ahora,
    }).map((h) => comoTexto(h.inicio));

    assert.ok(!conMargen.includes("19/10 11:30"), "pegado al final, no");
    assert.ok(!conMargen.includes("19/10 10:30"), "pegado al principio, tampoco");
    assert.ok(conMargen.includes("19/10 11:45"), "con el respiro de quince minutos, si");
  });

  it("dos citas ocupadas que se solapan no descuadran el calculo", () => {
    const ahora = new Date("2026-10-19T06:00:00Z");
    const ocupado: Intervalo[] = [
      { desde: new Date("2026-10-19T08:00:00Z"), hasta: new Date("2026-10-19T09:00:00Z") },
      { desde: new Date("2026-10-19T08:30:00Z"), hasta: new Date("2026-10-19T10:00:00Z") },
    ];
    const libres = calcularHuecos({ clinica: clinicaDePrueba(), tipoCita: LIMPIEZA, ocupado, ahora })
      .map((h) => comoTexto(h.inicio));
    assert.ok(!libres.includes("19/10 11:30"), "sigue ocupado hasta las 12");
    assert.ok(libres.includes("19/10 12:00"), "y libre a partir de ahi");
  });

  it("una cita larga no entra donde no cabe", () => {
    const ahora = new Date("2026-10-19T06:00:00Z");
    const larga: TipoCita = { ...LIMPIEZA, id: "endodoncia", nombre: "una endodoncia", minutos: 90 };
    const huecos = calcularHuecos({ clinica: clinicaDePrueba(), tipoCita: larga, ocupado: [], ahora });
    for (const hueco of huecos) {
      const l = enZona(hueco.inicio, "Europe/Madrid");
      const fin = l.hora * 60 + l.minuto + 90;
      assert.ok(fin <= 13 * 60 + 30 || (l.hora >= 16 && fin <= 20 * 60), `${comoTexto(hueco.inicio)} se sale de la franja`);
    }
    // A las 12:15 ya no cabe hora y media antes de las 13:30.
    const manana = huecos.filter((h) => enZona(h.inicio, "Europe/Madrid").hora < 14).map((h) => comoTexto(h.inicio));
    assert.ok(!manana.includes("19/10 12:15"));
    assert.ok(manana.includes("19/10 12:00"));
  });

  it("avisa si la clinica tiene una franja imposible", () => {
    const ahora = new Date("2026-10-19T06:00:00Z");
    const rota = clinicaDePrueba({ franjas: [{ dia: 1, desde: "16:00", hasta: "09:00" }] });
    assert.throws(
      () => calcularHuecos({ clinica: rota, tipoCita: LIMPIEZA, ocupado: [], ahora }),
      AgendaInvalidaError,
    );
  });

  it("avisa si un tipo de cita tiene una duracion imposible", () => {
    const ahora = new Date("2026-10-19T06:00:00Z");
    assert.throws(
      () => calcularHuecos({
        clinica: clinicaDePrueba(),
        tipoCita: { ...LIMPIEZA, minutos: 0 },
        ocupado: [],
        ahora,
      }),
      AgendaInvalidaError,
    );
  });
});

describe("el cambio de hora", () => {
  it("en 2026 el reloj se atrasa el domingo 25 de octubre", () => {
    // Si esto fallara, la zona horaria del entorno no tiene reglas europeas y
    // el resto de este bloque no probaria nada.
    assert.equal(desfaseMinutos(new Date("2026-10-23T10:00:00Z"), "Europe/Madrid"), 120);
    assert.equal(desfaseMinutos(new Date("2026-10-26T10:00:00Z"), "Europe/Madrid"), 60);
  });

  it("las nueve de la manana siguen siendo las nueve despues del cambio", () => {
    // Viernes 23 (todavia en horario de verano): 09:00 local = 07:00 UTC.
    assert.equal(instanteEnZona(2026, 10, 23, 9, 0, "Europe/Madrid").toISOString(), "2026-10-23T07:00:00.000Z");
    // Lunes 26 (ya en invierno): 09:00 local = 08:00 UTC.
    assert.equal(instanteEnZona(2026, 10, 26, 9, 0, "Europe/Madrid").toISOString(), "2026-10-26T08:00:00.000Z");
  });

  it("la agenda de la semana del cambio no se corre una hora", () => {
    // Viernes 23 a las 06:00 UTC (08:00 local), mirando cuatro dias: cruza el
    // domingo del cambio y llega al lunes 26.
    const ahora = new Date("2026-10-23T06:00:00Z");
    const huecos = calcularHuecos({
      clinica: clinicaDePrueba({ diasVista: 4, antelacionMinimaHoras: 0 }),
      tipoCita: LIMPIEZA,
      ocupado: [],
      ahora,
    });

    const delLunes = huecos.filter((h) => enZona(h.inicio, "Europe/Madrid").dia === 26);
    assert.ok(delLunes.length > 0, "el lunes de despues del cambio tiene que tener huecos");

    const primero = delLunes[0];
    assert.ok(primero);
    assert.equal(comoTexto(primero.inicio), "26/10 09:00");
    // Y el instante absoluto tiene que ser el de invierno, no el de verano.
    assert.equal(primero.inicio.toISOString(), "2026-10-26T08:00:00.000Z");
  });
});

describe("repartirHuecos", () => {
  it("no da tres horas seguidas de la misma manana", () => {
    const ahora = new Date("2026-10-19T06:00:00Z");
    const todos = calcularHuecos({ clinica: clinicaDePrueba(), tipoCita: LIMPIEZA, ocupado: [], ahora });
    const tres = repartirHuecos(todos, 3, "Europe/Madrid");

    assert.equal(tres.length, 3);
    const momentos = tres.map((h) => {
      const l = enZona(h.inicio, "Europe/Madrid");
      return `${l.dia}-${l.hora < 14 ? "manana" : "tarde"}`;
    });
    assert.equal(new Set(momentos).size, 3, `deberian ser tres momentos distintos: ${momentos.join(", ")}`);
  });

  it("devuelve los que haya si hay menos de los pedidos", () => {
    const ahora = new Date("2026-10-19T06:00:00Z");
    const todos = calcularHuecos({ clinica: clinicaDePrueba(), tipoCita: LIMPIEZA, ocupado: [], ahora });
    const uno = repartirHuecos(todos.slice(0, 1), 3, "Europe/Madrid");
    assert.equal(uno.length, 1);
    assert.deepEqual(repartirHuecos([], 3, "Europe/Madrid"), []);
  });

  it("los devuelve en orden, aunque los elija salteados", () => {
    const ahora = new Date("2026-10-19T06:00:00Z");
    const todos = calcularHuecos({ clinica: clinicaDePrueba(), tipoCita: LIMPIEZA, ocupado: [], ahora });
    const tres = repartirHuecos(todos, 3, "Europe/Madrid");
    for (let i = 1; i < tres.length; i++) {
      const anterior = tres[i - 1];
      const actual = tres[i];
      assert.ok(anterior && actual);
      assert.ok(actual.inicio.getTime() > anterior.inicio.getTime(), "tienen que ir de antes a despues");
    }
  });
});
