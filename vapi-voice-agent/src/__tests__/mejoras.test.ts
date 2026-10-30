/**
 * Lo que cambio despues de la primera llamada de prueba a La Vita Buona.
 *
 * Cada cosa nueva que se le manda a Vapi esta aqui contra los limites de su
 * API, no contra lo que parece razonable: un solo valor fuera de rango y
 * Vapi rechaza el asistente entero sin decir nada (paso con el 0,8).
 */

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  buildAssistant,
  buildSystemPrompt,
  MAX_PALABRAS_CLAVE,
  palabrasClave,
  planDeTurno,
  PRONUNCIACION,
  saludoInicial,
} from "../assistant";
import { camposQueFaltan } from "../db/businesses";
import { construirPedido, DatosIncompletosError } from "../db/orders";
import { calcularTotal } from "../pedido";
import { telefonoDelCliente } from "../types/vapi";
import { LA_VITA_BUONA } from "../db/lavitabuona";
import { fallbackBusiness } from "../db/fallbackBusiness";

type Asistente = {
  transcriber: { keyterm?: string[] };
  voice: { chunkPlan?: { formatPlan?: { replacements?: unknown[] } } };
  model: { tools: Array<Record<string, unknown>>; messages: Array<{ content: string }> };
};

const asistente = (negocio = LA_VITA_BUONA) => buildAssistant(negocio) as unknown as Asistente;

describe("fin de turno", () => {
  it('con "texto" no va el detector de Vapi, que anularia los tiempos', () => {
    const plan = planDeTurno("texto") as Record<string, unknown>;
    assert.equal("smartEndpointingPlan" in plan, false);
    assert.ok(plan.transcriptionEndpointingPlan);
  });

  it("los tiempos estan dentro de lo que acepta Vapi (de 0 a 3)", () => {
    const plan = planDeTurno("texto") as {
      waitSeconds: number;
      transcriptionEndpointingPlan: Record<string, number>;
    };
    for (const [campo, valor] of Object.entries(plan.transcriptionEndpointingPlan)) {
      assert.ok(valor >= 0 && valor <= 3, `${campo} = ${valor}`);
    }
    assert.ok(plan.waitSeconds >= 0 && plan.waitSeconds <= 5);
  });

  it("no corta al cliente que se para a pensar a mitad de frase", () => {
    const plan = planDeTurno("texto") as {
      waitSeconds: number;
      transcriptionEndpointingPlan: Record<string, number>;
    };
    const tras = (campo: string) => plan.waitSeconds + plan.transcriptionEndpointingPlan[campo]!;
    // Deepgram pone punto en cualquier pausa: con 0,5 segundos se metia en medio.
    assert.ok(tras("onPunctuationSeconds") >= 1.2, "tras un punto espera al menos 1,2 s");
    assert.ok(tras("onNoPunctuationSeconds") > tras("onPunctuationSeconds"));
    assert.ok(tras("onNumberSeconds") >= tras("onNoPunctuationSeconds"), "un telefono se dicta a trozos");
  });

  it('con "vapi" vuelve al detector de antes, sin tiempos que no se usarian', () => {
    const plan = planDeTurno("vapi") as Record<string, unknown>;
    assert.deepEqual(plan.smartEndpointingPlan, { provider: "vapi" });
    assert.equal("transcriptionEndpointingPlan" in plan, false);
  });
});

describe("pronunciacion y palabras clave", () => {
  it("los reemplazos tienen la forma exacta de Vapi", () => {
    for (const r of PRONUNCIACION) {
      assert.deepEqual(Object.keys(r).sort(), ["key", "replaceAllEnabled", "type", "value"]);
      assert.equal(r.type, "exact");
      assert.ok(r.value.length <= 1000);
    }
    const reemplazos = asistente().voice.chunkPlan?.formatPlan?.replacements;
    assert.deepEqual(reemplazos, PRONUNCIACION);
  });

  it("la voz sigue llevando proveedor e identificador", () => {
    const voz = asistente().voice as Record<string, unknown>;
    assert.ok(voz.provider && voz.voiceId);
  });

  it("Deepgram espera el nombre del local, la palabra pizza y los platos", () => {
    const claves = asistente().transcriber.keyterm ?? [];
    assert.equal(claves[0], "La Vita Buona");
    assert.ok(claves.includes("pizza"));
    assert.ok(claves.includes("Pizza margaritha"));
  });

  it("no pasa del limite que recomienda Deepgram, ni repite", () => {
    const claves = palabrasClave(LA_VITA_BUONA);
    assert.ok(claves.length <= MAX_PALABRAS_CLAVE);
    assert.equal(new Set(claves.map((c) => c.toLowerCase())).size, claves.length);
  });
});

describe("pasar la llamada a una persona", () => {
  const conNumero = { ...LA_VITA_BUONA, telefonoTraspaso: "+34988123456" };

  it("sin numero no hay herramienta, y el prompt manda llamar al restaurante", () => {
    const a = asistente(LA_VITA_BUONA);
    assert.equal(a.model.tools.some((t) => t.type === "transferCall"), false);
    assert.match(a.model.messages[0]!.content, /ofrece que llamen\s+al restaurante/);
  });

  it("con numero va la herramienta de Vapi, con el destino en su forma", () => {
    const traspaso = asistente(conNumero).model.tools.find((t) => t.type === "transferCall");
    assert.ok(traspaso, "falta transferCall");
    assert.deepEqual(Object.keys(traspaso).sort(), ["destinations", "type"]);
    const destinos = traspaso.destinations as Array<Record<string, unknown>>;
    assert.equal(destinos.length, 1);
    assert.equal(destinos[0]!.type, "number");
    assert.equal(destinos[0]!.number, "+34988123456");
    assert.ok(String(destinos[0]!.message).length <= 1000);
  });

  it("con numero el prompt le dice que la use en la misma respuesta", () => {
    const prompt = buildSystemPrompt(conNumero);
    assert.match(prompt, /herramienta de transferir la llamada EN LA MISMA RESPUESTA/);
    assert.match(prompt, /restaurante esta cerrado ahora, no pases la llamada/);
  });

  it("un numero sin prefijo en la ficha no pasa la validacion", () => {
    assert.deepEqual(camposQueFaltan(conNumero), []);
    const mal = { ...LA_VITA_BUONA, telefonoTraspaso: "988 12 34 56" };
    assert.ok(camposQueFaltan(mal).some((c) => c.startsWith("telefonoTraspaso")));
  });
});

describe("como toma el pedido", () => {
  const prompt = buildSystemPrompt(LA_VITA_BUONA);

  it("no vuelve a preguntar una cantidad que ya le han dicho", () => {
    assert.match(prompt, /no se lo\s+vuelvas a preguntar/);
  });

  it("confirma una sola vez, con el total ya calculado", () => {
    assert.match(prompt, /Es la unica vez que\s+repites el pedido/);
    assert.ok(
      prompt.indexOf("calcular_total con los platos") < prompt.indexOf("confirma TODO de una vez"),
      "el total tiene que estar antes de la confirmacion",
    );
  });

  it("pide nombre y telefono tambien para recoger", () => {
    assert.match(prompt, /Para recoger: el nombre, y un telefono/);
    const registrar = asistente().model.tools.find(
      (t) => (t.function as { name?: string } | undefined)?.name === "registrar_pedido",
    );
    const props = (registrar!.function as { parameters: { properties: Record<string, unknown> } })
      .parameters.properties;
    assert.ok(props.nombre, "registrar_pedido tiene que aceptar el nombre");
  });

  it("dice el codigo cifra a cifra, no letra a letra", () => {
    assert.match(prompt, /cifra a cifra/);
    assert.ok(!/letra a letra/.test(prompt));
  });

  it("ya no dice que no hay bebidas ni postres: los hay", () => {
    assert.ok(!/ni bebidas, ni postres, ni extras\./.test(prompt));
    assert.ok(LA_VITA_BUONA.carta.some((p) => p.id === "b-cocacola"));
    assert.ok(LA_VITA_BUONA.carta.some((p) => p.id === "po-tiramisu"));
  });

  it("ofrece la sugerencia del local una sola vez", () => {
    assert.ok(prompt.includes(LA_VITA_BUONA.sugerencia!));
    assert.match(prompt, /UNA sola vez/);
  });

  it("sin sugerencia no ofrece nada", () => {
    const sin = buildSystemPrompt(fallbackBusiness);
    assert.match(sin, /No ofrezcas nada que el cliente no haya pedido/);
  });

  it("una sugerencia en blanco no pasa la validacion", () => {
    assert.ok(camposQueFaltan({ ...LA_VITA_BUONA, sugerencia: "  " }).includes("sugerencia"));
  });
});

describe("configuracion nueva", () => {
  const ANTES = { ...process.env };

  function cargar(variables: Record<string, string>) {
    Object.assign(process.env, variables);
    delete require.cache[require.resolve("../config")];
    return (require("../config") as typeof import("../config")).config;
  }

  afterEach(() => {
    for (const clave of ["FIN_DE_TURNO", "TELEFONO_TRASPASO"]) {
      if (ANTES[clave] === undefined) delete process.env[clave];
      else process.env[clave] = ANTES[clave];
    }
    delete require.cache[require.resolve("../config")];
  });

  it('FIN_DE_TURNO vacio es "texto" y no admite otra cosa', () => {
    assert.equal(cargar({ FIN_DE_TURNO: "" }).finDeTurno, "texto");
    assert.equal(cargar({ FIN_DE_TURNO: "VAPI" }).finDeTurno, "vapi");
    assert.throws(() => cargar({ FIN_DE_TURNO: "rapido" }), /FIN_DE_TURNO/);
  });

  it("TELEFONO_TRASPASO acepta espacios pero exige el prefijo", () => {
    assert.equal(cargar({ TELEFONO_TRASPASO: "+34 988 12 34 56" }).telefonoTraspaso, "+34988123456");
    assert.throws(() => cargar({ TELEFONO_TRASPASO: "988123456" }), /prefijo/);
  });
});

describe("presentacion al descolgar", () => {
  it("dice el local, que es, la asistente virtual y lo que puede hacer", () => {
    const saludo = (buildAssistant(LA_VITA_BUONA) as unknown as { firstMessage: string }).firstMessage;
    assert.match(saludo, /gracias por llamar a La Vita Buona, restaurante italiano en Ourense/);
    assert.match(saludo, /asistente virtual/);
    assert.match(saludo, /para recoger en el local o a domicilio/);
    assert.ok(saludo.length <= 1000);
  });

  it("sin reparto no ofrece domicilio", () => {
    const sin = { ...LA_VITA_BUONA, entrega: { ...LA_VITA_BUONA.entrega, disponible: false } };
    assert.ok(!/domicilio/.test(saludoInicial(sin)));
  });

  it("el prompt no le hace presentarse dos veces", () => {
    assert.match(buildSystemPrompt(LA_VITA_BUONA), /no te vuelvas a presentar/);
  });

  it("un saludo propio vale si dice que es virtual, y si no, no pasa", () => {
    const bien = { ...LA_VITA_BUONA, saludo: "La Vita Buona, buenas. Soy Noah, la asistente virtual." };
    assert.equal(saludoInicial(bien), bien.saludo);
    assert.deepEqual(camposQueFaltan(bien), []);
    const mal = { ...LA_VITA_BUONA, saludo: "La Vita Buona, buenas, digame." };
    assert.ok(camposQueFaltan(mal).some((c) => c.startsWith("saludo")));
  });
});

describe("lo que fallo en la prueba del pedido de 97 euros", () => {
  it("el numero desde el que llama sale del mensaje de Vapi", () => {
    assert.equal(telefonoDelCliente({ type: "x", call: { customer: { number: "+34600112233" } } }), "+34600112233");
    assert.equal(telefonoDelCliente({ type: "x", customer: { number: "+34600112233" } }), "+34600112233");
    assert.equal(telefonoDelCliente({ type: "x", call: {} }), "");
  });

  it("si dice 'este mismo', el prompt ya tiene el numero", () => {
    const prompt = buildSystemPrompt(LA_VITA_BUONA, "+34600112233");
    assert.match(prompt, /llama desde el \+34600112233/);
    assert.match(prompt, /acaba en 2 3 3/);
    assert.match(buildSystemPrompt(LA_VITA_BUONA), /numero oculto/);
  });

  it("sin telefono dictado, el pedido se guarda con el de la llamada", () => {
    const total = calcularTotal(LA_VITA_BUONA, [{ plato: "p-margaritha", cantidad: 1 }], "recogida");
    const pedido = construirPedido(
      LA_VITA_BUONA,
      { articulos: [], entrega: "recogida", telefonoLlamada: "+34600112233" },
      total,
    );
    assert.equal(pedido.telefono, "+34600112233");
  });

  it("si falta la direccion, el error es de los que se arreglan preguntando", () => {
    const total = calcularTotal(LA_VITA_BUONA, [{ plato: "p-margaritha", cantidad: 1 }], "reparto");
    assert.throws(
      () => construirPedido(LA_VITA_BUONA, { articulos: [], entrega: "reparto" }, total),
      DatosIncompletosError,
    );
  });

  it("no cambia una pizza por otro plato que se llame parecido", () => {
    assert.match(buildSystemPrompt(LA_VITA_BUONA), /Nunca cambies una pizza por algo que\s+no es pizza/);
  });

  it("ante un fallo nunca le dice que el restaurante esta cerrado", () => {
    assert.match(buildSystemPrompt(LA_VITA_BUONA), /Nunca digas ni des a entender que el restaurante esta cerrado/);
    assert.ok(!/en horario de apertura para confirmar/.test(buildSystemPrompt(LA_VITA_BUONA)));
  });
});

describe("pedidos grandes", () => {
  it("el modelo tiene sitio para un pedido grande: no el tope de 250 de Vapi", () => {
    const modelo = (buildAssistant(LA_VITA_BUONA) as unknown as { model: { maxTokens?: number } }).model;
    assert.ok(modelo.maxTokens !== undefined, "sin maxTokens Vapi pone 250 y corta la lista de platos");
    assert.ok(modelo.maxTokens >= 1000 && modelo.maxTokens <= 10000, String(modelo.maxTokens));
  });
});

describe("sonido de fondo propio", async () => {
  const { fondoDeLlamada } = await import("../assistant");
  const { existsSync } = await import("node:fs");
  const { join } = await import("node:path");

  it('"pizzeria" se convierte en la URL publica del audio', () => {
    assert.equal(
      fondoDeLlamada("pizzeria", "https://ejemplo.ngrok-free.dev"),
      "https://ejemplo.ngrok-free.dev/audio/ambiente-pizzeria.mp3",
    );
  });

  it("sin URL publica, silencio: Vapi no podria descargarlo", () => {
    assert.equal(fondoDeLlamada("pizzeria", ""), "off");
  });

  it("los valores de Vapi pasan tal cual", () => {
    assert.equal(fondoDeLlamada("office", "https://x"), "office");
    assert.equal(fondoDeLlamada("off", "https://x"), "off");
  });

  it("el fichero existe de verdad", () => {
    assert.ok(existsSync(join(__dirname, "..", "..", "public", "audio", "ambiente-pizzeria.mp3")));
  });
});

describe("tiempo estimado segun el tamano del pedido", async () => {
  const { tiempoEstimado } = await import("../pedido");
  const pedir = (lineas: Array<[string, number]>, entrega: "recogida" | "reparto") =>
    calcularTotal(LA_VITA_BUONA, lineas.map(([plato, cantidad]) => ({ plato, cantidad })), entrega);

  it("un pedido normal da el tiempo de la ficha", () => {
    assert.equal(tiempoEstimado(LA_VITA_BUONA, pedir([["p-margaritha", 2]], "recogida")), "entre 15 y 20 minutos");
  });

  it("diez pizzas para recoger ya no salen en 15-20", () => {
    // El pedido real que lo destapo: 10 pizzas y el agente dijo 15-20.
    const total = pedir([["p-prosciutto", 5], ["g-davinci", 1], ["g-giovani", 1], ["p-bbq", 1], ["p-5formaggio", 1], ["p-mare-monte", 1]], "recogida");
    assert.equal(total.unidadesACocinar, 10);
    assert.equal(tiempoEstimado(LA_VITA_BUONA, total), "entre 25 y 30 minutos");
  });

  it("las bebidas y los postres hechos no alargan la espera", () => {
    const total = pedir([["p-margaritha", 2], ["b-cocacola", 6], ["po-tiramisu", 4]], "reparto");
    assert.equal(total.unidadesACocinar, 2);
    assert.equal(tiempoEstimado(LA_VITA_BUONA, total), "entre 35 y 45 minutos");
  });

  it("calcular_total y el prompt le dicen que use ese tiempo", () => {
    const total = pedir([["p-prosciutto", 10]], "recogida");
    const { describirTotal } = require("../pedido") as typeof import("../pedido");
    assert.match(describirTotal(LA_VITA_BUONA, total), /Tiempo estimado para este pedido: estara listo entre 25 y 30 minutos/);
    assert.match(buildSystemPrompt(LA_VITA_BUONA), /el\s+tiempo de CADA pedido te lo dan las herramientas/);
  });

  it("el pedido guardado lleva el tiempo que se le dijo", () => {
    const total = pedir([["p-prosciutto", 10]], "recogida");
    const pedido = construirPedido(LA_VITA_BUONA, { articulos: [], entrega: "recogida" }, total);
    assert.equal(pedido.tiempoEstimado, "entre 25 y 30 minutos");
  });
});
