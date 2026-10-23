/**
 * Limites de la configuracion que vienen de Vapi, no de nosotros.
 *
 * Si un valor esta fuera de lo que Vapi acepta, Vapi rechaza el asistente
 * entero: el webhook contesta 200 y la llamada no se descuelga. Paso de verdad
 * con INTERRUPCION_SEGUNDOS=0.8. Mejor que el servidor no arranque.
 */

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

const ANTES = process.env.INTERRUPCION_SEGUNDOS;

/** La configuracion se lee al importar: hay que recargarla en cada prueba. */
function cargar(valor: string): { interrupcionSegundos: number } {
  process.env.INTERRUPCION_SEGUNDOS = valor;
  delete require.cache[require.resolve("../config")];
  return (require("../config") as { config: { interrupcionSegundos: number } }).config;
}

afterEach(() => {
  if (ANTES === undefined) delete process.env.INTERRUPCION_SEGUNDOS;
  else process.env.INTERRUPCION_SEGUNDOS = ANTES;
  delete require.cache[require.resolve("../config")];
});

describe("INTERRUPCION_SEGUNDOS", () => {
  it("acepta hasta 0,5, que es el limite de Vapi", () => {
    assert.equal(cargar("0.5").interrupcionSegundos, 0.5);
    assert.equal(cargar("0,3").interrupcionSegundos, 0.3);
  });

  it("vacio es 0,4, el valor de serie", () => {
    assert.equal(cargar("").interrupcionSegundos, 0.4);
  });

  it("con 0,8 el servidor no arranca: Vapi rechazaria todas las llamadas", () => {
    assert.throws(() => cargar("0.8"), /entre 0 y 0.5/);
  });
});
