import type { Metadata } from "next";
import { FilaActivo, FormActivo } from "@/components/inversion/Activo";
import { BotonActualizar } from "@/components/inversion/BotonActualizar";
import { TarjetaRecomendacion } from "@/components/inversion/TarjetaRecomendacion";
import { Brain, FileText, Lightbulb, PieChart, Plus, Target, ThumbsDown, ThumbsUp, TrendingUp, TriangleAlert } from "lucide-react";
import { Kpi, Titulo, Vacio } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { Hoja } from "@/components/ui/Hoja";
import { fechaCorta, fechaLarga, hoy, sumarDias } from "@/lib/fechas";
import { cx, euros, signo } from "@/lib/formato";
import { calcularPesos, HORIZONTES, MINIMO_EVALUACIONES } from "@/lib/inversion/aprendizaje";
import { NOMBRE_SENAL, type Senal } from "@/lib/inversion/senales";
import { getSesion } from "@/lib/sesion";
import { n, type Account, type InvestmentReport, type Recommendation, type RecOutcome, type StrategyNote, type WatchItem } from "@/lib/tipos";

export const metadata: Metadata = { title: "Inversión" };

export default async function InversionPage() {
  const s = await getSesion();
  const [{ data: informe }, { data: lista }, { data: cuentas }, { data: recsTodas }, { data: resultados }, { data: notas }, { data: precios }] = await Promise.all([
    s.db.from("investment_reports").select("*").eq("user_id", s.userId).order("day", { ascending: false }).limit(1).maybeSingle(),
    s.db.from("watchlist").select("*").eq("user_id", s.userId).eq("active", true).order("position"),
    s.db.from("accounts").select("*").eq("user_id", s.userId).eq("active", true).not("symbol", "is", null),
    s.db.from("recommendations").select("*").eq("user_id", s.userId).order("day", { ascending: false }).limit(1000),
    s.db.from("recommendation_outcomes").select("*").eq("user_id", s.userId).limit(5000),
    s.db.from("strategy_notes").select("*").eq("user_id", s.userId).order("week", { ascending: false }).limit(8),
    s.db.from("prices").select("symbol, day, close").gte("day", sumarDias(hoy(), -10)).order("day", { ascending: false }),
  ]);

  const inf = informe as InvestmentReport | null;
  const watch = (lista ?? []) as WatchItem[];
  const recs = (recsTodas ?? []) as Recommendation[];
  const outs = (resultados ?? []) as RecOutcome[];
  const nombre = new Map(watch.map((w) => [w.symbol, w.name]));
  const deHoy = inf ? recs.filter((r) => r.report_id === inf.id).sort((a, b) => b.confidence - a.confidence) : [];

  // Cartera
  const posiciones = new Map<string, number>();
  for (const c of (cuentas ?? []) as Account[]) if (c.symbol) posiciones.set(c.symbol, (posiciones.get(c.symbol) ?? 0) + n(c.balance));
  const totalCartera = [...posiciones.values()].reduce((a, b) => a + b, 0);
  const ultimo = new Map<string, number>();
  for (const p of precios ?? []) if (!ultimo.has(p.symbol)) ultimo.set(p.symbol, Number(p.close));
  const sumaObjetivo = watch.reduce((a, w) => a + n(w.target_pct), 0);

  // Historial de aciertos
  const senalDe = new Map(recs.map((r) => [r.id, r.signal]));
  const metricas = calcularPesos(
    outs.filter((o) => senalDe.has(o.recommendation_id)).map((o) => ({ signal: senalDe.get(o.recommendation_id)!, horizon_days: o.horizon_days, hit: o.hit, return_pct: n(o.return_pct), benchmark_pct: o.benchmark_pct == null ? null : n(o.benchmark_pct) })),
    recs.filter((r) => r.feedback || r.followed != null).map((r) => ({ signal: r.signal, feedback: r.feedback, followed: r.followed })),
  );
  const porHorizonte = HORIZONTES.map((h) => {
    const xs = outs.filter((o) => o.horizon_days === h);
    const conB = xs.filter((o) => o.benchmark_pct != null);
    return {
      h,
      total: xs.length,
      pct: xs.length ? (100 * xs.filter((o) => o.hit).length) / xs.length : null,
      alfa: conB.length ? conB.reduce((a, o) => a + n(o.return_pct) - n(o.benchmark_pct), 0) / conB.length : null,
    };
  });
  const notasEstrategia = (notas ?? []) as StrategyNote[];
  const pesosVigentes = notasEstrategia[0]?.weights ?? {};

  return (
    <>
      <Titulo icono={<TrendingUp />} color="orange" sub="Núcleo indexado a largo plazo + satélite pequeño. Recomendaciones cada día laborable que se puntúan solas." acciones={<BotonActualizar />}>
        Inversión
      </Titulo>

      <p className="glass entrar mb-4 flex gap-2 rounded-2xl px-3 py-2.5 text-xs text-muted">
        <TriangleAlert className="size-4 shrink-0 text-warn" />
        Análisis automático con fines informativos, no asesoramiento financiero. Rentabilidades pasadas no garantizan futuras. Tú decides y ejecutas en tu bróker: la app no compra ni vende nada.
      </p>

      <Desplegable icono={<FileText />} color="orange" titulo={inf ? `Informe del ${fechaLarga(inf.day).toLowerCase()}` : "Informe del día"} resumen={inf?.mode === "claude" ? "IA" : inf ? "reglas" : undefined} abierto i={1}>
        {inf ? (
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{inf.summary}</div>
        ) : (
          <Vacio>El primer informe se genera el próximo día laborable, o pulsa «Actualizar ahora».</Vacio>
        )}
      </Desplegable>

      {deHoy.length > 0 && (
        <Desplegable icono={<Lightbulb />} color="yellow" titulo="Recomendaciones" resumen={`${deHoy.length}`} abierto i={2}>
          <p className="mb-3 text-xs text-muted">Valora cada una con el pulgar o marca «La seguí»: así el sistema aprende qué te sirve.</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {deHoy.map((r) => (
              <TarjetaRecomendacion key={r.id} rec={r} nombre={nombre.get(r.symbol) ?? r.symbol} nombreSenal={NOMBRE_SENAL[r.signal as Senal] ?? r.signal} />
            ))}
          </ul>
        </Desplegable>
      )}

      <Desplegable icono={<Target />} color="green" titulo="Historial de aciertos" resumen={porHorizonte[1].pct == null ? "sin datos" : `${Math.round(porHorizonte[1].pct)} % a 30 días`} i={3}>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {porHorizonte.map((p, k) => (
            <Kpi
              key={p.h}
              i={k}
              etiqueta={`A ${p.h} días`}
              valor={p.pct == null ? "—" : `${Math.round(p.pct)} %`}
              detalle={p.total ? `${p.total} evaluadas${p.alfa != null ? ` · ${signo(p.alfa)}` : ""}` : "sin datos"}
              tono={p.pct == null ? undefined : p.pct >= 55 ? "ok" : p.pct < 45 ? "bad" : undefined}
            />
          ))}
        </div>
        <ul className="space-y-2">
          {metricas.map((m) => {
            const peso = (pesosVigentes as Record<string, number>)[m.senal] ?? 1;
            return (
              <li key={m.senal} className="rounded-2xl border border-line/70 bg-bg/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{NOMBRE_SENAL[m.senal]}</span>
                  <span className={cx("rounded-lg px-2 py-0.5 text-xs font-semibold tabular-nums", peso < 0.6 ? "bg-bad/15 text-bad" : peso > 1.05 ? "bg-ok/15 text-ok" : "bg-hover text-muted")}>peso {peso.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                  <span>{m.evaluadas} evaluadas</span>
                  <span>acierto {m.aciertoPct == null ? "—" : `${Math.round(m.aciertoPct)} %`}</span>
                  <span className={cx(m.excesoMedio != null && (m.excesoMedio >= 0 ? "text-ok" : "text-bad"))}>vs índice {m.excesoMedio == null ? "—" : signo(m.excesoMedio)}</span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="size-3" /> {m.utiles} <ThumbsDown className="ml-1 size-3" /> {m.noUtiles}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Cada recomendación se puntúa a 7, 30 y 90 días con precios reales. Con {MINIMO_EVALUACIONES}+ evaluaciones, el peso de la señal sube o baja con su acierto y con tu valoración; por debajo de 0,6 la señal queda «en observación». Los pesos se recalculan cada lunes.
        </p>
      </Desplegable>

      <Desplegable icono={<Brain />} color="purple" titulo="Qué ha aprendido el sistema" resumen={notasEstrategia.length ? `${notasEstrategia.length} notas` : undefined} i={4}>
        {notasEstrategia.length ? (
          <ul className="space-y-3">
            {notasEstrategia.map((nota) => (
              <li key={nota.id} className="border-l-2 border-accent/40 pl-3">
                <div className="text-xs font-medium text-muted">
                  Semana {nota.week} · {fechaCorta(nota.created_at.slice(0, 10))}
                </div>
                <div className="whitespace-pre-wrap text-sm">{nota.summary}</div>
              </li>
            ))}
          </ul>
        ) : (
          <Vacio>La primera nota llega el próximo lunes.</Vacio>
        )}
      </Desplegable>

      <Desplegable icono={<PieChart />} color="blue" titulo="Tu cartera y reparto objetivo" resumen={totalCartera ? euros(totalCartera, false) : undefined} i={5}>
        {sumaObjetivo !== 100 && <p className="mb-2 text-xs text-warn">Los pesos objetivo suman {sumaObjetivo.toFixed(0)} % (deberían sumar 100 %).</p>}
        {!totalCartera && <p className="mb-2 text-xs text-muted">Para medir tus pesos reales, añade tus posiciones en Patrimonio con el mismo ticker.</p>}
        <ul className="space-y-2">
          {watch.map((w) => (
            <FilaActivo
              key={w.id}
              activo={w}
              pesoActual={totalCartera ? (100 * (posiciones.get(w.symbol) ?? 0)) / totalCartera : null}
              ultimo={w.quoted ? (ultimo.has(w.symbol) ? ultimo.get(w.symbol)!.toFixed(2) : "sin cotización") : w.yield_pct != null ? `${n(w.yield_pct).toFixed(2)} % TAE` : "—"}
            />
          ))}
        </ul>
        <div className="mt-3">
          <Hoja titulo="Añadir a la lista" boton="Añadir activo" icono={<Plus />} variante="suave">
            <FormActivo />
          </Hoja>
        </div>
      </Desplegable>
    </>
  );
}
