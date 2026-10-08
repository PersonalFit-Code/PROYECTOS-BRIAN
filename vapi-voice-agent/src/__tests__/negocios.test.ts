/**
 * Validacion de los negocios que llegan de Firestore y utilidades asociadas.
 *
 * Un documento mal formado no puede tumbar una llamada en curso: lo que se
 * comprueba aqui es que los fallos se detectan y se nombran.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { camposQueFaltan } from "../db/businesses";
import { fallbackBusiness } from "../db/fallbackBusiness";
import { EJEMPLOS } from "../db/negociosDeEjemplo";
import { comienzoDelDia } from "../db/orders";
import { buscarPlato } from "../util/carta";
import { formatearEuros, momentoActual } from "../util/format";

/** Copia profunda, para romper una sola cosa sin tocar el original. */
const copia = (): Record<string, unknown> =>
  JSON.parse(JSON.stringify(fallbackBusiness)) as Record<string, unknown>;

describe("camposQueFaltan", () => {
  it("acepta el negocio de ejemplo y los de la plantilla", () => {
    assert.deepEqual(camposQueFaltan(fallbackBusiness), []);
    for (const [clave, negocio] of Object.entries(EJEMPLOS)) {
      assert.deepEqual(camposQueFaltan(negocio), [], `fallo en ${clave}`);
    }
  });

  it("nombra el campo de texto que falta", () => {
    const sinNombre = copia();
    delete sinNombre.nombre;
    assert.deepEqual(camposQueFaltan(sinNombre), ["nombre"]);
  });

  it("no se traga un texto en blanco", () => {
    const enBlanco = copia();
    enBlanco.zonaHoraria = "   ";
    assert.deepEqual(camposQueFaltan(enBlanco), ["zonaHoraria"]);
  });

  it("acepta emailPedidos vacio pero no de otro tipo", () => {
    const vacio = copia();
    vacio.emailPedidos = "";
    assert.deepEqual(camposQueFaltan(vacio), []);

    const numerico = copia();
    numerico.emailPedidos = 42;
    assert.deepEqual(camposQueFaltan(numerico), ["emailPedidos"]);
  });

  it("exige una carta con al menos un plato bien formado", () => {
    const sinCarta = copia();
    sinCarta.carta = [];
    assert.deepEqual(sinCarta.carta, []);
    assert.deepEqual(camposQueFaltan(sinCarta), ["carta"]);

    const precioRaro = copia();
    (precioRaro.carta as Array<Record<string, unknown>>)[1]!.precioCentimos = 9.5;
    assert.deepEqual(camposQueFaltan(precioRaro), ["carta[1].precioCentimos"]);

    const precioNegativo = copia();
    (precioNegativo.carta as Array<Record<string, unknown>>)[0]!.precioCentimos = -1;
    assert.deepEqual(camposQueFaltan(precioNegativo), ["carta[0].precioCentimos"]);
  });

  it("valida las partes anidadas de horario y entrega", () => {
    const sinDiaCierre = copia();
    delete (sinDiaCierre.horario as Record<string, unknown>).diaCierre;
    assert.deepEqual(camposQueFaltan(sinDiaCierre), ["horario.diaCierre"]);

    const entregaRara = copia();
    (entregaRara.entrega as Record<string, unknown>).disponible = "si";
    assert.deepEqual(camposQueFaltan(entregaRara), ["entrega.disponible"]);
  });

  it("solo admite acciones conocidas y no una lista vacia", () => {
    const inventada = copia();
    inventada.acciones = ["catering"];
    assert.deepEqual(camposQueFaltan(inventada), ["acciones"]);

    const vacia = copia();
    vacia.acciones = [];
    assert.deepEqual(camposQueFaltan(vacia), ["acciones"]);
  });

  it("rechaza lo que ni siquiera es un objeto", () => {
    for (const basura of [null, undefined, "texto", 42, []]) {
      assert.equal(camposQueFaltan(basura).length > 0, true, `${String(basura)}`);
    }
  });
});

describe("comienzoDelDia", () => {
  const esMedianocheEn = (fecha: Date, zona: string): boolean =>
    new Intl.DateTimeFormat("es-ES", {
      timeZone: zona,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(fecha).replace("24:", "00:") === "00:00";

  const mismoDiaEn = (a: Date, b: Date, zona: string): boolean => {
    const f = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", { timeZone: zona, dateStyle: "short" }).format(d);
    return f(a) === f(b);
  };

  const casos: Array<[string, string]> = [
    ["Europe/Madrid", "2026-07-15T09:30:00Z"], // horario de verano
    ["Europe/Madrid", "2026-01-15T09:30:00Z"], // horario de invierno
    ["Europe/Madrid", "2026-10-08T23:30:00Z"], // ya es el dia siguiente alli
    ["America/Mexico_City", "2026-10-08T09:30:00Z"],
    ["Pacific/Auckland", "2026-10-08T09:30:00Z"],
    ["UTC", "2026-10-08T09:30:00Z"],
  ];

  for (const [zona, iso] of casos) {
    it(`devuelve la medianoche local en ${zona} (${iso})`, () => {
      const ahora = new Date(iso);
      const inicio = comienzoDelDia(zona, ahora);
      assert.equal(esMedianocheEn(inicio, zona), true, "no es medianoche");
      assert.equal(mismoDiaEn(inicio, ahora, zona), true, "no es el mismo dia");
      assert.equal(inicio <= ahora, true, "no es anterior a ahora");
    });
  }
});

describe("utilidades", () => {
  it("formatea centimos como euros en castellano", () => {
    assert.equal(formatearEuros(0).replace(/ /g, " "), "0,00 €");
    assert.equal(formatearEuros(950).replace(/ /g, " "), "9,50 €");
    assert.equal(formatearEuros(123456).replace(/ /g, " "), "1234,56 €");
  });

  it("momentoActual respeta la zona que se le pasa", () => {
    const instante = new Date("2026-10-08T09:30:00Z");
    const madrid = momentoActual("Europe/Madrid");
    const mexico = momentoActual("America/Mexico_City");
    assert.notEqual(madrid, mexico);
    assert.equal(typeof instante.toISOString(), "string");
  });

  it("buscarPlato encuentra por id y por nombre, sin distinguir mayusculas", () => {
    const carta = fallbackBusiness.carta;
    assert.equal(buscarPlato(carta, "margarita")?.id, "margarita");
    assert.equal(buscarPlato(carta, "  MARGARITA  ")?.id, "margarita");
    assert.equal(buscarPlato(carta, "Pizza Cuatro Quesos")?.id, "cuatro_quesos");
    assert.equal(buscarPlato(carta, "hawaiana"), undefined);
    assert.equal(buscarPlato([], "margarita"), undefined);
  });
});
