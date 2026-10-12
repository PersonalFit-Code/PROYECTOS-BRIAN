/**
 * El cliente de Google Calendar, sin salir a internet.
 *
 * El fetch entra por parametro justo para poder probar los dos casos que de
 * verdad hacen dano y que con credenciales de verdad no se pueden provocar a
 * voluntad: que el calendario no este compartido (y acabemos ofreciendo citas
 * encima de las que ya hay) y que una llamada reintente y cree la cita dos
 * veces.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { crearClienteCalendario, CalendarioError, idDeEvento } from "../google/calendario";

const CALENDARIO = "clinica@group.calendar.google.com";

interface Captura {
  url: string;
  cuerpo: Record<string, unknown>;
  cabeceras: Record<string, string>;
}

/** Un fetch de mentira que apunta lo que le piden y contesta lo que le digas. */
function fetchDeMentira(responder: (url: string) => { status: number; json?: unknown; texto?: string }) {
  const llamadas: Captura[] = [];
  const http = (async (url: string | URL | Request, init?: RequestInit) => {
    const direccion = String(url);
    llamadas.push({
      url: direccion,
      cuerpo: JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>,
      cabeceras: (init?.headers ?? {}) as Record<string, string>,
    });
    const r = responder(direccion);
    return {
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      json: async () => r.json,
      text: async () => r.texto ?? "",
    } as Response;
  }) as unknown as typeof fetch;
  return { http, llamadas };
}

function cliente(responder: (url: string) => { status: number; json?: unknown; texto?: string }) {
  const { http, llamadas } = fetchDeMentira(responder);
  return {
    api: crearClienteCalendario({ token: async () => "token-de-prueba", http }),
    llamadas,
  };
}

describe("tramosOcupados", () => {
  it("devuelve los tramos que da Google", async () => {
    const { api, llamadas } = cliente(() => ({
      status: 200,
      json: {
        calendars: {
          [CALENDARIO]: {
            busy: [
              { start: "2026-10-19T08:00:00Z", end: "2026-10-19T09:00:00Z" },
              { start: "2026-10-19T10:00:00Z", end: "2026-10-19T10:30:00Z" },
            ],
          },
        },
      },
    }));

    const tramos = await api.tramosOcupados({
      calendarId: CALENDARIO,
      desde: new Date("2026-10-19T00:00:00Z"),
      hasta: new Date("2026-10-20T00:00:00Z"),
      zonaHoraria: "Europe/Madrid",
    });

    assert.equal(tramos.length, 2);
    assert.equal(tramos[0]?.desde.toISOString(), "2026-10-19T08:00:00.000Z");
    assert.equal(tramos[1]?.hasta.toISOString(), "2026-10-19T10:30:00.000Z");
    // La ruta lleva B mayuscula; en minuscula Google da 404.
    assert.ok(llamadas[0]?.url.endsWith("/calendar/v3/freeBusy"), llamadas[0]?.url);
    assert.equal(llamadas[0]?.cabeceras["authorization"], "Bearer token-de-prueba");
  });

  it("si el calendario no esta compartido, falla en vez de decir que esta todo libre", async () => {
    // Este es el caso peligroso: Google contesta 200, con la lista de ocupados
    // vacia y el error escondido dentro. Si lo diesemos por bueno, Noah
    // ofreceria citas encima de las que la clinica ya tiene.
    const { api } = cliente(() => ({
      status: 200,
      json: { calendars: { [CALENDARIO]: { busy: [], errors: [{ reason: "notFound" }] } } },
    }));

    await assert.rejects(
      () => api.tramosOcupados({
        calendarId: CALENDARIO,
        desde: new Date("2026-10-19T00:00:00Z"),
        hasta: new Date("2026-10-20T00:00:00Z"),
        zonaHoraria: "Europe/Madrid",
      }),
      (error: unknown) => error instanceof CalendarioError && /notFound/.test(String(error)),
    );
  });

  it("si Google no devuelve ese calendario, tampoco se lo inventa", async () => {
    const { api } = cliente(() => ({ status: 200, json: { calendars: {} } }));
    await assert.rejects(
      () => api.tramosOcupados({
        calendarId: CALENDARIO,
        desde: new Date("2026-10-19T00:00:00Z"),
        hasta: new Date("2026-10-20T00:00:00Z"),
        zonaHoraria: "Europe/Madrid",
      }),
      CalendarioError,
    );
  });

  it("un tramo con fechas ilegibles se descarta sin tirar la llamada", async () => {
    const { api } = cliente(() => ({
      status: 200,
      json: {
        calendars: {
          [CALENDARIO]: {
            busy: [
              { start: "no-es-una-fecha", end: "2026-10-19T09:00:00Z" },
              { start: "2026-10-19T10:00:00Z" },
              { start: "2026-10-19T11:00:00Z", end: "2026-10-19T11:30:00Z" },
            ],
          },
        },
      },
    }));
    const tramos = await api.tramosOcupados({
      calendarId: CALENDARIO,
      desde: new Date("2026-10-19T00:00:00Z"),
      hasta: new Date("2026-10-20T00:00:00Z"),
      zonaHoraria: "Europe/Madrid",
    });
    assert.equal(tramos.length, 1);
  });

  it("un error de red se cuenta, no se traga", async () => {
    const http = (async () => {
      throw new Error("ECONNRESET");
    }) as unknown as typeof fetch;
    const api = crearClienteCalendario({ token: async () => "t", http });
    await assert.rejects(
      () => api.tramosOcupados({
        calendarId: CALENDARIO,
        desde: new Date(),
        hasta: new Date(),
        zonaHoraria: "Europe/Madrid",
      }),
      CalendarioError,
    );
  });
});

describe("crearCita", () => {
  const cita = {
    calendarId: CALENDARIO,
    inicio: new Date("2026-10-20T08:00:00Z"),
    fin: new Date("2026-10-20T08:30:00Z"),
    zonaHoraria: "Europe/Madrid",
    titulo: "Noah - limpieza - Marta",
    detalle: "Pedida por telefono.",
    referencia: "llamada-123",
  };

  it("crea el evento y nunca manda invitados", async () => {
    const { api, llamadas } = cliente(() => ({ status: 200, json: {} }));
    const resultado = await api.crearCita(cita);

    assert.equal(resultado.nueva, true);
    const cuerpo = llamadas[0]?.cuerpo ?? {};
    // Una cuenta de servicio sin delegacion no puede poner invitados: si
    // alguien los añade, Google empieza a devolver 403 y el motivo no se ve.
    assert.ok(!("attendees" in cuerpo), "no puede llevar attendees");
    assert.equal((cuerpo["start"] as Record<string, string>)["timeZone"], "Europe/Madrid");
    assert.equal(cuerpo["summary"], "Noah - limpieza - Marta");
  });

  it("escapa la arroba del calendario en la direccion", async () => {
    const { api, llamadas } = cliente(() => ({ status: 200, json: {} }));
    await api.crearCita(cita);
    assert.ok(llamadas[0]?.url.includes("clinica%40group.calendar.google.com"), llamadas[0]?.url);
  });

  it("si la llamada reintenta, no deja dos citas", async () => {
    // Google rechaza el segundo intento con 409 porque el id ya existe. Eso no
    // es un fallo: es exactamente lo que queremos que pase.
    let intentos = 0;
    const { api } = cliente(() => {
      intentos++;
      return intentos === 1 ? { status: 200, json: {} } : { status: 409, texto: "duplicate" };
    });

    const primera = await api.crearCita(cita);
    const segunda = await api.crearCita(cita);

    assert.equal(primera.nueva, true);
    assert.equal(segunda.nueva, false, "la segunda no crea nada");
    assert.equal(primera.id, segunda.id, "y las dos hablan de la misma cita");
  });

  it("otro error de Google si sube", async () => {
    const { api } = cliente(() => ({ status: 403, texto: "forbiddenForServiceAccounts" }));
    await assert.rejects(() => api.crearCita(cita), (error: unknown) =>
      error instanceof CalendarioError && /403/.test(String(error)));
  });
});

describe("idDeEvento", () => {
  const inicio = new Date("2026-10-20T08:00:00Z");

  it("la misma cita da siempre el mismo id", () => {
    assert.equal(idDeEvento("llamada-1", CALENDARIO, inicio), idDeEvento("llamada-1", CALENDARIO, inicio));
  });

  it("otra hora, otra llamada u otro calendario dan ids distintos", () => {
    const base = idDeEvento("llamada-1", CALENDARIO, inicio);
    assert.notEqual(base, idDeEvento("llamada-2", CALENDARIO, inicio));
    assert.notEqual(base, idDeEvento("llamada-1", "otro@group.calendar.google.com", inicio));
    assert.notEqual(base, idDeEvento("llamada-1", CALENDARIO, new Date("2026-10-20T09:00:00Z")));
  });

  it("cumple lo que Google admite como id", () => {
    const id = idDeEvento("llamada-1", CALENDARIO, inicio);
    // base32hex: solo 0-9 y a-v, y entre 5 y 1024 caracteres.
    assert.match(id, /^[0-9a-v]{5,1024}$/);
  });
});
