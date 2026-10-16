/**
 * Códigos de bono: generación, normalización de lo que se teclea y validación.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ALFABETO_BONO, esCodigoBonoValido, generarCodigoBono, normalizarCodigoBono } from "../code";

const FORMATO = /^AS-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

/** Un generador que devuelve siempre los mismos bytes. */
function fijo(...bytes: number[]): (n: number) => Uint8Array {
  return (n) => Uint8Array.from({ length: n }, (_, i) => bytes[i] ?? 0);
}

describe("generarCodigoBono", () => {
  it("tiene la forma AS-XXXX-XXXX y usa el alfabeto sin 0/O ni 1/I", () => {
    assert.equal(ALFABETO_BONO.length, 32);
    assert.equal(new Set(ALFABETO_BONO).size, 32, "sin símbolos repetidos");
    for (const prohibido of ["0", "O", "1", "I"]) assert.ok(!ALFABETO_BONO.includes(prohibido), prohibido);

    for (let i = 0; i < 200; i++) {
      const codigo = generarCodigoBono();
      assert.match(codigo, FORMATO, codigo);
      for (const prohibido of ["0", "O", "1", "I"]) assert.ok(!codigo.slice(3).includes(prohibido), codigo);
    }
  });

  it("es determinista con un generador fijo", () => {
    assert.equal(generarCodigoBono(fijo(0, 1, 2, 3, 4, 5, 6, 7)), "AS-ABCD-EFGH");
    assert.equal(generarCodigoBono(fijo(255, 255, 255, 255, 255, 255, 255, 255)), "AS-9999-9999");
    assert.equal(generarCodigoBono(fijo(32, 33, 34, 35, 36, 37, 38, 39)), "AS-ABCD-EFGH", "módulo 32");
  });

  it("reparte los 256 valores de un byte entre los 32 símbolos por igual", () => {
    const cuenta = new Map<string, number>();
    for (let b = 0; b < 256; b++) {
      const simbolo = generarCodigoBono(fijo(b, b, b, b, b, b, b, b))[3]!;
      cuenta.set(simbolo, (cuenta.get(simbolo) ?? 0) + 1);
    }
    assert.equal(cuenta.size, 32);
    for (const [simbolo, veces] of cuenta) assert.equal(veces, 8, simbolo);
  });

  it("con el azar de verdad no repite en una tirada razonable", () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 2000; i++) vistos.add(generarCodigoBono());
    assert.equal(vistos.size, 2000);
  });

  it("se queja de un generador que no da bytes suficientes", () => {
    assert.throws(() => generarCodigoBono(() => new Uint8Array(4)));
  });
});

describe("normalizarCodigoBono", () => {
  it("acepta lo que teclea la gente y devuelve el código canónico", () => {
    for (const entrada of [
      "AS-ABCD-EFGH",
      "as-abcd-efgh",
      "ASABCDEFGH",
      "ABCDEFGH",
      "abcd efgh",
      " AS ABCD EFGH ",
      "AS–ABCD–EFGH",
      "AS_ABCD_EFGH",
      "AS.ABCD.EFGH",
      "AS-AB CD-EF GH",
    ]) {
      assert.equal(normalizarCodigoBono(entrada), "AS-ABCD-EFGH", JSON.stringify(entrada));
    }
  });

  it("un cuerpo que empieza por AS no pierde sus letras", () => {
    assert.equal(normalizarCodigoBono("ASDFGHJK"), "AS-ASDF-GHJK");
    assert.equal(normalizarCodigoBono("AS-ASDF-GHJK"), "AS-ASDF-GHJK");
    assert.equal(normalizarCodigoBono("asasdfghjk"), "AS-ASDF-GHJK");
  });

  it("devuelve null con lo que no puede ser un código", () => {
    for (const entrada of ["", "AS-ABCD-EFG", "AS-ABCD-EFGHJ", "AS-ABC0-EFGH", "AS-ABCO-EFGH", "AS-ABC1-EFGH", "AS-ABCI-EFGH", "AS-ABCD-EFG!", "ABCDEFG", "XX-ABCD-EFGH"]) {
      assert.equal(normalizarCodigoBono(entrada), null, JSON.stringify(entrada));
    }
    assert.equal(normalizarCodigoBono(undefined as unknown as string), null);
  });

  it("todo código generado se normaliza a sí mismo", () => {
    for (let i = 0; i < 100; i++) {
      const codigo = generarCodigoBono();
      assert.equal(normalizarCodigoBono(codigo), codigo);
      assert.equal(normalizarCodigoBono(codigo.toLowerCase().replace(/-/g, " ")), codigo);
      assert.equal(esCodigoBonoValido(codigo), true);
    }
  });
});

describe("esCodigoBonoValido", () => {
  it("es la pregunta de sí o no de normalizar", () => {
    assert.equal(esCodigoBonoValido("as abcd efgh"), true);
    assert.equal(esCodigoBonoValido("AS-ABC0-EFGH"), false);
    assert.equal(esCodigoBonoValido(""), false);
  });
});
