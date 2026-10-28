import "server-only";

import { getClaude, logErrorClaude, textoDe } from "@/lib/coach/claude";
import { MODELO_COACH, personalidad } from "@/lib/coach/personalidad";
import { diaSemana, hoy, semanaIso, sumarDias } from "@/lib/fechas";
import type { Sesion } from "@/lib/sesion";
import { n, type Account, type Recommendation, type Settings, type WatchItem } from "@/lib/tipos";
import { acierto, calcularPesos, HORIZONTES, resumenAprendizaje, type Feedback, type Resultado } from "./aprendizaje";
import { cierreEn, indicadores, type Indicadores } from "./indicadores";
import { leerSeries } from "./precios";
import { generarPropuestas, NOMBRE_SENAL, type Activo, type Propuesta, type Senal } from "./senales";

/* ────────────────────────────────────────────────────────────
   1 · Puntuar recomendaciones pasadas con precios reales
   ──────────────────────────────────────────────────────────── */

export async function evaluarResultados(s: Sesion, dia = hoy()): Promise<number> {
  const { data: ajustes } = await s.db.from("settings").select("benchmark_symbol").eq("user_id", s.userId).single();
  const benchmark = (ajustes?.benchmark_symbol as string) ?? "IWDA.AS";
  const { data: recs } = await s.db
    .from("recommendations")
    .select("id, day, symbol, action, sleeve, price_ref, benchmark_ref")
    .eq("user_id", s.userId)
    .not("price_ref", "is", null)
    .neq("action", "vigilar")
    .lte("day", sumarDias(dia, -HORIZONTES[0]))
    .gte("day", sumarDias(dia, -(HORIZONTES[HORIZONTES.length - 1] + 30)));
  if (!recs?.length) return 0;

  const { data: hechos } = await s.db.from("recommendation_outcomes").select("recommendation_id, horizon_days").eq("user_id", s.userId).in("recommendation_id", recs.map((r) => r.id));
  const ya = new Set((hechos ?? []).map((h) => `${h.recommendation_id}:${h.horizon_days}`));
  const simbolos = [...new Set([...recs.map((r) => r.symbol as string), benchmark])];
  const series = await leerSeries(s.db, simbolos, sumarDias(dia, -200));

  const nuevas: Record<string, unknown>[] = [];
  for (const r of recs as Recommendation[]) {
    for (const h of HORIZONTES) {
      const objetivo = sumarDias(r.day, h);
      if (objetivo > dia || ya.has(`${r.id}:${h}`)) continue;
      const precio = cierreEn(series.get(r.symbol) ?? [], objetivo);
      // sin cotización de ese día o posterior todavía → esperar
      if (!precio || precio.day < sumarDias(objetivo, -5)) continue;
      const rent = (100 * (precio.close - n(r.price_ref))) / n(r.price_ref);
      const bench = cierreEn(series.get(benchmark) ?? [], objetivo);
      const rentBench = bench && r.benchmark_ref ? (100 * (bench.close - n(r.benchmark_ref))) / n(r.benchmark_ref) : null;
      const hit = acierto(r.action, r.sleeve, rent, rentBench);
      if (hit == null) continue;
      nuevas.push({
        recommendation_id: r.id,
        user_id: s.userId,
        horizon_days: h,
        price: precio.close,
        benchmark: bench?.close ?? null,
        return_pct: Math.round(rent * 1000) / 1000,
        benchmark_pct: rentBench == null ? null : Math.round(rentBench * 1000) / 1000,
        hit,
      });
    }
  }
  if (nuevas.length) {
    const r = await s.db.from("recommendation_outcomes").upsert(nuevas, { onConflict: "recommendation_id,horizon_days", ignoreDuplicates: true });
    if (r.error) throw new Error(`No se pudieron guardar los resultados: ${r.error.message}`);
  }
  return nuevas.length;
}

/* ────────────────────────────────────────────────────────────
   2 · Aprender: pesos por señal (nota semanal)
   ──────────────────────────────────────────────────────────── */

export async function pesosVigentes(s: Sesion): Promise<Partial<Record<Senal, number>>> {
  const { data } = await s.db.from("strategy_notes").select("weights").eq("user_id", s.userId).order("week", { ascending: false }).limit(1).maybeSingle();
  return (data?.weights as Partial<Record<Senal, number>>) ?? {};
}

async function datosAprendizaje(s: Sesion): Promise<{ resultados: Resultado[]; feedback: Feedback[] }> {
  const [{ data: outs }, { data: recs }] = await Promise.all([
    s.db.from("recommendation_outcomes").select("recommendation_id, horizon_days, hit, return_pct, benchmark_pct").eq("user_id", s.userId).limit(5000),
    s.db.from("recommendations").select("id, signal, feedback, followed").eq("user_id", s.userId).limit(5000),
  ]);
  const senalDe = new Map((recs ?? []).map((r) => [r.id as string, r.signal as string]));
  return {
    resultados: (outs ?? [])
      .filter((o) => senalDe.has(o.recommendation_id))
      .map((o) => ({
        signal: senalDe.get(o.recommendation_id)!,
        horizon_days: o.horizon_days,
        hit: o.hit,
        return_pct: n(o.return_pct),
        benchmark_pct: o.benchmark_pct == null ? null : n(o.benchmark_pct),
      })),
    feedback: (recs ?? []).filter((r) => r.feedback || r.followed != null).map((r) => ({ signal: r.signal, feedback: r.feedback, followed: r.followed })),
  };
}

/** Recalcula los pesos y deja una nota con qué ha cambiado y por qué. Idempotente por semana. */
export async function notaSemanal(s: Sesion, dia = hoy()): Promise<string> {
  const semana = semanaIso(dia);
  const [{ resultados, feedback }, anterior] = await Promise.all([datosAprendizaje(s), pesosVigentes(s)]);
  const metricas = calcularPesos(resultados, feedback);
  const resumen = resumenAprendizaje(metricas, anterior);
  const weights = Object.fromEntries(metricas.map((m) => [m.senal, m.peso]));
  const r = await s.db
    .from("strategy_notes")
    .upsert({ user_id: s.userId, week: semana, summary: resumen, metrics: { senales: metricas }, weights }, { onConflict: "user_id,week" });
  if (r.error) throw new Error(`No se pudo guardar la nota de estrategia: ${r.error.message}`);
  return resumen;
}

/* ────────────────────────────────────────────────────────────
   3 · Informe del día
   ──────────────────────────────────────────────────────────── */

const ACCION: Record<string, string> = { aportar: "Aportar", mantener: "Mantener", reducir: "Reducir", vigilar: "Vigilar" };

function resumenPorReglas(props: Propuesta[], nombres: Map<string, string>, fallos: string[]): string {
  const lineas = props
    .filter((p) => p.action !== "vigilar" || p.signal === "rentabilidad_liquidez")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6)
    .map((p) => `• ${ACCION[p.action]} ${nombres.get(p.symbol) ?? p.symbol}: ${p.thesis}`);
  const cab = lineas.length ? "Lo que toca hoy según tus reglas:" : "Hoy no hay movimientos que hacer: mantén el plan y la aportación mensual.";
  const aviso = fallos.length ? `\n\n(No se pudieron actualizar las cotizaciones de ${fallos.join(", ")}; se ha usado el último dato guardado.)` : "";
  return [cab, ...lineas].join("\n") + aviso;
}

export interface ResultadoInforme {
  dia: string;
  recomendaciones: number;
  modo: "claude" | "reglas";
}

/**
 * Genera (o regenera con `forzar`) el informe del día: indicadores → propuestas (con los pesos
 * aprendidos) → texto del coach → se guarda todo con el precio de referencia para puntuarlo luego.
 */
export async function generarInformeInversion(s: Sesion, opciones: { forzar?: boolean; fallosPrecios?: string[] } = {}): Promise<ResultadoInforme | null> {
  const dia = hoy();
  const { data: existente } = await s.db.from("investment_reports").select("id").eq("user_id", s.userId).eq("day", dia).maybeSingle();
  if (existente && !opciones.forzar) return null;

  const [{ data: ajustesRaw }, { data: lista }, { data: cuentas }, pesos] = await Promise.all([
    s.db.from("settings").select("*").eq("user_id", s.userId).single(),
    s.db.from("watchlist").select("*").eq("user_id", s.userId).eq("active", true).order("position"),
    s.db.from("accounts").select("*").eq("user_id", s.userId).eq("active", true).not("symbol", "is", null),
    pesosVigentes(s),
  ]);
  const ajustes = ajustesRaw as Settings;
  const watch = (lista ?? []) as WatchItem[];
  const activos: Activo[] = watch.map((w) => ({
    symbol: w.symbol,
    name: w.name,
    asset_class: w.asset_class,
    sleeve: w.sleeve,
    target_pct: n(w.target_pct),
    quoted: w.quoted,
    yield_pct: w.yield_pct == null ? null : n(w.yield_pct),
  }));
  const cotizados = activos.filter((a) => a.quoted).map((a) => a.symbol);
  const series = await leerSeries(s.db, [...new Set([...cotizados, ajustes.benchmark_symbol])], sumarDias(dia, -400));
  const inds = new Map<string, Indicadores>();
  for (const [sym, serie] of series) {
    const i = indicadores(serie);
    if (i) inds.set(sym, i);
  }
  const posiciones = new Map<string, number>();
  for (const c of (cuentas ?? []) as Account[]) if (c.symbol) posiciones.set(c.symbol, (posiciones.get(c.symbol) ?? 0) + n(c.balance));

  const propuestas = generarPropuestas({
    activos,
    indicadores: inds,
    posiciones,
    aportacionMensual: n(ajustes.monthly_investment),
    inflacion: n(ajustes.inflation_pct),
    pesos,
  });
  const nombres = new Map(activos.map((a) => [a.symbol, a.name]));
  let resumen = resumenPorReglas(propuestas, nombres, opciones.fallosPrecios ?? []);
  let modo: "claude" | "reglas" = "reglas";

  const claude = getClaude();
  if (claude && propuestas.length) {
    try {
      const { data: nota } = await s.db.from("strategy_notes").select("summary").eq("user_id", s.userId).order("week", { ascending: false }).limit(1).maybeSingle();
      const contexto = {
        fecha: dia,
        perfil: `mixto: ${100 - n(ajustes.satellite_pct)} % núcleo indexado a largo plazo, ${n(ajustes.satellite_pct)} % satélite`,
        aportacion_mensual: n(ajustes.monthly_investment),
        inflacion: n(ajustes.inflation_pct),
        cartera_actual: Object.fromEntries(posiciones),
        mercado: Object.fromEntries(
          [...inds].map(([k, v]) => [
            nombres.get(k) ?? k,
            { ultimo: v.ultimo, caida_desde_max_pct: +v.drawdown.toFixed(1), rent_3m_pct: v.mom3m == null ? null : +v.mom3m.toFixed(1), sobre_media_200: v.sma200 == null ? null : v.ultimo > v.sma200 },
          ]),
        ),
        propuestas: propuestas.map((p) => ({ activo: nombres.get(p.symbol) ?? p.symbol, accion: p.action, regla: NOMBRE_SENAL[p.signal], confianza: p.confidence, motivo: p.thesis })),
        aprendizaje_reciente: nota?.summary ?? "sin datos aún",
      };
      const msg = await claude.messages.create({
        model: MODELO_COACH,
        max_tokens: 900,
        system: personalidad(ajustes),
        messages: [
          {
            role: "user",
            content:
              `Escribe el informe de inversión de hoy para ${ajustes.display_name} a partir de estos datos (las propuestas ya están decididas por las reglas; tu trabajo es explicarlas y priorizarlas, no inventar otras):\n\n${JSON.stringify(contexto, null, 2)}\n\n` +
              `Formato: 1 frase de titular, luego 3–6 viñetas "• " con qué hacer este mes y por qué, ordenadas por importancia, y una línea final sobre qué ha aprendido el sistema de sus aciertos. ` +
              `Máximo 160 palabras. Sin promesas de rentabilidad; recuerda en media frase que la decisión es suya.`,
          },
        ],
      });
      const texto = textoDe(msg);
      if (texto) {
        resumen = texto + (opciones.fallosPrecios?.length ? `\n\n(Sin cotización nueva hoy para ${opciones.fallosPrecios.join(", ")}.)` : "");
        modo = "claude";
      }
    } catch (err) {
      logErrorClaude("informe-inversion", err);
    }
  }

  if (existente) await s.db.from("investment_reports").delete().eq("id", existente.id);
  const { data: informe, error } = await s.db
    .from("investment_reports")
    .insert({
      user_id: s.userId,
      day: dia,
      summary: resumen,
      mode: modo,
      context: { pesos, indicadores: Object.fromEntries(inds), posiciones: Object.fromEntries(posiciones) },
    })
    .select("id")
    .single();
  if (error || !informe) throw new Error(`No se pudo guardar el informe: ${error?.message}`);

  const benchRef = inds.get(ajustes.benchmark_symbol)?.ultimo ?? null;
  if (propuestas.length) {
    const r = await s.db.from("recommendations").insert(
      propuestas.map((p) => ({
        user_id: s.userId,
        report_id: informe.id,
        day: dia,
        symbol: p.symbol,
        action: p.action,
        sleeve: p.sleeve,
        signal: p.signal,
        thesis: p.thesis,
        confidence: p.confidence,
        horizon_days: p.horizon_days,
        price_ref: p.price_ref,
        benchmark_ref: p.price_ref != null ? benchRef : null,
      })),
    );
    if (r.error) throw new Error(`No se pudieron guardar las recomendaciones: ${r.error.message}`);
  }
  return { dia, recomendaciones: propuestas.length, modo };
}

/** ¿Toca informe hoy? Solo días laborables (los mercados cierran el fin de semana). */
export function esDiaDeMercado(dia = hoy()): boolean {
  return diaSemana(dia) < 5;
}

