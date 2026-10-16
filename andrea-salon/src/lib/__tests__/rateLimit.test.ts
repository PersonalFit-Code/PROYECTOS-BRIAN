/**
 * La cuota por IP: cuenta, bloquea, reinicia y, sobre todo, olvida.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { crearLimitador, ipDePeticion } from "../rateLimit";

/** Un reloj que solo avanza cuando la prueba lo dice. */
function reloj(inicio = 1_000_000) {
  let t = inicio;
  return { ahora: () => t, avanzar: (ms: number) => (t += ms) };
}

describe("crearLimitador", () => {
  it("deja pasar hasta el máximo y después dice cuánto esperar", () => {
    const r = reloj();
    const limitador = crearLimitador({ maximo: 3, ventanaMs: 10_000, ahora: r.ahora });

    assert.deepEqual(limitador.permitir("ip-a"), { ok: true });
    assert.deepEqual(limitador.permitir("ip-a"), { ok: true });
    assert.deepEqual(limitador.permitir("ip-a"), { ok: true });
    assert.deepEqual(limitador.permitir("ip-a"), { ok: false, reintentarEnMs: 10_000 });

    r.avanzar(4_000);
    assert.deepEqual(limitador.permitir("ip-a"), { ok: false, reintentarEnMs: 6_000 });
  });

  it("la ventana empieza con la primera petición y al acabar se reinicia", () => {
    const r = reloj();
    const limitador = crearLimitador({ maximo: 2, ventanaMs: 10_000, ahora: r.ahora });
    limitador.permitir("ip-a");
    r.avanzar(9_999);
    limitador.permitir("ip-a");
    assert.equal(limitador.permitir("ip-a").ok, false, "la segunda no mueve la ventana");
    r.avanzar(1);
    assert.deepEqual(limitador.permitir("ip-a"), { ok: true }, "a los 10 s exactos vuelve a haber cuota");
    assert.deepEqual(limitador.permitir("ip-a"), { ok: true });
    assert.equal(limitador.permitir("ip-a").ok, false);
  });

  it("cada clave lleva su cuenta", () => {
    const limitador = crearLimitador({ maximo: 1, ventanaMs: 10_000, ahora: reloj().ahora });
    assert.equal(limitador.permitir("ip-a").ok, true);
    assert.equal(limitador.permitir("ip-a").ok, false);
    assert.equal(limitador.permitir("ip-b").ok, true);
    assert.equal(limitador.tamano, 2);
  });

  it("barrer() olvida las claves caducadas y dice cuántas", () => {
    const r = reloj();
    const limitador = crearLimitador({ maximo: 5, ventanaMs: 10_000, ahora: r.ahora });
    limitador.permitir("ip-a");
    limitador.permitir("ip-b");
    r.avanzar(5_000);
    limitador.permitir("ip-c");
    assert.equal(limitador.barrer(), 0, "nada ha caducado todavía");
    assert.equal(limitador.tamano, 3);

    r.avanzar(5_000);
    assert.equal(limitador.barrer(), 2, "a y b han cumplido sus diez segundos");
    assert.equal(limitador.tamano, 1);

    r.avanzar(5_000);
    assert.equal(limitador.barrer(), 1);
    assert.equal(limitador.tamano, 0);
  });

  it("barre solo cada barridoMs como mucho, al atender una petición", () => {
    const r = reloj();
    const limitador = crearLimitador({ maximo: 5, ventanaMs: 10_000, ahora: r.ahora, barridoMs: 60_000 });
    limitador.permitir("ip-a");
    r.avanzar(20_000);
    limitador.permitir("ip-b");
    assert.equal(limitador.tamano, 2, "a ha caducado pero todavía no toca barrer");

    r.avanzar(40_001);
    limitador.permitir("ip-c");
    assert.equal(limitador.tamano, 1, "al pasar el minuto, la petición de c barre a y b");
  });

  it("por encima de maxClaves barre aunque no toque, para no crecer sin tope", () => {
    const r = reloj();
    const limitador = crearLimitador({ maximo: 5, ventanaMs: 10_000, ahora: r.ahora, maxClaves: 2, barridoMs: 3_600_000 });
    limitador.permitir("ip-a");
    limitador.permitir("ip-b");
    limitador.permitir("ip-c");
    assert.equal(limitador.tamano, 3, "las vivas no se tocan");
    r.avanzar(10_000);
    limitador.permitir("ip-d");
    assert.equal(limitador.tamano, 1, "con el mapa por encima del tope, las caducadas se van");
  });

  it("una clave caducada no revive arrastrando su cuenta", () => {
    const r = reloj();
    const limitador = crearLimitador({ maximo: 2, ventanaMs: 10_000, ahora: r.ahora, barridoMs: 3_600_000 });
    limitador.permitir("ip-a");
    limitador.permitir("ip-a");
    r.avanzar(10_000);
    assert.equal(limitador.permitir("ip-a").ok, true);
    assert.equal(limitador.permitir("ip-a").ok, true);
    assert.equal(limitador.permitir("ip-a").ok, false);
  });

  it("usa Date.now si no se le da reloj", () => {
    const limitador = crearLimitador({ maximo: 1, ventanaMs: 60_000 });
    assert.equal(limitador.permitir("ip-a").ok, true);
    const bloqueo = limitador.permitir("ip-a");
    assert.equal(bloqueo.ok, false);
    if (!bloqueo.ok) assert.ok(bloqueo.reintentarEnMs > 0 && bloqueo.reintentarEnMs <= 60_000);
  });

  it("rechaza una configuración sin sentido", () => {
    assert.throws(() => crearLimitador({ maximo: 0, ventanaMs: 1000 }));
    assert.throws(() => crearLimitador({ maximo: 1.5, ventanaMs: 1000 }));
    assert.throws(() => crearLimitador({ maximo: 1, ventanaMs: 0 }));
  });
});

describe("ipDePeticion", () => {
  it("coge la primera IP de x-forwarded-for y, si no, las otras cabeceras", () => {
    assert.equal(ipDePeticion(new Request("http://x/", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } })), "1.2.3.4");
    assert.equal(ipDePeticion(new Request("http://x/", { headers: { "x-forwarded-for": " 1.2.3.4 " } })), "1.2.3.4");
    assert.equal(ipDePeticion(new Request("http://x/", { headers: { "x-real-ip": "9.9.9.9" } })), "9.9.9.9");
    assert.equal(ipDePeticion(new Request("http://x/", { headers: { "cf-connecting-ip": "8.8.8.8" } })), "8.8.8.8");
    assert.equal(ipDePeticion(new Request("http://x/")), "unknown");
  });
});
