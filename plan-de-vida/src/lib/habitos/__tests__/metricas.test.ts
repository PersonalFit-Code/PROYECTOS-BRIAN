import assert from "node:assert/strict";
import { test } from "node:test";
import { cumplido, ideasPorReglas, indexar, informeMensual, rachaActual, toca } from "../metricas";

const diario = { kind: "check" as const, target: null, weekdays: [0, 1, 2, 3, 4, 5, 6], weekly_target: null, start_date: "2026-01-01" };
const laborables = { ...diario, weekdays: [0, 1, 2, 3, 4] };

test("toca: respeta días de la semana y fecha de inicio", () => {
  assert.equal(toca(laborables, "2026-10-26"), true); // lunes
  assert.equal(toca(laborables, "2026-10-25"), false); // domingo
  assert.equal(toca({ ...diario, start_date: "2026-11-01" }, "2026-10-31"), false);
});

test("cumplido: cantidad llega al objetivo", () => {
  const agua = { kind: "cantidad" as const, target: 8 };
  assert.equal(cumplido(agua, { done: false, value: 8 }), true);
  assert.equal(cumplido(agua, { done: false, value: 5 }), false);
});

test("racha: hoy sin marcar no rompe la racha de ayer", () => {
  const logs = indexar(
    ["2026-10-24", "2026-10-25", "2026-10-26"].map((day) => ({ habit_id: "h", day, done: true, value: null })),
  ).get("h")!;
  assert.equal(rachaActual(diario, logs, "2026-10-27"), 3);
  logs.set("2026-10-27", { done: true, value: null });
  assert.equal(rachaActual(diario, logs, "2026-10-27"), 4);
});

test("racha: los fines de semana no rompen un hábito de laborables", () => {
  const logs = indexar(
    ["2026-10-22", "2026-10-23", "2026-10-26"].map((day) => ({ habit_id: "h", day, done: true, value: null })),
  ).get("h")!;
  assert.equal(rachaActual(laborables, logs, "2026-10-26"), 3);
});

test("informe mensual: ordena mejores y peores y detecta el peor día", () => {
  const habitos = [
    { ...diario, id: "a", name: "Leer", emoji: "📚" },
    { ...diario, id: "b", name: "Gimnasio", emoji: "🏋️" },
  ];
  const logs: { habit_id: string; day: string; done: boolean; value: null }[] = [];
  for (let d = 1; d <= 30; d++) {
    const day = `2026-09-${String(d).padStart(2, "0")}`;
    logs.push({ habit_id: "a", day, done: true, value: null });
    // gimnasio: falla todos los sábados y domingos
    const dow = (new Date(Date.UTC(2026, 8, d)).getUTCDay() + 6) % 7;
    logs.push({ habit_id: "b", day, done: dow < 5, value: null });
  }
  const inf = informeMensual({
    mes: "2026-09",
    desde: "2026-09-01",
    hasta: "2026-09-30",
    desdeAnterior: "2026-08-01",
    hastaAnterior: "2026-08-31",
    habitos,
    logs: indexar(logs),
  });
  assert.equal(inf.mejores[0].id, "a");
  assert.equal(inf.mejores[0].pct, 100);
  assert.equal(inf.peores[0].id, "b");
  assert.ok(["sábado", "domingo"].includes(inf.peores[0].peorDia!));
  assert.ok(ideasPorReglas(inf).length > 0);
});
