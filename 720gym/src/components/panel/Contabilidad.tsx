"use client";

import { useMemo, useState } from "react";
import { Download, MessageCircle, Search } from "lucide-react";
import { BarrasMensuales, Estado, Kpi, NuevoWeb, Tarjeta, TituloBloque, botonClaro, botonNegro, descargarCSV, euros, useAhora } from "./ui";
import { cuentas, useDatosVivos } from "./datos";
import { gastosMes, ingresosMes, movimientos, socios } from "@/data/panel-demo";
import { cn } from "@/lib/utils";

type Filtro = "Todos" | "Ingreso" | "Gasto";

export default function Contabilidad() {
  const ahora = useAhora();
  const { pagos } = useDatosVivos();
  const c = cuentas(pagos);
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [texto, setTexto] = useState("");

  const mesNombre = ahora.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const conceptos = [...ingresosMes, ...(c.online ? [{ concepto: "Pagos online (web)", importe: c.online, detalle: `${pagos.length} pago(s) desde /alta` }] : [])];
  const maxConcepto = Math.max(...conceptos.map((x) => x.importe));
  const maxGasto = Math.max(...gastosMes.map((x) => x.importe));

  /* IVA del trimestre: estimación con el 21 % sobre ingresos y un soportado aproximado del 40 % de gastos no salariales. */
  const trimestreIngresos = c.serie.slice(-2).reduce((a, m) => a + m.ingresos, 0) + c.ingresos * 0.3;
  const repercutido = (trimestreIngresos / 1.21) * 0.21;
  const soportado = ((gastosMes.filter((g) => !g.concepto.startsWith("Nóminas")).reduce((a, g) => a + g.importe, 0) * 2.3) / 1.21) * 0.21;

  const lista = useMemo(() => {
    const vivos = pagos.map((p) => ({
      id: p.id,
      dia: new Date(p.creada).getDate(),
      concepto: `${p.concepto} · ${p.nombre}`,
      categoria: "Pagos online (web)",
      tipo: "Ingreso" as const,
      importe: p.importe,
      metodo: p.metodo,
      web: true,
    }));
    return [...vivos.reverse(), ...movimientos.map((m) => ({ ...m, web: false }))].filter(
      (m) => (filtro === "Todos" || m.tipo === filtro) && (!texto || `${m.concepto} ${m.categoria} ${m.metodo}`.toLowerCase().includes(texto.toLowerCase())),
    );
  }, [pagos, filtro, texto]);

  const cobros = {
    cobrado: socios.filter((s) => s.estado === "Al día"),
    pendiente: socios.filter((s) => s.estado === "Pendiente"),
    impagado: socios.filter((s) => s.estado === "Impagado"),
  };
  const enVentana = ahora.getDate() <= 7;

  function exportar() {
    descargarCSV(`720gym-movimientos-${ahora.toISOString().slice(0, 7)}.csv`, [
      ["Día", "Concepto", "Categoría", "Tipo", "Importe (€)", "Método"],
      ...lista.map((m) => [m.dia, m.concepto, m.categoria, m.tipo, (m.tipo === "Gasto" ? -m.importe : m.importe).toFixed(2).replace(".", ","), m.metodo]),
    ]);
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi oscura etiqueta={`Ingresos · ${mesNombre}`} valor={euros(c.ingresos)} nota={c.online ? `incluye ${euros(c.online)} online` : "cuotas, bonos y servicios"} />
        <Kpi etiqueta="Gastos" valor={euros(c.gastos)} nota="6 partidas" />
        <Kpi etiqueta="Beneficio" valor={euros(c.beneficio)} nota={`margen ${c.margen.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`} />
        <Kpi etiqueta="IVA trimestre (estim.)" valor={euros(Math.round(repercutido - soportado))} nota="a liquidar · modelo 303" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Tarjeta>
          <TituloBloque>Ingresos por concepto</TituloBloque>
          <ul className="space-y-4">
            {conceptos.map((x) => (
              <li key={x.concepto}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-semibold">
                    {x.concepto} {x.concepto.startsWith("Pagos online") && <NuevoWeb />}
                  </span>
                  <span className="subtitular text-[20px] tabular-nums">{euros(x.importe)}</span>
                </div>
                <div className="mt-1.5 h-2 bg-niebla">
                  <div className="h-full bg-negro" style={{ width: `${(x.importe / maxConcepto) * 100}%` }} />
                </div>
                <p className="mt-1 text-[12px] text-negro/50">{x.detalle}</p>
              </li>
            ))}
          </ul>
        </Tarjeta>
        <Tarjeta>
          <TituloBloque>Gastos por partida</TituloBloque>
          <ul className="space-y-4">
            {gastosMes.map((x) => (
              <li key={x.concepto}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-semibold">{x.concepto}</span>
                  <span className="subtitular text-[20px] tabular-nums">{euros(x.importe)}</span>
                </div>
                <div className="mt-1.5 h-2 bg-niebla">
                  <div className="h-full bg-[#8c8c90]" style={{ width: `${(x.importe / maxGasto) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-px bg-black/[0.06] text-[13px]">
            <div className="bg-white py-3 pr-3">
              <p className="text-negro/55">IVA repercutido (21 %)</p>
              <p className="subtitular text-[20px]">{euros(Math.round(repercutido))}</p>
            </div>
            <div className="bg-white py-3 pl-3">
              <p className="text-negro/55">IVA soportado</p>
              <p className="subtitular text-[20px]">{euros(Math.round(soportado))}</p>
            </div>
          </div>
        </Tarjeta>
      </div>

      <Tarjeta>
        <TituloBloque>Ingresos y gastos · 12 meses</TituloBloque>
        <BarrasMensuales datos={c.serie} />
      </Tarjeta>

      <Tarjeta>
        <TituloBloque>
          Cobros del mes <span className="ml-2 align-middle text-[12px] font-normal tracking-normal normal-case text-negro/55">{enVentana ? "Ventana de cobro abierta (del 1 al 7)" : "Ventana de cobro cerrada (del 1 al 7)"}</span>
        </TituloBloque>
        <div className="grid grid-cols-3 gap-px bg-black/[0.06]">
          {(
            [
              ["Cobrado", cobros.cobrado],
              ["Pendiente", cobros.pendiente],
              ["Impagado", cobros.impagado],
            ] as const
          ).map(([nombre, lista]) => (
            <div key={nombre} className="bg-white p-4">
              <Estado estado={nombre} />
              <p className="titular mt-3 text-[36px] leading-none">{lista.length}</p>
              <p className="mt-1 text-[12px] text-negro/55">{euros(lista.reduce((a, s) => a + s.cuota, 0))}</p>
            </div>
          ))}
        </div>
        <ul className="mt-4 divide-y divide-black/[0.06]">
          {[...cobros.impagado, ...cobros.pendiente].map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span>
                <span className="block text-[14px] font-semibold">{s.nombre}</span>
                <span className="text-[12px] text-negro/55">
                  {s.plan} · {euros(s.cuota)}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Estado estado={s.estado} />
                <a
                  /* Socios ficticios: el enlace abre WhatsApp sin número para elegir contacto. */
                  href={`https://wa.me/?text=${encodeURIComponent(`Hola ${s.nombre.split(" ")[0]}, te recordamos que la cuota de ${s.plan} (${euros(s.cuota)}) se paga del 1 al 7. Si ya la has pagado, ignora este mensaje. ¡Gracias! · 720 GYM CLUB`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={botonClaro}
                >
                  <MessageCircle className="size-4" aria-hidden /> Recordar
                </a>
              </span>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="subtitular text-[20px]">Movimientos</h3>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Buscar movimiento</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-negro/40" aria-hidden />
              <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar…" className="h-10 w-48 bg-pared pr-3 pl-9 text-[14px] outline-none ring-1 ring-black/10 focus:ring-negro" />
            </label>
            <div className="flex" role="group" aria-label="Filtrar por tipo">
              {(["Todos", "Ingreso", "Gasto"] as Filtro[]).map((f) => (
                <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)} className={cn("h-10 px-3 text-[13px] font-semibold", filtro === f ? "bg-negro text-white" : "bg-pared text-negro/70")}>
                  {f === "Todos" ? "Todos" : `${f}s`}
                </button>
              ))}
            </div>
            <button type="button" onClick={exportar} className={botonNegro}>
              <Download className="size-4" aria-hidden /> Exportar CSV
            </button>
          </div>
        </div>
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/10 text-negro/50">
                <th scope="col" className="py-2 pl-5 font-semibold sm:pl-6">Día</th>
                <th scope="col" className="py-2 font-semibold">Concepto</th>
                <th scope="col" className="py-2 font-semibold">Categoría</th>
                <th scope="col" className="py-2 font-semibold">Método</th>
                <th scope="col" className="py-2 pr-5 text-right font-semibold sm:pr-6">Importe</th>
              </tr>
            </thead>
            <tbody>
              {lista.slice(0, 40).map((m) => (
                <tr key={m.id} className={cn("border-b border-black/[0.05]", m.web && "bg-niebla")}>
                  <td className="py-2.5 pl-5 tabular-nums sm:pl-6">{String(m.dia).padStart(2, "0")}</td>
                  <td className="py-2.5">
                    <span className="font-medium">{m.concepto}</span> {m.web && <NuevoWeb />}
                  </td>
                  <td className="py-2.5 text-negro/60">{m.categoria}</td>
                  <td className="py-2.5 text-negro/60">{m.metodo}</td>
                  <td className={cn("py-2.5 pr-5 text-right font-semibold tabular-nums sm:pr-6", m.tipo === "Gasto" && "text-negro/55")}>
                    {m.tipo === "Gasto" ? "−" : "+"}
                    {euros(m.importe)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lista.length > 40 && <p className="mt-3 text-[12px] text-negro/50">Mostrando 40 de {lista.length}. El CSV incluye todos.</p>}
      </Tarjeta>
    </div>
  );
}
