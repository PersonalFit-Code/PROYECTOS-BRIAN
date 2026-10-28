import type { Metadata } from "next";
import Link from "next/link";
import { Checkin } from "@/components/diario/Checkin";
import { HabitosHoy, type HabitoDelDia } from "@/components/habitos/HabitosHoy";
import { Pagina } from "@/components/layout/Pagina";
import { ListaTareas } from "@/components/metas/ListaTareas";
import { Card, Progreso, Seccion, Titulo } from "@/components/ui/basicos";
import { getCategorias, getDiario, getHabitos, getLogs, getMetas, getMovimientos, getRecurrentes, getTareas } from "@/lib/datos/consultas";
import { fechaCorta, fechaLarga, hoy as hoyMadrid, lunesDe, mesDe, rangoMes, sumarDias } from "@/lib/fechas";
import { euros } from "@/lib/formato";
import { cumplido, indexar, rachaActual, toca } from "@/lib/habitos/metricas";
import { getSesion } from "@/lib/sesion";
import { n } from "@/lib/tipos";

export const metadata: Metadata = { title: "Hoy" };

export default async function HoyPage() {
  const hoy = hoyMadrid();
  const s = await getSesion();
  const mes = rangoMes(mesDe(hoy));
  const [habitos, logs, diario, tareas, metas, movimientos, categorias, recurrentes] = await Promise.all([
    getHabitos(s),
    getLogs(s, sumarDias(hoy, -400), hoy),
    getDiario(s, hoy, hoy),
    getTareas(s, { hasta: hoy }),
    getMetas(s),
    getMovimientos(s, mes.desde, mes.hasta),
    getCategorias(s),
    getRecurrentes(s),
  ]);

  const porHabito = indexar(logs);
  const lunes = lunesDe(hoy);
  const delDia: HabitoDelDia[] = habitos
    .filter((h) => toca(h, hoy))
    .map((h) => {
      const l = porHabito.get(h.id) ?? new Map();
      const log = l.get(hoy);
      let semanal: string | null = null;
      if (h.weekly_target) {
        let hechos = 0;
        for (let i = 0; i < 7; i++) if (cumplido(h, l.get(sumarDias(lunes, i)))) hechos++;
        semanal = `${hechos}/${h.weekly_target} esta semana`;
      }
      return {
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        kind: h.kind,
        target: h.target != null ? n(h.target) : null,
        unit: h.unit,
        routine: h.routine,
        done: cumplido(h, log),
        value: log?.value != null ? n(log.value) : null,
        racha: rachaActual(h, l, hoy),
        semanal,
      };
    });

  // Tareas de hoy: pendientes con fecha ≤ hoy o sin fecha, y las que se han tachado hoy (para ver el avance).
  const deHoy = tareas.filter((t) => (!t.done && (!t.due_date || t.due_date <= hoy)) || (t.done && t.done_at != null && hoyMadrid(new Date(t.done_at)) === hoy));

  const gastado = movimientos.filter((m) => m.kind === "gasto").reduce((a, m) => a + n(m.amount), 0);
  const ingresado = movimientos.filter((m) => m.kind === "ingreso").reduce((a, m) => a + n(m.amount), 0);
  const presupuesto = categorias.filter((c) => c.kind === "gasto").reduce((a, c) => a + n(c.monthly_budget), 0);
  const proximos = recurrentes.filter((r) => r.active && r.kind === "gasto" && r.next_date <= sumarDias(hoy, 7));
  const entrada = diario[0] ?? null;

  return (
    <Pagina>
      <Titulo emoji="☀️" sub={fechaLarga(hoy)}>
        Hoy
      </Titulo>

      <Seccion titulo="¿Cómo estás?">
        <Checkin dia={hoy} mood={entrada?.mood ?? null} energy={entrada?.energy ?? null} />
      </Seccion>

      <Seccion titulo="Rutinas y hábitos" accion={<Link href="/habitos" className="text-xs text-muted hover:text-fg">Ver todos →</Link>}>
        <HabitosHoy habitos={delDia} dia={hoy} />
      </Seccion>

      <Seccion titulo="Tareas">
        <ListaTareas tareas={deHoy} metas={metas.filter((m) => m.status === "activa")} dia={hoy} hoy={hoy} />
      </Seccion>

      <Seccion titulo="Dinero este mes" accion={<Link href="/finanzas" className="text-xs text-muted hover:text-fg">Finanzas →</Link>}>
        <Card>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs text-muted">Gastado</div>
              <div className="text-2xl font-semibold tabular-nums">{euros(gastado)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted">Ingresado</div>
              <div className="text-lg tabular-nums text-ok">{euros(ingresado)}</div>
            </div>
          </div>
          {presupuesto > 0 && (
            <div className="mt-3">
              <Progreso valor={(100 * gastado) / presupuesto} color={gastado > presupuesto ? "var(--bad)" : "var(--accent)"} />
              <div className="mt-1 text-xs text-muted">
                {euros(gastado, false)} de {euros(presupuesto, false)} presupuestados
              </div>
            </div>
          )}
          {proximos.length > 0 && (
            <div className="mt-3 border-t border-line pt-2 text-sm">
              <div className="mb-1 text-xs text-muted">Próximos cargos (7 días)</div>
              {proximos.map((r) => (
                <div key={r.id} className="flex justify-between">
                  <span>{r.name}</span>
                  <span className="tabular-nums text-muted">
                    {fechaCorta(r.next_date)} · {euros(r.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Seccion>
    </Pagina>
  );
}
