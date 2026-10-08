/**
 * Lo que queda escrito: el pedido que se guarda y el resumen de la llamada.
 *
 * Se prueban las funciones puras, que son las que deciden el contenido. El
 * guardado en si (idempotencia, errores de red) se comprueba aparte contra un
 * Firestore simulado.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { construirResumen } from "../db/calls";
import { fallbackBusiness } from "../db/fallbackBusiness";
import { PedidoNoGuardadoError, construirPedido } from "../db/orders";
import { calcularTotal } from "../pedido";

const negocio = fallbackBusiness;
const totalReparto = calcularTotal(
  negocio,
  [{ plato: "margarita", cantidad: 2 }],
  "reparto",
);
const totalRecogida = calcularTotal(
  negocio,
  [{ plato: "margarita", cantidad: 1 }],
  "recogida",
);

describe("construirPedido", () => {
  it("genera un codigo de 4 letras faciles de deletrear", () => {
    // Sin O ni 0, sin I ni 1, sin S ni 5: se confunden al telefono.
    for (let i = 0; i < 200; i += 1) {
      const { codigo } = construirPedido(
        negocio,
        { articulos: [], entrega: "recogida" },
        totalRecogida,
      );
      assert.match(codigo, /^[ABCDEFGHJKLMNPQRTUVWXYZ2346789]{4}$/, codigo);
    }
  });

  it("copia las lineas con su identificador de plato y su importe", () => {
    const pedido = construirPedido(
      negocio,
      { articulos: [], entrega: "reparto", direccion: "Rua X 1" },
      totalReparto,
    );
    assert.equal(pedido.lineas.length, 1);
    assert.equal(pedido.lineas[0]?.platoId, "margarita");
    assert.equal(pedido.lineas[0]?.cantidad, 2);
    assert.equal(pedido.lineas[0]?.importeCentimos, 1900);
    assert.equal(pedido.totalCentimos, 2150);
  });

  it("nace siempre pendiente y con la hora de creacion", () => {
    const pedido = construirPedido(
      negocio,
      { articulos: [], entrega: "recogida" },
      totalRecogida,
    );
    assert.equal(pedido.estado, "pendiente");
    assert.equal(Number.isNaN(Date.parse(pedido.creadoEnIso)), false);
  });

  it("exige direccion cuando es reparto", () => {
    assert.throws(
      () => construirPedido(negocio, { articulos: [], entrega: "reparto" }, totalReparto),
      PedidoNoGuardadoError,
    );
    assert.throws(
      () =>
        construirPedido(
          negocio,
          { articulos: [], entrega: "reparto", direccion: "   " },
          totalReparto,
        ),
      PedidoNoGuardadoError,
      "una direccion en blanco no cuenta",
    );
  });

  it("no exige direccion cuando se recoge en el local", () => {
    const pedido = construirPedido(
      negocio,
      { articulos: [], entrega: "recogida" },
      totalRecogida,
    );
    assert.equal(pedido.direccion, "");
  });

  it("limpia los espacios de los datos que dicta el cliente", () => {
    const pedido = construirPedido(
      negocio,
      {
        articulos: [],
        entrega: "reparto",
        direccion: "  Rua do Paseo 5, 2 A  ",
        telefono: "  600123456 ",
        notas: "  sin picante  ",
        callId: " CA-1 ",
      },
      totalReparto,
    );
    assert.equal(pedido.direccion, "Rua do Paseo 5, 2 A");
    assert.equal(pedido.telefono, "600123456");
    assert.equal(pedido.notas, "sin picante");
    assert.equal(pedido.callId, "CA-1");
  });
});

describe("construirResumen", () => {
  const mensajeCompleto = {
    type: "end-of-call-report",
    endedReason: "customer-ended-call",
    startedAt: "2026-10-08T12:00:00.000Z",
    endedAt: "2026-10-08T12:02:35.000Z",
    cost: 0.0431,
    call: { id: "CA-1" },
    customer: { number: "+34600111222" },
    artifact: {
      transcript: "AI: buenas. User: dos margaritas.",
      recording: {
        mono: { combinedUrl: "https://s/mono.wav", customerUrl: "https://s/cust.wav" },
        stereoUrl: "https://s/stereo.wav",
      },
      presignedMonoUrl: "https://caduca/firmada?exp=1",
    },
  };

  it("calcula la duracion a partir del inicio y el fin", () => {
    const resumen = construirResumen(negocio, mensajeCompleto);
    assert.equal(resumen.duracionSegundos, 155);
  });

  it("recoge motivo, coste, telefono y transcripcion", () => {
    const resumen = construirResumen(negocio, mensajeCompleto);
    assert.equal(resumen.motivoFin, "customer-ended-call");
    assert.equal(resumen.costeUsd, 0.0431);
    assert.equal(resumen.telefonoCliente, "+34600111222");
    assert.match(resumen.transcripcion, /dos margaritas/);
    assert.equal(resumen.businessId, negocio.id);
  });

  it("prefiere la grabacion combinada y nunca guarda la URL que caduca", () => {
    const resumen = construirResumen(negocio, mensajeCompleto);
    assert.equal(resumen.grabacionUrl, "https://s/mono.wav");
    assert.equal(JSON.stringify(resumen).includes("caduca"), false);
  });

  it("cae a la estereo si no hay combinada", () => {
    const resumen = construirResumen(negocio, {
      ...mensajeCompleto,
      artifact: { recording: { stereoUrl: "https://s/stereo.wav" } },
    });
    assert.equal(resumen.grabacionUrl, "https://s/stereo.wav");
  });

  it("aguanta un evento pelado, sin grabacion ni fechas", () => {
    const resumen = construirResumen(negocio, {
      type: "end-of-call-report",
      endedReason: "hangup",
      call: { id: "CA-2" },
      artifact: {},
    });
    assert.equal(resumen.grabacionUrl, "");
    assert.equal(resumen.transcripcion, "");
    assert.equal(resumen.duracionSegundos, 0);
    assert.equal(resumen.callId, "CA-2");
  });

  it("no inventa duraciones negativas si las fechas vienen al reves", () => {
    const resumen = construirResumen(negocio, {
      ...mensajeCompleto,
      startedAt: "2026-10-08T12:02:35.000Z",
      endedAt: "2026-10-08T12:00:00.000Z",
    });
    assert.equal(resumen.duracionSegundos, 0);
  });

  it("aguanta un evento completamente vacio", () => {
    const resumen = construirResumen(negocio, {});
    assert.equal(resumen.callId, "");
    assert.equal(resumen.duracionSegundos, 0);
    assert.equal(resumen.costeUsd, 0);
  });
});
