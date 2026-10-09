/**
 * Lectura de los "tool-calls" de Vapi.
 *
 * El primer caso es el que rompio la primera llamada real: si esto falla, el
 * agente se inventa el total y el pedido no llega a la cocina.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizarLlamadas } from "../tools/normalizar";
import type { VapiMessage } from "../types/vapi";

const ARGS = {
  articulos: [{ plato: "margarita", cantidad: 2 }],
  entrega: "recogida",
};

const mensaje = (extra: Partial<VapiMessage>): VapiMessage => ({
  type: "tool-calls",
  ...extra,
});

describe("normalizarLlamadas", () => {
  it("lee la forma de la llamada real: los dos arrays, con el nombre dentro de function", () => {
    const llamadas = normalizarLlamadas(
      mensaje({
        toolCallList: [
          {
            id: "call_1",
            type: "function",
            function: { name: "calcular_total", arguments: ARGS },
          },
        ],
        toolCalls: [
          {
            id: "call_1",
            type: "function",
            function: { name: "calcular_total", arguments: JSON.stringify(ARGS) },
          },
        ],
      }),
    );
    assert.deepEqual(llamadas, [
      { id: "call_1", nombre: "calcular_total", argumentos: ARGS },
    ]);
  });

  it("lee el formato plano que documenta Vapi, con parameters o con arguments", () => {
    const conParameters = normalizarLlamadas(
      mensaje({ toolCallList: [{ id: "a", name: "calcular_total", parameters: ARGS }] }),
    );
    const conArguments = normalizarLlamadas(
      mensaje({ toolCallList: [{ id: "a", name: "calcular_total", arguments: ARGS }] }),
    );
    assert.deepEqual(conParameters, [{ id: "a", nombre: "calcular_total", argumentos: ARGS }]);
    assert.deepEqual(conArguments, conParameters);
  });

  it("lee el estilo OpenAI con los argumentos en texto", () => {
    const llamadas = normalizarLlamadas(
      mensaje({
        toolCalls: [
          { id: "b", function: { name: "registrar_pedido", arguments: JSON.stringify(ARGS) } },
        ],
      }),
    );
    assert.deepEqual(llamadas, [{ id: "b", nombre: "registrar_pedido", argumentos: ARGS }]);
  });

  it("si una copia viene incompleta, toma los datos de la otra", () => {
    const llamadas = normalizarLlamadas(
      mensaje({
        toolCallList: [{ id: "c" }],
        toolCalls: [{ id: "c", function: { name: "calcular_total", arguments: ARGS } }],
      }),
    );
    assert.deepEqual(llamadas, [{ id: "c", nombre: "calcular_total", argumentos: ARGS }]);
  });

  it("mantiene separadas dos herramientas distintas en el mismo mensaje", () => {
    const llamadas = normalizarLlamadas(
      mensaje({
        toolCallList: [
          { id: "x", function: { name: "calcular_total", arguments: ARGS } },
          { id: "y", function: { name: "registrar_pedido", arguments: ARGS } },
        ],
      }),
    );
    assert.deepEqual(
      llamadas.map((l) => [l.id, l.nombre]),
      [
        ["x", "calcular_total"],
        ["y", "registrar_pedido"],
      ],
    );
  });

  it("ignora lo que no tiene id y no revienta con basura", () => {
    const llamadas = normalizarLlamadas(
      mensaje({
        toolCallList: [null, 7, "texto", {}] as unknown as VapiMessage["toolCallList"],
        toolCalls: "no es un array" as unknown as VapiMessage["toolCalls"],
      }),
    );
    assert.deepEqual(llamadas, []);
  });

  it("unos argumentos en texto mal formado quedan vacios, sin excepcion", () => {
    const llamadas = normalizarLlamadas(
      mensaje({ toolCalls: [{ id: "z", function: { name: "calcular_total", arguments: "{roto" } }] }),
    );
    assert.deepEqual(llamadas, [{ id: "z", nombre: "calcular_total", argumentos: {} }]);
  });
});
