/**
 * Teléfonos españoles: lo que teclea la gente y lo que se guarda.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { esMovilES, formatearTelefonoES, normalizarTelefonoES } from "../phone";

describe("normalizarTelefonoES", () => {
  it("acepta las formas habituales y devuelve E.164", () => {
    for (const entrada of [
      "646771356",
      "646 77 13 56",
      "646.77.13.56",
      "646-77-13-56",
      "+34646771356",
      "+34 646 77 13 56",
      "(+34) 646-77-13-56",
      "0034646771356",
      "0034 646 77 13 56",
      "34646771356",
      " 646 77 13 56 ",
      "646 77 13 56",
      "+34–646–77–13–56",
    ]) {
      assert.equal(normalizarTelefonoES(entrada), "+34646771356", JSON.stringify(entrada));
    }
    assert.equal(normalizarTelefonoES("988 00 00 00"), "+34988000000", "fijos también");
    assert.equal(normalizarTelefonoES("722 00 00 00"), "+34722000000", "móviles que empiezan por 7");
    assert.equal(normalizarTelefonoES("800 123 456"), "+34800123456");
  });

  it("devuelve null, sin lanzar, con lo que no es un número español", () => {
    for (const entrada of [
      "",
      "   ",
      "abc",
      "12345",
      "546771356",
      "346771356",
      "64677135",
      "6467713567",
      "+34 646 77 13 5",
      "+34646771356x",
      "+33 6 12 34 56 78",
      "0033612345678",
      "+3464677135",
      "646 77 13 56 / 988 00 00 00",
      "+34+34646771356",
    ]) {
      assert.equal(normalizarTelefonoES(entrada), null, JSON.stringify(entrada));
    }
    assert.equal(normalizarTelefonoES(undefined as unknown as string), null);
    assert.equal(normalizarTelefonoES(646771356 as unknown as string), null);
  });
});

describe("formatearTelefonoES", () => {
  it("agrupa como se lee en España", () => {
    assert.equal(formatearTelefonoES("+34646771356"), "646 77 13 56");
    assert.equal(formatearTelefonoES("646771356"), "646 77 13 56");
    assert.equal(formatearTelefonoES("+34 988 00 00 00"), "988 00 00 00");
  });

  it("deja en paz lo que no entiende", () => {
    assert.equal(formatearTelefonoES(" +33 6 12 34 56 78 "), "+33 6 12 34 56 78");
    assert.equal(formatearTelefonoES(""), "");
  });
});

describe("esMovilES", () => {
  it("solo los que empiezan por 6 o 7", () => {
    assert.equal(esMovilES("646 77 13 56"), true);
    assert.equal(esMovilES("+34722000000"), true);
    assert.equal(esMovilES("988 00 00 00"), false);
    assert.equal(esMovilES("abc"), false);
  });
});
