import "server-only";

import { timingSafeEqual } from "node:crypto";
import { hoy, mesAnterior, mesDe } from "@/lib/fechas";
import { siguienteFecha } from "@/lib/finanzas";
import type { Sesion } from "@/lib/sesion";
import type { RecurringItem } from "@/lib/tipos";

/** Vercel Cron manda `Authorization: Bearer $CRON_SECRET`. Comparación en tiempo constante. */
export function autorizado(req: Request): boolean {
  const secreto = process.env.CRON_SECRET;
  const cabecera = req.headers.get("authorization") ?? "";
  if (!secreto || !cabecera.startsWith("Bearer ")) return false;
  const a = Buffer.from(cabecera.slice(7));
  const b = Buffer.from(secreto);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Apunta los fijos y suscripciones que vencen hasta hoy y adelanta su próxima fecha. Si el cron
 * estuvo parado varios días, se ponen al día todos los cargos pendientes (como mucho 24 por fijo).
 * Idempotente: la tabla no admite dos movimientos del mismo fijo el mismo día.
 */
export async function apuntarRecurrentes(s: Sesion, dia = hoy()): Promise<number> {
  const { data } = await s.db.from("recurring_items").select("*").eq("user_id", s.userId).eq("active", true).lte("next_date", dia);
  let apuntados = 0;
  for (const r of (data ?? []) as RecurringItem[]) {
    let fecha = r.next_date;
    const filas: Record<string, unknown>[] = [];
    for (let i = 0; i < 24 && fecha <= dia; i++) {
      filas.push({ user_id: s.userId, day: fecha, amount: r.amount, kind: r.kind, category_id: r.category_id, note: r.name, recurring_id: r.id, method: r.method ?? "tarjeta" });
      fecha = siguienteFecha(fecha, r.frequency);
    }
    const ins = await s.db.from("transactions").upsert(filas, { onConflict: "recurring_id,day", ignoreDuplicates: true });
    if (ins.error) {
      console.error(`[cron] fijo ${r.name}:`, ins.error.message);
      continue;
    }
    await s.db.from("recurring_items").update({ next_date: fecha }).eq("id", r.id);
    apuntados += filas.length;
  }
  return apuntados;
}

/** Foto de saldos a primeros de mes (para la gráfica de patrimonio). */
export async function fotoPatrimonio(s: Sesion, dia = hoy()): Promise<number> {
  const mes = `${mesDe(dia)}-01`;
  const { data } = await s.db.from("accounts").select("id, balance").eq("user_id", s.userId).eq("active", true);
  if (!data?.length) return 0;
  const r = await s.db.from("account_snapshots").upsert(
    data.map((c) => ({ account_id: c.id, user_id: s.userId, month: mes, balance: c.balance })),
    { onConflict: "account_id,month" },
  );
  if (r.error) throw new Error(r.error.message);
  return data.length;
}

export function mesCerrado(dia = hoy()): string {
  return mesAnterior(mesDe(dia));
}
