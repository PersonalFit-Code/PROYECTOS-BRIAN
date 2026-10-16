/**
 * Reservas de broma: lo evidente se rechaza y lo de una clienta real pasa siempre.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { correoInventado, telefonoInventado } from "../antiabuso";

describe("telefonoInventado", () => {
  it("rechaza números de broma", () => {
    for (const n of ["+34666666666", "+34600000000", "+34699999999", "+34612345678", "+34698765432", "+34700000012", "+34623456789"]) {
      assert.equal(telefonoInventado(n), true, n);
    }
  });
  it("deja pasar números normales, también con repeticiones cortas", () => {
    for (const n of ["+34646771356", "+34600111222", "+34988123456", "+34666777888", "+34611000033", "+34623456780"]) {
      assert.equal(telefonoInventado(n), false, n);
    }
  });
});

describe("correoInventado", () => {
  it("rechaza risas, teclado aporreado, pruebas y correos desechables", () => {
    for (const c of ["jajaja@gmail.com", "JAJAJA@gmail.com", "jejeje123@hotmail.com", "xdxd@gmail.com", "asdfgh@gmail.com", "qwerty@yahoo.es", "aaaa@gmail.com", "test@gmail.com", "prueba1@gmail.com", "ana@mailinator.com", "x@yopmail.com", "ana@example.com"]) {
      assert.equal(correoInventado(c), true, c);
    }
  });
  it("deja pasar correos reales, aunque se parezcan", () => {
    for (const c of ["ana.perez@gmail.com", "javier@gmail.com", "jaime@hotmail.com", "aaron@gmail.com", "testa.maria@gmail.com", "pruebas.salon@empresa.es", "anna@gmail.com", "info.viaurea@gmail.com"]) {
      assert.equal(correoInventado(c), false, c);
    }
  });
});
