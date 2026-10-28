import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GraficaMeses } from "@/components/finanzas/GraficaMeses";
import { ListaMovimientos } from "@/components/finanzas/ListaMovimientos";
import { Presupuesto } from "@/components/finanzas/Presupuesto";
import { Card, Kpi, Seccion, Titulo } from "@/components/ui/basicos";
import { getCategorias, getMovimientos } from "@/lib/datos/consultas";
import { hoy, mesAnterior, mesDe, NOMBRES_MES, nombreMes, rangoMes, sumarMeses } from "@/lib/fechas";
import { euros, pct } from "@/lib/formato";
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
  const [todos, categorias] = await Promise.all([getMovimientos(s, `${inicioGrafica}-01`, hasta), getCategorias(s)]);
  const delMes = todos.filter((m) => m.day >= desde);

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
      <Titulo emoji="💸">Movimientos</Titulo>
      <div className="mb-6 flex items-center gap-1 text-sm">
        <Link aria-label="Mes anterior" href={`/finanzas?mes=${mesAnterior(mes)}`} className="rounded p-1 hover:bg-hover">
          <ChevronLeft className="size-4" />
        </Link>
        <span className="min-w-32 text-center font-medium capitalize">{nombreMes(mes)}</span>
        {mes < actual && (
          <Link aria-label="Mes siguiente" href={`/finanzas?mes=${mesDe(sumarMeses(`${mes}-01`, 1))}`} className="rounded p-1 hover:bg-hover">
            <ChevronRight className="size-4" />
          </Link>
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi etiqueta="Ingresos" valor={euros(ingresos, false)} tono="ok" />
        <Kpi etiqueta="Gastos" valor={euros(gastos, false)} />
        <Kpi etiqueta="Ahorro" valor={euros(ahorro, false)} tono={ahorro >= 0 ? "ok" : "bad"} />
        <Kpi etiqueta="Tasa de ahorro" valor={ingresos > 0 ? pct((100 * ahorro) / ingresos) : "—"} detalle="objetivo: ≥ 20 %" />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Seccion titulo="Movimientos del mes">
            <ListaMovimientos movimientos={delMes} categorias={categorias} />
          </Seccion>
        </div>
        <div className="space-y-8 lg:col-span-2">
          <Seccion titulo="Presupuesto por categoría">
            {filas.length ? <Presupuesto filas={filas} /> : <p className="text-sm text-muted">Cuando apuntes gastos verás aquí cada categoría. Toca la cifra para ponerle límite.</p>}
          </Seccion>
          <Seccion titulo="Últimos 6 meses">
            <Card className="p-2">
              <GraficaMeses datos={meses} />
            </Card>
          </Seccion>
        </div>
      </div>
    </>
  );
}
