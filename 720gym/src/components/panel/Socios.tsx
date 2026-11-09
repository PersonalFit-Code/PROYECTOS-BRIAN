"use client";

import { useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { Estado, Kpi, Tarjeta, botonClaro, euros } from "./ui";
import { porEntrenador, totales, type EstadoPago } from "@/data/panel-demo";
import { sociosFiltrados } from "./datos";
import { usePanelCtx } from "./contexto";
import { cn } from "@/lib/utils";

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" });
const acceso = (d: number, h: string) => (d === 0 ? `Hoy, ${h}` : d === 1 ? `Ayer, ${h}` : `Hace ${d} días`);
const recordatorio = (nombre: string, plan: string, cuota: number) =>
  `https://wa.me/?text=${encodeURIComponent(`Hola ${nombre.split(" ")[0]}, te recordamos que la cuota de ${plan} (${euros(cuota)}) se paga del 1 al 7. ¡Gracias! · 720 GYM CLUB`)}`;

export default function Socios() {
  const { filtro, abrirFicha } = usePanelCtx();
  const socios = sociosFiltrados(filtro);
  const [texto, setTexto] = useState("");
  const [plan, setPlan] = useState("Todos");
  const [estado, setEstado] = useState<EstadoPago | "Todos">("Todos");
  const planes = ["Todos", ...new Set(socios.map((s) => s.plan))];
  const lista = socios.filter(
    (s) => (!texto || s.nombre.toLowerCase().includes(texto.toLowerCase())) && (plan === "Todos" || s.plan === plan) && (estado === "Todos" || s.estado === estado),
  );
  const sinVenir = socios.filter((s) => s.ultimoAcceso >= 7).length;
  const media = socios.length ? (socios.reduce((a, s) => a + s.asistencias, 0) / socios.length).toFixed(1) : "0";

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi oscura etiqueta="Clientes activos" valor={filtro === "Todos" ? totales.sociosActivos : porEntrenador[filtro].clientes} nota={filtro === "Todos" ? "gimnasio, Pilates y bonos" : `de ${filtro}`} />
        <Kpi etiqueta="Altas este mes" valor={`+${totales.altasMes}`} nota={`${totales.bajasMes} bajas`} />
        <Kpi etiqueta="Asistencia media" valor={media} nota="visitas/mes por socio" />
        <Kpi etiqueta="Riesgo de baja" valor={sinVenir} nota="+7 días sin venir (muestra)" />
      </div>

      <Tarjeta>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="subtitular text-[20px]">
            Socios <span className="text-[14px] font-normal tracking-normal normal-case text-negro/50">· muestra de {socios.length}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <span className="sr-only">Buscar socio</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-negro/40" aria-hidden />
              <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar por nombre…" className="h-10 w-56 bg-pared pr-3 pl-9 text-[14px] outline-none ring-1 ring-black/10 focus:ring-negro" />
            </label>
            <label>
              <span className="sr-only">Plan</span>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="h-10 bg-pared px-3 text-[13px] ring-1 ring-black/10 outline-none">
                {planes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Estado de pago</span>
              <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoPago | "Todos")} className="h-10 bg-pared px-3 text-[13px] ring-1 ring-black/10 outline-none">
                {["Todos", "Al día", "Pendiente", "Impagado"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Escritorio */}
        <div className="-mx-6 hidden overflow-x-auto md:block">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/10 text-negro/50">
                <th scope="col" className="py-2 pl-6 font-semibold">Socio</th>
                <th scope="col" className="py-2 font-semibold">Plan</th>
                <th scope="col" className="py-2 font-semibold">Alta</th>
                <th scope="col" className="py-2 font-semibold">Pago</th>
                <th scope="col" className="py-2 font-semibold">Último acceso</th>
                <th scope="col" className="py-2 text-right font-semibold">Visitas/mes</th>
                <th scope="col" className="py-2 pr-6"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id} className="cursor-pointer border-b border-black/[0.05] hover:bg-pared" onClick={(e) => {
                    if (!(e.target as HTMLElement).closest("a,button")) abrirFicha(s.id);
                  }}>
                  <td className="py-2.5 pl-6">
                    <span className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center bg-negro text-[11px] font-bold text-white" aria-hidden>
                        {s.nombre.split(" ").map((p) => p[0]).join("")}
                      </span>
                      <button type="button" onClick={() => abrirFicha(s.id)} className="font-semibold underline-offset-4 hover:underline">
                        {s.nombre}
                      </button>
                    </span>
                  </td>
                  <td className="py-2.5">
                    {s.plan} <span className="text-negro/45">· {euros(s.cuota)}</span>
                  </td>
                  <td className="py-2.5 text-negro/60">{fecha(s.alta)}</td>
                  <td className="py-2.5">
                    <Estado estado={s.estado} />
                  </td>
                  <td className={cn("py-2.5", s.ultimoAcceso >= 7 ? "font-semibold" : "text-negro/60")}>{acceso(s.ultimoAcceso, s.horaAcceso)}</td>
                  <td className="py-2.5 text-right tabular-nums">{s.asistencias}</td>
                  <td className="py-2.5 pr-6 text-right">
                    {s.estado !== "Al día" && (
                      <a href={recordatorio(s.nombre, s.plan, s.cuota)} target="_blank" rel="noopener noreferrer" className={cn(botonClaro, "h-8 px-3")} aria-label={`Recordar pago a ${s.nombre}`}>
                        <MessageCircle className="size-4" aria-hidden />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Móvil */}
        <ul className="grid gap-2 md:hidden">
          {lista.map((s) => (
            <li key={s.id} className="bg-pared p-4">
              <div className="flex items-start justify-between gap-3">
                <span>
                  <button type="button" onClick={() => abrirFicha(s.id)} className="block text-left font-semibold underline underline-offset-4">
                    {s.nombre}
                  </button>
                  <span className="text-[12px] text-negro/55">
                    {s.plan} · {euros(s.cuota)}
                  </span>
                </span>
                <Estado estado={s.estado} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px] text-negro/60">
                <span>
                  {acceso(s.ultimoAcceso, s.horaAcceso)} · {s.asistencias} visitas
                </span>
                {s.estado !== "Al día" && (
                  <a href={recordatorio(s.nombre, s.plan, s.cuota)} target="_blank" rel="noopener noreferrer" className="font-semibold text-negro underline underline-offset-2">
                    Recordar pago
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
        {lista.length === 0 && <p className="py-6 text-center text-[14px] text-negro/55">Ningún socio coincide con el filtro.</p>}
      </Tarjeta>
    </div>
  );
}
