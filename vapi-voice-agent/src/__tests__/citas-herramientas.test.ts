/**
 * Las herramientas de citas, que es donde se decide si un paciente se queda
 * con hora o no.
 *
 * Lo que mas se prueba aqui no es el camino feliz: es que cuando algo falla,
 * el agente NUNCA le de una hora al paciente. Una cita confirmada que no
 * existe es mucho peor que un "le llamamos ahora".
 */

import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { buscarHuecos, buscarTipoCita, olvidarOfertas, reservarCita } from "../citas/herramientas";
import type { Clinica, TipoCita } from "../db/clinica";
import { CalendarioError, type ClienteCalendario, type DatosCita } from "../google/calendario";
import type { Intervalo } from "../citas/huecos";

const MADRID = "Europe/Madrid";
/** Lunes 19 de octubre de 2026, 08:00 en Madrid. */
const AHORA = new Date("2026-10-19T06:00:00Z");

const LIMPIEZA: TipoCita = {
  id: "limpieza",
  nombre: "una limpieza",
  descripcion: "higiene dental",
  minutos: 30,
};
const URGENCIA: TipoCita = {
  id: "urgencia",
  nombre: "una urgencia",
  descripcion: "dolor",
  minutos: 20,
  esUrgencia: true,
};

const CLINICA: Clinica = {
  modo: "citas",
  id: "prueba",
  nombre: "Clinica de prueba",
  ciudad: "Ourense",
  direccion: "Rua Falsa 1",
  zonaHoraria: MADRID,
  tipoLabel: "clinica dental",
  horario: { texto: "de lunes a viernes", diaCierre: "sabado y domingo" },
  tiposCita: [LIMPIEZA, URGENCIA],
  agenda: {
    calendarId: "clinica@group.calendar.google.com",
    franjas: [1, 2, 3, 4, 5].flatMap((dia) => [
      { dia, desde: "09:00", hasta: "13:30" },
      { dia, desde: "16:00", hasta: "20:00" },
    ]),
    margenMinutos: 0,
    antelacionMinimaHoras: 2,
    diasVista: 3,
    huecosPorTanda: 3,
    pasoMinutos: 15,
  },
  urgencias: { telefono: "988 11 22 33", queDecir: "Venga ahora mismo, le atendemos sin cita." },
  emailCitas: "",
};

/** Un calendario de mentira: le dices que esta ocupado y que va a contestar. */
function calendarioDeMentira(opciones: {
  ocupado?: Intervalo[];
  fallaAlLeer?: boolean;
  fallaAlCrear?: boolean;
  yaExistia?: boolean;
} = {}) {
  const creadas: DatosCita[] = [];
  const api: ClienteCalendario = {
    async tramosOcupados() {
      if (opciones.fallaAlLeer) throw new CalendarioError("notFound");
      return opciones.ocupado ?? [];
    },
    async crearCita(datos) {
      if (opciones.fallaAlCrear) throw new CalendarioError("403");
      creadas.push(datos);
      return { nueva: !opciones.yaExistia, id: "id-de-prueba" };
    },
  };
  return { api, creadas };
}

function contexto(calendario: ClienteCalendario | null, callId = "llamada-1") {
  return { clinica: CLINICA, calendario, callId, ahora: AHORA };
}

beforeEach(() => olvidarOfertas());

describe("buscarTipoCita", () => {
  it("encuentra por id y por nombre", () => {
    assert.equal(buscarTipoCita(CLINICA, "limpieza")?.id, "limpieza");
    assert.equal(buscarTipoCita(CLINICA, "una limpieza")?.id, "limpieza");
  });

  it("aguanta el articulo y las tildes de mas", () => {
    assert.equal(buscarTipoCita(CLINICA, "LIMPIEZA")?.id, "limpieza");
    assert.equal(buscarTipoCita(CLINICA, " Limpiezá ")?.id, "limpieza");
  });

  it("no se inventa uno cuando no lo hay", () => {
    assert.equal(buscarTipoCita(CLINICA, "un implante"), undefined);
    assert.equal(buscarTipoCita(CLINICA, ""), undefined);
  });
});

describe("buscar_huecos", () => {
  it("ofrece huecos y manda la hora exacta para reservar", async () => {
    const { api } = calendarioDeMentira();
    const texto = await buscarHuecos(contexto(api), { tipo_cita: "limpieza" });

    assert.match(texto, /Huecos libres para una limpieza/);
    assert.match(texto, /hoy a las diez de la manana/);
    // La hora en formato de maquina tiene que ir, para no depender de memoria.
    assert.match(texto, /\[1\]=2026-10-19T08:00:00\.000Z/);
    assert.ok(!texto.includes("\n"), "Vapi necesita una sola linea");
  });

  it("si el paciente llama con dolor, no busca hueco: deriva con la frase de la clinica", async () => {
    const { api } = calendarioDeMentira();
    const texto = await buscarHuecos(contexto(api), { tipo_cita: "urgencia" });

    assert.match(texto, /no busques hueco/);
    assert.ok(texto.includes(CLINICA.urgencias.queDecir), "tiene que decir la frase de la clinica, literal");
  });

  it("si no sabe de que cita hablan, pregunta en vez de elegir por su cuenta", async () => {
    const { api } = calendarioDeMentira();
    const texto = await buscarHuecos(contexto(api), { tipo_cita: "un implante de titanio" });
    assert.match(texto, /No se de que tipo de cita/);
    assert.match(texto, /una limpieza/);
  });

  it("si el calendario falla, NO da ninguna hora", async () => {
    const { api } = calendarioDeMentira({ fallaAlLeer: true });
    const texto = await buscarHuecos(contexto(api), { tipo_cita: "limpieza" });

    assert.match(texto, /no le des ninguna hora/i);
    assert.ok(!/\d{1,2}:\d{2}/.test(texto), "no puede colarse ninguna hora");
  });

  it("sin calendario configurado, tampoco", async () => {
    const texto = await buscarHuecos(contexto(null), { tipo_cita: "limpieza" });
    assert.match(texto, /no le des ninguna hora/i);
  });

  it("con la agenda llena, lo dice y pide telefono", async () => {
    // Ocupado de lunes a miercoles entero.
    const { api } = calendarioDeMentira({
      ocupado: [{ desde: new Date("2026-10-19T00:00:00Z"), hasta: new Date("2026-10-23T00:00:00Z") }],
    });
    const texto = await buscarHuecos(contexto(api), { tipo_cita: "limpieza" });
    assert.match(texto, /No queda ningun hueco/);
    assert.match(texto, /telefono/);
  });
});

describe("reservar_cita", () => {
  it("reserva con la hora exacta que se le devolvio", async () => {
    const { api, creadas } = calendarioDeMentira();
    const texto = await reservarCita(contexto(api), {
      inicio: "2026-10-19T08:00:00.000Z",
      tipo_cita: "limpieza",
      nombre: "Marta",
      telefono: "600 11 22 33",
    });

    assert.match(texto, /Cita puesta/);
    assert.match(texto, /hoy a las diez de la manana/);
    assert.equal(creadas.length, 1);
    const cita = creadas[0];
    assert.ok(cita);
    assert.equal(cita.inicio.toISOString(), "2026-10-19T08:00:00.000Z");
    assert.equal(cita.fin.toISOString(), "2026-10-19T08:30:00.000Z", "media hora, la que dura una limpieza");
    assert.match(cita.detalle, /Telefono: 600 11 22 33/);
  });

  it("tambien vale decir 'el segundo' si se ofrecieron en esta llamada", async () => {
    const { api, creadas } = calendarioDeMentira();
    await buscarHuecos(contexto(api), { tipo_cita: "limpieza" });
    const texto = await reservarCita(contexto(api), {
      opcion: 2,
      nombre: "Marta",
      telefono: "600 11 22 33",
    });

    assert.match(texto, /Cita puesta/);
    assert.equal(creadas.length, 1);
  });

  it("sin nombre o sin telefono no reserva", async () => {
    const { api, creadas } = calendarioDeMentira();
    assert.match(
      await reservarCita(contexto(api), { inicio: "2026-10-19T08:00:00.000Z", tipo_cita: "limpieza", telefono: "600" }),
      /Falta el nombre/,
    );
    assert.match(
      await reservarCita(contexto(api), { inicio: "2026-10-19T08:00:00.000Z", tipo_cita: "limpieza", nombre: "Marta" }),
      /Falta un telefono/,
    );
    assert.equal(creadas.length, 0);
  });

  it("si no se entiende que hora quiere, no se inventa una", async () => {
    const { api, creadas } = calendarioDeMentira();
    const texto = await reservarCita(contexto(api), {
      inicio: "cuando sea",
      tipo_cita: "limpieza",
      nombre: "Marta",
      telefono: "600",
    });
    assert.match(texto, /No se que hora ha elegido/);
    assert.equal(creadas.length, 0);
  });

  it("si entre medias le han dado esa hora a otro, no la pisa", async () => {
    // El hueco se ofrecio libre, pero al ir a escribir ya esta cogido.
    const { api, creadas } = calendarioDeMentira({
      ocupado: [{ desde: new Date("2026-10-19T08:00:00Z"), hasta: new Date("2026-10-19T08:30:00Z") }],
    });
    const texto = await reservarCita(contexto(api), {
      inicio: "2026-10-19T08:00:00.000Z",
      tipo_cita: "limpieza",
      nombre: "Marta",
      telefono: "600",
    });

    assert.match(texto, /ya no esta libre/);
    assert.equal(creadas.length, 0, "no puede escribir encima");
  });

  it("una hora fuera del horario de la clinica se rechaza", async () => {
    const { api, creadas } = calendarioDeMentira();
    const texto = await reservarCita(contexto(api), {
      inicio: "2026-10-19T22:00:00.000Z", // medianoche en Madrid
      tipo_cita: "limpieza",
      nombre: "Marta",
      telefono: "600",
    });
    assert.match(texto, /ya no esta libre/);
    assert.equal(creadas.length, 0);
  });

  it("si la llamada reintenta, lo dice y no duplica", async () => {
    const { api } = calendarioDeMentira({ yaExistia: true });
    const texto = await reservarCita(contexto(api), {
      inicio: "2026-10-19T08:00:00.000Z",
      tipo_cita: "limpieza",
      nombre: "Marta",
      telefono: "600",
    });
    assert.match(texto, /ya estaba puesta, no se ha duplicado/);
    assert.match(texto, /no vuelvas a reservar/);
  });

  it("si Google rechaza la cita, NO se le confirma al paciente", async () => {
    const { api } = calendarioDeMentira({ fallaAlCrear: true });
    const texto = await reservarCita(contexto(api), {
      inicio: "2026-10-19T08:00:00.000Z",
      tipo_cita: "limpieza",
      nombre: "Marta",
      telefono: "600",
    });
    assert.match(texto, /NO se ha podido poner la cita/);
    assert.ok(!/Cita puesta/.test(texto));
  });

  it("sin calendario no confirma nada", async () => {
    const texto = await reservarCita(contexto(null), {
      inicio: "2026-10-19T08:00:00.000Z",
      tipo_cita: "limpieza",
      nombre: "Marta",
      telefono: "600",
    });
    assert.match(texto, /NO le confirmes la cita/);
  });

  it("la memoria de una llamada no se mezcla con la de otra", async () => {
    const { api, creadas } = calendarioDeMentira();
    await buscarHuecos(contexto(api, "llamada-A"), { tipo_cita: "limpieza" });
    // Otra llamada distinta pide "la segunda" sin que le hayan ofrecido nada.
    const texto = await reservarCita(contexto(api, "llamada-B"), {
      opcion: 2,
      tipo_cita: "limpieza",
      nombre: "Marta",
      telefono: "600",
    });
    assert.match(texto, /No se que hora ha elegido/);
    assert.equal(creadas.length, 0);
  });
});
