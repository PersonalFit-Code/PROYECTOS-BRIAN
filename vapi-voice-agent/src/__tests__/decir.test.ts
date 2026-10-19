/**
 * Como suena la hora por el altavoz.
 *
 * Se prueba porque es lo unico de todo el sistema que el paciente oye
 * literalmente: un fallo aqui no da un error, da una cita a la hora que no es.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  decirDia,
  decirHora,
  decirMomento,
  decirPrecio,
  describirHuecos,
} from "../citas/decir";

const MADRID = "Europe/Madrid";

describe("decirHora", () => {
  it("las horas en punto", () => {
    assert.equal(decirHora(9, 0), "las nueve de la manana");
    assert.equal(decirHora(13, 0), "la una de la tarde");
    assert.equal(decirHora(16, 0), "las cuatro de la tarde");
    assert.equal(decirHora(21, 0), "las nueve de la noche");
    assert.equal(decirHora(12, 0), "las doce de la manana");
  });

  it("los cuartos y la media, como los dice la gente", () => {
    assert.equal(decirHora(9, 15), "las nueve y cuarto de la manana");
    assert.equal(decirHora(9, 30), "las nueve y media de la manana");
    assert.equal(decirHora(9, 45), "las diez menos cuarto de la manana");
  });

  it("pasada la media se cuenta hacia la hora siguiente", () => {
    assert.equal(decirHora(17, 40), "las seis menos veinte de la tarde");
    assert.equal(decirHora(17, 50), "las seis menos diez de la tarde");
    assert.equal(decirHora(12, 50), "la una menos diez de la tarde");
  });

  it("los minutos sueltos", () => {
    assert.equal(decirHora(10, 5), "las diez y cinco de la manana");
    assert.equal(decirHora(10, 20), "las diez y veinte de la manana");
    assert.equal(decirHora(10, 25), "las diez y veinticinco de la manana");
  });

  it("la parte del dia sigue a la hora que se dice, no a la de partida", () => {
    // 12:45 se dice "la una menos cuarto", y la una es de la tarde.
    assert.equal(decirHora(12, 45), "la una menos cuarto de la tarde");
    // 20:50 se dice "las nueve menos diez", y las nueve es de la noche.
    assert.equal(decirHora(20, 50), "las nueve menos diez de la noche");
  });
});

describe("decirDia", () => {
  const ahora = new Date("2026-10-19T08:00:00Z"); // lunes 19, 10:00 en Madrid

  it("los dias de cerca se dicen por su nombre de cerca", () => {
    assert.equal(decirDia(new Date("2026-10-19T16:00:00Z"), ahora, MADRID), "hoy");
    assert.equal(decirDia(new Date("2026-10-20T08:00:00Z"), ahora, MADRID), "manana");
    assert.equal(decirDia(new Date("2026-10-21T08:00:00Z"), ahora, MADRID), "pasado manana");
  });

  it("dentro de la semana basta con el dia", () => {
    assert.equal(decirDia(new Date("2026-10-22T08:00:00Z"), ahora, MADRID), "el jueves");
    assert.equal(decirDia(new Date("2026-10-23T08:00:00Z"), ahora, MADRID), "el viernes");
  });

  it("pasada la semana hace falta la fecha, o no se sabe de que jueves hablas", () => {
    assert.equal(decirDia(new Date("2026-10-29T08:00:00Z"), ahora, MADRID), "el jueves 29 de octubre");
  });

  it("cuenta dias de calendario, no periodos de 24 horas", () => {
    // Las 23:30 de hoy y las 00:30 de manana estan a una hora, pero son dias
    // distintos y hay que decirlos distinto.
    assert.equal(decirDia(new Date("2026-10-19T21:30:00Z"), ahora, MADRID), "hoy");
    assert.equal(decirDia(new Date("2026-10-19T22:30:00Z"), ahora, MADRID), "manana");
  });
});

describe("decirMomento", () => {
  it("junta dia y hora", () => {
    const ahora = new Date("2026-10-19T08:00:00Z");
    assert.equal(
      decirMomento(new Date("2026-10-20T08:30:00Z"), ahora, MADRID),
      "manana a las diez y media de la manana",
    );
  });
});

describe("describirHuecos", () => {
  const ahora = new Date("2026-10-19T08:00:00Z");

  it("enumera con 'o', porque hay que elegir uno", () => {
    const frase = describirHuecos({
      huecos: [
        { inicio: new Date("2026-10-19T16:00:00Z") },
        { inicio: new Date("2026-10-20T08:00:00Z") },
      ],
      ahora,
      zonaHoraria: MADRID,
      nombreCita: "una limpieza",
    });
    assert.match(frase, /hoy a las seis de la tarde/);
    assert.match(frase, /o \[2\] manana a las diez de la manana/);
  });

  it("cabe en una sola linea, que es lo que Vapi acepta", () => {
    const frase = describirHuecos({
      huecos: [{ inicio: new Date("2026-10-20T08:00:00Z") }],
      ahora,
      zonaHoraria: MADRID,
      nombreCita: "una limpieza",
    });
    assert.ok(!frase.includes("\n"), "no puede llevar saltos de linea");
  });

  it("cuando no hay nada, dice que hacer en vez de dejar al modelo improvisando", () => {
    const frase = describirHuecos({ huecos: [], ahora, zonaHoraria: MADRID, nombreCita: "una limpieza" });
    assert.match(frase, /No queda ningun hueco/);
    assert.match(frase, /telefono/);
  });
});

describe("decirPrecio", () => {
  it("no dice los centimos cuando son cero", () => {
    assert.equal(decirPrecio(1800), "18 euros");
    assert.equal(decirPrecio(0), "0 euros");
  });

  it("dice los centimos cuando los hay, con el cero delante", () => {
    assert.equal(decirPrecio(2250), "22 euros con 50");
    assert.equal(decirPrecio(2205), "22 euros con 05");
  });

  it("no mete nunca un simbolo: el agente no puede leerlos", () => {
    for (const centimos of [0, 5, 100, 1899, 123456]) {
      assert.ok(!/[€,.]/.test(decirPrecio(centimos)), `${centimos} -> ${decirPrecio(centimos)}`);
    }
  });
});
