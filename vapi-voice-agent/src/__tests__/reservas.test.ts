/**
 * El modo reservas de restaurante, con Hilderwin (Westende) como ejemplo.
 *
 * Lo que se comprueba: que las reglas del restaurante las aplica el servidor
 * (martes y miercoles cerrado, turnos fijos del sabado, mas de 8 personas a
 * confirmar), que una llamada deja una sola reserva, y que el asistente que se
 * le da a Vapi escucha y habla en varios idiomas.
 *
 * Firebase se apaga ANTES de cargar nada: con el .env de quien lanza los tests,
 * las reservas de prueba acabarian en la base de datos de verdad.
 */

process.env.FIREBASE_SERVICE_ACCOUNT = "";
process.env.VAPI_SERVER_SECRET = "";
process.env.PUBLIC_SERVER_URL = "";

import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import type { AddressInfo } from "node:net";

import type * as Herramientas from "../reservas/herramientas";
import type * as Reservas from "../db/reservas";
import type * as Restaurantes from "../db/restaurantesDeEjemplo";
import type * as Restaurante from "../db/restaurante";
import type * as AsistenteReservas from "../assistantReservas";
import type * as Negocios from "../db/businesses";

// require y no import: los import se ejecutan antes que las lineas de arriba.
const herramientas = require("../reservas/herramientas") as typeof Herramientas;
const reservas = require("../db/reservas") as typeof Reservas;
const { HILDERWIN } = require("../db/restaurantesDeEjemplo") as typeof Restaurantes;
const { esRestaurante, camposQueFaltanRestaurante } = require("../db/restaurante") as typeof Restaurante;
const { buildAssistantReservas, buildSystemPromptReservas } =
  require("../assistantReservas") as typeof AsistenteReservas;
const { getNegocio } = require("../db/businesses") as typeof Negocios;

// Lunes 23 de noviembre de 2026, 10:00 en Bruselas (09:00 UTC).
const AHORA = new Date("2026-11-23T09:00:00Z");

const contexto = (callId = "llamada-1", telefonoLlamada = "") => ({
  restaurante: HILDERWIN,
  callId,
  telefonoLlamada,
  ahora: AHORA,
});

describe("horas de reserva de Hilderwin", () => {
  it("lunes: de 12:00 a 13:30 y de 18:00 a 20:00, cada cuarto de hora", () => {
    const horas = herramientas.horasDeReserva(HILDERWIN, 1);
    for (const h of ["12:00", "13:30", "18:00", "19:45", "20:00"]) assert.ok(horas.includes(h), h);
    for (const h of ["11:45", "13:45", "17:45", "20:15", "21:00"]) assert.ok(!horas.includes(h), h);
  });

  it("sabado por la noche solo los turnos de las 18:00 y las 20:00", () => {
    const horas = herramientas.horasDeReserva(HILDERWIN, 6);
    assert.ok(horas.includes("12:30"));
    assert.ok(horas.includes("18:00"));
    assert.ok(horas.includes("20:00"));
    assert.ok(!horas.includes("19:00"));
    assert.ok(!horas.includes("18:15"));
  });

  it("martes y miercoles no hay ninguna", () => {
    assert.deepEqual(herramientas.horasDeReserva(HILDERWIN, 2), []);
    assert.deepEqual(herramientas.horasDeReserva(HILDERWIN, 3), []);
  });
});

describe("comprobarReserva", () => {
  it("un martes dice que cierran y no la acepta", () => {
    const r = herramientas.comprobarReserva(HILDERWIN, "2026-11-24", "19:00", AHORA);
    assert.equal(r.ok, false);
    assert.match(r.ok ? "" : r.motivo, /closed on Tuesday and Wednesday/);
  });

  it("un sabado a las 19:00 no, a las 20:00 si", () => {
    const mal = herramientas.comprobarReserva(HILDERWIN, "2026-11-28", "19:00", AHORA);
    assert.equal(mal.ok, false);
    assert.match(mal.ok ? "" : mal.motivo, /18:00 or 20:00/);
    assert.equal(herramientas.comprobarReserva(HILDERWIN, "2026-11-28", "20:00", AHORA).ok, true);
  });

  it("acepta la hora dicha como 19.30 o 19u30", () => {
    assert.equal(herramientas.comprobarReserva(HILDERWIN, "2026-11-26", "19.30", AHORA).ok, true);
    assert.equal(herramientas.comprobarReserva(HILDERWIN, "2026-11-26", "19u30", AHORA).ok, true);
  });

  it("no acepta una hora que ya ha pasado ni una fecha que no existe", () => {
    assert.equal(herramientas.comprobarReserva(HILDERWIN, "2026-11-23", "12:00", new Date("2026-11-23T11:30:00Z")).ok, false);
    assert.equal(herramientas.comprobarReserva(HILDERWIN, "2026-02-30", "12:00", AHORA).ok, false);
  });

  it("el calendario del prompt pone bien el dia de la semana", () => {
    const calendario = herramientas.calendarioProximosDias(HILDERWIN, AHORA, 7);
    assert.match(calendario, /Monday 2026-11-23 \(today\)/);
    assert.match(calendario, /Tuesday 2026-11-24 \(tomorrow\): closed/);
    assert.match(calendario, /Saturday 2026-11-28: .*fixed sittings at 18:00 or 20:00/);
  });
});

describe("registrar_reserva", () => {
  beforeEach(() => reservas.olvidarReservasEnMemoria());

  const datos = {
    fecha: "2026-11-26",
    hora: "19:30",
    personas: 4,
    nombre: "Peeters",
    telefono: "0470 12 34 56",
    idioma: "nl",
  };

  it("hasta 8 personas queda apuntada", async () => {
    const texto = await herramientas.registrarReserva(contexto(), datos);
    assert.match(texto, /^Reservation noted/);
    const lista = await reservas.listarReservas("hilderwin");
    assert.equal(lista.length, 1);
    assert.equal(lista[0]!.estado, "confirmada");
    assert.equal(lista[0]!.hora, "19:30");
  });

  it("mas de 8 queda como peticion que confirma el restaurante", async () => {
    const texto = await herramientas.registrarReserva(contexto(), { ...datos, personas: 12 });
    assert.match(texto, /NOT confirmed yet/);
    assert.match(texto, /call them back/);
    assert.equal((await reservas.listarReservas("hilderwin"))[0]!.estado, "pendiente");
  });

  it("sin nombre no apunta nada y dice que falta", async () => {
    const texto = await herramientas.registrarReserva(contexto(), { ...datos, nombre: "" });
    assert.match(texto, /NOT registered yet: missing the name/);
    assert.equal((await reservas.listarReservas("hilderwin")).length, 0);
  });

  it("si corrige la hora en la misma llamada queda una sola reserva", async () => {
    await herramientas.registrarReserva(contexto(), datos);
    await herramientas.registrarReserva(contexto(), { ...datos, hora: "20:00" });
    const lista = await reservas.listarReservas("hilderwin");
    assert.equal(lista.length, 1);
    assert.equal(lista[0]!.hora, "20:00");
  });

  it("sin telefono dictado usa el de la llamada", async () => {
    await herramientas.registrarReserva(contexto("llamada-2", "+32470998877"), { ...datos, telefono: "" });
    assert.equal((await reservas.listarReservas("hilderwin"))[0]!.telefono, "+32470998877");
  });
});

describe("dejar_recado", () => {
  beforeEach(() => reservas.olvidarReservasEnMemoria());

  it("guarda el recado para que el restaurante llame", async () => {
    const texto = await herramientas.dejarRecado(contexto(), {
      nombre: "Dubois",
      telefono: "0485 11 22 33",
      mensaje: "Vraagt of de keuken glutenvrij kan koken.",
      idioma: "fr",
    });
    assert.match(texto, /will call them back/);
    const lista = await reservas.listarRecados("hilderwin");
    assert.equal(lista.length, 1);
    assert.equal(lista[0]!.idioma, "fr");
  });

  it("sin de que va no lo guarda", async () => {
    const texto = await herramientas.dejarRecado(contexto(), { nombre: "Dubois", telefono: "0485112233" });
    assert.match(texto, /NOT saved yet/);
  });
});

describe("la ficha y el asistente de Hilderwin", () => {
  it("la ficha es valida, y un saludo que no dice que es automatico no pasa", () => {
    assert.ok(esRestaurante(HILDERWIN));
    assert.ok(
      camposQueFaltanRestaurante({ ...HILDERWIN, saludo: "Goeiedag, restaurant Hilderwin." }).some((c) =>
        c.startsWith("saludo"),
      ),
    );
  });

  it("escucha en varios idiomas y la voz no se fija a ninguno", () => {
    const asistente = buildAssistantReservas(HILDERWIN, "hilderwin") as unknown as {
      transcriber: { language: string; keyterm: string[]; model: string };
      voice: Record<string, unknown>;
      firstMessage: string;
      model: { tools: Array<{ type: string; function?: { name: string } }> };
      endCallMessage?: string;
    };
    assert.equal(asistente.transcriber.model, "nova-3");
    assert.equal(asistente.transcriber.language, "multi");
    assert.ok(asistente.transcriber.keyterm.includes("Hilderwin"));
    assert.ok(asistente.transcriber.keyterm.length <= 50);
    assert.equal("language" in asistente.voice, false);
    assert.equal(asistente.voice.voiceId, "FpLGR2n1CcG1v7SHJFsa");
    assert.match(asistente.firstMessage, /automatische assistent/);
    const nombres = asistente.model.tools.map((t) => t.function?.name ?? t.type);
    assert.deepEqual(nombres, ["registrar_reserva", "dejar_recado", "endCall"]);
    assert.equal(asistente.endCallMessage, undefined, "una despedida fija saldria siempre en un idioma");
  });

  it("el prompt lista los cuatro idiomas, los dias de cierre y no lleva castellano", () => {
    const prompt = buildSystemPromptReservas(HILDERWIN, "+32470998877", AHORA);
    for (const idioma of ["Dutch", "French", "English", "German"]) assert.match(prompt, new RegExp(idioma));
    assert.match(prompt, /- Tuesday: closed/);
    assert.match(prompt, /More than 8 people/);
    assert.match(prompt, /ending in 8 7 7/);
    assert.ok(!/\b(pedido|reserva para|gracias|perfecto|cliente)\b/i.test(prompt), "no puede colarse castellano");
  });

  it("sin Firestore, ?business=hilderwin sirve el restaurante del codigo", async () => {
    const negocio = await getNegocio("hilderwin");
    assert.equal((negocio as { modo?: string }).modo, "reservas");
    assert.equal(negocio.nombre, "Restaurant Hilderwin");
  });

  it("por HTTP, el assistant-request de Hilderwin devuelve el asistente de reservas", async () => {
    const { createApp } = require("../app") as typeof import("../app");
    const servidor = createApp().listen(0);
    await new Promise((r) => servidor.once("listening", r));
    const { port } = servidor.address() as AddressInfo;
    try {
      const respuesta = await fetch(`http://127.0.0.1:${port}/voice-webhook?business=hilderwin`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: { type: "assistant-request", call: { id: "x" } } }),
      });
      const cuerpo = (await respuesta.json()) as { assistant: { name: string; transcriber: { language: string } } };
      assert.match(cuerpo.assistant.name, /Hilderwin/);
      assert.equal(cuerpo.assistant.transcriber.language, "multi");
    } finally {
      await new Promise<void>((r) => servidor.close(() => r()));
    }
  });
});
