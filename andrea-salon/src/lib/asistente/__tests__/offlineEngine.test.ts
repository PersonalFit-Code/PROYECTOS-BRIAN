/**
 * El motor del asistente sin IA.
 *
 * Es lo que contesta mientras el salón no active la clave de Anthropic, y lo que contesta cuando la IA
 * falla. Se prueban las tres promesas que no puede romper nunca: entender las preguntas rápidas del
 * propio panel, no inventar un precio ni una duración que no estén publicados, y no prometer una
 * cita que no puede dar.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SERVICIOS_FIXTURE } from "../../../data/fixtures";
import es from "../../../i18n/messages/es";
import { urlFor } from "../../hosts";
import { serviciosDesdeCatalogo, serviciosDesdeFixture } from "../knowledge";
import { answerOffline, detectIntent, matchServicios, normalizeText, type OfflineIntent } from "../offlineEngine";
import { pageFromPath, type ServicioAsistente } from "../types";

const servicios = serviciosDesdeFixture(SERVICIOS_FIXTURE);
/* Viernes 16-oct-2026 a las 12:00 en Ourense (10:00 UTC): abierto, con horario de viernes seguido. */
const AHORA = new Date("2026-10-16T10:00:00Z");

function intent(pregunta: string, lista: readonly ServicioAsistente[] = servicios): OfflineIntent["kind"] {
  return detectIntent(normalizeText(pregunta), lista).kind;
}

function responde(pregunta: string, lista: readonly ServicioAsistente[] = servicios): string {
  return answerOffline([{ role: "user", content: pregunta }], { servicios: lista, now: AHORA });
}

describe("normalizeText", () => {
  it("quita tildes, eñes, signos y mayúsculas", () => {
    assert.equal(normalizeText("¿Cuánto dura la MANICURA, señora?"), "cuanto dura la manicura senora");
    assert.equal(normalizeText("  Uñas   de gel  "), "unas de gel");
  });
});

describe("detectIntent", () => {
  it("entiende todas las preguntas rápidas del panel", () => {
    const esperado: Record<string, OfflineIntent["kind"]> = {
      "¿Qué horario tenéis?": "hours",
      "¿Cómo reservo cita?": "booking",
      "¿Cuánto cuesta la manicura?": "prices",
      "¿Cuánto dura una manicura?": "duration",
      "¿Tenéis bonos regalo?": "bonos",
      "¿Dónde estáis?": "location",
      "¿Puedo cancelar mi cita?": "cancel",
    };
    for (const pregunta of es.chat.quickReplies) {
      assert.ok(pregunta in esperado, `falta la intención esperada de «${pregunta}» en la prueba`);
      assert.equal(intent(pregunta), esperado[pregunta], pregunta);
    }
  });

  it("desempata como dice su comentario", () => {
    assert.equal(intent("Soy alérgica al HEMA, ¿puedo reservar?"), "health", "la salud manda sobre la reserva");
    assert.equal(intent("Quiero cancelar mi reserva"), "cancel", "cancelar manda sobre reservar");
    assert.equal(intent("¿Atendéis sin cita?"), "walkIn");
    assert.equal(intent("¿Cuánto cuesta una tarjeta regalo?"), "bonos", "una tarjeta regalo no es un método de pago");
    assert.equal(intent("¿Puedo pagar con Bizum?"), "payment");
    assert.equal(intent("Hola, ¿abrís el sábado?"), "hours", "el saludo no tapa la pregunta");
    assert.equal(intent("¿Qué es la manicura rusa?"), "service");
    assert.equal(intent("hola"), "greeting");
    assert.equal(intent("qwerty"), "fallback");
  });
});

describe("matchServicios", () => {
  it("elige el servicio más concreto y empata los genéricos", () => {
    assert.deepEqual(
      matchServicios(normalizeText("manicura rusa"), servicios).map((s) => s.slug),
      ["manicura-rusa"],
    );
    assert.deepEqual(
      matchServicios(normalizeText("una manicura"), servicios).map((s) => s.slug),
      ["manicura-completa", "manicura-rusa", "manicura-personalizada"],
    );
    assert.deepEqual(
      matchServicios(normalizeText("uñas acrílicas"), servicios).map((s) => s.slug),
      ["gel-acrylgel"],
      "por sinónimo",
    );
  });
});

describe("answerOffline", () => {
  it("sin mensajes saluda", () => {
    assert.equal(answerOffline([], { servicios, now: AHORA }), es.chat.offline.greeting);
  });

  it("da el precio publicado y avisa de que está pendiente", () => {
    const r = responde("¿Cuánto cuesta la manicura completa?");
    assert.match(r, /\*\*Manicura completa\*\* — 25 €/);
    assert.match(r, /pendientes de confirmar/);
  });

  it("NO inventa un precio que no está publicado", () => {
    const r = responde("¿Cuánto cuesta la manicura rusa?");
    const linea = r.split("\n").find((l) => l.includes("Manicura rusa")) ?? "";
    assert.ok(linea, "nombra el servicio");
    assert.doesNotMatch(linea, /\d+\s?€/, "ni una cifra en la línea del servicio sin precio");
    assert.match(linea, /pregúntanos/);
  });

  it("con precio 0 en la base de datos dice «pregúntanos», no «0 €»", () => {
    const base = serviciosDesdeCatalogo(
      [{ id: "c1", name: "Manos" }],
      [
        {
          id: "s1", category_id: "c1", slug: "manicura-rusa", name: "Manicura rusa", description: null, duration_min: 0, buffer_min: 10,
          price_cents: 0, price_is_from: true, active: true, bookable_online: true, position: 1, created_at: "", updated_at: "",
        },
      ],
    );
    assert.equal(base[0].precioCents, null);
    assert.equal(base[0].duracionMin, null);
    const r = responde("¿Cuánto cuesta la manicura rusa?", base);
    assert.doesNotMatch(r, /0 €/);
    assert.match(r, /pregúntanos/);
    assert.doesNotMatch(responde("¿Cuánto dura la manicura rusa?", base), /\d+ min/, "tampoco inventa la duración");
  });

  it("no reserva ni promete hueco: manda a la reserva online", () => {
    const r = responde("¿Hay hueco mañana a las 10?");
    assert.ok(r.includes(urlFor("reservar", "/")), "enlaza la reserva online");
    assert.match(r, /no puedo reservar/i);
    assert.doesNotMatch(r, /(te (lo )?guardo|queda reservad|seguro que hay)/i);
  });

  it("con un servicio nombrado, enlaza la reserva con ese servicio ya elegido", () => {
    assert.ok(responde("Quiero reservar una pedicura").includes(urlFor("reservar", "/?servicio=pedicura-completa")));
  });

  it("el horario lleva el aviso de pendiente mientras Andrea no lo confirme", () => {
    const r = responde("¿Qué horario tenéis?");
    assert.match(r, /Viernes: 09:30–19:30/);
    assert.match(r, /Abierto ahora/);
    assert.match(r, /pendiente de confirmar/);
  });

  it("ante una alergia no da consejo médico", () => {
    assert.match(responde("Tengo alergia al acrílico"), /No puedo darte consejo médico/);
  });

  it("sin lista de servicios (la base de datos ha fallado) no nombra precios", () => {
    const r = responde("¿Cuánto cuesta la manicura?", []);
    assert.doesNotMatch(r, /€/);
    assert.match(r, /\/es\/servicios/);
  });
});

describe("pageFromPath", () => {
  it("traduce la ruta sin idioma a la página del asistente", () => {
    assert.equal(pageFromPath("/"), "home");
    assert.equal(pageFromPath("/servicios"), "servicios");
    assert.equal(pageFromPath("/legal/privacidad"), "legal");
    assert.equal(pageFromPath("/bonos?x=1"), "bonos");
    assert.equal(pageFromPath("/bono/abc"), "otra");
  });
});
