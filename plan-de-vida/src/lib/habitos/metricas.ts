/**
 * Cálculos de hábitos, sin base de datos (se prueban en __tests__): qué toca cada día, si se cumplió,
 * rachas y el informe de fin de mes (lo que más fallas, lo que mejor se te da, por día de la semana).
 */
import { diaSemana, diasDelRango, lunesDe, sumarDias, NOMBRES_DIA, NOMBRES_DIA_PLURAL } from "@/lib/fechas";
import { n, type Habit, type HabitLog } from "@/lib/tipos";

type HabitoBase = Pick<Habit, "kind" | "target" | "weekdays" | "weekly_target" | "start_date">;
type Registro = Pick<HabitLog, "done" | "value">;

/** ¿Toca el hábito ese día? Los de "N veces por semana" se pueden hacer cualquier día. */
export function toca(h: HabitoBase, dia: string): boolean {
  if (dia < h.start_date) return false;
  if (h.weekly_target) return true;
  return h.weekdays.includes(diaSemana(dia));
}

/** ¿Cuenta como cumplido? En "dejar", la casilla marcada significa "hoy he aguantado". */
export function cumplido(h: Pick<Habit, "kind" | "target">, log: Registro | undefined): boolean {
  if (!log) return false;
  if (h.kind === "cantidad" && h.target != null) return log.done || n(log.value) >= n(h.target);
  return log.done;
}

export type LogsPorDia = Map<string, Registro>;

export function indexar(logs: Pick<HabitLog, "habit_id" | "day" | "done" | "value">[]): Map<string, LogsPorDia> {
  const out = new Map<string, LogsPorDia>();
  for (const l of logs) {
    let m = out.get(l.habit_id);
    if (!m) out.set(l.habit_id, (m = new Map()));
    m.set(l.day, l);
  }
  return out;
}

/**
 * Racha actual. Diaria: días seguidos que tocaban y se cumplieron (si hoy aún no está hecho, no rompe:
 * se cuenta desde ayer). Semanal ("3 veces por semana"): semanas seguidas llegando al objetivo.
 */
export function rachaActual(h: HabitoBase, logs: LogsPorDia, hoy: string): number {
  if (h.weekly_target) {
    let racha = 0;
    let lunes = lunesDe(hoy);
    const hechosEstaSemana = contarSemana(h, logs, lunes);
    if (hechosEstaSemana >= h.weekly_target) racha++;
    lunes = sumarDias(lunes, -7);
    while (lunes >= lunesDe(h.start_date) && contarSemana(h, logs, lunes) >= h.weekly_target) {
      racha++;
      lunes = sumarDias(lunes, -7);
    }
    return racha;
  }
  let racha = 0;
  let dia = hoy;
  if (toca(h, dia) && !cumplido(h, logs.get(dia))) dia = sumarDias(dia, -1);
  for (let i = 0; i < 3660 && dia >= h.start_date; i++, dia = sumarDias(dia, -1)) {
    if (!toca(h, dia)) continue;
    if (!cumplido(h, logs.get(dia))) break;
    racha++;
  }
  return racha;
}

function contarSemana(h: HabitoBase, logs: LogsPorDia, lunes: string): number {
  let c = 0;
  for (let i = 0; i < 7; i++) if (cumplido(h, logs.get(sumarDias(lunes, i)))) c++;
  return c;
}

/** Mejor racha (diaria) dentro de un rango. */
export function mejorRacha(h: HabitoBase, logs: LogsPorDia, desde: string, hasta: string): number {
  let mejor = 0;
  let actual = 0;
  for (const d of diasDelRango(desde, hasta)) {
    if (!toca(h, d)) continue;
    if (cumplido(h, logs.get(d))) mejor = Math.max(mejor, ++actual);
    else actual = 0;
  }
  return mejor;
}

/* ────────────────────────────────────────────────────────────
   Informe mensual
   ──────────────────────────────────────────────────────────── */

export interface MetricaHabito {
  id: string;
  nombre: string;
  emoji: string;
  programados: number;
  cumplidos: number;
  pct: number;
  pctAnterior: number | null;
  mejorRacha: number;
  /** % de cumplimiento por día de la semana (null si ese día no tocaba) */
  porDiaSemana: (number | null)[];
  peorDia: string | null;
}

export interface InformeHabitos {
  mes: string;
  desde: string;
  hasta: string;
  pctGlobal: number;
  pctGlobalAnterior: number | null;
  habitos: MetricaHabito[];
  mejores: MetricaHabito[];
  peores: MetricaHabito[];
  porDiaSemana: (number | null)[];
  mejorDiaSemana: string | null;
  peorDiaSemana: string | null;
  diasPerfectos: number;
  diasConDatos: number;
  /** ánimo medio (1–5) en días buenos (≥ 80 % cumplido) frente a días flojos (< 50 %) */
  animo: { diasBuenos: number | null; diasFlojos: number | null };
}

interface Cuenta {
  programados: number;
  cumplidos: number;
}

function contarRango(h: HabitoBase, logs: LogsPorDia, desde: string, hasta: string): Cuenta & { porDia: Cuenta[] } {
  const porDia: Cuenta[] = Array.from({ length: 7 }, () => ({ programados: 0, cumplidos: 0 }));
  const dias = diasDelRango(desde, hasta).filter((d) => d >= h.start_date);
  if (h.weekly_target) {
    // "N veces por semana": lo esperado es N/7 por día que el hábito existía.
    const cumplidos = dias.filter((d) => cumplido(h, logs.get(d))).length;
    const programados = Math.max(1, Math.round((dias.length * h.weekly_target) / 7));
    for (const d of dias) {
      const c = porDia[diaSemana(d)];
      c.programados += h.weekly_target / 7;
      if (cumplido(h, logs.get(d))) c.cumplidos += h.weekly_target / 7;
    }
    return { programados: dias.length ? programados : 0, cumplidos: Math.min(cumplidos, programados), porDia };
  }
  let programados = 0;
  let cumplidos = 0;
  for (const d of dias) {
    if (!toca(h, d)) continue;
    programados++;
    const c = porDia[diaSemana(d)];
    c.programados++;
    if (cumplido(h, logs.get(d))) {
      cumplidos++;
      c.cumplidos++;
    }
  }
  return { programados, cumplidos, porDia };
}

const porcentaje = (c: Cuenta) => (c.programados ? (100 * c.cumplidos) / c.programados : 0);

export function informeMensual(params: {
  mes: string;
  desde: string;
  hasta: string;
  desdeAnterior: string;
  hastaAnterior: string;
  habitos: (HabitoBase & Pick<Habit, "id" | "name" | "emoji">)[];
  logs: Map<string, LogsPorDia>;
  animoPorDia?: Map<string, number>;
}): InformeHabitos {
  const { mes, desde, hasta, desdeAnterior, hastaAnterior, habitos, logs } = params;
  const globalDia: Cuenta[] = Array.from({ length: 7 }, () => ({ programados: 0, cumplidos: 0 }));
  let totalProg = 0;
  let totalCump = 0;
  let antProg = 0;
  let antCump = 0;

  const metricas: MetricaHabito[] = habitos.map((h) => {
    const l = logs.get(h.id) ?? new Map();
    const actual = contarRango(h, l, desde, hasta);
    const anterior = contarRango(h, l, desdeAnterior, hastaAnterior);
    totalProg += actual.programados;
    totalCump += actual.cumplidos;
    antProg += anterior.programados;
    antCump += anterior.cumplidos;
    actual.porDia.forEach((c, i) => {
      globalDia[i].programados += c.programados;
      globalDia[i].cumplidos += c.cumplidos;
    });
    const porDiaSemana = actual.porDia.map((c) => (c.programados ? porcentaje(c) : null));
    return {
      id: h.id,
      nombre: h.name,
      emoji: h.emoji,
      programados: actual.programados,
      cumplidos: actual.cumplidos,
      pct: porcentaje(actual),
      pctAnterior: anterior.programados ? porcentaje(anterior) : null,
      mejorRacha: h.weekly_target ? 0 : mejorRacha(h, l, desde, hasta),
      porDiaSemana,
      peorDia: peorDiaSignificativo(porDiaSemana, true),
    };
  }).filter((m) => m.programados > 0);

  const ordenados = [...metricas].sort((a, b) => b.pct - a.pct);
  const porDiaSemana = globalDia.map((c) => (c.programados ? porcentaje(c) : null));

  // Días perfectos y ánimo según cómo fue el día
  let diasPerfectos = 0;
  let diasConDatos = 0;
  const buenos: number[] = [];
  const flojos: number[] = [];
  for (const d of diasDelRango(desde, hasta)) {
    const delDia = habitos.filter((h) => !h.weekly_target && toca(h, d));
    if (!delDia.length) continue;
    const hechos = delDia.filter((h) => cumplido(h, logs.get(h.id)?.get(d))).length;
    const algo = delDia.some((h) => logs.get(h.id)?.has(d));
    if (!algo) continue;
    diasConDatos++;
    const ratio = hechos / delDia.length;
    if (ratio === 1) diasPerfectos++;
    const animo = params.animoPorDia?.get(d);
    if (animo != null) {
      if (ratio >= 0.8) buenos.push(animo);
      else if (ratio < 0.5) flojos.push(animo);
    }
  }
  const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

  return {
    mes,
    desde,
    hasta,
    pctGlobal: totalProg ? (100 * totalCump) / totalProg : 0,
    pctGlobalAnterior: antProg ? (100 * antCump) / antProg : null,
    habitos: metricas,
    mejores: ordenados.filter((m) => m.pct >= 50).slice(0, 3),
    peores: [...ordenados].reverse().filter((m) => m.pct < 80).slice(0, 3),
    porDiaSemana,
    mejorDiaSemana: peorDiaSignificativo(porDiaSemana) ? mejorIndice(porDiaSemana) : null,
    peorDiaSemana: peorDiaSignificativo(porDiaSemana),
    diasPerfectos,
    diasConDatos,
    animo: { diasBuenos: media(buenos), diasFlojos: media(flojos) },
  };
}

function mejorIndice(xs: (number | null)[]): string | null {
  let i = -1;
  xs.forEach((x, j) => {
    if (x != null && (i < 0 || x > (xs[i] as number))) i = j;
  });
  return i < 0 ? null : NOMBRES_DIA[i];
}

/**
 * Peor día solo si destaca: si todos los días van parecido (p. ej. todo al 0 %), no hay "peor día".
 * Con `plural`, para frases tipo "falla más los …", y si empatan hasta 3 días se nombran todos
 * ("sábados y domingos"); sin `plural` (frases tipo "tu peor día es el …") el empate da null.
 */
function peorDiaSignificativo(xs: (number | null)[], plural = false): string | null {
  const vals = xs.filter((x): x is number => x != null);
  if (vals.length < 2 || Math.max(...vals) - Math.min(...vals) < 20) return null;
  const minimo = Math.min(...vals);
  const empatados = xs.map((x, i) => (x != null && Math.abs(x - minimo) < 0.5 ? i : -1)).filter((i) => i >= 0);
  if (!plural) return empatados.length === 1 ? NOMBRES_DIA[empatados[0]] : null;
  if (empatados.length > 3) return null;
  const nombres = empatados.map((i) => NOMBRES_DIA_PLURAL[i]);
  return nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

/**
 * Ideas de mejora sin IA (si no hay clave de Anthropic, o como base que la IA amplía). Concretas y
 * accionables: cada una sale de un dato del informe.
 */
export function ideasPorReglas(inf: InformeHabitos): string[] {
  const ideas: string[] = [];
  for (const p of inf.peores) {
    if (p.pct < 40) {
      ideas.push(
        `${p.emoji} ${p.nombre} (${Math.round(p.pct)} %): baja el listón a una versión mínima que no puedas fallar (2 minutos) durante 2 semanas. Primero la constancia, luego la intensidad.`,
      );
    } else {
      ideas.push(
        `${p.emoji} ${p.nombre} (${Math.round(p.pct)} %): engánchalo a algo que ya haces siempre ("después de X, hago ${p.nombre.toLowerCase()}") y déjalo preparado la noche antes.`,
      );
    }
    if (p.peorDia) ideas.push(`${p.nombre} se te cae sobre todo los ${p.peorDia}: planifica ese día en concreto (hora fija en el calendario) o quítalo de ese día y compénsalo otro.`);
  }
  if (inf.peorDiaSemana && inf.mejorDiaSemana && inf.peorDiaSemana !== inf.mejorDiaSemana) {
    ideas.push(`Tu peor día es el ${inf.peorDiaSemana} y el mejor el ${inf.mejorDiaSemana}. Copia lo que haces el ${inf.mejorDiaSemana} (hora de despertar, plan del día) y aplícalo al ${inf.peorDiaSemana}.`);
  }
  if (inf.pctGlobalAnterior != null) {
    const dif = inf.pctGlobal - inf.pctGlobalAnterior;
    if (dif < -5) ideas.push(`Has bajado ${Math.abs(Math.round(dif))} puntos respecto al mes pasado. Revisa si añadiste hábitos de golpe: mejor 3 que cumples que 8 que arrastras.`);
    else if (dif > 5) ideas.push(`Has subido ${Math.round(dif)} puntos respecto al mes pasado. Ahora toca subir un poco la exigencia del hábito que mejor llevas.`);
  }
  if (inf.animo.diasBuenos != null && inf.animo.diasFlojos != null && inf.animo.diasBuenos - inf.animo.diasFlojos >= 0.5) {
    ideas.push(`Los días que cumples tu rutina tu ánimo medio es ${inf.animo.diasBuenos.toFixed(1)}/5 frente a ${inf.animo.diasFlojos.toFixed(1)}/5 los días flojos. La rutina no es un extra: es lo que te pone bien.`);
  }
  if (inf.mejores[0]) {
    ideas.push(`${inf.mejores[0].emoji} ${inf.mejores[0].nombre} ya es parte de ti (${Math.round(inf.mejores[0].pct)} %). Úsalo de ancla para colgarle el hábito que más te cuesta.`);
  }
  return ideas.slice(0, 7);
}
