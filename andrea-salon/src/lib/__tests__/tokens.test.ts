/**
 * Las firmas de los enlaces de cita y de bono.
 */

import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";

import { LONGITUD_MINIMA_SECRETO, firmar, verificar } from "../tokens";

/** 32 bytes en hexadecimal, como `TOKEN_SECRET`. */
const SECRETO = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const OTRO_SECRETO = "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";
const VALOR = "cita:123e4567-e89b-12d3-a456-426614174000";

describe("firmar", () => {
  it("es HMAC-SHA256 del valor en UTF-8 con el secreto como clave, en hexadecimal", () => {
    // Vectores fijos: si cambian, los enlaces ya enviados dejan de abrir.
    assert.equal(firmar(VALOR, SECRETO), "557343b77b8c571206950fc08002c1e0794238839bc238de19ce010d4ae74348");
    assert.equal(firmar("bono:AS-7K3M-Q9ZD", SECRETO), "42c8e9e6ce0dbc4450def2af6fdd6d707a7daec258626e6fdb47a95891dd7e9c");
    assert.equal(firmar("ñandú €", SECRETO), createHmac("sha256", SECRETO).update("ñandú €", "utf8").digest("hex"));
    assert.match(firmar(VALOR, SECRETO), /^[0-9a-f]{64}$/);
  });

  it("cambia con el valor y con el secreto", () => {
    assert.notEqual(firmar(VALOR, SECRETO), firmar(`${VALOR}x`, SECRETO));
    assert.notEqual(firmar(VALOR, SECRETO), firmar(VALOR, OTRO_SECRETO));
    assert.notEqual(firmar(`cita:${VALOR.slice(5)}`, SECRETO), firmar(`bono:${VALOR.slice(5)}`, SECRETO), "el ámbito forma parte de lo firmado");
  });

  it("se niega a firmar con un secreto vacío o corto", () => {
    assert.throws(() => firmar(VALOR, ""), /TOKEN_SECRET/);
    assert.throws(() => firmar(VALOR, "cambiame"), /TOKEN_SECRET/);
    assert.throws(() => firmar(VALOR, "a".repeat(LONGITUD_MINIMA_SECRETO - 1)), /TOKEN_SECRET/);
    assert.throws(() => firmar(VALOR, undefined as unknown as string), /TOKEN_SECRET/);
    assert.doesNotThrow(() => firmar(VALOR, "a".repeat(LONGITUD_MINIMA_SECRETO)));
  });
});

describe("verificar", () => {
  const firma = firmar(VALOR, SECRETO);

  it("acepta la firma buena, también en mayúsculas", () => {
    assert.equal(verificar(VALOR, firma, SECRETO), true);
    assert.equal(verificar(VALOR, firma.toUpperCase(), SECRETO), true);
  });

  it("rechaza el valor manipulado, otra firma válida y otro secreto", () => {
    assert.equal(verificar(`${VALOR}x`, firma, SECRETO), false);
    assert.equal(verificar(VALOR, firmar("otra cosa", SECRETO), SECRETO), false);
    assert.equal(verificar(VALOR, firma, OTRO_SECRETO), false);
    const casiIgual = `${firma.slice(0, -1)}${firma.endsWith("0") ? "1" : "0"}`;
    assert.equal(verificar(VALOR, casiIgual, SECRETO), false);
  });

  it("una firma mal formada es falsa, nunca una excepción", () => {
    for (const rota of ["", "abc", firma.slice(0, 63), `${firma}0`, "z".repeat(64), "0x" + firma.slice(2), " " + firma]) {
      assert.equal(verificar(VALOR, rota, SECRETO), false, JSON.stringify(rota));
    }
    assert.equal(verificar(VALOR, undefined as unknown as string, SECRETO), false);
    assert.equal(verificar(VALOR, null as unknown as string, SECRETO), false);
    assert.equal(verificar(undefined as unknown as string, firma, SECRETO), false);
    assert.equal(verificar(VALOR, firma, ""), false, "sin secreto nada verifica");
    assert.equal(verificar(VALOR, firma, "cambiame"), false);
  });
});
