/**
 * El calculo del total: lo que acaba cobrandose al cliente.
 *
 * Se prueba con el ejecutor que trae Node, sin añadir dependencias.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fallbackBusiness } from "../db/fallbackBusiness";
import type { Business } from "../db/types";
import {
  PedidoInvalidoError,
  calcularTotal,
  describirTotal,
} from "../pedido";

const negocio: Business = fallbackBusiness;

describe("calcularTotal", () => {
  it("suma las lineas y añade los gastos de envio", () => {
    const total = calcularTotal(negocio, [{ plato: "margarita", cantidad: 1 }], "reparto");
    assert.equal(total.subtotalCentimos, 950);
    assert.equal(total.gastosEnvioCentimos, 250);
    assert.equal(total.totalCentimos, 1200);
    assert.equal(total.envioGratis, false);
  });

  it("da envio gratis al llegar al umbral", () => {
    const total = calcularTotal(
      negocio,
      [{ plato: "margarita", cantidad: 2 }, { plato: "cuatro_quesos", cantidad: 1 }],
      "reparto",
    );
    assert.equal(total.subtotalCentimos, 3150);
    assert.equal(total.gastosEnvioCentimos, 0);
    assert.equal(total.totalCentimos, 3150);
  });

  it("el umbral es inclusivo: justo 20,00 € ya es gratis", () => {
    const concreto: Business = {
      ...negocio,
      carta: [{ id: "x", nombre: "X", descripcion: "", precioCentimos: 2000 }],
    };
    const total = calcularTotal(concreto, [{ plato: "x", cantidad: 1 }], "reparto");
    assert.equal(total.gastosEnvioCentimos, 0);
  });

  it("un centimo por debajo del umbral si paga envio", () => {
    const concreto: Business = {
      ...negocio,
      carta: [{ id: "x", nombre: "X", descripcion: "", precioCentimos: 1999 }],
    };
    const total = calcularTotal(concreto, [{ plato: "x", cantidad: 1 }], "reparto");
    assert.equal(total.gastosEnvioCentimos, 250);
    assert.equal(total.totalCentimos, 2249);
  });

  it("la recogida nunca paga envio, por poco que sea el pedido", () => {
    const total = calcularTotal(negocio, [{ plato: "margarita", cantidad: 1 }], "recogida");
    assert.equal(total.gastosEnvioCentimos, 0);
    assert.equal(total.totalCentimos, 950);
  });

  it("acepta el plato por su nombre, no solo por su identificador", () => {
    const total = calcularTotal(negocio, [{ plato: "PIZZA MARGARITA", cantidad: 1 }], "recogida");
    assert.equal(total.lineas[0]?.platoId, "margarita");
  });

  it("rechaza un plato que no esta en la carta y dice cuales hay", () => {
    assert.throws(
      () => calcularTotal(negocio, [{ plato: "hawaiana", cantidad: 1 }], "recogida"),
      (error: unknown) =>
        error instanceof PedidoInvalidoError &&
        error.message.includes("Pizza Margarita"),
    );
  });

  it("rechaza cantidades que no son enteros positivos", () => {
    for (const cantidad of [0, -1, 1.5, Number.NaN]) {
      assert.throws(
        () => calcularTotal(negocio, [{ plato: "margarita", cantidad }], "recogida"),
        PedidoInvalidoError,
        `deberia rechazar la cantidad ${cantidad}`,
      );
    }
  });

  it("rechaza pedidos desproporcionados", () => {
    assert.throws(
      () => calcularTotal(negocio, [{ plato: "margarita", cantidad: 21 }], "recogida"),
      PedidoInvalidoError,
    );
  });

  it("rechaza un pedido vacio y un tipo de entrega inventado", () => {
    assert.throws(() => calcularTotal(negocio, [], "reparto"), PedidoInvalidoError);
    assert.throws(
      () => calcularTotal(negocio, [{ plato: "margarita", cantidad: 1 }], "teletransporte"),
      PedidoInvalidoError,
    );
  });

  it("no acumula errores de coma flotante", () => {
    // 0,10 € x 3 en centimos son 30, no 30.000000000000004.
    const concreto: Business = {
      ...negocio,
      carta: [{ id: "x", nombre: "X", descripcion: "", precioCentimos: 10 }],
    };
    const total = calcularTotal(concreto, [{ plato: "x", cantidad: 3 }], "recogida");
    assert.equal(total.totalCentimos, 30);
    assert.equal(Number.isInteger(total.totalCentimos), true);
  });
});

describe("describirTotal", () => {
  it("escribe los importes en euros, con coma decimal", () => {
    const total = calcularTotal(negocio, [{ plato: "margarita", cantidad: 1 }], "reparto");
    const texto = describirTotal(negocio, total);
    assert.match(texto, /9,50/);
    assert.match(texto, /Gastos de envio: 2,50/);
    assert.match(texto, /Total a pagar: 12,00/);
  });

  it("dice por que el envio sale gratis", () => {
    const total = calcularTotal(negocio, [{ plato: "margarita", cantidad: 3 }], "reparto");
    assert.match(describirTotal(negocio, total), /Envio gratis por superar 20,00/);
  });

  it("en recogida lo dice en lugar de hablar de envio", () => {
    const total = calcularTotal(negocio, [{ plato: "margarita", cantidad: 1 }], "recogida");
    assert.match(describirTotal(negocio, total), /Recogida en el local/);
  });
});
