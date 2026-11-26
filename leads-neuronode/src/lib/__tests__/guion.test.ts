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
  // Sin datos de su Instagram: saludo genérico, sin corchetes que haya que rellenar a mano.
  assert.ok(g.mensaje?.startsWith("¡Hola! Mi nombre es Brian") && !g.mensaje.includes("["));
  assert.equal(g.dmListo, false);
  assert.equal(g.secuenciaDM.length, 4);
  // Directo: como mucho un recordatorio, nunca una secuencia de días.
  assert.ok(g.secuenciaDM.some((p) => p.texto?.includes("lo dejo aquí")));
  assert.ok(!g.secuenciaDM.some((p) => /Día [4-9]/.test(p.cuando)));
  // El primer mensaje es corto (se lee entero) y pide algo claro; el detalle va cuando contesta.
  assert.ok((g.secuenciaDM[0].texto ?? "").length < 750);
  assert.ok(g.secuenciaDM[0].texto?.endsWith("(sin compromiso).\nUn saludo."));
  assert.equal((g.secuenciaDM[0].texto ?? "").match(/contenido/g)?.length, 1);
  assert.ok(g.secuenciaDM[0].texto?.includes("ecosistema") && g.secuenciaDM[0].texto.includes("beta de 30 días"));
  assert.ok(g.secuenciaDM[1].texto?.includes("en un solo sitio") && g.secuenciaDM[1].texto.includes("sin límite"));
  // La web va en todos los mensajes, y el primero son como mucho 4 párrafos cortos.
  assert.ok(g.secuenciaDM.every((p) => p.texto?.includes("neuro-node.com")));
  assert.ok((g.secuenciaDM[0].texto ?? "").split("\n\n").length <= 4);
  assert.ok(g.secuenciaDM.every((p) => !p.texto || !/€|\$/.test(p.texto)));
  assert.equal(montarGuion(base).mensaje, null);
  assert.equal(montarGuion(base).secuenciaDM.length, 0);
});

test("con lo que Gus apunta de su Instagram, el mensaje sale listo, directo y sin halagos", () => {
  const n = { ...base, nombre: "entrenamientomujer", sector: "infoproducto" as const, instagram: "https://instagram.com/x" };
  const dm = { nombre: "Bea", detalle: "Me encanta cómo explicas el entrenamiento.", gancho: "Y vi tu reel de «Comenta PREPARTO» con más de 200 comentarios." };
  const g = montarGuion(n, [], { dm } as never);
  assert.ok(g.dmListo);
  const m = g.secuenciaDM[0].texto ?? "";
  assert.ok(m.startsWith("¡Hola Bea! Mi nombre es Brian, de neuro·node. Vi tu reel de «Comenta PREPARTO»"));
  assert.ok(!m.includes("Me encanta"), "el halago antiguo ya no sale");
  assert.ok(g.secuenciaDM[1].texto?.startsWith("¡Genial, Bea!"));
  assert.ok(g.secuenciaDM[2].texto?.startsWith("Bea, te lo resumo"));
});

test("barbero de Ourense: se le dice que Brian también es de allí y se ofrece pasar en persona", () => {
  const n = { ...base, nombre: "90 Street Barber", sector: "otro" as const, instagram: "https://instagram.com/daaani_8" };
  const dm = { nombre: "Dani", local: "Ourense", tipo: "servicio" as const, problema: "Veo que las citas te entran por DM." };
  const g = montarGuion(n, [], { dm } as never);
  assert.equal(g.secuenciaDM.length, 4);
  const m = g.secuenciaDM[0].texto ?? "";
  assert.ok(m.startsWith("¡Hola Dani! Mi nombre es Brian, de neuro·node, también de Ourense. Veo que las citas te entran por DM."));
  assert.ok(m.includes("cierra las citas en tu calendario") && !m.includes("infoproductores"));
  // El contenido en redes va siempre, también a un barbero.
  assert.ok(m.includes("estrategias de contenido orgánico"));
  assert.ok(g.secuenciaDM[1].texto?.includes("me pase un día"));
  assert.ok(g.secuenciaDM[2].texto?.includes("te cierra las citas"));
});
