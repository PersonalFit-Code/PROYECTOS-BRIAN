/**
 * Quien puede abrir el panel de pedidos.
 *
 * Esto guarda direcciones y telefonos de clientes, asi que un fallo aqui no
 * es un fallo de comodidad. Paso de verdad: sin PANEL_PASSWORD el panel solo
 * debia responder al propio ordenador, pero ngrok reenvia a localhost y el
 * servidor veia 127.0.0.1 en todas las peticiones. Resultado: el panel quedo
 * abierto a cualquiera que supiera la direccion del tunel.
 */

import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import type { AddressInfo } from "node:net";

import { createApp } from "../app";

/** Levanta el servidor con la configuracion dada y devuelve su direccion. */
async function servidor(panelPassword: string) {
  process.env.PANEL_PASSWORD = panelPassword;
  process.env.FIREBASE_SERVICE_ACCOUNT = "";
  // La configuracion se lee al importar, asi que hay que recargarla.
  const rutaConfig = require.resolve("../config");
  const rutaPanel = require.resolve("../routes/panel");
  const rutaApp = require.resolve("../app");
  for (const r of [rutaConfig, rutaPanel, rutaApp]) delete require.cache[r];
  const { createApp: crear } = require("../app") as { createApp: typeof createApp };

  const app = crear();
  const srv = app.listen(0);
  await new Promise((r) => srv.once("listening", r));
  const { port } = srv.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    cerrar: () => new Promise<void>((r) => srv.close(() => r())),
  };
}

/** Cabecera que pone cualquier tunel o proxy al reenviar. */
const DE_FUERA = { "x-forwarded-for": "203.0.113.9" };

describe("acceso al panel sin contrasena", () => {
  it("responde al propio ordenador", async () => {
    const s = await servidor("");
    try {
      const r = await fetch(`${s.url}/pedidos`);
      assert.equal(r.status, 200);
    } finally {
      await s.cerrar();
    }
  });

  it("NO responde a traves de un tunel, aunque el socket diga 127.0.0.1", async () => {
    const s = await servidor("");
    try {
      const cabeceras: Array<Record<string, string>> = [
        { "x-forwarded-for": "203.0.113.9" },
        { "x-forwarded-host": "algo.ngrok-free.dev" },
        { "x-real-ip": "203.0.113.9" },
        { forwarded: "for=203.0.113.9" },
      ];
      for (const cabecera of cabeceras) {
        const r = await fetch(`${s.url}/pedidos`, { headers: cabecera });
        assert.equal(
          r.status,
          403,
          `con ${Object.keys(cabecera)[0]} el panel deberia estar cerrado`,
        );
      }
    } finally {
      await s.cerrar();
    }
  });

  it("tampoco deja leer los datos ni marcar atendidos por el tunel", async () => {
    const s = await servidor("");
    try {
      const datos = await fetch(`${s.url}/pedidos/datos`, { headers: DE_FUERA });
      assert.equal(datos.status, 403);
      const marcar = await fetch(`${s.url}/pedidos/atendido`, {
        method: "POST",
        headers: { ...DE_FUERA, "content-type": "application/json" },
        body: JSON.stringify({ docId: "x" }),
      });
      assert.equal(marcar.status, 403);
    } finally {
      await s.cerrar();
    }
  });
});

describe("acceso al panel con contrasena", () => {
  const auth = "Basic " + Buffer.from("cocina:secreta123").toString("base64");

  it("pide credenciales a quien llega de fuera", async () => {
    const s = await servidor("secreta123");
    try {
      const r = await fetch(`${s.url}/pedidos`, { headers: DE_FUERA });
      assert.equal(r.status, 401);
      assert.match(r.headers.get("www-authenticate") ?? "", /Basic/);
    } finally {
      await s.cerrar();
    }
  });

  it("abre con las credenciales correctas, que es lo que permite la demo", async () => {
    const s = await servidor("secreta123");
    try {
      const r = await fetch(`${s.url}/pedidos`, {
        headers: { ...DE_FUERA, authorization: auth },
      });
      assert.equal(r.status, 200);
    } finally {
      await s.cerrar();
    }
  });

  it("rechaza una contrasena equivocada", async () => {
    const s = await servidor("secreta123");
    try {
      const r = await fetch(`${s.url}/pedidos`, {
        headers: {
          ...DE_FUERA,
          authorization: "Basic " + Buffer.from("cocina:mala").toString("base64"),
        },
      });
      assert.equal(r.status, 401);
    } finally {
      await s.cerrar();
    }
  });
});

after(() => {
  delete process.env.PANEL_PASSWORD;
});
