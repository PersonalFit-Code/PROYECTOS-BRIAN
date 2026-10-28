import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ListTodo, Moon, Smile, Sun, Sunrise, Wallet } from "lucide-react";
import { PreguntarCoach } from "@/components/coach/PreguntarCoach";
import { Checkin } from "@/components/diario/Checkin";
import { HabitosHoy, type HabitoDelDia } from "@/components/habitos/HabitosHoy";
import { Pagina } from "@/components/layout/Pagina";
import { ListaTareas } from "@/components/metas/ListaTareas";
import { Progreso, Titulo, Vacio } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { Icono } from "@/components/ui/iconos";
import { getCategorias, getDiario, getHabitos, getLogs, getMetas, getMovimientos, getRecurrentes, getTareas } from "@/lib/datos/consultas";
import { fechaCorta, fechaLarga, hoy as hoyMadrid, lunesDe, mesDe, rangoMes, sumarDias } from "@/lib/fechas";
import { euros } from "@/lib/formato";
import { cumplido, indexar, rachaActual, toca } from "@/lib/habitos/metricas";
import { getSesion } from "@/lib/sesion";
import { n, type Routine } from "@/lib/tipos";

export const metadata: Metadata = { title: "Hoy" };

const RUTINAS: { id: Routine; titulo: string; icono: typeof Sun; color: string }[] = [
  { id: "manana", titulo: "Rutina de mañana", icono: Sunrise, color: "orange" },
  { id: "dia", titulo: "Durante el día", icono: Sun, color: "yellow" },
  { id: "noche", titulo: "Rutina de noche", icono: Moon, color: "purple" },
];

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
  const pendientes = deHoy.filter((t) => !t.done).length;

  const gastos = movimientos.filter((m) => m.kind === "gasto");
  const gastado = gastos.reduce((a, m) => a + n(m.amount), 0);
  const gastadoHoy = gastos.filter((m) => m.day === hoy).reduce((a, m) => a + n(m.amount), 0);
  const ingresado = movimientos.filter((m) => m.kind === "ingreso").reduce((a, m) => a + n(m.amount), 0);
  const presupuesto = categorias.filter((c) => c.kind === "gasto").reduce((a, c) => a + n(c.monthly_budget), 0);
  const proximos = recurrentes.filter((r) => r.active && r.kind === "gasto" && r.next_date <= sumarDias(hoy, 7));
  const nombreCat = new Map(categorias.map((c) => [c.id, c]));
  const entrada = diario[0] ?? null;
  const hechos = delDia.filter((h) => h.done).length;

  return (
    <Pagina>
      <Titulo icono={<Sun />} color="yellow" sub={fechaLarga(hoy)}>
        Hoy
      </Titulo>

      <div className="mb-4 flex flex-wrap gap-2">
        <PreguntarCoach pregunta="Dame el plan de ataque para hoy">Plan de ataque para hoy</PreguntarCoach>
      </div>

      {delDia.length > 0 && (
        <div className="glass entrar mb-4 flex items-center gap-3 rounded-2xl px-4 py-3">
          <span className="shrink-0 text-sm font-medium">Tu día</span>
          <Progreso valor={(100 * hechos) / delDia.length} color="var(--ok)" />
          <span className="shrink-0 text-sm tabular-nums text-muted">
            {hechos}/{delDia.length}
          </span>
        </div>
      )}

      <Desplegable icono={<Smile />} color="blue" titulo="¿Cómo estás?" resumen={entrada?.mood ? "Hecho" : "Pendiente"} abierto={!entrada?.mood} i={1}>
        <Checkin dia={hoy} mood={entrada?.mood ?? null} energy={entrada?.energy ?? null} />
      </Desplegable>

      {delDia.length === 0 ? (
        <Desplegable icono={<Sun />} color="yellow" titulo="Rutinas y hábitos" abierto i={2}>
          <Vacio>
            Aún no tienes hábitos para hoy.{" "}
            <Link href="/habitos" className="text-accent underline">
              Crea tu primera rutina
            </Link>
            .
          </Vacio>
        </Desplegable>
      ) : (
        RUTINAS.map((r, i) => {
          const lista = delDia.filter((h) => h.routine === r.id);
          if (!lista.length) return null;
          const hechosRutina = lista.filter((h) => h.done).length;
          return (
            <Desplegable key={r.id} icono={<r.icono />} color={r.color} titulo={r.titulo} resumen={`${hechosRutina}/${lista.length}`} abierto={hechosRutina < lista.length} i={i + 2}>
              <HabitosHoy habitos={lista} dia={hoy} />
            </Desplegable>
          );
        })
      )}

      <Desplegable icono={<ListTodo />} color="pink" titulo="Tareas" resumen={pendientes ? `${pendientes} ${pendientes === 1 ? "pendiente" : "pendientes"}` : "Al día"} abierto={pendientes > 0} i={6}>
        <ListaTareas tareas={deHoy} metas={metas.filter((m) => m.status === "activa")} dia={hoy} hoy={hoy} />
      </Desplegable>

      <Desplegable icono={<Wallet />} color="green" titulo="Dinero" resumen={gastadoHoy ? `${euros(gastadoHoy)} hoy` : `${euros(gastado, false)} este mes`} i={7}>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs text-muted">Gastado este mes</div>
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
          <div className="mt-4">
            <div className="mb-1 text-xs font-medium text-muted">Próximos cargos (7 días)</div>
            <ul className="space-y-1">
              {proximos.map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-sm">
                  <Icono nombre={(r.category_id && nombreCat.get(r.category_id)?.emoji) || "repeat"} className="text-muted" />
                  <span className="flex-1">{r.name}</span>
                  <span className="tabular-nums text-muted">
                    {fechaCorta(r.next_date)} · {euros(r.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link href="/finanzas" className="mt-4 inline-flex items-center gap-1 text-sm text-accent">
          Ir a Finanzas <ChevronRight className="size-4" />
        </Link>
      </Desplegable>
    </Pagina>
  );
}
