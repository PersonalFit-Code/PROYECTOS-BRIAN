/**
 * El bloque de voz que se manda a Vapi. Si sale mal formado no hay error que
 * leer: la llamada simplemente no conecta.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAssistant, construirVoz } from "../assistant";
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
 * Vapi cuelga en cuanto el agente dice una de las endCallPhrases, buscandolas
 * como texto suelto. Una llamada real se corto por esto: la lista llevaba
 * "adios" y "hasta luego".
 */
describe("frases que cuelgan la llamada", () => {
  const asistente = buildAssistant(fallbackBusiness) as unknown as {
    endCallPhrases: string[];
    model: { messages: Array<{ content: string }> };
  };

  it("ninguna es una despedida corriente que se pueda soltar sin querer", () => {
    const peligrosas = ["adios", "hasta luego", "gracias", "vale", "nada mas"];
    for (const frase of asistente.endCallPhrases) {
      assert.ok(
        !peligrosas.includes(frase.trim().toLowerCase()),
        `"${frase}" se dice en cualquier conversacion y colgaria la llamada`,
      );
    }
  });

  it("son frases largas, no una palabra suelta", () => {
    for (const frase of asistente.endCallPhrases) {
      assert.ok(
        frase.trim().split(/\s+/).length >= 4,
        `"${frase}" es demasiado corta para no decirla por accidente`,
      );
    }
  });

  it("el prompt le dice al agente la frase exacta con la que despedirse", () => {
    const prompt = asistente.model.messages[0]?.content ?? "";
    for (const frase of asistente.endCallPhrases) {
      assert.ok(
        prompt.toLowerCase().includes(frase.trim().toLowerCase()),
        `el prompt no menciona "${frase}", asi que el agente no sabe como colgar`,
      );
    }
  });
});
