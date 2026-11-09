"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Download, Search, X } from "lucide-react";
import { Tarjeta, botonNegro, descargarCSV, euros, useAhora } from "./ui";
import { movimientosVivos, useDatosVivos } from "./datos";
import { usePanelCtx } from "./contexto";
import { Segmento, fechaCorta } from "./Resumen";
import { cn } from "@/lib/utils";

type Tipo = "todos" | "Ingreso" | "Gasto";

export default function Movimientos() {
  const ahora = useAhora();
  const { pagos } = useDatosVivos();
  const { avisar } = usePanelCtx();
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<Tipo>("todos");
  const [categoria, setCategoria] = useState("");

  const todos = useMemo(() => movimientosVivos(pagos, ahora), [pagos, ahora]);
  const categorias = Array.from(new Set(todos.map((m) => m.categoria))).sort();
  const lista = todos.filter(
    (m) =>
      (tipo === "todos" || m.tipo === tipo) &&
      (!categoria || m.categoria === categoria) &&
      `${m.concepto} ${m.categoria} ${m.metodo}`.toLowerCase().includes(texto.trim().toLowerCase()),
  );
  const entra = lista.filter((m) => m.tipo === "Ingreso").reduce((a, m) => a + m.importe, 0);
  const sale = lista.filter((m) => m.tipo === "Gasto").reduce((a, m) => a + m.importe, 0);

  function exportar() {
    descargarCSV(`720gym-movimientos-${ahora.toISOString().slice(0, 10)}.csv`, [
      ["Fecha", "Concepto", "Categoría", "Tipo", "Método", "Importe (€)"],
      ...lista.map((m) => [m.fecha.toLocaleDateString("es-ES"), m.concepto, m.categoria, m.tipo, m.metodo, m.tipo === "Gasto" ? -m.importe : m.importe]),
    ]);
    avisar(`${lista.length} movimientos exportados a CSV`);
  }

  return (
    <div className="grid gap-4">
      <Tarjeta className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
        <label className="relative flex items-center">
          <span className="sr-only">Buscar movimientos</span>
          <Search className="pointer-events-none absolute left-3.5 size-4 text-negro/45" aria-hidden />
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por nombre, plan, categoría o método"
            className="h-11 w-full rounded-full bg-white/80 pr-10 pl-10 text-[14px] ring-1 ring-black/10 transition outline-none focus:bg-white focus:ring-2 focus:ring-negro"
          />
          {texto && (
            <button type="button" onClick={() => setTexto("")} className="absolute right-3 grid size-6 place-items-center rounded-full bg-black/[0.07]" aria-label="Borrar búsqueda">
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </label>
        <Segmento
          etiqueta="Tipo de movimiento"
          valor={tipo}
          onCambio={setTipo}
          opciones={[
            { id: "todos", nombre: "Todos" },
            { id: "Ingreso", nombre: "Ingresos" },
            { id: "Gasto", nombre: "Gastos" },
          ]}
        />
        <label>
          <span className="sr-only">Categoría</span>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="h-10 w-full rounded-full bg-white/80 px-4 text-[13px] font-semibold ring-1 ring-black/10 outline-none focus:ring-negro">
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={exportar} className={botonNegro}>
          <Download className="size-4" aria-hidden /> Exportar CSV
        </button>
      </Tarjeta>

      <div className="grid grid-cols-3 gap-3">
        {[
          { n: "Entra", v: entra },
          { n: "Sale", v: sale },
          { n: "Neto", v: entra - sale },
        ].map((d, i) => (
          <Tarjeta key={d.n} oscura={i === 2} className="p-4 sm:p-5">
            <p className={cn("text-[12px] font-semibold", i === 2 ? "text-white/60" : "text-negro/55")}>{d.n}</p>
            <p className="titular mt-1 text-[24px] leading-none tabular-nums sm:text-[34px]">{euros(d.v)}</p>
          </Tarjeta>
        ))}
      </div>

      <Tarjeta className="p-2 sm:p-3">
        <p className="px-3 pt-2 pb-3 text-[12px] text-negro/55" aria-live="polite">
          {lista.length} de {todos.length} movimientos de este mes
        </p>
        {lista.length === 0 ? (
          <p className="px-3 py-10 text-center text-[14px] text-negro/55">Nada coincide con «{texto}». Prueba con otra palabra.</p>
        ) : (
          <ul className="grid">
            {lista.map((m) => (
              <li key={m.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-black/[0.04] sm:grid-cols-[auto_1.6fr_1fr_0.8fr_auto]">
                <span className={cn("grid size-9 place-items-center rounded-full", m.tipo === "Ingreso" ? "bg-negro text-white" : "bg-black/[0.07]")}>
                  {m.tipo === "Ingreso" ? <ArrowDownLeft className="size-4" aria-hidden /> : <ArrowUpRight className="size-4" aria-hidden />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">
                    {m.concepto}
                    {m.web && <span className="ml-1.5 rounded-full bg-negro px-1.5 py-px align-middle text-[10px] text-white">web</span>}
                  </p>
                  <p className="truncate text-[12px] text-negro/50 sm:hidden">
                    {m.categoria} · {fechaCorta(m.fecha)}
                  </p>
                </div>
                <p className="hidden truncate text-[12px] text-negro/60 sm:block">{m.categoria}</p>
                <p className="hidden text-[12px] text-negro/60 sm:block">
                  {fechaCorta(m.fecha)} · {m.metodo}
                </p>
                <p className={cn("text-right text-[14px] font-semibold tabular-nums", m.tipo === "Gasto" && "text-negro/55")}>
                  {m.tipo === "Ingreso" ? "+" : "−"}
                  {euros(m.importe)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
