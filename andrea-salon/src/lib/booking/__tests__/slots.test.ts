/**
 * Los huecos que se le ofrecen a la clienta.
 *
 * Es el cálculo del que depende que una cita exista o se pise con otra, así
 * que se prueba con fechas concretas y comprobando el instante exacto, no solo
 * que "haya algo". Incluye los dos cambios de hora que caen dentro del primer
 * medio año del salón (25-oct-2026 y 28-mar-2027), que es donde una agenda
 * mal hecha empieza a dar citas corridas sin que nadie se entere hasta que
 * llega una clienta a deshora.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AgendaInvalidaError, calcularHuecos, diasConHueco, duracionTotal, fusionar, huecosDelDia } from "../slots";
import { descomponerFechaLocal, desfaseMinutos, enZona, fechaLocal, instanteEnZona, minutosDeHhMm } from "../tz";
import type { EntradaHuecos, Franja, Hueco, Intervalo } from "../types";

const ZONA = "Europe/Madrid";
const MIN = 60_000;

/** Lunes a viernes, mañana y tarde: la franja partida típica de un salón. */
const HORARIO_LABORABLE: readonly Franja[] = ([1, 2, 3, 4, 5] as const).flatMap((dia) => [
  { dia, desde: "09:30", hasta: "13:30" },
  { dia, desde: "15:30", hasta: "19:30" },
]);

/** Solo mañanas, los siete días: para mirar los domingos del cambio de hora. */
const TODOS_LOS_DIAS: readonly Franja[] = ([1, 2, 3, 4, 5, 6, 7] as const).map((dia) => ({
  dia,
  desde: "09:30",
  hasta: "13:30",
}));

function entrada(cambios: Partial<EntradaHuecos> = {}): EntradaHuecos {
  return {
    // Lunes 19 de octubre de 2026, 06:00 UTC = 08:00 en Madrid (horario de verano).
    ahora: new Date("2026-10-19T06:00:00Z"),
    zona: ZONA,
    horizonteDias: 45,
    antelacionMin: 120,
    pasoMin: 15,
    servicios: [{ duracionMin: 30, bufferMin: 0 }],
    profesionales: [{ id: "ana", franjas: HORARIO_LABORABLE }],
    ocupado: {},
    cierres: [],
    ...cambios,
  };
}

/** El instante en el que el reloj del salón marca esa fecha y esa hora. */
function en(fecha: string, hhmm: string): Date {
  const { anio, mes, dia } = descomponerFechaLocal(fecha);
  const minutos = minutosDeHhMm(hhmm);
  return instanteEnZona(anio, mes, dia, Math.floor(minutos / 60), minutos % 60, ZONA);
}

function tramo(fecha: string, desde: string, hasta: string): Intervalo {
  return { desde: en(fecha, desde), hasta: en(fecha, hasta) };
}

/** "10:00", en hora local. */
function hora(instante: Date): string {
  const l = enZona(instante, ZONA);
  return `${String(l.hora).padStart(2, "0")}:${String(l.minuto).padStart(2, "0")}`;
}

/** "2026-10-19 10:00", en hora local. */
function texto(instante: Date): string {
  return `${fechaLocal(instante, ZONA)} ${hora(instante)}`;
}

function delDia(huecos: readonly Hueco[], fecha: string): Hueco[] {
  return huecos.filter((h) => fechaLocal(h.inicio, ZONA) === fecha);
}

describe("duracionTotal", () => {
  it("suma las duraciones y solo cuenta el buffer del último servicio", () => {
    assert.deepEqual(duracionTotal([{ duracionMin: 30, bufferMin: 10 }, { duracionMin: 45, bufferMin: 15 }]), {
      minutos: 75,
      bufferFinal: 15,
    });
    assert.deepEqual(duracionTotal([{ duracionMin: 30, bufferMin: 10 }, { duracionMin: 45, bufferMin: 0 }]), {
      minutos: 75,
      bufferFinal: 0,
    });
    assert.deepEqual(duracionTotal([{ duracionMin: 20, bufferMin: 5 }]), { minutos: 20, bufferFinal: 5 });
  });

  it("avisa si no hay servicios o alguno tiene una duración o un buffer imposibles", () => {
    assert.throws(() => duracionTotal([]), AgendaInvalidaError);
    assert.throws(() => duracionTotal([{ duracionMin: 0, bufferMin: 0 }]), AgendaInvalidaError);
    assert.throws(() => duracionTotal([{ duracionMin: 4, bufferMin: 0 }]), AgendaInvalidaError);
    assert.throws(() => duracionTotal([{ duracionMin: 30.5, bufferMin: 0 }]), AgendaInvalidaError);
    assert.throws(() => duracionTotal([{ duracionMin: 30, bufferMin: -5 }]), AgendaInvalidaError);
  });
});

describe("fusionar", () => {
  it("une los tramos que se solapan o se tocan y descarta los vacíos", () => {
    const unidos = fusionar([
      tramo("2026-10-19", "11:00", "12:00"),
      tramo("2026-10-19", "10:00", "11:00"),
      tramo("2026-10-19", "11:30", "12:30"),
      tramo("2026-10-19", "15:00", "15:00"),
      tramo("2026-10-19", "16:00", "17:00"),
    ]);
    assert.deepEqual(
      unidos.map((t) => `${hora(t.desde)}-${hora(t.hasta)}`),
      ["10:00-12:30", "16:00-17:00"],
    );
  });
});

describe("calcularHuecos", () => {
  it("no ofrece nada fuera de las franjas ni en fin de semana, y nada antes de ahora", () => {
    const e = entrada({ antelacionMin: 0, servicios: [{ duracionMin: 60, bufferMin: 0 }] });
    const huecos = calcularHuecos(e);
    assert.ok(huecos.length > 0, "con la agenda vacía tiene que haber huecos");

    for (const hueco of huecos) {
      const l = enZona(hueco.inicio, ZONA);
      const minutos = l.hora * 60 + l.minuto;
      const dentro =
        (minutos >= 9 * 60 + 30 && minutos + 60 <= 13 * 60 + 30) ||
        (minutos >= 15 * 60 + 30 && minutos + 60 <= 19 * 60 + 30);
      assert.ok(dentro, `${texto(hueco.inicio)} cae fuera del horario`);
      assert.ok(l.diaSemana >= 1 && l.diaSemana <= 5, `${texto(hueco.inicio)} es fin de semana`);
      assert.ok(hueco.inicio.getTime() >= e.ahora.getTime(), "nada antes de ahora");
      assert.equal(hueco.staffId, "ana");
      assert.equal(hueco.candidatas, undefined, "calcularHuecos no rellena candidatas");
    }
  });

  it("respeta la franja partida: el último hueco de la mañana acaba al cerrar y nada cae en la pausa", () => {
    const horas = delDia(
      calcularHuecos(entrada({ antelacionMin: 0, servicios: [{ duracionMin: 60, bufferMin: 0 }] })),
      "2026-10-19",
    ).map((h) => hora(h.inicio));

    assert.ok(horas.includes("12:30"), "12:30 + 60 min = 13:30, justo al cierre de la mañana");
    assert.ok(!horas.includes("12:45"), "12:45 + 60 min se pasa de las 13:30");
    assert.ok(!horas.includes("13:30") && !horas.includes("14:00") && !horas.includes("15:00"), "en la pausa no hay nada");
    assert.ok(horas.includes("15:30"), "la tarde empieza a las 15:30");
    assert.ok(horas.includes("18:30") && !horas.includes("18:45"), "y acaba a las 19:30");
  });

  it("solo el buffer del último servicio cuenta, y cuenta tanto para el cierre como para el choque", () => {
    const e = entrada({
      antelacionMin: 0,
      servicios: [
        { duracionMin: 30, bufferMin: 10 },
        { duracionMin: 45, bufferMin: 15 },
      ],
    });
    const lunes = delDia(calcularHuecos(e), "2026-10-19");
    for (const h of lunes) {
      assert.equal((h.fin.getTime() - h.inicio.getTime()) / MIN, 90, "30 + 45 + buffer final 15");
    }
    const horas = lunes.map((h) => hora(h.inicio));
    assert.ok(horas.includes("12:00"), "12:00 + 90 = 13:30, cabe");
    assert.ok(!horas.includes("12:15"), "12:15 + 90 no cabe antes de las 13:30");

    // Con una cita a las 11:00, el bloque [10:15, 11:00) cabe y el [10:30, 11:15) no.
    const conCita = entrada({
      antelacionMin: 0,
      servicios: [{ duracionMin: 30, bufferMin: 15 }],
      ocupado: { ana: [tramo("2026-10-19", "11:00", "12:00")] },
    });
    const horasConCita = delDia(calcularHuecos(conCita), "2026-10-19").map((h) => hora(h.inicio));
    assert.ok(horasConCita.includes("10:15"));
    assert.ok(!horasConCita.includes("10:30"), "el buffer también choca con la cita siguiente");
  });

  it("respeta la antelación mínima", () => {
    // 08:00 local + 2 h = 10:00. El salón abre a las 9:30, pero 9:30 y 9:45 quedan fuera.
    const primero = calcularHuecos(entrada({ antelacionMin: 120 }))[0];
    assert.ok(primero);
    assert.equal(texto(primero.inicio), "2026-10-19 10:00");

    const sinAntelacion = calcularHuecos(entrada({ antelacionMin: 0 }))[0];
    assert.ok(sinAntelacion);
    assert.equal(texto(sinAntelacion.inicio), "2026-10-19 09:30");

    // Una antelación negativa (despiste en la configuración) vale lo mismo que ninguna.
    const negativa = calcularHuecos(entrada({ antelacionMin: -30 }))[0];
    assert.ok(negativa);
    assert.equal(texto(negativa.inicio), "2026-10-19 09:30");
  });

  it("prueba comienzos cada pasoMin", () => {
    const cada15 = delDia(calcularHuecos(entrada({ pasoMin: 15 })), "2026-10-19").map((h) => hora(h.inicio));
    assert.deepEqual(cada15.slice(0, 4), ["10:00", "10:15", "10:30", "10:45"]);

    const cada30 = delDia(calcularHuecos(entrada({ pasoMin: 30 })), "2026-10-19").map((h) => hora(h.inicio));
    assert.deepEqual(cada30.slice(0, 4), ["10:00", "10:30", "11:00", "11:30"]);
  });

  it("una cita ya puesta parte el día", () => {
    const e = entrada({ antelacionMin: 0, ocupado: { ana: [tramo("2026-10-19", "11:00", "12:00")] } });
    const horas = delDia(calcularHuecos(e), "2026-10-19").map((h) => hora(h.inicio));

    assert.ok(horas.includes("10:30"), "acaba justo cuando empieza la cita: cabe");
    assert.ok(!horas.includes("10:45"), "se le solapa por el principio");
    assert.ok(!horas.includes("11:00"), "es la propia cita");
    assert.ok(!horas.includes("11:30") && !horas.includes("11:45"), "empiezan dentro de la cita");
    assert.ok(horas.includes("12:00"), "justo al acabar sí");

    // Y el martes no se entera.
    assert.ok(delDia(calcularHuecos(e), "2026-10-20").map((h) => hora(h.inicio)).includes("11:00"));
  });

  it("dos citas que se solapan no descuadran el cálculo", () => {
    const e = entrada({
      antelacionMin: 0,
      ocupado: { ana: [tramo("2026-10-19", "10:00", "11:00"), tramo("2026-10-19", "10:30", "12:00")] },
    });
    const horas = delDia(calcularHuecos(e), "2026-10-19").map((h) => hora(h.inicio));
    assert.ok(!horas.includes("11:30"), "sigue ocupado hasta las 12");
    assert.ok(horas.includes("12:00"), "y libre a partir de ahí");
  });

  it("un cierre del salón anula el día para todas; uno parcial, solo ese rato", () => {
    const e = entrada({
      antelacionMin: 0,
      profesionales: [
        { id: "ana", franjas: HORARIO_LABORABLE },
        { id: "bea", franjas: HORARIO_LABORABLE },
      ],
      cierres: [
        // Martes 20 entero (de medianoche a medianoche, hora local).
        { desde: en("2026-10-20", "00:00"), hasta: en("2026-10-21", "00:00") },
        // Miércoles 21 por la tarde.
        tramo("2026-10-21", "15:30", "19:30"),
      ],
    });
    const huecos = calcularHuecos(e);
    assert.equal(delDia(huecos, "2026-10-20").length, 0, "el martes no hay nada para nadie");

    const miercoles = delDia(huecos, "2026-10-21").map((h) => hora(h.inicio));
    assert.ok(miercoles.includes("09:30"), "la mañana del miércoles sigue");
    assert.ok(!miercoles.some((h) => h >= "15:30"), "la tarde del miércoles no");

    assert.ok(delDia(huecos, "2026-10-22").length > 0, "el jueves es normal");
  });

  it("devuelve los huecos ordenados por hora y, a igual hora, por el orden de las profesionales", () => {
    const e = entrada({
      antelacionMin: 0,
      horizonteDias: 3,
      profesionales: [
        { id: "bea", franjas: HORARIO_LABORABLE },
        { id: "ana", franjas: HORARIO_LABORABLE },
      ],
    });
    const huecos = calcularHuecos(e);
    for (let i = 1; i < huecos.length; i++) {
      const anterior = huecos[i - 1];
      const actual = huecos[i];
      assert.ok(anterior && actual);
      assert.ok(actual.inicio.getTime() >= anterior.inicio.getTime(), "de antes a después");
      if (actual.inicio.getTime() === anterior.inicio.getTime()) {
        assert.deepEqual([anterior.staffId, actual.staffId], ["bea", "ana"]);
      }
    }
  });

  it("sin profesionales no hay huecos, sin error", () => {
    assert.deepEqual(calcularHuecos(entrada({ profesionales: [] })), []);
  });

  it("avisa de un horario o una configuración imposibles", () => {
    const invertida = entrada({ profesionales: [{ id: "ana", franjas: [{ dia: 1, desde: "16:00", hasta: "09:00" }] }] });
    assert.throws(() => calcularHuecos(invertida), AgendaInvalidaError);

    const malEscrita = entrada({ profesionales: [{ id: "ana", franjas: [{ dia: 1, desde: "9h30", hasta: "13:30" }] }] });
    assert.throws(() => calcularHuecos(malEscrita), AgendaInvalidaError);

    assert.throws(() => calcularHuecos(entrada({ servicios: [{ duracionMin: 0, bufferMin: 0 }] })), AgendaInvalidaError);
    assert.throws(() => calcularHuecos(entrada({ servicios: [] })), AgendaInvalidaError);
    assert.throws(() => calcularHuecos(entrada({ pasoMin: 0 })), AgendaInvalidaError);
    assert.throws(() => calcularHuecos(entrada({ horizonteDias: 0 })), AgendaInvalidaError);
    assert.throws(() => calcularHuecos(entrada({ desde: "19/10/2026" })), AgendaInvalidaError);
  });
});

describe("el horizonte", () => {
  // Lunes 19-oct + 44 días = miércoles 2-dic: el día 45 contando hoy.
  const ULTIMO_DIA = "2026-12-02";
  const DIA_46 = "2026-12-03";

  it("abarca exactamente horizonteDias contando hoy", () => {
    const e = entrada({ horizonteDias: 45 });
    const dias = diasConHueco(e);
    assert.equal(dias.length, 45);
    assert.equal(dias[0]?.fecha, "2026-10-19");
    assert.equal(dias[44]?.fecha, ULTIMO_DIA);

    assert.ok(huecosDelDia(e, ULTIMO_DIA).length > 0, "el día 45 todavía se ofrece");
    assert.equal(huecosDelDia(e, DIA_46).length, 0, "el 46 (un jueves laborable) ya no");

    const todos = calcularHuecos(e);
    const ultimo = todos[todos.length - 1];
    assert.ok(ultimo);
    assert.equal(fechaLocal(ultimo.inicio, ZONA), ULTIMO_DIA);
  });

  it("la ventana pedida se recorta a [hoy, horizonte)", () => {
    const e = entrada({ horizonteDias: 45, antelacionMin: 0 });

    const fechasDic = new Set(calcularHuecos({ ...e, desde: "2026-12-01", dias: 10 }).map((h) => fechaLocal(h.inicio, ZONA)));
    assert.deepEqual([...fechasDic].sort(), ["2026-12-01", ULTIMO_DIA]);

    // Una ventana que empieza en el pasado se recorta a hoy; una que acaba en el pasado queda vacía.
    const desdeElPasado = calcularHuecos({ ...e, desde: "2026-10-10" });
    assert.ok(desdeElPasado.length > 0);
    assert.equal(fechaLocal(desdeElPasado[0]!.inicio, ZONA), "2026-10-19", "lo de antes de hoy no existe");
    assert.equal(fechaLocal(desdeElPasado[desdeElPasado.length - 1]!.inicio, ZONA), "2026-11-23", "10-oct + 44 días");
    assert.deepEqual(calcularHuecos({ ...e, desde: "2026-10-10", dias: 3 }), []);

    assert.deepEqual(huecosDelDia(e, "2026-10-18"), [], "ayer no se puede reservar");
    assert.deepEqual(diasConHueco({ ...e, desde: "2026-10-21", dias: 2 }).map((d) => d.fecha), ["2026-10-21", "2026-10-22"]);
    assert.deepEqual(calcularHuecos({ ...e, desde: DIA_46 }), []);
  });
});

describe("diasConHueco", () => {
  it("marca los días sin horario, los cerrados y los llenos como sin huecos", () => {
    const e = entrada({
      horizonteDias: 7,
      cierres: [{ desde: en("2026-10-21", "00:00"), hasta: en("2026-10-22", "00:00") }],
      ocupado: { ana: [tramo("2026-10-22", "09:30", "13:30"), tramo("2026-10-22", "15:30", "19:30")] },
    });
    const porFecha = new Map(diasConHueco(e).map((d) => [d.fecha, d.hayHuecos]));
    assert.equal(porFecha.size, 7);
    assert.equal(porFecha.get("2026-10-19"), true, "lunes normal");
    assert.equal(porFecha.get("2026-10-21"), false, "cerrado");
    assert.equal(porFecha.get("2026-10-22"), false, "lleno de citas");
    assert.equal(porFecha.get("2026-10-24"), false, "sábado sin horario");
    assert.equal(porFecha.get("2026-10-25"), false, "domingo sin horario");
  });

  it("hoy deja de tener huecos cuando ya no queda nada por delante", () => {
    // Lunes 19 a las 18:00 UTC = 20:00 local: el salón ya cerró.
    const dias = diasConHueco(entrada({ ahora: new Date("2026-10-19T18:00:00Z"), horizonteDias: 2 }));
    assert.deepEqual(dias, [
      { fecha: "2026-10-19", hayHuecos: false },
      { fecha: "2026-10-20", hayHuecos: true },
    ]);
  });
});

describe("huecosDelDia", () => {
  it("con dos profesionales devuelve una entrada por hora y lista las candidatas", () => {
    const e = entrada({
      antelacionMin: 0,
      profesionales: [
        { id: "ana", franjas: HORARIO_LABORABLE },
        { id: "bea", franjas: HORARIO_LABORABLE },
      ],
      ocupado: { bea: [tramo("2026-10-19", "10:00", "11:00")] },
    });
    const huecos = huecosDelDia(e, "2026-10-19");

    // 15 comienzos por la mañana y 15 por la tarde. Sin deduplicar serían 55:
    // 30 de ana y 25 de bea, que pierde de 09:45 (acabaría a las 10:15) a 10:45.
    assert.equal(huecos.length, 30);
    assert.equal(calcularHuecos({ ...e, desde: "2026-10-19", dias: 1 }).length, 55);
    assert.equal(new Set(huecos.map((h) => h.inicio.getTime())).size, 30, "ningún inicio repetido");
    for (let i = 1; i < huecos.length; i++) {
      assert.ok((huecos[i]?.inicio.getTime() ?? 0) > (huecos[i - 1]?.inicio.getTime() ?? 0), "ordenados");
    }

    const porHora = new Map(huecos.map((h) => [hora(h.inicio), h]));
    assert.equal(porHora.get("09:30")?.staffId, "ana");
    assert.deepEqual(porHora.get("09:30")?.candidatas, ["ana", "bea"]);
    for (const h of ["09:45", "10:00", "10:15", "10:30", "10:45"]) {
      assert.equal(porHora.get(h)?.staffId, "ana", `${h}: bea está ocupada`);
      assert.deepEqual(porHora.get(h)?.candidatas, ["ana"]);
    }
    assert.deepEqual(porHora.get("11:00")?.candidatas, ["ana", "bea"]);
  });

  it("la primera candidata es la primera que puede, no siempre la primera de la lista", () => {
    const e = entrada({
      antelacionMin: 0,
      profesionales: [
        { id: "ana", franjas: HORARIO_LABORABLE },
        { id: "bea", franjas: HORARIO_LABORABLE },
      ],
      ocupado: { ana: [tramo("2026-10-19", "10:00", "11:00")] },
    });
    const alas10 = huecosDelDia(e, "2026-10-19").find((h) => hora(h.inicio) === "10:00");
    assert.ok(alas10);
    assert.equal(alas10.staffId, "bea");
    assert.deepEqual(alas10.candidatas, ["bea"]);
  });

  it("con una sola profesional también rellena candidatas", () => {
    const huecos = huecosDelDia(entrada(), "2026-10-19");
    assert.ok(huecos.length > 0);
    for (const h of huecos) assert.deepEqual(h.candidatas, ["ana"]);
  });

  it("fuera del horizonte no hay nada y una fecha mal escrita avisa", () => {
    assert.deepEqual(huecosDelDia(entrada({ horizonteDias: 3 }), "2026-10-22"), []);
    assert.throws(() => huecosDelDia(entrada(), "2026-02-31"), AgendaInvalidaError);
    assert.throws(() => huecosDelDia(entrada(), "hoy"), AgendaInvalidaError);
  });
});

describe("el cambio de hora", () => {
  it("en 2026 el reloj se atrasa el domingo 25 de octubre y en 2027 se adelanta el domingo 28 de marzo", () => {
    // Si esto fallara, la zona horaria del entorno no tiene reglas europeas y
    // el resto de este bloque no probaría nada.
    assert.equal(desfaseMinutos(new Date("2026-10-24T10:00:00Z"), ZONA), 120);
    assert.equal(desfaseMinutos(new Date("2026-10-25T10:00:00Z"), ZONA), 60);
    assert.equal(desfaseMinutos(new Date("2027-03-27T10:00:00Z"), ZONA), 60);
    assert.equal(desfaseMinutos(new Date("2027-03-28T10:00:00Z"), ZONA), 120);
    assert.equal(enZona(new Date("2026-10-25T12:00:00Z"), ZONA).diaSemana, 7);
    assert.equal(enZona(new Date("2027-03-28T12:00:00Z"), ZONA).diaSemana, 7);
  });

  it("octubre de 2026: el día de 25 horas ofrece las mismas horas locales, en los instantes de invierno", () => {
    // Sábado 24 a las 06:00 UTC (08:00 local), tres días: sábado, el domingo del cambio y el lunes.
    const e = entrada({
      ahora: new Date("2026-10-24T06:00:00Z"),
      antelacionMin: 0,
      horizonteDias: 3,
      profesionales: [{ id: "ana", franjas: TODOS_LOS_DIAS }],
    });
    const huecos = calcularHuecos(e);
    const sabado = delDia(huecos, "2026-10-24");
    const domingo = delDia(huecos, "2026-10-25");
    const lunes = delDia(huecos, "2026-10-26");

    assert.equal(sabado.length, 15, "de 09:30 a 13:00 cada cuarto de hora");
    assert.deepEqual(domingo.map((h) => hora(h.inicio)), sabado.map((h) => hora(h.inicio)), "las mismas horas locales");
    assert.deepEqual(lunes.map((h) => hora(h.inicio)), sabado.map((h) => hora(h.inicio)));

    assert.equal(sabado[0]?.inicio.toISOString(), "2026-10-24T07:30:00.000Z", "09:30 de verano");
    assert.equal(domingo[0]?.inicio.toISOString(), "2026-10-25T08:30:00.000Z", "09:30 de invierno: el cambio fue a las 03:00");
    assert.equal(lunes[0]?.inicio.toISOString(), "2026-10-26T08:30:00.000Z");

    // Entre un hueco y el siguiente siguen pasando quince minutos de reloj.
    for (let i = 1; i < domingo.length; i++) {
      assert.equal((domingo[i]!.inicio.getTime() - domingo[i - 1]!.inicio.getTime()) / MIN, 15);
    }
    assert.deepEqual(diasConHueco(e).map((d) => d.fecha), ["2026-10-24", "2026-10-25", "2026-10-26"]);
  });

  it("marzo de 2027: el día de 23 horas ofrece las mismas horas locales, en los instantes de verano", () => {
    // Sábado 27 a las 07:00 UTC (08:00 local, invierno), tres días.
    const e = entrada({
      ahora: new Date("2027-03-27T07:00:00Z"),
      antelacionMin: 0,
      horizonteDias: 3,
      profesionales: [{ id: "ana", franjas: TODOS_LOS_DIAS }],
    });
    const huecos = calcularHuecos(e);
    const sabado = delDia(huecos, "2027-03-27");
    const domingo = delDia(huecos, "2027-03-28");
    const lunes = delDia(huecos, "2027-03-29");

    assert.equal(sabado.length, 15);
    assert.deepEqual(domingo.map((h) => hora(h.inicio)), sabado.map((h) => hora(h.inicio)));
    assert.deepEqual(lunes.map((h) => hora(h.inicio)), sabado.map((h) => hora(h.inicio)));

    assert.equal(sabado[0]?.inicio.toISOString(), "2027-03-27T08:30:00.000Z", "09:30 de invierno");
    assert.equal(domingo[0]?.inicio.toISOString(), "2027-03-28T07:30:00.000Z", "09:30 de verano: el cambio fue a las 02:00");
    assert.equal(lunes[0]?.inicio.toISOString(), "2027-03-29T07:30:00.000Z");
    assert.deepEqual(diasConHueco(e).map((d) => d.fecha), ["2027-03-27", "2027-03-28", "2027-03-29"]);
  });

  it("la agenda de la semana del cambio no se corre una hora", () => {
    // Viernes 23 a las 06:00 UTC (08:00 local), cuatro días: cruza el domingo del cambio y llega al lunes 26.
    const huecos = calcularHuecos(entrada({ ahora: new Date("2026-10-23T06:00:00Z"), antelacionMin: 0, horizonteDias: 4 }));
    const lunes = delDia(huecos, "2026-10-26");
    assert.ok(lunes.length > 0, "el lunes de después del cambio tiene que tener huecos");
    assert.equal(texto(lunes[0]!.inicio), "2026-10-26 09:30");
    assert.equal(lunes[0]!.inicio.toISOString(), "2026-10-26T08:30:00.000Z", "el instante de invierno, no el de verano");
  });

  it("una cita guardada en UTC sigue bloqueando la hora local correcta después del cambio", () => {
    // Lunes 26 de 11:00 a 12:00 local = 10:00-11:00 UTC ya en invierno.
    const e = entrada({
      ahora: new Date("2026-10-23T06:00:00Z"),
      antelacionMin: 0,
      horizonteDias: 4,
      ocupado: { ana: [{ desde: new Date("2026-10-26T10:00:00Z"), hasta: new Date("2026-10-26T11:00:00Z") }] },
    });
    const horas = delDia(calcularHuecos(e), "2026-10-26").map((h) => hora(h.inicio));
    assert.ok(horas.includes("10:30") && !horas.includes("11:00") && !horas.includes("11:45") && horas.includes("12:00"));
  });
});
