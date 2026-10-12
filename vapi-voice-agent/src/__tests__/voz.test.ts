/**
 * El bloque de voz que se manda a Vapi. Si sale mal formado no hay error que
 * leer: la llamada simplemente no conecta.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAssistant, construirVoz, nombreDelAgente } from "../assistant";
import { config } from "../config";
import { fallbackBusiness } from "../db/fallbackBusiness";

describe("construirVoz", () => {
  it("con Azure manda solo proveedor e identificador", () => {
    assert.deepEqual(
      construirVoz({
        proveedor: "azure",
        voiceId: "es-ES-XimenaMultilingualNeural",
        modelo: "eleven_flash_v2_5",
        velocidad: 1.1,
      }),
      { provider: "azure", voiceId: "es-ES-XimenaMultilingualNeural" },
    );
  });

  it("con ElevenLabs flash v2.5 fuerza el espanol y aplica la velocidad", () => {
    const voz = construirVoz({
      proveedor: "11labs",
      voiceId: "abc123",
      modelo: "eleven_flash_v2_5",
      velocidad: 1.1,
    });
    assert.equal(voz.provider, "11labs");
    assert.equal(voz.voiceId, "abc123");
    assert.equal(voz.model, "eleven_flash_v2_5");
    assert.equal(voz.language, "es");
    assert.equal(voz.speed, 1.1);
  });

  it("con otro modelo de ElevenLabs no manda idioma, que Vapi lo rechaza", () => {
    const voz = construirVoz({
      proveedor: "11labs",
      voiceId: "abc123",
      modelo: "eleven_multilingual_v2",
      velocidad: 1,
    });
    assert.equal(voz.model, "eleven_multilingual_v2");
    assert.equal("language" in voz, false);
  });

  it("no activa los ajustes que suben la latencia y entrecortan la voz", () => {
    const voz = construirVoz({
      proveedor: "11labs",
      voiceId: "abc123",
      modelo: "eleven_flash_v2_5",
      velocidad: 1.05,
    });
    assert.equal(voz.style, 0, "style > 0 sube la latencia y corta el audio");
    assert.equal(voz.useSpeakerBoost, false, "speaker boost sube la latencia");
  });

  it("los ajustes de ElevenLabs estan dentro de los rangos que acepta", () => {
    const voz = construirVoz({
      proveedor: "11labs",
      voiceId: "abc123",
      modelo: "eleven_flash_v2_5",
      velocidad: 1.05,
    });
    for (const campo of ["stability", "similarityBoost", "style"] as const) {
      const valor = voz[campo];
      assert.ok(
        typeof valor === "number" && valor >= 0 && valor <= 1,
        `${campo} = ${String(valor)}`,
      );
    }
    const latencia = voz.optimizeStreamingLatency;
    assert.ok(typeof latencia === "number" && latencia >= 0 && latencia <= 4);
  });
});

/**
 * Como cuelga la llamada.
 *
 * Hubo dos fallos reales aqui. Primero endCallPhrases llevaba "adios" y
 * "hasta luego" y cortaba la llamada en mitad de un pedido. Despues, con una
 * frase larga, paso lo contrario: Vapi la compara como subcadena contra lo
 * que transcribe del asistente, al modelo le basto con meter una coma y la
 * linea se quedo abierta. La solucion no es afinar la frase: es no usar ese
 * mecanismo y dejar que cuelgue la herramienta endCall.
 */
describe("colgar la llamada", () => {
  const asistente = buildAssistant(fallbackBusiness) as unknown as {
    endCallMessage?: string;
    endCallPhrases?: string[];
    model: { tools: Array<Record<string, unknown>>; messages: Array<{ content: string }> };
  };

  it("lleva la herramienta de colgar de Vapi", () => {
    const colgar = asistente.model.tools.filter((t) => t.type === "endCall");
    assert.equal(colgar.length, 1, "falta la herramienta endCall, o esta duplicada");
  });

  it("la herramienta va desnuda: Vapi no admite mas campos ahi", () => {
    const colgar = asistente.model.tools.find((t) => t.type === "endCall");
    assert.deepEqual(
      Object.keys(colgar ?? {}),
      ["type"],
      'endCall solo admite type, messages y rejectionPlan; cualquier otro campo (function, server, name) puede hacer que Vapi rechace el asistente entero',
    );
  });

  it("convive con las dos herramientas propias, que siguen intactas", () => {
    const nombres = asistente.model.tools
      .filter((t) => t.type === "function")
      .map((t) => (t.function as { name: string }).name);
    assert.deepEqual(nombres.sort(), ["calcular_total", "registrar_pedido"]);
  });

  it("NO usa endCallPhrases: es el mecanismo que fallaba en los dos sentidos", () => {
    assert.equal(
      asistente.endCallPhrases,
      undefined,
      "endCallPhrases compara subcadenas: o no casa y no cuelga, o casa de mas y corta a mitad de pedido",
    );
  });

  it("dice algo al colgar, en vez de cortar en seco", () => {
    const mensaje = asistente.endCallMessage ?? "";
    assert.ok(mensaje.trim().length > 0, "sin endCallMessage, Vapi cuelga en silencio");
    assert.ok(mensaje.length <= 1000, "Vapi corta endCallMessage en 1000 caracteres");
  });

  it("el prompt le dice cuando colgar, que es el unico sitio donde se puede", () => {
    const prompt = asistente.model.messages[0]?.content ?? "";
    assert.match(prompt, /cuelga tu la llamada con la herramienta de colgar/i);
    assert.match(
      prompt,
      /no cuelgues nunca antes de haber dado el codigo de pedido/i,
      "sin esto puede colgar a media comanda",
    );
  });
});

/**
 * La identidad de la asistente. Tiene nombre propio para que se pueda
 * brandear, pero sin dejar de avisar de que no es una persona: eso ultimo es
 * obligacion legal (Reglamento de IA, articulo 50).
 */
describe("nombre de la asistente", () => {
  const conNombre = { ...fallbackBusiness, nombreAgente: "Carmina" };

  it("usa el nombre del negocio cuando lo tiene", () => {
    assert.equal(nombreDelAgente(conNombre), "Carmina");
  });

  it("cae al nombre de marca cuando el negocio no trae ninguno", () => {
    assert.equal(nombreDelAgente(fallbackBusiness), config.nombreAgente);
    assert.equal(nombreDelAgente({ ...fallbackBusiness, nombreAgente: "  " }), config.nombreAgente);
  });

  it("se presenta con su nombre al descolgar", () => {
    const a = buildAssistant(conNombre) as unknown as { firstMessage: string };
    assert.match(a.firstMessage, /Soy Carmina/);
    assert.ok(a.firstMessage.includes(fallbackBusiness.nombre));
  });

  it("avisa de que es virtual en el mismo saludo, no solo si preguntan", () => {
    const a = buildAssistant(conNombre) as unknown as { firstMessage: string };
    assert.match(
      a.firstMessage,
      /virtual|automatic/i,
      "el saludo tiene que decir que no es una persona",
    );
  });

  it("el prompt le prohibe hacerse pasar por humana", () => {
    const a = buildAssistant(conNombre) as unknown as {
      model: { messages: Array<{ content: string }> };
    };
    const prompt = a.model.messages[0]?.content ?? "";
    assert.ok(prompt.includes("Carmina"), "el prompt no le dice como se llama");
    assert.match(prompt, /nunca digas ni des a entender que eres humana/i);
  });
});
