/**
 * Céntimos enteros: pintar y leer importes sin perder ni uno.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ESPACIO_FINO, eurosACentimos, formatearEuros, sumarCentimos } from "../money";

const E = ESPACIO_FINO;

describe("formatearEuros", () => {
  it("por defecto enseña decimales solo cuando los hay", () => {
    assert.equal(formatearEuros(2500), `25${E}€`);
    assert.equal(formatearEuros(2550), `25,50${E}€`);
    assert.equal(formatearEuros(2505), `25,05${E}€`);
    assert.equal(formatearEuros(0), `0${E}€`);
    assert.equal(formatearEuros(5), `0,05${E}€`);
    assert.equal(formatearEuros(-2550), `-25,50${E}€`);
  });

  it("agrupa los miles como es-ES: cuatro cifras juntas, a partir de cinco con punto", () => {
    assert.equal(formatearEuros(125000), `1250${E}€`);
    assert.equal(formatearEuros(1234567), `12.345,67${E}€`);
    assert.equal(formatearEuros(123456700), `1.234.567${E}€`);
  });

  it("conDecimales fuerza o quita los decimales", () => {
    assert.equal(formatearEuros(2500, { conDecimales: true }), `25,00${E}€`);
    assert.equal(formatearEuros(2550, { conDecimales: true }), `25,50${E}€`);
    assert.equal(formatearEuros(2550, { conDecimales: false }), `26${E}€`);
    assert.equal(formatearEuros(2549, { conDecimales: false }), `25${E}€`);
    assert.equal(formatearEuros(-2550, { conDecimales: false }), `-26${E}€`);
    assert.equal(formatearEuros(2500, { conDecimales: false }), `25${E}€`);
  });

  it("el espacio antes del euro es el fino de no separación", () => {
    assert.equal(ESPACIO_FINO, " ");
    assert.equal(formatearEuros(2500).charCodeAt(2), 0x202f);
  });

  it("rechaza lo que no son céntimos enteros", () => {
    assert.throws(() => formatearEuros(25.5), TypeError);
    assert.throws(() => formatearEuros(Number.NaN), TypeError);
    assert.throws(() => formatearEuros("2500" as unknown as number), TypeError);
  });
});

describe("eurosACentimos", () => {
  it("entiende lo que se teclea en un campo de precio", () => {
    const casos: Array<[string, number]> = [
      ["25", 2500],
      ["25,50", 2550],
      ["25.50", 2550],
      ["25,5", 2550],
      ["25.5", 2550],
      ["0,99", 99],
      [",50", 50],
      ["25,", 2500],
      ["25.", 2500],
      ["25 €", 2500],
      ["25€", 2500],
      ["25,50 €", 2550],
      ["25 euros", 2500],
      ["25 EUR", 2500],
      [" 25,50 ", 2550],
      ["1.250", 125000],
      ["1.250,00", 125000],
      ["1.250.000", 125000000],
      ["1,250.50", 125050],
      ["1 250,00", 125000],
      ["-5", -500],
      ["−5,50", -550],
      ["007", 700],
    ];
    for (const [texto, esperado] of casos) {
      assert.equal(eurosACentimos(texto), esperado, JSON.stringify(texto));
    }
  });

  it("devuelve null, sin lanzar, con lo que no es un importe", () => {
    for (const texto of ["", "   ", "€", "abc", "25,505", "25,5,5", "1.25.0", "1,2,3", "12.345.6", "25a", "25.50.50", "1.2500", "--5", "1.250,5.0"]) {
      assert.equal(eurosACentimos(texto), null, JSON.stringify(texto));
    }
    assert.equal(eurosACentimos(undefined as unknown as string), null);
    assert.equal(eurosACentimos(25 as unknown as string), null);
  });

  it("va y vuelve", () => {
    for (const centimos of [0, 5, 99, 100, 2550, 125000, 1234567]) {
      assert.equal(eurosACentimos(formatearEuros(centimos)), centimos);
      assert.equal(eurosACentimos(formatearEuros(centimos, { conDecimales: true })), centimos);
    }
  });
});

describe("sumarCentimos", () => {
  it("suma enteros y rechaza lo demás", () => {
    assert.equal(sumarCentimos(100, 250, 5), 355);
    assert.equal(sumarCentimos(), 0);
    assert.equal(sumarCentimos(2500, -500), 2000);
    assert.throws(() => sumarCentimos(100, 1.5), TypeError);
    assert.throws(() => sumarCentimos(Number.NaN), TypeError);
  });
});
