/**
 * La ficha de una clinica y el asistente que sale de ella.
 *
 * Lo que se comprueba aqui no es que "funcione": es que una ficha mal puesta
 * se detecte antes de que suene el telefono, y que el asistente no pueda
 * ofrecer lo que no debe.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAssistantCitas, buildSystemPromptCitas } from "../assistantCitas";
import type { Clinica } from "../db/clinica";
import { camposQueFaltanClinica, esClinica, pideCitas } from "../db/validarClinica";
import { fallbackBusiness } from "../db/fallbackBusiness";

function clinica(cambios: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    modo: "citas",
    id: "pontenova",
    nombre: "Clinica Pontenova",
    ciudad: "Ourense",
    direccion: "Rua do Paseo 12",
    zonaHoraria: "Europe/Madrid",
    tipoLabel: "clinica dental",
    horario: { texto: "de lunes a viernes", diaCierre: "sabado y domingo" },
    tiposCita: [
      { id: "limpieza", nombre: "una limpieza", descripcion: "higiene dental", minutos: 30 },
      { id: "urgencia", nombre: "una urgencia", descripcion: "dolor", minutos: 20, esUrgencia: true },
    ],
    agenda: {
      calendarId: "clinica@group.calendar.google.com",
      franjas: [{ dia: 1, desde: "09:00", hasta: "13:30" }],
      margenMinutos: 10,
      antelacionMinimaHoras: 2,
      diasVista: 7,
      huecosPorTanda: 3,
    },
    urgencias: { telefono: "988 11 22 33", queDecir: "Venga ahora mismo, le atendemos sin cita." },
    emailCitas: "",
    ...cambios,
  };
}

describe("validar la ficha de una clinica", () => {
  it("una ficha completa pasa", () => {
    assert.deepEqual(camposQueFaltanClinica(clinica()), []);
    assert.ok(esClinica(clinica()));
  });

  it("sin frase de urgencias no pasa: es lo unico que puede decirle a alguien con dolor", () => {
    const rota = clinica({ urgencias: { telefono: "988", queDecir: "" } });
    assert.ok(camposQueFaltanClinica(rota).includes("urgencias.queDecir"));
  });

  it('rechaza el calendario "primary", que es el fallo mas caro', () => {
    // "primary" es el calendario de la propia cuenta de servicio. Las citas
    // se crearian sin error, en una agenda que no mira nadie.
    const rota = clinica({ agenda: { ...(clinica().agenda as object), calendarId: "primary" } });
    assert.ok(camposQueFaltanClinica(rota).some((c) => c.startsWith("agenda.calendarId")));
  });

  it("una franja con hora mal escrita no pasa", () => {
    const rota = clinica({
      agenda: { ...(clinica().agenda as object), franjas: [{ dia: 1, desde: "9h", hasta: "13:30" }] },
    });
    assert.ok(camposQueFaltanClinica(rota).includes("agenda.franjas[0].desde"));
  });

  it("un dia de la semana fuera de 1 a 7 no pasa", () => {
    const rota = clinica({
      agenda: { ...(clinica().agenda as object), franjas: [{ dia: 0, desde: "09:00", hasta: "13:30" }] },
    });
    assert.ok(camposQueFaltanClinica(rota).includes("agenda.franjas[0].dia"));
  });

  it("una clinica donde todo son urgencias no puede dar ninguna cita", () => {
    const rota = clinica({
      tiposCita: [{ id: "urg", nombre: "una urgencia", descripcion: "dolor", minutos: 20, esUrgencia: true }],
    });
    assert.ok(camposQueFaltanClinica(rota).some((c) => c.startsWith("tiposCita (")));
  });

  it("una duracion de cero minutos no pasa", () => {
    const rota = clinica({
      tiposCita: [{ id: "x", nombre: "una limpieza", descripcion: "d", minutos: 0 }],
    });
    assert.ok(camposQueFaltanClinica(rota).includes("tiposCita[0].minutos"));
  });

  it("un negocio sin urgencias es valido: un centro de estetica no tiene ninguna", () => {
    const estetica = clinica({
      tipoLabel: "centro de estetica",
      tiposCita: [
        { id: "cejas", nombre: "un diseno de cejas", descripcion: "d", minutos: 20, precioCentimos: 1000 },
      ],
      urgencias: undefined,
      comoLlamarAlCliente: "clienta",
    });
    assert.deepEqual(camposQueFaltanClinica(estetica), []);
  });

  it("pero si hay un tipo marcado como urgencia, la frase no puede faltar", () => {
    const rota = clinica({ urgencias: undefined });
    assert.ok(
      camposQueFaltanClinica(rota).some((c) => c.startsWith("urgencias (")),
      "el agente llegaria al circuito de urgencias sin nada que decir",
    );
  });

  it("un precio tiene que venir en centimos enteros", () => {
    // Un 45 donde iban 4500 lo diria el agente tal cual por telefono.
    for (const precio of [45.5, -100, "25" as unknown as number]) {
      const rota = clinica({
        tiposCita: [
          { id: "x", nombre: "una limpieza", descripcion: "d", minutos: 30, precioCentimos: precio },
        ],
      });
      assert.ok(
        camposQueFaltanClinica(rota).includes("tiposCita[0].precioCentimos"),
        `${precio} no deberia pasar`,
      );
    }
  });

  it("comoLlamarAlCliente puede no estar, pero no puede estar en blanco", () => {
    assert.deepEqual(camposQueFaltanClinica(clinica({ comoLlamarAlCliente: undefined })), []);
    assert.ok(
      camposQueFaltanClinica(clinica({ comoLlamarAlCliente: "  " })).includes(
        "comoLlamarAlCliente",
      ),
    );
  });

  it("distingue una clinica de un negocio de pedidos", () => {
    assert.ok(pideCitas(clinica()));
    assert.ok(!pideCitas(fallbackBusiness));
    assert.ok(!pideCitas(null));
    assert.ok(!pideCitas("citas"));
  });

  it("un negocio de pedidos no cuela como clinica", () => {
    assert.ok(!esClinica(fallbackBusiness));
  });
});

describe("el asistente de citas", () => {
  const ficha = clinica() as unknown as Clinica;

  /** Mismo atajo que en voz.test.ts: el tipo de las herramientas es una union. */
  const comoObjeto = (c: Clinica) =>
    buildAssistantCitas(c, "pontenova") as unknown as {
      firstMessage: string;
      endCallMessage?: string;
      endCallPhrases?: string[];
      model: { tools: Array<Record<string, unknown>> };
    };

  it("solo ofrece los tratamientos agendables, nunca la urgencia", () => {
    const buscar = comoObjeto(ficha).model.tools.find(
      (t) => (t.function as { name?: string } | undefined)?.name === "buscar_huecos",
    );
    assert.ok(buscar, "falta la herramienta de buscar huecos");
    const parametros = (buscar.function as {
      parameters: { properties: Record<string, { enum?: string[] }> };
    }).parameters;
    assert.deepEqual(parametros.properties["tipo_cita"]?.enum, ["limpieza"]);
  });

  it("la herramienta de colgar va desnuda, como exige Vapi", () => {
    const colgar = comoObjeto(ficha).model.tools.find((t) => t.type === "endCall");
    // Cualquier campo de mas y Vapi rechaza el asistente entero.
    assert.deepEqual(Object.keys(colgar ?? {}), ["type"]);
  });

  it("no lleva endCallPhrases, que fue lo que cortaba llamadas a medias", () => {
    const asistente = comoObjeto(ficha);
    assert.equal(asistente.endCallPhrases, undefined);
    assert.equal(asistente.endCallMessage, "Gracias por llamar. ¡Hasta luego!");
  });

  it("la frase de urgencias va literal en el prompt", () => {
    const prompt = buildSystemPromptCitas(ficha);
    assert.ok(prompt.includes("Venga ahora mismo, le atendemos sin cita."));
    assert.match(prompt, /No das consejo sanitario/);
    assert.match(prompt, /No pides datos de salud/);
  });

  it("el prompt prohibe decir horas que no vengan de la herramienta", () => {
    const prompt = buildSystemPromptCitas(ficha);
    assert.match(prompt, /No inventas huecos/);
    assert.match(prompt, /buscar_huecos/);
  });

  it("se presenta con el nombre de la clinica y dice que es virtual", () => {
    const asistente = comoObjeto(ficha);
    assert.match(asistente.firstMessage, /Clinica Pontenova/);
    assert.match(asistente.firstMessage, /asistente virtual/);
  });

  it("una clinica puede ponerle otro nombre a la asistente", () => {
    assert.match(comoObjeto({ ...ficha, nombreAgente: "Sara" }).firstMessage, /Soy Sara/);
  });
});
