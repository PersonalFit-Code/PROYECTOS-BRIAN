/**
 * registrar_pedido sin platos. Paso en una llamada real: calcular_total los
 * recibio, el cliente confirmo, y registrar_pedido llego tres veces vacio. El
 * cliente acabo colgando. Esto prueba la herramienta por HTTP, como Vapi.
 */

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";

import { leerArticulos } from "../tools/memoriaPedido";

describe("leerArticulos", () => {
  const uno = [{ plato: "p-margaritha", cantidad: 2 }];

  it("acepta la lista normal", () => assert.deepEqual(leerArticulos(uno), uno));
  it("acepta la lista como texto JSON", () => assert.deepEqual(leerArticulos(JSON.stringify(uno)), uno));
  it("acepta un plato suelto", () => assert.deepEqual(leerArticulos(uno[0]), uno));
  it("acepta la lista envuelta", () => assert.deepEqual(leerArticulos({ articulos: uno }), uno));
  it("acepta un mapa plato -> cantidad", () =>
    assert.deepEqual(leerArticulos({ "p-margaritha": 2 }), uno));
  it("sin nada usable devuelve vacio", () => {
    assert.deepEqual(leerArticulos(undefined), []);
    assert.deepEqual(leerArticulos("no es json"), []);
    assert.deepEqual(leerArticulos({}), []);
  });
});

let url: string;
let cerrar: () => Promise<void>;

before(async () => {
  process.env.FIREBASE_SERVICE_ACCOUNT = "";
  process.env.NEGOCIO_DE_EJEMPLO = "lavitabuona";
  process.env.VAPI_SERVER_SECRET = "";
  process.env.PUBLIC_SERVER_URL = "";
  for (const m of ["../config", "../db/firebase", "../db/businesses", "../db/orders", "../routes/panel", "../routes/voiceWebhook", "../app"]) {
    delete require.cache[require.resolve(m)];
  }
  const { createApp } = require("../app") as typeof import("../app");
  const servidor = createApp().listen(0);
  await new Promise((r) => servidor.once("listening", r));
  url = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}/voice-webhook?business=lavitabuona`;
  cerrar = () => new Promise<void>((r) => servidor.close(() => r()));
});

after(async () => cerrar?.());

async function herramienta(nombre: string, argumentos: Record<string, unknown>, callId: string): Promise<string> {
  const llamada = { id: `tc-${nombre}`, type: "function", function: { name: nombre, arguments: JSON.stringify(argumentos) } };
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: { type: "tool-calls", call: { id: callId }, toolCallList: [llamada], toolCalls: [llamada] } }),
  });
  const cuerpo = (await r.json()) as { results: Array<{ result: string }> };
  return cuerpo.results[0]!.result;
}

describe("registrar_pedido sin platos, por HTTP", () => {
  it("usa lo que se calculo en la llamada y no le dice que faltan platos", async () => {
    await herramienta("calcular_total", { articulos: [{ plato: "p-margaritha", cantidad: 1 }], entrega: "reparto" }, "c-memoria");
    const texto = await herramienta(
      "registrar_pedido",
      { entrega: "reparto", direccion: "Rua X 1", nombre: "Ana", telefono: "600112233" },
      "c-memoria",
    );
    // Sin Firestore en los tests no se puede guardar: lo que importa es que
    // ya no se queja de los platos, que llegaron bien de memoria.
    assert.ok(!/no lleva ningun plato/.test(texto), texto);
    assert.match(texto, /base de datos no esta configurada/);
  });

  it("con la lista como texto JSON tambien vale", async () => {
    const texto = await herramienta(
      "registrar_pedido",
      { articulos: JSON.stringify([{ plato: "p-margaritha", cantidad: 1 }]), entrega: "recogida", nombre: "Ana" },
      "c-texto",
    );
    assert.ok(!/no lleva ningun plato/.test(texto), texto);
  });

  it("la memoria es por llamada: otra llamada no hereda el pedido", async () => {
    const texto = await herramienta("registrar_pedido", { entrega: "recogida" }, "c-otra");
    assert.match(texto, /no lleva ningun plato/);
  });
});

describe("buscar los platos en el texto, sea cual sea la forma", async () => {
  const { buscarArticulosEnTexto } = await import("../tools/memoriaPedido");
  const ids = ["p-prosciutto", "p-prosciutto-funghi", "p-margaritha", "po-tiramisu"];

  it("lee una lista mal formada con sus cantidades", () => {
    assert.deepEqual(
      buscarArticulosEnTexto("[{plato: p-margaritha, cantidad: 2}, {plato: 'po-tiramisu', cantidad: 3}]", ids),
      [{ plato: "p-margaritha", cantidad: 2 }, { plato: "po-tiramisu", cantidad: 3 }],
    );
  });

  it("no confunde un plato con otro que empieza igual", () => {
    assert.deepEqual(buscarArticulosEnTexto('"p-prosciutto-funghi" x1', ids), [
      { plato: "p-prosciutto-funghi", cantidad: 1 },
    ]);
  });
});
