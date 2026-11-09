"use client";

import { Download, Printer } from "lucide-react";
import { Tarjeta, TituloBloque, botonClaro, botonNegro, descargarCSV, euros, useAhora } from "./ui";
import { cuentas, movimientosVivos, pesoFiltro, sociosFiltrados, useDatosVivos } from "./datos";
import { usePanelCtx } from "./contexto";
import { gastosMes, ingresosMes } from "@/data/panel-demo";

const grises = ["#0e0e0f", "#3a3b40", "#66676d", "#94959b", "#bfc0c5", "#dcdde0"];

function Barras({ filas, total }: { filas: { nombre: string; valor: number; nota?: string }[]; total: number }) {
  return (
    <ul className="grid gap-4">
      {filas.map((f, i) => {
        const pct = total ? (f.valor / total) * 100 : 0;
        return (
          <li key={f.nombre}>
            <p className="flex justify-between gap-3 text-[13px]">
              <span className="truncate font-semibold">{f.nombre}</span>
              <span className="shrink-0 tabular-nums">
                {euros(f.valor)} <span className="text-negro/45">· {Math.round(pct)} %</span>
              </span>
            </p>
            {f.nota && <p className="text-[12px] text-negro/50">{f.nota}</p>}
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/[0.07]">
              <div className="barra-crece h-full rounded-full" style={{ width: `${pct}%`, background: grises[Math.min(i, grises.length - 1)], animationDelay: `${i * 0.08}s` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Rosco({ filas, total }: { filas: { nombre: string; valor: number }[]; total: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const largos = filas.map((f) => (f.valor / total) * circ);
  const inicios = largos.map((_, i) => largos.slice(0, i).reduce((a, l) => a + l, 0));
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 140 140" className="size-44 shrink-0 -rotate-90" role="img" aria-label={`Reparto de ingresos: ${filas.map((f) => `${f.nombre} ${Math.round((f.valor / total) * 100)} %`).join(", ")}`}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="#0e0e0f" strokeOpacity={0.06} strokeWidth={18} />
        {filas.map((f, i) => {
          const largo = largos[i];
          return (
            <circle
              key={f.nombre}
              cx={70}
              cy={70}
              r={r}
              fill="none"
              stroke={grises[i % grises.length]}
              strokeWidth={18}
              strokeDasharray={`${Math.max(0, largo - 2)} ${circ}`}
              strokeDashoffset={-inicios[i]}
              className="animate-[aparece_0.6s_ease_both]"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <title>{`${f.nombre}: ${euros(f.valor)}`}</title>
            </circle>
          );
        })}
      </svg>
      <ul className="grid w-full gap-2">
        {filas.map((f, i) => (
          <li key={f.nombre} className="flex items-center gap-2 text-[13px]">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: grises[i % grises.length] }} aria-hidden />
            <span className="min-w-0 flex-1 truncate">{f.nombre}</span>
            <span className="font-semibold tabular-nums">{Math.round((f.valor / total) * 100)} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Informes() {
  const ahora = useAhora();
  const { pagos } = useDatosVivos();
  const { filtro, avisar, imprimir } = usePanelCtx();
  const peso = pesoFiltro(filtro);
  const c = cuentas(pagos);

  const ingresos = [...ingresosMes.map((x) => ({ nombre: x.concepto, valor: Math.round(x.importe * peso), nota: x.detalle })), ...(c.online ? [{ nombre: "Pagos online (web)", valor: c.online, nota: `${pagos.length} pagos desde la web` }] : [])].sort((a, b) => b.valor - a.valor);
  const gastos = gastosMes.map((x) => ({ nombre: x.concepto, valor: Math.round(x.importe * peso) })).sort((a, b) => b.valor - a.valor);
  const totalI = ingresos.reduce((a, x) => a + x.valor, 0);
  const totalG = gastos.reduce((a, x) => a + x.valor, 0);

  const metodos = Object.entries(
    movimientosVivos(pagos, ahora)
      .filter((m) => m.tipo === "Ingreso")
      .reduce<Record<string, number>>((a, m) => ({ ...a, [m.metodo]: (a[m.metodo] ?? 0) + m.importe }), {}),
  )
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor);
  const totalM = metodos.reduce((a, x) => a + x.valor, 0);

  const planes = Object.entries(sociosFiltrados(filtro).reduce<Record<string, { n: number; v: number }>>((a, s) => ({ ...a, [s.plan]: { n: (a[s.plan]?.n ?? 0) + 1, v: (a[s.plan]?.v ?? 0) + s.cuota } }), {}))
    .map(([nombre, x]) => ({ nombre, valor: x.v, nota: `${x.n} clientes en la muestra` }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6);
  const totalP = planes.reduce((a, x) => a + x.valor, 0);

  function exportar() {
    descargarCSV(`720gym-informe-${ahora.toISOString().slice(0, 7)}.csv`, [
      ["Bloque", "Categoría", "Importe (€)", "% del bloque"],
      ...ingresos.map((x) => ["Ingresos", x.nombre, x.valor, Math.round((x.valor / totalI) * 100)]),
      ...gastos.map((x) => ["Gastos", x.nombre, x.valor, Math.round((x.valor / totalG) * 100)]),
      ...metodos.map((x) => ["Métodos de cobro", x.nombre, x.valor, Math.round((x.valor / totalM) * 100)]),
    ]);
    avisar("Informe exportado a CSV");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-wrap gap-2 lg:col-span-2">
        <button type="button" onClick={exportar} className={botonNegro}>
          <Download className="size-4" aria-hidden /> Exportar informe (CSV)
        </button>
        <button type="button" onClick={() => imprimir({ tipo: "informe" })} className={botonClaro}>
          <Printer className="size-4" aria-hidden /> Imprimir informe del mes
        </button>
      </div>
      <Tarjeta>
        <TituloBloque accion={<span className="text-[13px] font-semibold tabular-nums">{euros(totalI)}</span>}>Ingresos por categoría</TituloBloque>
        <Rosco filas={ingresos} total={totalI} />
      </Tarjeta>
      <Tarjeta>
        <TituloBloque accion={<span className="text-[13px] font-semibold tabular-nums">{euros(totalG)}</span>}>Gastos por categoría</TituloBloque>
        <Barras filas={gastos} total={totalG} />
      </Tarjeta>
      <Tarjeta>
        <TituloBloque>Detalle de ingresos</TituloBloque>
        <Barras filas={ingresos} total={totalI} />
      </Tarjeta>
      <div className="grid gap-4">
        <Tarjeta>
          <TituloBloque>Cómo pagan</TituloBloque>
          <Barras filas={metodos} total={totalM} />
        </Tarjeta>
        <Tarjeta>
          <TituloBloque>Planes que más facturan</TituloBloque>
          <Barras filas={planes} total={totalP} />
        </Tarjeta>
      </div>
    </div>
  );
}
