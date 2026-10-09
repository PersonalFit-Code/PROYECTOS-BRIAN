/**
 * El bloque de voz que se manda a Vapi. Si sale mal formado no hay error que
 * leer: la llamada simplemente no conecta.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { construirVoz } from "../assistant";

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
