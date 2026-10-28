import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cierre } from "./indicadores";

/**
 * Cotizaciones de cierre diario. Sin clave: Yahoo Finance (gratis, sin registro, tickers tipo
 * "IWDA.AS" o "SXR8.DE"). Con TWELVEDATA_API_KEY: Twelve Data (más estable; el ticker va como
 * "IWDA:XAMS" o se traduce del sufijo de Yahoo).
 *
 * Se guardan en la tabla `prices` y los cálculos leen de ahí: si un día la fuente falla, se trabaja
 * con lo último que haya.
 */

const SUFIJO_A_MERCADO: Record<string, string> = { AS: "XAMS", DE: "XETR", PA: "XPAR", MI: "XMIL", L: "XLON", MC: "XMAD", SW: "XSWX" };

async function deYahoo(symbol: string, rango: string): Promise<Cierre[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${rango}&interval=1d`;
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (PlanDeVida)" }, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`Yahoo ${res.status} para ${symbol}`);
  const json = (await res.json()) as {
    chart?: { result?: { timestamp?: number[]; indicators?: { quote?: { close?: (number | null)[] }[] } }[] };
  };
  const r = json.chart?.result?.[0];
  const ts = r?.timestamp ?? [];
  const cierres = r?.indicators?.quote?.[0]?.close ?? [];
  const out: Cierre[] = [];
  ts.forEach((t, i) => {
    const c = cierres[i];
    if (c != null && Number.isFinite(c)) out.push({ day: new Date(t * 1000).toISOString().slice(0, 10), close: c });
  });
  return out;
}

async function deTwelveData(symbol: string, sesiones: number): Promise<Cierre[]> {
  const [base, sufijo] = symbol.split(".");
  const params = new URLSearchParams({ symbol: base, interval: "1day", outputsize: String(sesiones), apikey: process.env.TWELVEDATA_API_KEY! });
  if (sufijo && SUFIJO_A_MERCADO[sufijo]) params.set("mic_code", SUFIJO_A_MERCADO[sufijo]);
  const res = await fetch(`https://api.twelvedata.com/time_series?${params}`, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  const json = (await res.json()) as { status?: string; message?: string; values?: { datetime: string; close: string }[] };
  if (json.status === "error" || !json.values) throw new Error(`Twelve Data: ${json.message ?? "sin datos"} (${symbol})`);
  return json.values.map((v) => ({ day: v.datetime.slice(0, 10), close: Number(v.close) })).reverse();
}

/** Descarga y guarda las cotizaciones. Devuelve los símbolos que fallaron (no corta el resto). */
export async function actualizarPrecios(db: SupabaseClient, simbolos: string[]): Promise<{ ok: string[]; fallos: string[] }> {
  const ok: string[] = [];
  const fallos: string[] = [];
  for (const symbol of simbolos) {
    try {
      const { count } = await db.from("prices").select("symbol", { count: "exact", head: true }).eq("symbol", symbol);
      const primeraVez = !count || count < 200;
      const serie = process.env.TWELVEDATA_API_KEY ? await deTwelveData(symbol, primeraVez ? 400 : 30) : await deYahoo(symbol, primeraVez ? "2y" : "1mo");
      if (!serie.length) throw new Error("serie vacía");
      const r = await db.from("prices").upsert(
        serie.map((c) => ({ symbol, day: c.day, close: c.close })),
        { onConflict: "symbol,day" },
      );
      if (r.error) throw new Error(r.error.message);
      ok.push(symbol);
    } catch (err) {
      console.error(`[precios] ${symbol}:`, err instanceof Error ? err.message : err);
      fallos.push(symbol);
    }
    // Twelve Data gratis: 8 peticiones por minuto
    if (process.env.TWELVEDATA_API_KEY) await new Promise((r) => setTimeout(r, 8_000));
  }
  return { ok, fallos };
}

/** Series guardadas (desde `desde`), ordenadas de antigua a reciente. */
export async function leerSeries(db: SupabaseClient, simbolos: string[], desde: string): Promise<Map<string, Cierre[]>> {
  const out = new Map<string, Cierre[]>();
  if (!simbolos.length) return out;
  // Supabase devuelve como mucho 1000 filas por consulta: se pide símbolo a símbolo.
  await Promise.all(
    simbolos.map(async (s) => {
      const { data } = await db.from("prices").select("day, close").eq("symbol", s).gte("day", desde).order("day").limit(1000);
      out.set(s, (data ?? []).map((d) => ({ day: d.day as string, close: Number(d.close) })));
    }),
  );
  return out;
}
