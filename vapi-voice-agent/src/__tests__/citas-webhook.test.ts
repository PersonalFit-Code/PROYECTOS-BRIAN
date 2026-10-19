/**
 * Una llamada de cita entera, por donde pasa de verdad: HTTP.
 *
 * Los otros tests de citas prueban las piezas por separado llamando a las
 * funciones. Aqui se levanta el servidor y se le mandan los mismos cuerpos que
 * manda Vapi, con su forma rara de los tool-calls incluida, porque es ahi
 * donde se rompio la primera llamada real del modo pedidos: las funciones
 * estaban bien y el webhook leia el nombre de la herramienta de donde no
 * estaba.
 *
 * Lo que se comprueba, en este orden:
 *  1. assistant-request devuelve el asistente de citas, con sus herramientas.
 *  2. buscar_huecos devuelve horas en una sola linea, con el ISO para copiar.
 *  3. reservar_cita escribe en el calendario y confirma.
 *  4. si entre ofrecer y reservar alguien ocupa esa hora, NO se confirma.
 *
 * El calendario es de mentira; Google no se toca. Eso quiere decir que esto no
 * prueba que Google acepte lo que le mandamos: eso solo lo prueba una cita de
 * verdad en un calendario de verdad.
 */

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";

import { CLINICAS_DE_EJEMPLO } from "../db/clinicasDeEjemplo";
import { olvidarOfertas } from "../citas/herramientas";
import { invalidateBusinessCache } from "../db/businesses";
import { usarCalendario } from "../google/cliente";
import type { ClienteCalendario, DatosCita } from "../google/calendario";
import type { Intervalo } from "../citas/huecos";

const ESTETICA = "airea";

/**
 * Calendario de mentira que se comporta como el de Google en lo que importa:
 * se le puede ocupar una hora a mitad de la prueba, y lo que se escribe queda
 * ocupado para la siguiente lectura.
 */
function calendarioDeMentira() {
  const creadas: DatosCita[] = [];
  const ocupado: Intervalo[] = [];

  const api: ClienteCalendario = {
    async tramosOcupados() {
      return [...ocupado];
    },
    async crearCita(datos) {
      creadas.push(datos);
      ocupado.push({ desde: datos.inicio, hasta: datos.fin });
      return { nueva: true, id: `id-${creadas.length}` };
    },
  };

  return {
    api,
    creadas,
    /** Como si la esteticista hubiera dado esa hora en mano. */
    ocupar(desde: Date, minutos: number) {
      ocupado.push({ desde, hasta: new Date(desde.getTime() + minutos * 60_000) });
    },
  };
}

let calendario: ReturnType<typeof calendarioDeMentira>;
let url: string;
let cerrar: () => Promise<void>;

before(async () => {
  // Sin Firebase y con la clinica de ejemplo puesta, el webhook sirve el
  // centro de estetica. Hay que recargar config y las rutas que la leyeron.
  process.env.FIREBASE_SERVICE_ACCOUNT = "";
  process.env.CLINICA_DE_EJEMPLO = ESTETICA;
  process.env.VAPI_SERVER_SECRET = "";
  process.env.PUBLIC_SERVER_URL = "";
  for (const modulo of [
    "../config",
    "../db/businesses",
    "../routes/panel",
    "../routes/voiceWebhook",
    "../app",
  ]) {
    delete require.cache[require.resolve(modulo)];
  }
  const { createApp } = require("../app") as typeof import("../app");

  // El calendario se sustituye en el modulo recien recargado, no en el que
  // importo este fichero arriba: si no, el webhook seguiria con el de Google.
  const cliente = require("../google/cliente") as { usarCalendario: typeof usarCalendario };
  calendario = calendarioDeMentira();
  cliente.usarCalendario(calendario.api);

  invalidateBusinessCache();
  olvidarOfertas();

  const servidor = createApp().listen(0);
  await new Promise((r) => servidor.once("listening", r));
  const { port } = servidor.address() as AddressInfo;
  url = `http://127.0.0.1:${port}/voice-webhook?business=${ESTETICA}`;
  cerrar = () => new Promise<void>((r) => servidor.close(() => r()));
});

after(async () => {
  await cerrar?.();
});

/** Manda un cuerpo de Vapi y devuelve lo que contesta el servidor. */
async function webhook(message: Record<string, unknown>): Promise<any> {
  const respuesta = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message }),
  });
  assert.equal(respuesta.status, 200, "el webhook tiene que contestar 200");
  return respuesta.json();
}

/**
 * Un tool-call con la forma de la llamada real: los dos arrays, el nombre
 * dentro de function y los argumentos como texto JSON.
 */
async function herramienta(
  nombre: string,
  argumentos: Record<string, unknown>,
  callId = "llamada-estetica-1",
): Promise<string> {
  const llamada = {
    id: `tc-${nombre}`,
    type: "function",
    function: { name: nombre, arguments: JSON.stringify(argumentos) },
  };
  const cuerpo = await webhook({
    type: "tool-calls",
    call: { id: callId },
    toolCallList: [llamada],
    toolCalls: [llamada],
  });

  assert.equal(cuerpo.results?.length, 1, "Vapi espera un results por tool-call");
  assert.equal(cuerpo.results[0].toolCallId, llamada.id);
  const texto = cuerpo.results[0].result;
  assert.equal(typeof texto, "string", "result tiene que ser texto plano");
  assert.ok(!texto.includes("\n"), `result no puede llevar saltos de linea: ${texto}`);
  return texto;
}

describe("llamada de cita de punta a punta, por HTTP", () => {
  it("assistant-request devuelve el asistente de citas del centro de estetica", async () => {
    const cuerpo = await webhook({ type: "assistant-request", call: { id: "x" } });
    const asistente = cuerpo.assistant;

    assert.ok(asistente, "tiene que venir un assistant");
    assert.match(asistente.name, /Airea/);
    assert.match(asistente.firstMessage, /asistente virtual/);

    const prompt = asistente.model.messages[0].content;
    // Si esto se cae es que esta sirviendo el asistente de pedidos.
    assert.match(prompt, /centro de estetica/);
    assert.match(prompt, /PARA QUE PUEDES DAR CITA/);
    assert.ok(!/carta|pedido/i.test(prompt), "no es un negocio de pedidos");

    // Una clienta, no una paciente.
    assert.match(prompt, /la clienta|el clienta|clienta/);
    assert.ok(!/paciente/.test(prompt), "en estetica no se dice paciente");

    // Precio cerrado: en estetica es lo primero que preguntan. Y dicho en
    // palabras, no "25,00 €": el agente tiene prohibido leer simbolos.
    assert.match(prompt, /Cuesta 25 euros/);
    assert.ok(!prompt.includes("€"), "nada de simbolos en una llamada de voz");
    assert.match(prompt, /los que vienen\s*escritos/);

    // Sin urgencias, no se le pone una frase que el centro no ha escrito.
    assert.ok(!/urgencias es el/.test(prompt), "este centro no tiene urgencias");

    const nombres = asistente.model.tools
      .filter((t: any) => t.type === "function")
      .map((t: any) => t.function.name);
    assert.deepEqual(nombres.sort(), ["buscar_huecos", "reservar_cita"]);

    // endCall tiene que ir desnudo: cualquier campo de mas y Vapi rechaza el
    // asistente entero.
    const colgar = asistente.model.tools.find((t: any) => t.type === "endCall");
    assert.deepEqual(colgar, { type: "endCall" });
  });

  it("buscar_huecos da horas reales y el ISO para copiarlo al reservar", async () => {
    const texto = await herramienta("buscar_huecos", { tipo_cita: "manicura-semi" });

    assert.match(texto, /Huecos libres para una manicura con semipermanente/);
    assert.match(texto, /\[1\]=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it("no da hora para un tratamiento que el centro no hace", async () => {
    const texto = await herramienta("buscar_huecos", { tipo_cita: "un masaje descontracturante" });
    assert.match(texto, /No se de que tipo de cita/);
    assert.match(texto, /una manicura/);
  });

  it("reservar_cita escribe en la agenda y solo entonces confirma", async () => {
    const ofrecidos = await herramienta("buscar_huecos", { tipo_cita: "cejas" });
    const inicio = ofrecidos.match(/\[1\]=(\S+)/)?.[1];
    assert.ok(inicio, "buscar_huecos tiene que devolver la hora en ISO");

    const antes = calendario.creadas.length;
    const texto = await herramienta("reservar_cita", {
      inicio,
      tipo_cita: "cejas",
      nombre: "Lucia Varela",
      telefono: "600 11 22 33",
    });

    assert.match(texto, /Cita puesta/);
    assert.equal(calendario.creadas.length, antes + 1, "tiene que haber escrito la cita");

    const cita = calendario.creadas[antes];
    assert.ok(cita);
    assert.equal(cita.inicio.toISOString(), inicio);
    // 20 minutos es lo que dura el diseno de cejas en el ejemplo: la duracion
    // la pone el negocio, no el modelo.
    assert.equal(cita.fin.getTime() - cita.inicio.getTime(), 20 * 60_000);
    assert.match(cita.titulo, /Lucia Varela/);
    assert.match(cita.detalle, /Clienta: Lucia Varela/);
    assert.match(cita.detalle, /600 11 22 33/);
  });

  it("sin nombre o sin telefono no reserva", async () => {
    const sinNombre = await herramienta("reservar_cita", {
      opcion: 1,
      tipo_cita: "cejas",
      nombre: "",
      telefono: "600 11 22 33",
    });
    // "de la clienta", no "del clienta": el prompt y esto los lee un jefe.
    assert.match(sinNombre, /Falta el nombre de la clienta/);

    const sinTelefono = await herramienta("reservar_cita", {
      opcion: 1,
      tipo_cita: "cejas",
      nombre: "Lucia Varela",
      telefono: "",
    });
    assert.match(sinTelefono, /Falta un telefono/);
  });

  it("si le pisan la hora entre ofrecerla y reservarla, NO confirma la cita", async () => {
    const ofrecidos = await herramienta("buscar_huecos", { tipo_cita: "limpieza-facial" });
    const inicio = ofrecidos.match(/\[1\]=(\S+)/)?.[1];
    assert.ok(inicio);

    // La esteticista da esa misma hora en mano mientras la clienta se decide.
    calendario.ocupar(new Date(inicio), 60);

    const antes = calendario.creadas.length;
    const texto = await herramienta("reservar_cita", {
      inicio,
      tipo_cita: "limpieza-facial",
      nombre: "Marta Rey",
      telefono: "600 44 55 66",
    });

    assert.match(texto, /ya no esta libre/);
    assert.equal(calendario.creadas.length, antes, "no puede haber escrito nada");
    assert.ok(!/Cita puesta/.test(texto), "no se le puede confirmar");
  });
});
