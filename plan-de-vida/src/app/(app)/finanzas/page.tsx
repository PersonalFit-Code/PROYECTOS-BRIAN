import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ChartColumn, ChevronLeft, ChevronRight, Clock, Gauge, PiggyBank, Receipt, Scale } from "lucide-react";
import { GraficaMeses } from "@/components/finanzas/GraficaMeses";
import { ListaMovimientos } from "@/components/finanzas/ListaMovimientos";
import { HaciaMeta } from "@/components/finanzas/HaciaMeta";
import { ListaTraspasos, Pendientes } from "@/components/finanzas/Pendientes";
import { Presupuesto } from "@/components/finanzas/Presupuesto";
import { Kpi, Titulo } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { getCategorias, getCuentas, getMetas, getMovimientos, getPendientes, getRecurrentes, getTraspasos } from "@/lib/datos/consultas";
import { hoy, mesAnterior, mesDe, NOMBRES_MES, nombreMes, rangoMes, sumarMeses } from "@/lib/fechas";
import { euros, pct } from "@/lib/formato";
import { aplicarAuto } from "@/lib/metas/auto";
import { getSesion } from "@/lib/sesion";
import { n } from "@/lib/tipos";

export const metadata: Metadata = { title: "Finanzas" };

export default async function FinanzasPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const sp = await searchParams;
  const actual = mesDe(hoy());
  const mes = /^\d{4}-\d{2}$/.test(sp.mes ?? "") ? sp.mes! : actual;
  const { desde, hasta } = rangoMes(mes);
  const inicioGrafica = mesDe(sumarMeses(`${mes}-01`, -5));

  const s = await getSesion();
  const [todos, categorias, metas, recurrentes, pendientes, traspasos, cuentas] = await Promise.all([
    getMovimientos(s, `${inicioGrafica}-01`, hasta),
    getCategorias(s),
    getMetas(s, Number(mes.slice(0, 4))),
    getRecurrentes(s),
    getPendientes(s),
    getTraspasos(s, desde, hasta),
    getCuentas(s),
  ]);
  const nombreCuenta = Object.fromEntries(cuentas.map((c) => [c.id, c.name]));
  const enCamino = pendientes.filter((m) => m.kind === "ingreso").reduce((a, m) => a + n(m.amount), 0);
  const delMes = todos.filter((m) => m.day >= desde);
  // La meta de ingresos solo se mide en el mes en curso (los fijos de hoy no dicen nada de meses pasados).
  const auto = mes === actual ? aplicarAuto(metas.filter((m) => m.auto === "ingreso_mensual" && m.status === "activa"), delMes, recurrentes, mes) : null;
  const metaIngresos = auto?.metas[0];

  const gastos = delMes.filter((m) => m.kind === "gasto").reduce((a, m) => a + n(m.amount), 0);
  const ingresos = delMes.filter((m) => m.kind === "ingreso").reduce((a, m) => a + n(m.amount), 0);
  const ahorro = ingresos - gastos;

  const porCat = new Map<string, number>();
  for (const m of delMes) if (m.kind === "gasto") porCat.set(m.category_id ?? "", (porCat.get(m.category_id ?? "") ?? 0) + n(m.amount));
  const filas = categorias
    .filter((c) => c.kind === "gasto")
    .map((c) => ({ id: c.id, nombre: c.name, emoji: c.emoji, gastado: porCat.get(c.id) ?? 0, presupuesto: c.monthly_budget != null ? n(c.monthly_budget) : null }))
    .sort((a, b) => b.gastado - a.gastado || (b.presupuesto ?? 0) - (a.presupuesto ?? 0));

  const meses: { mes: string; ingresos: number; gastos: number }[] = [];
  for (let m = inicioGrafica; m <= mes; m = mesDe(sumarMeses(`${m}-01`, 1))) {
    const ms = todos.filter((t) => t.day.startsWith(m));
    meses.push({
      mes: NOMBRES_MES[Number(m.slice(5)) - 1].slice(0, 3),
      ingresos: ms.filter((t) => t.kind === "ingreso").reduce((a, t) => a + n(t.amount), 0),
      gastos: ms.filter((t) => t.kind === "gasto").reduce((a, t) => a + n(t.amount), 0),
    });
  }

  return (
    <>
      <Titulo icono={<Receipt />} color="blue" sub="Toca el botón + para apuntar un gasto o un ingreso en segundos.">
        Movimientos
      </Titulo>
      <div className="glass entrar mb-4 flex items-center justify-between rounded-2xl px-2 py-1.5 text-sm">
        <Link aria-label="Mes anterior" href={`/finanzas?mes=${mesAnterior(mes)}`} className="rounded-xl p-2 transition hover:bg-hover">
          <ChevronLeft className="size-4" />
        </Link>
        <span className="font-medium first-letter:uppercase">{nombreMes(mes)}</span>
        {mes < actual ? (
          <Link aria-label="Mes siguiente" href={`/finanzas?mes=${mesDe(sumarMeses(`${mes}-01`, 1))}`} className="rounded-xl p-2 transition hover:bg-hover">
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className="size-8" />
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi i={0} icono={<ArrowDownLeft />} etiqueta="Ingresos" valor={euros(ingresos, false)} tono="ok" />
        <Kpi i={1} icono={<ArrowUpRight />} etiqueta="Gastos" valor={euros(gastos, false)} />
        <Kpi i={2} icono={<PiggyBank />} etiqueta="Ahorro" valor={euros(ahorro, false)} tono={ahorro >= 0 ? "ok" : "bad"} />
        <Kpi i={3} icono={<Scale />} etiqueta="Tasa de ahorro" valor={ingresos > 0 ? pct((100 * ahorro) / ingresos) : "—"} detalle="objetivo: ≥ 20 %" />
      </div>

      {metaIngresos && auto?.estados.get(metaIngresos.id) && <HaciaMeta meta={metaIngresos} estado={auto.estados.get(metaIngresos.id)!} />}

      {pendientes.length > 0 && (
        <Desplegable icono={<Clock />} color="yellow" titulo="Pendiente de llegar" resumen={enCamino ? `+${euros(enCamino, false)} en camino` : `${pendientes.length}`} abierto i={4}>
          <p className="mb-2 text-xs text-muted">No mueven tu saldo ni cuentan en el mes hasta que toques «Ha llegado».</p>
          <Pendientes pendientes={pendientes} cuentas={nombreCuenta} />
        </Desplegable>
      )}

      <Desplegable icono={<Receipt />} color="blue" titulo="Movimientos del mes" resumen={`${delMes.length}`} abierto i={4}>
        <ListaMovimientos movimientos={delMes} categorias={categorias} />
      </Desplegable>
      {traspasos.length > 0 && (
        <Desplegable icono={<ArrowLeftRight />} color="purple" titulo="Traspasos entre tus cuentas" resumen={`${traspasos.length}`} i={5}>
          <p className="mb-2 text-xs text-muted">Dinero que solo cambia de sitio (efectivo ↔ banco): no es ingreso ni gasto.</p>
          <ListaTraspasos traspasos={traspasos} cuentas={nombreCuenta} />
        </Desplegable>
      )}
      <Desplegable icono={<Gauge />} color="orange" titulo="Presupuesto por categoría" i={5}>
        <p className="mb-3 text-xs text-muted">Toca la cifra de cada categoría para ponerle o cambiarle el límite.</p>
        <Presupuesto filas={filas} />
      </Desplegable>
      <Desplegable icono={<ChartColumn />} color="green" titulo="Últimos 6 meses" i={6}>
        <GraficaMeses datos={meses} />
      </Desplegable>
    </>
  );
}
