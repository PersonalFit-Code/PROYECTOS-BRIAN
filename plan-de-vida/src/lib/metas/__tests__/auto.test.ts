import assert from "node:assert/strict";
import { test } from "node:test";
import type { Goal } from "@/lib/tipos";
import { aplicarAuto, ingresoMensual, ritmoMeta } from "../auto";

const fijos = [
  { kind: "ingreso" as const, amount: 100, frequency: "mensual" as const, active: true },
  { kind: "ingreso" as const, amount: 50, frequency: "mensual" as const, active: true },
  { kind: "ingreso" as const, amount: 50, frequency: "mensual" as const, active: true },
  { kind: "gasto" as const, amount: 10, frequency: "mensual" as const, active: true },
  { kind: "ingreso" as const, amount: 999, frequency: "mensual" as const, active: false },
];

test("ingresoMensual: los fijos hacen de suelo hasta que lo apuntado los supera", () => {
  assert.equal(ingresoMensual([], fijos, "2026-11").total, 200);
  const ventas = [
    { kind: "ingreso" as const, amount: 200, day: "2026-11-01" },
    { kind: "ingreso" as const, amount: 300, day: "2026-11-15" },
    { kind: "gasto" as const, amount: 50, day: "2026-11-15" },
    { kind: "ingreso" as const, amount: 1000, day: "2026-10-31" },
  ];
  assert.deepEqual(ingresoMensual(ventas, fijos, "2026-11"), { total: 500, apuntado: 500, fijos: 200 });
});

test("ritmoMeta: de 200 a 3.000 entre octubre y abril sube lo mismo cada mes", () => {
  const r = (mes: string) => Math.round(ritmoMeta(200, 3000, "2026-10-28T10:00:00Z", "2027-04-30", mes)!);
  assert.equal(r("2026-10"), 200);
  assert.equal(r("2026-11"), 667);
  assert.equal(r("2027-01"), 1600);
  assert.equal(r("2027-04"), 3000);
  assert.equal(r("2027-08"), 3000);
  assert.equal(ritmoMeta(200, 3000, "2026-10-28", null, "2026-11"), null);
});

test("aplicarAuto: calcula valor y % solo en las metas automáticas", () => {
  const base = { area_id: null, description: null, period: "anual", year: 2026, quarter: null, month: null, unit: "€/mes", status: "activa", created_at: "2026-10-28", start_text: null, target_text: null } as const;
  const metas: Goal[] = [
    { ...base, id: "a", title: "3.000 €/mes", start_value: 200, target_value: 3000, current_value: null, progress_pct: 0, due_date: "2027-04-30", auto: "ingreso_mensual" },
    { ...base, id: "b", title: "Otra", start_value: null, target_value: null, current_value: null, progress_pct: 30, due_date: null, auto: null },
  ];
  const { metas: out, estados } = aplicarAuto(metas, [{ kind: "ingreso", amount: 1600, day: "2026-11-20" }], fijos, "2026-11");
  assert.equal(out[0].current_value, 1600);
  assert.equal(Math.round(Number(out[0].progress_pct)), 53);
  assert.equal(out[1].progress_pct, 30);
  assert.equal(Math.round(estados.get("a")!.ritmo!), 667);
  assert.equal(estados.get("a")!.falta, 1400);
});
