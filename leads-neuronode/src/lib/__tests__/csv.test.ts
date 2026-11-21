import assert from "node:assert/strict";
import { test } from "node:test";
import { filasDeCsv, leerCsv } from "../csv";
import { repartir } from "../reparto";

const CAB = "nombre,sector,subsector,comunidad,provincia,localidad,direccion,telefono,web,instagram,email_generico,fuente_url,notas";

test("leerCsv respeta comillas, comas y saltos dentro de una celda", () => {
  assert.deepEqual(leerCsv('a,b\n"uno, dos","con ""comillas"""\n'), [
    ["a", "b"],
    ["uno, dos", 'con "comillas"'],
  ]);
});

test("filasDeCsv limpia teléfonos, enlaces y correos", () => {
  const csv = `${CAB}
"Gimnasio Ejemplo",fitness,gimnasio,Galicia,Lugo,Lugo,"Rúa Uno, 2",+34 982 11 22 33,ejemplo.es,javascript:alert(1),info@ejemplo.es,https://fuente.es/x,sin reservas online
"Clínica Prueba",clinica,fisioterapia,Galicia,Lugo,Lugo,,12345,,,maria.perez@gmail.com,,`;
  const { filas, errores } = filasDeCsv(csv, 1);
  assert.equal(errores.length, 0);
  assert.equal(filas[0].telefono, "982112233");
  assert.equal(filas[0].web, "https://ejemplo.es/");
  assert.equal(filas[0].instagram, null, "un enlace que no es http(s) se descarta");
  assert.equal(filas[0].email_generico, "info@ejemplo.es");
  assert.equal(filas[1].telefono, null, "un teléfono que no tiene 9 dígitos se descarta");
  assert.equal(filas[1].email_generico, null, "un correo personal no se guarda");
});

test("filasDeCsv salta los repetidos y avisa de las filas malas", () => {
  const csv = `${CAB}
Gimnasio Ñandú,fitness,,Galicia,,Vigo,,,,,,,
GIMNASIO NANDU,fitness,,Galicia,,vigo,,,,,,,
Bar Raro,bares,,Galicia,,Vigo,,,,,,,
,fitness,,Galicia,,Vigo,,,,,,,`;
  const { filas, errores } = filasDeCsv(csv, 1);
  assert.equal(filas.length, 1);
  assert.equal(errores.length, 2);
});

test("filasDeCsv rechaza un fichero sin las columnas", () => {
  assert.equal(filasDeCsv("nombre,sector\nA,fitness", 1).filas.length, 0);
});

test("repartir llena los días de 100 en 100, con el fitness primero y sin pasarse", () => {
  const negocios = [
    ...Array.from({ length: 120 }, (_, i) => ({ id: `h${i}`, sector: "hosteleria" as const, comunidad: i % 2 ? "Galicia" : "Andalucía" })),
    ...Array.from({ length: 120 }, (_, i) => ({ id: `f${i}`, sector: "fitness" as const, comunidad: i % 2 ? "Galicia" : "Andalucía" })),
  ];
  const r = repartir(negocios, { 1: 30 });
  assert.equal(r.get(1)!.length, 70, "el día 1 ya tenía 30");
  assert.ok(r.get(1)!.every((id) => id.startsWith("f")), "el día 1 se llena con fitness");
  assert.equal(r.get(2)!.length, 100);
  assert.equal(r.get(3)!.length, 70);
  assert.equal([...r.values()].flat().length, 240);
});

test("repartir no pasa del día 10", () => {
  const negocios = Array.from({ length: 50 }, (_, i) => ({ id: `n${i}`, sector: "fitness" as const, comunidad: "Galicia" }));
  const lleno = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, 100]));
  assert.equal(repartir(negocios, lleno).size, 0);
});
