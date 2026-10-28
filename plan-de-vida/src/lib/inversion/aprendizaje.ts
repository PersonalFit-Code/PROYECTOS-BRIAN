/**
 * Bucle de automejora. Puro, para poder probarlo.
 *  1. evaluar(): puntúa cada recomendación con precios reales a 7, 30 y 90 días frente al benchmark.
 *  2. calcularPesos(): con esos aciertos y el feedback del usuario, cuánto fiarse de cada señal.
 * El cron guarda los pesos cada semana (strategy_notes) y el motor los usa al día siguiente.
 */
import type { RecAction, Sleeve } from "@/lib/tipos";
import { SENALES_EVALUABLES, type Senal } from "./senales";

export const HORIZONTES = [7, 30, 90] as const;

/**
 * ¿Acertó? Aportar/mantener: subió (y en el satélite, además, batió al benchmark). Reducir: lo hizo
 * peor que el benchmark (reducir era lo correcto). Vigilar no se puntúa.
 */
export function acierto(action: RecAction, sleeve: Sleeve, rentabilidad: number, benchmark: number | null): boolean | null {
  if (action === "vigilar") return null;
  if (action === "reducir") return benchmark == null ? rentabilidad < 0 : rentabilidad < benchmark;
  if (sleeve === "satelite" && benchmark != null) return rentabilidad > 0 && rentabilidad >= benchmark;
  return rentabilidad > 0;
}

export interface Resultado {
  signal: string;
  horizon_days: number;
  hit: boolean;
  return_pct: number;
  benchmark_pct: number | null;
}

export interface Feedback {
  signal: string;
  feedback: "util" | "no_util" | null;
  followed: boolean | null;
}

export interface MetricaSenal {
  senal: Senal;
  evaluadas: number;
  aciertoPct: number | null;
  excesoMedio: number | null;
  utiles: number;
  noUtiles: number;
  seguidas: number;
  peso: number;
}

/** Mínimo de evaluaciones para empezar a mover el peso de una señal. */
export const MINIMO_EVALUACIONES = 5;

/**
 * Peso de cada señal (0,3 a 1,5). Con pocos datos, neutro (1). Con datos: 0,5 + % de acierto
 * (a 30 días, o el horizonte disponible), corregido ±0,15 por el feedback de utilidad.
 */
export function calcularPesos(resultados: Resultado[], feedback: Feedback[]): MetricaSenal[] {
  return SENALES_EVALUABLES.map((senal) => {
    const propios = resultados.filter((r) => r.signal === senal);
    // horizonte de referencia: 30 días si hay, si no el que haya
    const ref = propios.some((r) => r.horizon_days === 30) ? propios.filter((r) => r.horizon_days === 30) : propios;
    const fb = feedback.filter((f) => f.signal === senal);
    const utiles = fb.filter((f) => f.feedback === "util").length;
    const noUtiles = fb.filter((f) => f.feedback === "no_util").length;
    const seguidas = fb.filter((f) => f.followed).length;

    let peso = 1;
    let aciertoPct: number | null = null;
    let excesoMedio: number | null = null;
    if (ref.length) {
      aciertoPct = (100 * ref.filter((r) => r.hit).length) / ref.length;
      const conBench = ref.filter((r) => r.benchmark_pct != null);
      excesoMedio = conBench.length ? conBench.reduce((a, r) => a + (r.return_pct - (r.benchmark_pct ?? 0)), 0) / conBench.length : null;
      if (ref.length >= MINIMO_EVALUACIONES) peso = 0.5 + aciertoPct / 100;
    }
    if (utiles + noUtiles >= 3) peso += (0.15 * (utiles - noUtiles)) / (utiles + noUtiles);
    peso = Math.max(0.3, Math.min(1.5, Math.round(peso * 100) / 100));
    return { senal, evaluadas: ref.length, aciertoPct, excesoMedio, utiles, noUtiles, seguidas, peso };
  });
}

/** Resumen en texto de lo aprendido, para el registro "qué cambió y por qué". */
export function resumenAprendizaje(actual: MetricaSenal[], anterior: Partial<Record<string, number>>): string {
  const lineas: string[] = [];
  for (const m of actual) {
    const antes = anterior[m.senal] ?? 1;
    const cambio = Math.round((m.peso - antes) * 100) / 100;
    if (m.evaluadas < MINIMO_EVALUACIONES && m.utiles + m.noUtiles < 3) continue;
    const datos = `${m.evaluadas} evaluadas, ${m.aciertoPct == null ? "—" : `${Math.round(m.aciertoPct)} % de acierto`}${m.excesoMedio != null ? `, ${m.excesoMedio >= 0 ? "+" : ""}${m.excesoMedio.toFixed(1)} pts vs benchmark` : ""}${m.utiles + m.noUtiles ? `, feedback ${m.utiles}👍/${m.noUtiles}👎` : ""}`;
    if (Math.abs(cambio) >= 0.05) lineas.push(`${m.senal}: peso ${antes.toFixed(2)} → ${m.peso.toFixed(2)} (${datos}).`);
    else lineas.push(`${m.senal}: sin cambios, ${m.peso.toFixed(2)} (${datos}).`);
  }
  return lineas.length ? lineas.join("\n") : "Aún no hay suficientes recomendaciones evaluadas: todas las señales siguen con peso neutro (1,00).";
}
