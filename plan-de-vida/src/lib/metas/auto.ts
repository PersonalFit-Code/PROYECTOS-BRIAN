import { mesDe } from "@/lib/fechas";
import { mensual } from "@/lib/finanzas";
import { n, type Goal, type RecurringItem, type Transaction } from "@/lib/tipos";

/**
 * Lo que entra en el mes: los ingresos apuntados o, si aún son menos, lo comprometido por los ingresos
 * fijos activos (el día 1 todavía no se ha cobrado nada, pero los mantenimientos ya cuentan).
 */
export function ingresoMensual(
  movimientos: Pick<Transaction, "kind" | "amount" | "day">[],
  fijos: Pick<RecurringItem, "kind" | "amount" | "frequency" | "active">[],
  mes: string,
): { total: number; apuntado: number; fijos: number } {
  const apuntado = movimientos.filter((m) => m.kind === "ingreso" && mesDe(m.day) === mes).reduce((a, m) => a + n(m.amount), 0);
  const comprometido = fijos.filter((r) => r.active && r.kind === "ingreso").reduce((a, r) => a + mensual(r.amount, r.frequency), 0);
  return { total: Math.max(apuntado, comprometido), apuntado, fijos: comprometido };
}

function mesesEntre(desde: string, hasta: string): number {
  const [a1, m1] = desde.split("-").map(Number);
  const [a2, m2] = hasta.split("-").map(Number);
  return (a2 - a1) * 12 + (m2 - m1);
}

/**
 * Lo que debería entrar en `mes` para llegar al objetivo en la fecha límite, subiendo lo mismo cada mes
 * desde el mes en que se creó la meta. null si la meta no tiene fecha.
 */
export function ritmoMeta(inicio: number, objetivo: number, creada: string, limite: string | null, mes: string): number | null {
  if (!limite) return null;
  const total = mesesEntre(mesDe(creada), mesDe(limite));
  if (total <= 0) return objetivo;
  const k = Math.min(total, Math.max(0, mesesEntre(mesDe(creada), mes)));
  return inicio + ((objetivo - inicio) * k) / total;
}

export interface EstadoAuto {
  valor: number;
  ritmo: number | null;
  falta: number;
  apuntado: number;
  fijos: number;
}

/** Rellena valor actual y % de las metas automáticas con los datos del mes. Las demás quedan igual. */
export function aplicarAuto(
  metas: Goal[],
  movimientos: Pick<Transaction, "kind" | "amount" | "day">[],
  fijos: Pick<RecurringItem, "kind" | "amount" | "frequency" | "active">[],
  mes: string,
): { metas: Goal[]; estados: Map<string, EstadoAuto> } {
  const estados = new Map<string, EstadoAuto>();
  if (!metas.some((m) => m.auto)) return { metas, estados };
  const ingreso = ingresoMensual(movimientos, fijos, mes);
  return {
    metas: metas.map((m) => {
      if (m.auto !== "ingreso_mensual" || m.target_value == null) return m;
      const inicio = n(m.start_value ?? 0);
      const objetivo = n(m.target_value);
      // % de lo que ya entra frente a lo que se quiere ganar al mes (200 de 3.000 = 7 %), no desde el punto de partida.
      const pct = objetivo > 0 ? Math.min(100, Math.max(0, (100 * ingreso.total) / objetivo)) : 0;
      estados.set(m.id, {
        valor: ingreso.total,
        ritmo: ritmoMeta(inicio, objetivo, m.created_at, m.due_date, mes),
        falta: Math.max(0, objetivo - ingreso.total),
        apuntado: ingreso.apuntado,
        fijos: ingreso.fijos,
      });
      return { ...m, current_value: ingreso.total, progress_pct: pct };
    }),
    estados,
  };
}
