/**
 * El tope de tiempo. Si esto falla, una consulta lenta puede dejar al cliente
 * escuchando silencio hasta que la llamada se muere sola.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { conLimite } from "../util/espera";

const tarda = <T>(ms: number, valor: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(valor), ms));

const fallaEn = (ms: number, mensaje: string): Promise<never> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(mensaje)), ms));

describe("conLimite", () => {
  it("devuelve el valor si llega a tiempo", async () => {
    assert.equal(await conLimite(tarda(5, "hecho"), 200), "hecho");
  });

  it("devuelve null si tarda mas de la cuenta", async () => {
    assert.equal(await conLimite(tarda(200, "tarde"), 20), null);
  });

  it("propaga el error si falla antes del limite", async () => {
    await assert.rejects(conLimite(fallaEn(5, "roto"), 200), /roto/);
  });

  it("un fallo posterior al limite no deja un rechazo sin atender", async () => {
    const sinAtender: unknown[] = [];
    const escucha = (razon: unknown): void => {
      sinAtender.push(razon);
    };
    process.on("unhandledRejection", escucha);
    try {
      assert.equal(await conLimite(fallaEn(20, "tarde y roto"), 5), null);
      await tarda(60, null);
    } finally {
      process.off("unhandledRejection", escucha);
    }
    assert.deepEqual(sinAtender, []);
  });

  it("no deja temporizadores vivos cuando resuelve a tiempo", async () => {
    // Si quedara un setTimeout pendiente, el proceso no terminaria solo.
    const antes = process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;
    await conLimite(tarda(1, "ya"), 5_000);
    const despues = process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;
    assert.ok(despues <= antes, `temporizadores: ${antes} -> ${despues}`);
  });
});
