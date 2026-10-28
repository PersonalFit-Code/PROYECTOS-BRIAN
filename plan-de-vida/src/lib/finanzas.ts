import { sumarDias, sumarMeses } from "@/lib/fechas";
import { n, type Account, type Frequency, type Num } from "@/lib/tipos";

/** Coste mensual equivalente de un fijo (una suscripción anual de 120 € = 10 €/mes). */
export function mensual(importe: Num, frecuencia: Frequency): number {
  const v = n(importe);
  if (frecuencia === "semanal") return (v * 52) / 12;
  if (frecuencia === "anual") return v / 12;
  return v;
}

export function siguienteFecha(dia: string, frecuencia: Frequency): string {
  if (frecuencia === "semanal") return sumarDias(dia, 7);
  if (frecuencia === "anual") return sumarMeses(dia, 12);
  return sumarMeses(dia, 1);
}

/** Lo que hay que apartar al mes para llegar a la meta en la fecha (null si no hay fecha o ya pasó). */
export function ritmoMensual(objetivo: number, ahorrado: number, fechaMeta: string | null, hoy: string): number | null {
  if (!fechaMeta || fechaMeta <= hoy) return null;
  const falta = Math.max(0, objetivo - ahorrado);
  const meses = Math.max(1, (Date.parse(fechaMeta) - Date.parse(hoy)) / (30.44 * 86_400_000));
  return falta / meses;
}

/** Activos menos deudas (las deudas se guardan en positivo). */
export function patrimonioNeto(cuentas: Pick<Account, "kind" | "balance">[]): number {
  return cuentas.reduce((a, c) => a + (c.kind === "deuda" ? -n(c.balance) : n(c.balance)), 0);
}
