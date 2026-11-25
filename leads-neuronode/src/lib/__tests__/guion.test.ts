import assert from "node:assert/strict";
import { test } from "node:test";
import { detectarSenal, montarGuion, type DatosNegocio } from "../guion";

const base: DatosNegocio = { nombre: "Gimnasio Lemos", sector: "fitness", subsector: "gimnasio", localidad: "Monforte", web: "https://gimnasiolemos.com", instagram: null, notas: null };

test("detecta la señal más fuerte de cada negocio", () => {
  assert.equal(detectarSenal({ ...base, notas: "La web que figura en Google Maps no carga: el dominio no resuelve." }), "web_caida");
  assert.equal(detectarSenal({ ...base, web: null }), "sin_web");
  assert.equal(detectarSenal({ ...base, web: null, instagram: "https://instagram.com/x" }), "solo_instagram");
  assert.equal(detectarSenal({ ...base, notas: "En Facebook indica información y reservas por teléfono." }), "reservas_a_mano");
  assert.equal(detectarSenal({ ...base, notas: "Reservas de clase con una herramienta externa (Viday)." }), "herramienta_externa");
  assert.equal(detectarSenal(base), "nada");
  assert.equal(detectarSenal(base, ["Tarifas en PDF"]), "carta_pdf");
});

test("el guion nombra el negocio y la localidad, y no lleva precios", () => {
  const g = montarGuion({ ...base, web: null });
  assert.match(g.entrada, /Gimnasio Lemos/);
  assert.match(g.pregunta, /Monforte/);
  assert.match(g.regalo, /gratis/);
  const todo = JSON.stringify(g);
  assert.doesNotMatch(todo, /\d+\s?€|euros/i);
  assert.equal(g.aMedida, false);
});

test("a las clínicas se les habla de usted y al resto de tú", () => {
  const clinica = montarGuion({ ...base, sector: "clinica", subsector: "fisioterapia" });
  assert.match(clinica.entrada, /le robo/);
  assert.match(clinica.cierre, /Le viene/);
  assert.match(montarGuion(base).entrada, /te robo/);
});

test("las partes escritas a medida mandan, y las vacías no pisan nada", () => {
  const g = montarGuion(base, [], { entrada: "Hola, soy Brian.", pregunta: "  ", objeciones: [] });
  assert.equal(g.entrada, "Hola, soy Brian.");
  assert.notEqual(g.pregunta.trim(), "");
  assert.ok(g.objeciones.length > 3);
  assert.equal(g.aMedida, true);
});

test("pastelería y restaurante usan su propio caso real", () => {
  assert.match(montarGuion({ ...base, sector: "hosteleria", subsector: "pasteleria" }).prueba, /Bin & Cami/);
  assert.match(montarGuion({ ...base, sector: "hosteleria", subsector: "restaurante" }).prueba, /Tixola/);
});

test("infoproductores y coaches: se habla del setter con IA, sin clientes inventados, y hay mensaje de Instagram", () => {
  const g = montarGuion({ ...base, nombre: "Marta Coach", sector: "infoproducto", subsector: "coach", localidad: null, web: null, instagram: "https://instagram.com/x" });
  assert.match(g.prueba, /setter con IA/);
  assert.match(g.pregunta, /mensajes directos/);
  assert.ok(g.cualificar.length >= 5 && g.precios.length >= 8);
  assert.doesNotMatch(JSON.stringify(g), /\d+\s?€|euros|tres mejoras/i);
  assert.equal(montarGuion(base).cualificar.length, 0);
  assert.doesNotMatch(JSON.stringify(g), /Personal Fit|Tixola|Bin & Cami|lleváis|tenéis/);
  assert.ok(g.mensaje && g.mensaje.includes("[nombre]"));
  assert.equal(g.secuenciaDM.length, 4);
  // Directo: como mucho un recordatorio, nunca una secuencia de días.
  assert.ok(g.secuenciaDM.some((p) => p.texto?.includes("lo dejo aquí")));
  assert.ok(!g.secuenciaDM.some((p) => /Día [4-9]/.test(p.cuando)));
  // El primer mensaje ya cuenta lo que lo hace distinto: todo en uno y sin límite de mensajes.
  assert.ok(g.secuenciaDM[0].texto?.includes("en un solo agente") && g.secuenciaDM[0].texto.includes("sin límite"));
  // El enlace solo aparece cuando hay interés, nunca en el primer mensaje.
  assert.ok(!/enlace|https?:/.test(g.secuenciaDM[0].texto ?? ""));
  assert.ok(g.secuenciaDM.every((p) => !p.texto || !/€|\$/.test(p.texto)));
  assert.equal(montarGuion(base).mensaje, null);
  assert.equal(montarGuion(base).secuenciaDM.length, 0);
});
