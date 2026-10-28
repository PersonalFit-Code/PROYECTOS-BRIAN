/** Filas de la base de datos (supabase/migrations/0001_esquema.sql). Los numeric llegan como number o string. */

export type Num = number | string;

export type Settings = {
  user_id: string;
  display_name: string;
  coach_prompt: string | null;
  /** notas de negocio para el coach (migración 0005) */
  negocio: string | null;
  coach_name: string;
  monthly_investment: Num;
  satellite_pct: Num;
  inflation_pct: Num;
  benchmark_symbol: string;
};

export type Area = { id: string; slug: string; name: string; emoji: string; color: string; vision: string | null; position: number };

export type GoalPeriod = "anual" | "trimestral" | "mensual";
export type GoalStatus = "activa" | "hecha" | "pausada" | "descartada";
export type Goal = {
  id: string;
  area_id: string | null;
  title: string;
  description: string | null;
  period: GoalPeriod;
  year: number;
  quarter: number | null;
  month: number | null;
  unit: string | null;
  start_value: Num | null;
  target_value: Num | null;
  current_value: Num | null;
  progress_pct: Num;
  status: GoalStatus;
  due_date: string | null;
  /** métrica que se calcula sola (migración 0004); null = avance a mano */
  auto: GoalAuto | null;
  created_at: string;
};

export type GoalAuto = "ingreso_mensual";

export type Task = { id: string; goal_id: string | null; title: string; due_date: string | null; priority: number; done: boolean; done_at: string | null };

export type HabitKind = "check" | "cantidad" | "dejar";
export type Routine = "manana" | "dia" | "noche";
export type Habit = {
  id: string;
  area_id: string | null;
  name: string;
  emoji: string;
  kind: HabitKind;
  target: Num | null;
  unit: string | null;
  routine: Routine;
  weekdays: number[];
  weekly_target: number | null;
  start_date: string;
  active: boolean;
  position: number;
};
export type HabitLog = { habit_id: string; day: string; done: boolean; value: Num | null; note: string | null };

export type JournalEntry = { id: string; day: string; mood: number | null; energy: number | null; gratitude: string | null; body: string | null };

export type Review = { id: string; kind: "semanal" | "mensual"; period: string; answers: Record<string, string>; report: unknown; created_at: string };

export type TxKind = "gasto" | "ingreso";
export type Category = { id: string; name: string; emoji: string; kind: TxKind; monthly_budget: Num | null; position: number };
export type Transaction = { id: string; day: string; amount: Num; kind: TxKind; category_id: string | null; note: string | null; recurring_id: string | null };
export type Frequency = "semanal" | "mensual" | "anual";
export type RecurringItem = {
  id: string;
  name: string;
  amount: Num;
  kind: TxKind;
  category_id: string | null;
  frequency: Frequency;
  next_date: string;
  is_subscription: boolean;
  active: boolean;
};
export type SavingsGoal = { id: string; name: string; emoji: string; target: Num; saved: Num; target_date: string | null; done: boolean };
export type AccountKind = "liquidez" | "inversion" | "deuda" | "otro";
export type Account = { id: string; name: string; kind: AccountKind; balance: Num; symbol: string | null; active: boolean; position: number; updated_at: string };
export type AccountSnapshot = { account_id: string; month: string; balance: Num };

export type AssetClass = "renta_variable" | "renta_fija" | "liquidez";
export type Sleeve = "nucleo" | "satelite";
export type WatchItem = {
  id: string;
  symbol: string;
  name: string;
  asset_class: AssetClass;
  sleeve: Sleeve;
  target_pct: Num;
  quoted: boolean;
  yield_pct: Num | null;
  active: boolean;
  position: number;
};
export type Price = { symbol: string; day: string; close: Num };
export type RecAction = "aportar" | "mantener" | "reducir" | "vigilar";
export type Recommendation = {
  id: string;
  report_id: string | null;
  day: string;
  symbol: string;
  action: RecAction;
  sleeve: Sleeve;
  signal: string;
  thesis: string;
  confidence: number;
  horizon_days: number;
  price_ref: Num | null;
  benchmark_ref: Num | null;
  feedback: "util" | "no_util" | null;
  followed: boolean | null;
  feedback_note: string | null;
};
export type RecOutcome = {
  recommendation_id: string;
  horizon_days: number;
  price: Num;
  benchmark: Num | null;
  return_pct: Num;
  benchmark_pct: Num | null;
  hit: boolean;
};
export type InvestmentReport = { id: string; day: string; summary: string; mode: "claude" | "reglas"; context: Record<string, unknown>; created_at: string };
export type StrategyNote = { id: string; week: string; summary: string; metrics: Record<string, unknown>; weights: Record<string, number>; created_at: string };
export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; created_at: string };

export const n = (v: Num | null | undefined): number => (v == null ? 0 : Number(v));
