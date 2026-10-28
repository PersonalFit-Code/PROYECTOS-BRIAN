import assert from "node:assert/strict";
import { test } from "node:test";
import { acierto, calcularPesos } from "../aprendizaje";
import { indicadores, type Cierre } from "../indicadores";
import { generarPropuestas, type Activo } from "../senales";

function serie(valores: number[]): Cierre[] {
  return valores.map((close, i) => ({ day: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`, close }));
}

const activos: Activo[] = [
  { symbol: "WORLD", name: "World", asset_class: "renta_variable", sleeve: "nucleo", target_pct: 60, quoted: true, yield_pct: null },
  { symbol: "BONOS", name: "Bonos", asset_class: "renta_fija", sleeve: "nucleo", target_pct: 20, quoted: true, yield_pct: null },
  { symbol: "SP500", name: "S&P", asset_class: "renta_variable", sleeve: "satelite", target_pct: 20, quoted: true, yield_pct: null },
  { symbol: "CUENTA", name: "Cuenta", asset_class: "liquidez", sleeve: "nucleo", target_pct: 0, quoted: false, yield_pct: 1.5 },
];

test("indicadores: medias, caída y momento", () => {
  const sube = serie(Array.from({ length: 260 }, (_, i) => 100 + i));
  const ind = indicadores(sube)!;
  assert.equal(ind.drawdown, 0);
  assert.ok(ind.sma50! > ind.sma200!);
  assert.ok(ind.mom3m! > 0);
});

test("aportación mensual: reparte hacia lo infraponderado", () => {
  const props = generarPropuestas({
    activos,
    indicadores: new Map(),
    posiciones: new Map([["WORLD", 9000], ["BONOS", 1000]]),
    aportacionMensual: 500,
    inflacion: 2.5,
    pesos: {},
  });
  const aportes = props.filter((p) => p.signal === "aportacion_mensual");
  // SP500 (0 % vs 20 %) y BONOS (10 % vs 20 %) tienen hueco; WORLD (90 %) no
  assert.deepEqual(aportes.map((p) => p.symbol).sort(), ["BONOS", "SP500"]);
  assert.ok(props.some((p) => p.signal === "sobreponderado" && p.symbol === "WORLD"));
  // la cuenta al 1,5 % pierde contra una inflación del 2,5 %
  assert.equal(props.find((p) => p.symbol === "CUENTA")?.action, "vigilar");
});

test("caída del núcleo y tendencias del satélite", () => {
  const caida = serie([...Array.from({ length: 200 }, () => 100), ...Array.from({ length: 60 }, () => 80)]);
  const bajista = serie(Array.from({ length: 260 }, (_, i) => 300 - i));
  const props = generarPropuestas({
    activos,
    indicadores: new Map([["WORLD", indicadores(caida)!], ["SP500", indicadores(bajista)!]]),
    posiciones: new Map(),
    aportacionMensual: 0,
    inflacion: 2,
    pesos: {},
  });
  assert.ok(props.some((p) => p.signal === "caida_nucleo" && p.symbol === "WORLD"));
  assert.ok(props.some((p) => p.signal === "debilidad_satelite" && p.action === "reducir"));
});

test("una señal con mal historial pasa a vigilar", () => {
  const bajista = serie(Array.from({ length: 260 }, (_, i) => 300 - i));
  const props = generarPropuestas({
    activos,
    indicadores: new Map([["SP500", indicadores(bajista)!]]),
    posiciones: new Map(),
    aportacionMensual: 0,
    inflacion: 2,
    pesos: { debilidad_satelite: 0.4 },
  });
  const p = props.find((x) => x.signal === "debilidad_satelite")!;
  assert.equal(p.action, "vigilar");
  assert.equal(p.confidence, 1);
});

test("acierto según la acción", () => {
  assert.equal(acierto("aportar", "nucleo", 3, 5), true);
  assert.equal(acierto("aportar", "satelite", 3, 5), false);
  assert.equal(acierto("reducir", "satelite", -2, 1), true);
  assert.equal(acierto("vigilar", "nucleo", 3, 1), null);
});

test("pesos: suben con aciertos y bajan con fallos y feedback negativo", () => {
  const r = (signal: string, hit: boolean) => ({ signal, horizon_days: 30, hit, return_pct: hit ? 2 : -2, benchmark_pct: 0 });
  const resultados = [...Array(8)].map(() => r("tendencia_satelite", true)).concat([...Array(8)].map(() => r("debilidad_satelite", false)));
  const feedback = [...Array(3)].map(() => ({ signal: "debilidad_satelite", feedback: "no_util" as const, followed: false }));
  const pesos = Object.fromEntries(calcularPesos(resultados, feedback).map((m) => [m.senal, m.peso]));
  assert.equal(pesos.tendencia_satelite, 1.5);
  assert.ok(pesos.debilidad_satelite < 0.6);
  assert.equal(pesos.aportacion_mensual, 1);
});

test("la aportación se reparte entera y no se contradice con el sobrepeso", () => {
  const caida = serie([...Array.from({ length: 200 }, () => 100), ...Array.from({ length: 60 }, () => 85)]);
  const props = generarPropuestas({
    activos,
    indicadores: new Map([["WORLD", indicadores(caida)!]]),
    posiciones: new Map([["WORLD", 9000], ["BONOS", 1000]]),
    aportacionMensual: 500,
    inflacion: 2,
    pesos: {},
  });
  const euros = props
    .filter((p) => p.signal === "aportacion_mensual")
    .map((p) => Number(p.thesis.match(/unos ([\d.]+) €/)![1].replace(".", "")))
    .reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(euros - 500) <= 2, `reparte ${euros} €`);
  // WORLD pesa de más: no puede salir a la vez "aportar por caída" y "reducir"
  assert.ok(!props.some((p) => p.symbol === "WORLD" && p.action === "aportar"));
});
