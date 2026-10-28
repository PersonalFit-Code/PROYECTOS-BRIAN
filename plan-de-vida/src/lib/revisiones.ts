import "server-only";

import { lunesDe, mesDe, rangoMes, semanaIso, sumarDias } from "@/lib/fechas";
import { indexar, informeMensual } from "@/lib/habitos/metricas";
import type { Sesion } from "@/lib/sesion";
import { n, type Habit, type HabitLog, type JournalEntry, type Transaction } from "@/lib/tipos";

export type TipoRevision = "semanal" | "mensual";

export const PREGUNTAS: Record<TipoRevision, { id: string; texto: string }[]> = {
  semanal: [
    { id: "bien", texto: "¿Qué ha ido bien esta semana?" },
    { id: "mal", texto: "¿Qué no ha salido como quería? ¿Por qué?" },
    { id: "aprendi", texto: "¿Qué he aprendido?" },
    { id: "prioridades", texto: "Mis 3 prioridades para la semana que viene" },
  ],
  mensual: [
    { id: "logro", texto: "¿De qué logro del mes me siento orgulloso?" },
    { id: "habito", texto: "¿Qué hábito ajusto (o quito) el mes que viene?" },
    { id: "dinero", texto: "¿En qué gasté de más? ¿Qué recorto?" },
    { id: "foco", texto: "Mi foco número uno para el mes que viene" },
  ],
};

export interface Periodo {
  tipo: TipoRevision;
  clave: string;
  desde: string;
  hasta: string;
}

/** Periodo a revisar: la semana o el mes que contiene `dia`. */
export function periodoDe(tipo: TipoRevision, dia: string): Periodo {
  if (tipo === "semanal") {
    const desde = lunesDe(dia);
    return { tipo, clave: semanaIso(dia), desde, hasta: sumarDias(desde, 6) };
  }
  const mes = mesDe(dia);
  return { tipo, clave: mes, ...rangoMes(mes) };
}

export interface ResumenPeriodo {
  habitosPct: number;
  diasPerfectos: number;
  gastos: number;
  ingresos: number;
  tareasHechas: number;
  animoMedio: number | null;
  peorHabito: string | null;
  mejorHabito: string | null;
}

/** Números del periodo para la revisión (y para el coach). */
export async function resumenPeriodo(s: Sesion, desde: string, hasta: string): Promise<ResumenPeriodo> {
  const [{ data: habitos }, { data: logs }, { data: movs }, { count: tareasHechas }, { data: diario }] = await Promise.all([
    s.db.from("habits").select("*").eq("user_id", s.userId).eq("active", true),
    s.db.from("habit_logs").select("habit_id, day, done, value").eq("user_id", s.userId).gte("day", desde).lte("day", hasta),
    s.db.from("transactions").select("amount, kind").eq("user_id", s.userId).gte("day", desde).lte("day", hasta),
    s.db.from("tasks").select("id", { count: "exact", head: true }).eq("user_id", s.userId).eq("done", true).gte("done_at", `${desde}T00:00:00Z`).lte("done_at", `${hasta}T23:59:59Z`),
    s.db.from("journal_entries").select("mood").eq("user_id", s.userId).gte("day", desde).lte("day", hasta),
  ]);
  const inf = informeMensual({
    mes: desde.slice(0, 7),
    desde,
    hasta,
    desdeAnterior: desde,
    hastaAnterior: desde,
    habitos: (habitos ?? []) as Habit[],
    logs: indexar((logs ?? []) as HabitLog[]),
  });
  const ms = (movs ?? []) as Pick<Transaction, "amount" | "kind">[];
  const animos = ((diario ?? []) as Pick<JournalEntry, "mood">[]).map((d) => d.mood).filter((m): m is number => m != null);
  return {
    habitosPct: inf.pctGlobal,
    diasPerfectos: inf.diasPerfectos,
    gastos: ms.filter((m) => m.kind === "gasto").reduce((a, m) => a + n(m.amount), 0),
    ingresos: ms.filter((m) => m.kind === "ingreso").reduce((a, m) => a + n(m.amount), 0),
    tareasHechas: tareasHechas ?? 0,
    animoMedio: animos.length ? animos.reduce((a, b) => a + b, 0) / animos.length : null,
    peorHabito: inf.peores[0]?.nombre ?? null,
    mejorHabito: inf.mejores[0]?.nombre ?? null,
  };
}
