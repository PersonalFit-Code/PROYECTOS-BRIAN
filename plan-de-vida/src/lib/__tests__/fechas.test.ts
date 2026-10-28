import assert from "node:assert/strict";
import { test } from "node:test";
import { diaSemana, hoy, lunesDeSemanaIso, rangoMes, semanaIso, sumarMeses } from "../fechas";
import { mensual, ritmoMensual, siguienteFecha } from "../finanzas";

test("hoy en Madrid, no en UTC", () => {
  // 23:30 UTC del 31 de octubre = 00:30 del 1 de noviembre en Madrid (CET)
  assert.equal(hoy(new Date("2026-10-31T23:30:00Z")), "2026-11-01");
});

test("sumarMeses no desborda a fin de mes", () => {
  assert.equal(sumarMeses("2026-01-31", 1), "2026-02-28");
  assert.equal(sumarMeses("2028-01-31", 1), "2028-02-29");
});

test("semanas ISO ida y vuelta", () => {
  assert.equal(semanaIso("2026-10-28"), "2026-W44");
  assert.equal(lunesDeSemanaIso("2026-W44"), "2026-10-26");
  assert.equal(semanaIso("2027-01-01"), "2026-W53");
  assert.equal(diaSemana("2026-10-26"), 0);
});

test("rango de mes", () => {
  assert.deepEqual(rangoMes("2026-02"), { desde: "2026-02-01", hasta: "2026-02-28" });
});

test("finanzas: equivalente mensual y siguiente cobro", () => {
  assert.equal(mensual(120, "anual"), 10);
  assert.equal(siguienteFecha("2026-01-31", "mensual"), "2026-02-28");
  assert.ok(Math.abs((ritmoMensual(1200, 0, "2027-10-28", "2026-10-28") ?? 0) - 100) < 2);
});

test("inicio del día en Madrid según horario", async () => {
  const { inicioDia } = await import("../fechas");
  assert.equal(inicioDia("2026-07-15"), "2026-07-14T22:00:00.000Z");
  assert.equal(inicioDia("2026-12-15"), "2026-12-14T23:00:00.000Z");
});
