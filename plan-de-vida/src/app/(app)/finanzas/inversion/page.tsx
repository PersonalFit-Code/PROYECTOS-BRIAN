import type { Metadata } from "next";
import { FilaActivo, FormActivo } from "@/components/inversion/Activo";
import { BotonActualizar } from "@/components/inversion/BotonActualizar";
import { TarjetaRecomendacion } from "@/components/inversion/TarjetaRecomendacion";
import { Card, Kpi, Seccion, Titulo, Vacio } from "@/components/ui/basicos";
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Titulo emoji="📈" sub="Núcleo indexado a largo plazo + satélite pequeño. Recomendaciones cada día laborable que se puntúan solas.">
          Inversión
        </Titulo>
        <BotonActualizar />
      </div>

      <p className="mb-6 rounded-md border border-line bg-side px-3 py-2 text-xs text-muted">
        ⚠️ Análisis automático con fines informativos, no asesoramiento financiero. Rentabilidades pasadas no garantizan futuras. Tú decides y ejecutas en tu bróker: la app no compra ni vende nada.
      </p>

      <Seccion titulo={inf ? `Informe del ${fechaLarga(inf.day).toLowerCase()}` : "Informe del día"}>
        {inf ? (
          <Card>
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{inf.summary}</div>
            <div className="mt-3 text-xs text-muted">{inf.mode === "claude" ? "Redactado por el coach a partir de las reglas." : "Generado por reglas (sin IA)."}</div>
          </Card>
        ) : (
          <Vacio>El primer informe se genera en el próximo día laborable, o pulsa «Actualizar ahora».</Vacio>
        )}
      </Seccion>

      {deHoy.length > 0 && (
        <Seccion titulo="Recomendaciones de hoy · tu valoración entrena al sistema">
          <ul className="grid gap-3 md:grid-cols-2">
            {deHoy.map((r) => (
              <TarjetaRecomendacion key={r.id} rec={r} nombre={nombre.get(r.symbol) ?? r.symbol} nombreSenal={NOMBRE_SENAL[r.signal as Senal] ?? r.signal} />
            ))}
          </ul>
        </Seccion>
      )}

      <Seccion titulo="Historial de aciertos (frente al benchmark)">
        <div className="mb-4 grid grid-cols-3 gap-3">
          {porHorizonte.map((p) => (
            <Kpi
              key={p.h}
              etiqueta={`A ${p.h} días`}
              valor={p.pct == null ? "—" : `${Math.round(p.pct)} %`}
              detalle={p.total ? `${p.total} evaluadas${p.alfa != null ? ` · ${signo(p.alfa)} vs bench.` : ""}` : "sin datos aún"}
              tono={p.pct == null ? undefined : p.pct >= 55 ? "ok" : p.pct < 45 ? "bad" : undefined}
            />
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="py-1 font-medium">Señal</th>
                <th className="py-1 text-right font-medium">Evaluadas</th>
                <th className="py-1 text-right font-medium">Acierto</th>
                <th className="py-1 text-right font-medium">vs bench.</th>
                <th className="py-1 text-right font-medium">👍/👎</th>
                <th className="py-1 text-right font-medium">Peso</th>
              </tr>
            </thead>
            <tbody>
              {metricas.map((m) => {
                const peso = (pesosVigentes as Record<string, number>)[m.senal] ?? 1;
                return (
                  <tr key={m.senal} className="border-t border-line">
                    <td className="py-2 pr-2">{NOMBRE_SENAL[m.senal]}</td>
                    <td className="py-2 text-right tabular-nums">{m.evaluadas}</td>
                    <td className="py-2 text-right tabular-nums">{m.aciertoPct == null ? "—" : `${Math.round(m.aciertoPct)} %`}</td>
                    <td className={cx("py-2 text-right tabular-nums", m.excesoMedio != null && (m.excesoMedio >= 0 ? "text-ok" : "text-bad"))}>{m.excesoMedio == null ? "—" : signo(m.excesoMedio)}</td>
                    <td className="py-2 text-right tabular-nums">
                      {m.utiles}/{m.noUtiles}
                    </td>
                    <td className={cx("py-2 text-right tabular-nums", peso < 0.6 ? "text-bad" : peso > 1.05 ? "text-ok" : "")}>{peso.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">
          Cada recomendación se puntúa a 7, 30 y 90 días con precios reales. Con {MINIMO_EVALUACIONES}+ evaluaciones, el peso de la señal sube o baja con su acierto y con tus 👍/👎; por debajo de 0,6 la señal queda «en observación». Los pesos se recalculan cada lunes.
        </p>
      </Seccion>

      <Seccion titulo="Qué ha aprendido el sistema">
        {notasEstrategia.length ? (
          <ul className="space-y-3">
            {notasEstrategia.map((nota) => (
              <li key={nota.id} className="border-l-2 border-line pl-3">
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
      </Seccion>

      <Seccion titulo={`Tu cartera y reparto objetivo${totalCartera ? ` · ${euros(totalCartera, false)}` : ""}`}>
        {sumaObjetivo !== 100 && <p className="mb-2 text-xs text-warn">Los pesos objetivo suman {sumaObjetivo.toFixed(0)} % (deberían sumar 100 %).</p>}
        {!totalCartera && <p className="mb-2 text-xs text-muted">Para medir tus pesos reales, añade tus posiciones en Patrimonio con el mismo ticker.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="py-1 font-medium">Activo</th>
                <th className="py-1 text-right font-medium">Último</th>
                <th className="py-1 text-right font-medium">Objetivo</th>
                <th className="py-1 text-right font-medium">Actual</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {watch.map((w) => (
                <FilaActivo
                  key={w.id}
                  activo={w}
                  pesoActual={totalCartera ? (100 * (posiciones.get(w.symbol) ?? 0)) / totalCartera : null}
                  ultimo={w.quoted ? (ultimo.has(w.symbol) ? ultimo.get(w.symbol)!.toFixed(2) : "—") : w.yield_pct != null ? `${n(w.yield_pct).toFixed(2)} % TAE` : "—"}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Card className="mt-4">
          <h3 className="mb-3 text-sm font-semibold">Añadir a la lista</h3>
          <FormActivo />
        </Card>
      </Seccion>
    </>
  );
}
