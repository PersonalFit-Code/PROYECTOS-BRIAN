import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ChartColumn, ChevronLeft, ChevronRight, Lightbulb, Sparkles, Table2, TrendingDown, Trophy } from "lucide-react";
import { Pagina } from "@/components/layout/Pagina";
import { Card, Kpi, Progreso, Titulo, Vacio } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { Icono } from "@/components/ui/iconos";
import { hoy, INICIALES_DIA, mesAnterior, mesDe, nombreMes, sumarMeses } from "@/lib/fechas";
import { cx, signo } from "@/lib/formato";
import { calcularInforme, leerInforme } from "@/lib/habitos/informe";
import { ideasPorReglas, type MetricaHabito } from "@/lib/habitos/metricas";
import { getSesion } from "@/lib/sesion";
import { BotonGenerar } from "./BotonGenerar";

export const metadata: Metadata = { title: "Informe de hábitos" };

function colorPct(p: number) {
  return p >= 80 ? "var(--ok)" : p >= 50 ? "var(--warn)" : "var(--bad)";
}

export default async function InformePage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const sp = await searchParams;
  const mes = /^\d{4}-\d{2}$/.test(sp.mes ?? "") ? sp.mes! : mesAnterior(mesDe(hoy()));
  const s = await getSesion();
  const [inf, guardado] = await Promise.all([calcularInforme(s, mes), leerInforme(s, mes)]);
  const ideas = guardado?.ideas ?? ideasPorReglas(inf);
  const enCurso = mes === mesDe(hoy());

  return (
    <Pagina ancha>
      <Link href="/habitos" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ChevronLeft className="size-4" /> Hábitos
      </Link>
      <Titulo icono={<ChartColumn />} color="blue" sub={enCurso ? "Mes en curso: los datos se completan a medida que marcas." : "Lo que más fallas, lo que mejor se te da y qué mejorar."}>
        <span className="first-letter:uppercase">Informe de {nombreMes(mes)}</span>
      </Titulo>

      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href={`/habitos/informe?mes=${mesAnterior(mes)}`} className="glass inline-flex items-center gap-1 rounded-xl px-3 py-1.5 transition hover:bg-hover">
          <ChevronLeft className="size-4" /> Anterior
        </Link>
        {!enCurso && (
          <Link href={`/habitos/informe?mes=${mesDe(sumarMeses(`${mes}-01`, 1))}`} className="glass inline-flex items-center gap-1 rounded-xl px-3 py-1.5 transition hover:bg-hover">
            Siguiente <ChevronRight className="size-4" />
          </Link>
        )}
      </div>

      {!inf.habitos.length ? (
        <Vacio>No hay hábitos con datos en este mes.</Vacio>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi
              icono={<CalendarCheck />}
              etiqueta="Cumplimiento"
              valor={`${Math.round(inf.pctGlobal)} %`}
              detalle={inf.pctGlobalAnterior != null ? `${signo(inf.pctGlobal - inf.pctGlobalAnterior, 0).replace(" %", " pts")} vs mes anterior` : undefined}
              tono={inf.pctGlobal >= 70 ? "ok" : inf.pctGlobal < 50 ? "bad" : undefined}
            />
            <Kpi i={1} icono={<Sparkles />} etiqueta="Días perfectos" valor={inf.diasPerfectos} detalle={`de ${inf.diasConDatos} con datos`} />
            <Kpi i={2} icono={<Trophy />} etiqueta="Mejor día" valor={<span className="capitalize">{inf.mejorDiaSemana ?? "—"}</span>} />
            <Kpi i={3} icono={<TrendingDown />} etiqueta="Peor día" valor={<span className="capitalize">{inf.peorDiaSemana ?? "—"}</span>} tono="bad" />
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <Card className="entrar">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Trophy className="size-4 text-ok" /> Lo que mejor se te da
              </h3>
              <Ranking lista={inf.mejores} vacio="Ningún hábito por encima del 50 % todavía." />
            </Card>
            <Card className="entrar">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <TrendingDown className="size-4 text-bad" /> Donde más fallas
              </h3>
              <Ranking lista={inf.peores} vacio="Nada por debajo del 80 %. Brutal." />
            </Card>
          </div>

          <Desplegable icono={<CalendarCheck />} color="blue" titulo="Cumplimiento por día de la semana" abierto>
            <div className="flex items-end gap-2">
              {inf.porDiaSemana.map((p, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs tabular-nums text-muted">{p == null ? "—" : `${Math.round(p)}%`}</span>
                  <div className="flex h-28 w-full items-end">
                    <div className="w-full rounded-t" style={{ height: `${Math.max(2, p ?? 0)}%`, background: p == null ? "var(--line)" : colorPct(p) }} />
                  </div>
                  <span className="text-xs font-medium">{INICIALES_DIA[i]}</span>
                </div>
              ))}
            </div>
          </Desplegable>

          <Desplegable icono={<Lightbulb />} color="yellow" titulo="Ideas para el mes que viene" resumen={`${ideas.length}`} abierto>
            <div className="mb-3">
              <BotonGenerar mes={mes} hay={guardado?.ideasModo === "claude"} />
            </div>
            <ul className="space-y-2">
              {ideas.map((idea, i) =>
                idea.startsWith("> ") ? (
                  <li key={i} className="border-l-4 border-accent pl-3 italic">
                    {idea.slice(2)}
                  </li>
                ) : (
                  <li key={i} className="flex gap-2">
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{idea}</span>
                  </li>
                ),
              )}
            </ul>
            <p className="mt-3 text-xs text-muted">
              {guardado?.ideasModo === "claude" ? "Ideas del coach (IA) a partir de tus datos." : "Ideas automáticas a partir de tus datos. Pide las del coach para un análisis más fino."}
            </p>
          </Desplegable>

          <Desplegable icono={<Table2 />} color="green" titulo="Todos los hábitos" resumen={`${inf.habitos.length}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    <th className="py-1 font-medium">Hábito</th>
                    <th className="py-1 font-medium">Cumplido</th>
                    <th className="w-1/3 py-1 font-medium"></th>
                    <th className="py-1 text-right font-medium">vs mes ant.</th>
                    <th className="py-1 text-right font-medium">Mejor racha</th>
                  </tr>
                </thead>
                <tbody>
                  {[...inf.habitos].sort((a, b) => b.pct - a.pct).map((h) => (
                    <tr key={h.id} className="border-t border-line">
                      <td className="py-2 pr-2">
                        <span className="inline-flex items-center gap-2">
                          <Icono nombre={h.emoji} porDefecto="check" className="text-muted" /> {h.nombre}
                        </span>
                      </td>
                      <td className="py-2 pr-2 tabular-nums">
                        {h.cumplidos}/{h.programados}
                      </td>
                      <td className="py-2 pr-2">
                        <Progreso valor={h.pct} color={colorPct(h.pct)} />
                      </td>
                      <td className={cx("py-2 text-right tabular-nums", h.pctAnterior != null && (h.pct >= h.pctAnterior ? "text-ok" : "text-bad"))}>
                        {h.pctAnterior == null ? "—" : signo(h.pct - h.pctAnterior, 0).replace(" %", "")}
                      </td>
                      <td className="py-2 text-right tabular-nums">{h.mejorRacha || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Desplegable>

          {inf.animo.diasBuenos != null && inf.animo.diasFlojos != null && (
            <Card className="entrar">
              <p className="text-sm">
                Los días que cumples ≥ 80 % de tu rutina tu ánimo medio es <b>{inf.animo.diasBuenos.toFixed(1)}/5</b>; los días por debajo del 50 %, <b>{inf.animo.diasFlojos.toFixed(1)}/5</b>.
              </p>
            </Card>
          )}
        </>
      )}
    </Pagina>
  );
}

function Ranking({ lista, vacio }: { lista: MetricaHabito[]; vacio: string }) {
  if (!lista.length) return <p className="text-sm text-muted">{vacio}</p>;
  return (
    <ol className="space-y-3">
      {lista.map((h) => (
        <li key={h.id}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="inline-flex items-center gap-2">
              <Icono nombre={h.emoji} porDefecto="check" className="text-muted" /> {h.nombre}
            </span>
            <span className="tabular-nums text-muted">{Math.round(h.pct)} %</span>
          </div>
          <Progreso valor={h.pct} color={colorPct(h.pct)} />
          {h.peorDia && h.pct < 80 && <p className="mt-1 text-xs text-muted">Falla más los {h.peorDia}</p>}
        </li>
      ))}
    </ol>
  );
}
