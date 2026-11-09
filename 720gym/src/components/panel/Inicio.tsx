"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, CalendarRange, Check, HandCoins, Lock, Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import Hoja from "./Hoja";
import { BarraOcupacion, BarrasMensuales, Estado, Kpi, NuevoWeb, Tarjeta, TituloBloque, botonClaro, botonNegro, diaDe, euros, hace, useAhora } from "./ui";
import { cuentas, ficha, nombreClase, ocupacion, pesoFiltro, sesionesReservables, sociosFiltrados, useDatosVivos } from "./datos";
import { cambiar, idNuevo, usePanel, type Prioridad } from "./almacen";
import { usePanelCtx } from "./contexto";
import { cajaTipo, entrenadores, porEntrenador, solicitudesSemilla, totales } from "@/data/panel-demo";
import { cn } from "@/lib/utils";
import type { Seccion } from "./Panel";

const tipoTexto = { prueba: "Clase de prueba", inscripcion: "Inscripción", entrada: "Entrada diaria" } as const;
const prioridades: Prioridad[] = ["Muy prioritaria", "Prioritaria", "Poco prioritaria"];
type Rapido = "pendientes" | "dia" | "anual" | null;

export default function Inicio({ ir }: { ir: (s: Seccion) => void }) {
  const ahora = useAhora();
  const panel = usePanel();
  const { filtro, abrirFicha } = usePanelCtx();
  const { reservas, solicitudes, pagos } = useDatosVivos();
  const [rapido, setRapido] = useState<Rapido>(null);
  const [editarObjetivo, setEditarObjetivo] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  const hoyIso = ahora.toISOString().slice(0, 10);
  const peso = pesoFiltro(filtro);
  const c = cuentas(pagos);
  const lista = sociosFiltrados(filtro);
  const fichas = lista.map((s) => ({ s, f: ficha(s, ahora, panel) }));
  const registradosMes = fichas.flatMap(({ f }) => f.registrados).filter((p) => p.fecha.slice(0, 7) === hoyIso.slice(0, 7));
  const generado = Math.round(c.ingresos * peso) + registradosMes.reduce((a, p) => a + p.importe, 0);
  const conDeuda = fichas.filter(({ f }) => f.deuda > 0);
  const deuda = conDeuda.reduce((a, { f }) => a + f.deuda, 0);
  const clientes = filtro === "Todos" ? totales.sociosActivos : porEntrenador[filtro].clientes;
  const sesMes = filtro === "Todos" ? entrenadores.reduce((a, e) => a + porEntrenador[e].sesionesMes, 0) : porEntrenador[filtro].sesionesMes;
  const sesHoy = filtro === "Todos" ? entrenadores.reduce((a, e) => a + porEntrenador[e].sesionesHoy, 0) : porEntrenador[filtro].sesionesHoy;
  const objetivo = Math.round(panel.objetivo * peso);
  const progreso = Math.min(100, (generado / objetivo) * 100);

  /* Caja del día */
  const webHoy = pagos.filter((p) => p.creada.slice(0, 10) === hoyIso);
  const registradosHoy = fichas.flatMap(({ f }) => f.registrados).filter((p) => p.fecha === hoyIso);
  const desglose: Record<string, number> = {
    Efectivo: Math.round(cajaTipo.Efectivo * peso) + registradosHoy.filter((p) => p.metodo === "Efectivo").reduce((a, p) => a + p.importe, 0),
    Tarjeta: Math.round(cajaTipo.Tarjeta * peso) + registradosHoy.filter((p) => p.metodo === "Tarjeta").reduce((a, p) => a + p.importe, 0),
    Bizum: Math.round(cajaTipo.Bizum * peso) + registradosHoy.filter((p) => p.metodo === "Bizum").reduce((a, p) => a + p.importe, 0),
    "Online (web)": filtro === "Todos" ? webHoy.reduce((a, p) => a + p.importe, 0) : 0,
  };
  const totalDia = Object.values(desglose).reduce((a, b) => a + b, 0);
  const cierreHoy = panel.cierres.find((x) => x.fecha === hoyIso);

  const hoy = diaDe(ahora);
  const clasesHoy = sesionesReservables.filter((s) => s.dia === hoy).sort((a, b) => a.hora.localeCompare(b.hora));

  function guardarObjetivo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = Number(String(new FormData(e.currentTarget).get("objetivo")).replace(/\D/g, ""));
    if (v > 0) cambiar((x) => ({ ...x, objetivo: v }));
    setEditarObjetivo(false);
  }
  function cerrarCaja(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nota = String(new FormData(e.currentTarget).get("nota") ?? "");
    cambiar((x) => ({
      ...x,
      cierres: [...x.cierres, { fecha: hoyIso, apertura: x.apertura, desglose, total: totalDia, nota }],
      apertura: x.apertura + desglose.Efectivo,
    }));
    setCerrando(false);
  }
  function anadirTarea(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const texto = String(d.get("texto") ?? "").trim();
    if (!texto) return;
    cambiar((x) => ({ ...x, tareas: [...x.tareas, { id: idNuevo(), texto, prioridad: String(d.get("prioridad")) as Prioridad, hecha: false }] }));
    e.currentTarget.reset();
  }

  const tareas = [...panel.tareas].sort((a, b) => Number(a.hecha) - Number(b.hecha) || prioridades.indexOf(a.prioridad) - prioridades.indexOf(b.prioridad));
  const ultimas = [
    ...[...solicitudes].reverse().map((s) => ({ id: s.id, nombre: s.nombre, tipo: tipoTexto[s.tipo], cuando: hace(s.creada, ahora), web: true, estado: "Nueva" })),
    ...solicitudesSemilla.map((s) => ({ id: s.id, nombre: s.nombre, tipo: tipoTexto[s.tipo], cuando: s.hace, web: false, estado: s.estado as string })),
  ].slice(0, 4);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi oscura etiqueta="Clientes activos" valor={clientes} nota="este mes" />
        <Kpi etiqueta="Sesiones del mes" valor={sesMes} nota={`${sesHoy} hoy`} />
        <Kpi etiqueta="Generado" valor={euros(generado)} nota={ahora.toLocaleDateString("es-ES", { month: "long" })} />
        <button type="button" onClick={() => setRapido("pendientes")} className="text-left">
          <Kpi etiqueta="En deuda" valor={euros(deuda)} nota={`${conDeuda.length} clientes con pagos pendientes →`} />
        </button>
      </div>

      {/* Objetivo */}
      <Tarjeta>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="etiqueta text-negro/50">Objetivo de facturación · {filtro === "Todos" ? "centro" : filtro}</p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="titular text-[44px] leading-none">{euros(generado)}</span>
              <span className="text-[15px] text-negro/55">de {euros(objetivo)}</span>
            </p>
          </div>
          {editarObjetivo ? (
            <form onSubmit={guardarObjetivo} className="flex gap-2">
              <label>
                <span className="sr-only">Objetivo mensual del centro (€)</span>
                <input name="objetivo" inputMode="numeric" defaultValue={panel.objetivo} autoFocus className="h-10 w-32 bg-pared px-3 ring-1 ring-black/10 outline-none focus:ring-negro" />
              </label>
              <button type="submit" className={botonNegro}>
                Guardar
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setEditarObjetivo(true)} className={botonClaro}>
              <Pencil className="size-4" aria-hidden /> Editar objetivo
            </button>
          )}
        </div>
        <div className="mt-4 h-3 bg-niebla" role="meter" aria-valuemin={0} aria-valuemax={objetivo} aria-valuenow={generado} aria-label="Progreso del objetivo">
          <div className="h-full bg-negro transition-[width] duration-700" style={{ width: `${progreso}%` }} />
        </div>
        <p className="mt-2 text-[12px] text-negro/55">
          {progreso >= 100 ? "¡Objetivo cumplido!" : `Faltan ${euros(objetivo - generado)} · ${Math.round(progreso)} % conseguido`}
          {filtro !== "Todos" && ` · parte de ${filtro} (${Math.round(peso * 100)} % del objetivo del centro)`}
        </p>
      </Tarjeta>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Caja diaria */}
        <Tarjeta oscura className="xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="subtitular text-[20px]">Caja de hoy</h3>
            <span className="text-[12px] text-white/55">{ahora.toLocaleDateString("es-ES", { weekday: "long", day: "numeric" })}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[13px]">
            <span className="text-white/60">Saldo de apertura (efectivo)</span>
            <span className="font-semibold tabular-nums">{euros(cierreHoy?.apertura ?? panel.apertura)}</span>
          </div>
          <ul className="divide-y divide-white/10">
            {Object.entries(cierreHoy?.desglose ?? desglose).map(([m, v]) => (
              <li key={m} className="flex items-center justify-between py-2.5 text-[14px]">
                <span className="text-white/80">{m}</span>
                <span className="font-semibold tabular-nums">{euros(v)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-baseline justify-between border-t border-white/20 pt-3">
            <span className="etiqueta text-white/55">Total cobrado</span>
            <span className="titular text-[36px] leading-none">{euros(cierreHoy?.total ?? totalDia)}</span>
          </div>
          {cierreHoy ? (
            <p className="mt-4 flex items-start gap-2 bg-white/8 p-3 text-[13px] text-white/80">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Caja cerrada. Apertura para mañana: <strong>{euros(panel.apertura)}</strong>
                {cierreHoy.nota && <span className="block text-white/55 italic">«{cierreHoy.nota}»</span>}
              </span>
            </p>
          ) : cerrando ? (
            <form onSubmit={cerrarCaja} className="mt-4 grid gap-2">
              <label>
                <span className="mb-1 block text-[12px] text-white/60">Anotación del cierre (opcional)</span>
                <input name="nota" placeholder="Ej.: 5 € de cambio en el cajón" className="h-10 w-full bg-white/10 px-3 text-[14px] text-white ring-1 ring-white/15 outline-none focus:ring-white" />
              </label>
              <button type="submit" className="inline-flex h-11 items-center justify-center bg-white text-[14px] font-semibold text-negro hover:bg-niebla">
                Confirmar cierre
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setCerrando(true)} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 bg-white text-[14px] font-semibold text-negro transition hover:bg-niebla">
              <Lock className="size-4" aria-hidden /> Cerrar caja
            </button>
          )}
        </Tarjeta>

        {/* Entrenadores */}
        <Tarjeta className="xl:col-span-2">
          <TituloBloque>Resumen por entrenadores</TituloBloque>
          <div className="-mx-5 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-black/10 text-negro/50">
                  <th scope="col" className="py-2 pl-5 font-semibold sm:pl-6">Entrenador</th>
                  <th scope="col" className="py-2 text-right font-semibold">Sesiones</th>
                  <th scope="col" className="py-2 text-right font-semibold">Clientes</th>
                  <th scope="col" className="py-2 pr-5 text-right font-semibold sm:pr-6">Generado</th>
                </tr>
              </thead>
              <tbody>
                {entrenadores.map((e) => (
                  <tr key={e} className={cn("border-b border-black/[0.05]", filtro === e && "bg-niebla")}>
                    <td className="py-3 pl-5 sm:pl-6">
                      <span className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center bg-negro text-[13px] font-bold text-white" aria-hidden>
                          {e[0]}
                        </span>
                        <span>
                          <span className="block font-semibold">{e}</span>
                          <span className="text-[12px] text-negro/50">{porEntrenador[e].rol}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {porEntrenador[e].sesionesMes} <span className="text-negro/45">· {porEntrenador[e].sesionesHoy} hoy</span>
                    </td>
                    <td className="py-3 text-right tabular-nums">{porEntrenador[e].clientes}</td>
                    <td className="py-3 pr-5 text-right font-semibold tabular-nums sm:pr-6">{euros(Math.round(c.ingresos * porEntrenador[e].peso))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {(
              [
                ["pendientes", HandCoins, "Cobros pendientes", `${conDeuda.length} clientes · ${euros(deuda)}`],
                ["dia", Receipt, "Cobros del día", euros(totalDia)],
                ["anual", CalendarRange, "Resumen anual", "Facturación mes a mes"],
              ] as const
            ).map(([id, Icono, t, sub]) => (
              <button key={id} type="button" onClick={() => setRapido(id)} className="group flex items-center gap-3 bg-pared p-4 text-left transition hover:bg-negro hover:text-white">
                <Icono className="size-5 shrink-0" aria-hidden />
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold">{t}</span>
                  <span className="text-[12px] opacity-60">{sub}</span>
                </span>
                <ArrowUpRight className="size-4 opacity-40 transition group-hover:opacity-100" aria-hidden />
              </button>
            ))}
          </div>
        </Tarjeta>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Tareas */}
        <Tarjeta>
          <TituloBloque>Tareas pendientes</TituloBloque>
          <ul className="divide-y divide-black/[0.06]">
            {tareas.map((t) => (
              <li key={t.id} className="flex items-start gap-3 py-3">
                <button
                  type="button"
                  onClick={() => cambiar((x) => ({ ...x, tareas: x.tareas.map((y) => (y.id === t.id ? { ...y, hecha: !y.hecha } : y)) }))}
                  className={cn("mt-0.5 grid size-5 shrink-0 place-items-center ring-1", t.hecha ? "bg-negro text-white ring-negro" : "ring-black/30 hover:ring-negro")}
                  aria-label={t.hecha ? `Marcar como pendiente: ${t.texto}` : `Marcar como hecha: ${t.texto}`}
                >
                  {t.hecha && <Check className="size-3.5" />}
                </button>
                <span className="flex-1">
                  <span className={cn("block text-[14px]", t.hecha && "text-negro/40 line-through")}>{t.texto}</span>
                  <span
                    className={cn(
                      "mt-1 inline-block px-1.5 py-0.5 text-[10px] font-semibold",
                      t.prioridad === "Muy prioritaria" ? "bg-negro text-white" : t.prioridad === "Prioritaria" ? "bg-[#dfe0e3] text-negro" : "text-negro/55 ring-1 ring-black/15",
                    )}
                  >
                    {t.prioridad}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => cambiar((x) => ({ ...x, tareas: x.tareas.filter((y) => y.id !== t.id) }))}
                  className="grid size-8 place-items-center text-negro/35 hover:text-negro"
                  aria-label={`Borrar tarea: ${t.texto}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={anadirTarea} className="mt-3 grid gap-2">
            <label>
              <span className="sr-only">Nueva tarea</span>
              <input name="texto" placeholder="Nueva tarea…" className="h-10 w-full bg-pared px-3 text-[14px] ring-1 ring-black/10 outline-none focus:ring-negro" />
            </label>
            <div className="flex gap-2">
              <label className="flex-1">
                <span className="sr-only">Prioridad</span>
                <select name="prioridad" defaultValue="Prioritaria" className="h-10 w-full bg-pared px-2 text-[13px] ring-1 ring-black/10 outline-none">
                  {prioridades.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className={botonNegro}>
                <Plus className="size-4" aria-hidden /> Añadir tarea
              </button>
            </div>
          </form>
        </Tarjeta>

        {/* Clases de hoy */}
        <Tarjeta>
          <TituloBloque
            accion={
              <button type="button" onClick={() => ir("calendario")} className="flex items-center gap-1 text-[13px] font-semibold hover:underline">
                Calendario <ArrowUpRight className="size-4" aria-hidden />
              </button>
            }
          >
            Clases de hoy
          </TituloBloque>
          {clasesHoy.length === 0 ? (
            <p className="text-[14px] text-negro/60">Hoy no hay clases dirigidas. Sala abierta de 08:00 a 22:30.</p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {clasesHoy.map((s) => {
                const o = ocupacion(s, reservas);
                return (
                  <li key={`${s.hora}-${s.clase}`} className="py-3">
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className="text-[14px] font-semibold">
                        <span className="subtitular mr-2 text-[16px] tabular-nums">{s.hora}</span>
                        {nombreClase(s.clase)}
                      </span>
                      {o.web > 0 && <span className="text-[11px] font-semibold">+{o.web} web</span>}
                    </div>
                    <BarraOcupacion ocupadas={o.ocupadas} total={o.total} fina />
                  </li>
                );
              })}
            </ul>
          )}
        </Tarjeta>

        {/* Últimas solicitudes */}
        <Tarjeta>
          <TituloBloque
            accion={
              <button type="button" onClick={() => ir("solicitudes")} className="flex items-center gap-1 text-[13px] font-semibold hover:underline">
                Todas <ArrowUpRight className="size-4" aria-hidden />
              </button>
            }
          >
            Desde la web
          </TituloBloque>
          <ul className="divide-y divide-black/[0.06]">
            {[...pagos].reverse().slice(0, 3).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  <span className="block text-[14px] font-semibold">{p.concepto}</span>
                  <span className="text-[12px] text-negro/55">
                    Pago online · {p.nombre} · {hace(p.creada, ahora)}
                  </span>
                </span>
                <span className="subtitular text-[18px] tabular-nums">{euros(p.importe)}</span>
              </li>
            ))}
            {ultimas.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  <span className="block text-[14px] font-semibold">{s.nombre}</span>
                  <span className="text-[12px] text-negro/55">
                    {s.tipo} · {s.cuando}
                  </span>
                </span>
                {s.web ? <NuevoWeb /> : <Estado estado={s.estado} />}
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>

      {rapido === "pendientes" && (
        <Hoja titulo="Cobros pendientes" subtitulo={`${conDeuda.length} clientes · ${euros(deuda)}${filtro !== "Todos" ? ` · ${filtro}` : ""}`} onCerrar={() => setRapido(null)}>
          {conDeuda.length === 0 ? (
            <p className="text-[14px] text-negro/60">Nadie debe nada. 👌</p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {conDeuda.map(({ s, f }) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setRapido(null);
                      abrirFicha(s.id);
                    }}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-pared"
                  >
                    <span>
                      <span className="block text-[14px] font-semibold">{s.nombre}</span>
                      <span className="text-[12px] text-negro/55">
                        {s.plan} · {f.entrenador}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <Estado estado={s.estado} />
                      <span className="subtitular text-[20px] tabular-nums">{euros(f.deuda)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Hoja>
      )}
      {rapido === "dia" && (
        <Hoja titulo="Cobros del día" subtitulo={ahora.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} onCerrar={() => setRapido(null)}>
          <ul className="divide-y divide-black/[0.06]">
            {Object.entries(desglose).map(([m, v]) => (
              <li key={m} className="flex justify-between py-3 text-[14px]">
                <span>{m}</span>
                <span className="font-semibold tabular-nums">{euros(v)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-baseline justify-between border-t border-negro pt-3">
            <span className="etiqueta">Total</span>
            <span className="titular text-[36px]">{euros(totalDia)}</span>
          </p>
          {[...webHoy, ...registradosHoy].length > 0 && (
            <>
              <h3 className="subtitular mt-6 text-[18px]">Detalle</h3>
              <ul className="mt-2 divide-y divide-black/[0.06] text-[13px]">
                {webHoy.map((p) => (
                  <li key={p.id} className="flex justify-between py-2.5">
                    <span>
                      {p.concepto} · {p.nombre} <NuevoWeb />
                    </span>
                    <span className="font-semibold">{euros(p.importe)}</span>
                  </li>
                ))}
                {registradosHoy.map((p) => (
                  <li key={p.id} className="flex justify-between py-2.5">
                    <span>
                      {p.concepto} · {p.metodo}
                    </span>
                    <span className="font-semibold">{euros(p.importe)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-6 text-[12px] text-negro/50">Las domiciliaciones de cuotas se cobran del 1 al 7 y no pasan por la caja.</p>
        </Hoja>
      )}
      {rapido === "anual" && (
        <Hoja ancha titulo="Resumen anual" subtitulo="Facturación mes a mes · últimos 12 meses" onCerrar={() => setRapido(null)}>
          <BarrasMensuales datos={c.serie.map((m) => ({ ...m, ingresos: Math.round(m.ingresos * peso), gastos: Math.round(m.gastos * peso) }))} />
          <table className="mt-6 w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/10 text-negro/50">
                <th scope="col" className="py-2 font-semibold">Mes</th>
                <th scope="col" className="py-2 text-right font-semibold">Ingresos</th>
                <th scope="col" className="py-2 text-right font-semibold">Gastos</th>
                <th scope="col" className="py-2 text-right font-semibold">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {c.serie.map((m) => (
                <tr key={m.mes} className="border-b border-black/[0.05]">
                  <td className="py-2">{m.mes}</td>
                  <td className="py-2 text-right tabular-nums">{euros(Math.round(m.ingresos * peso))}</td>
                  <td className="py-2 text-right tabular-nums text-negro/60">{euros(Math.round(m.gastos * peso))}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{euros(Math.round((m.ingresos - m.gastos) * peso))}</td>
                </tr>
              ))}
              <tr>
                <td className="py-3 font-semibold">Total</td>
                <td className="py-3 text-right font-semibold tabular-nums">{euros(Math.round(c.serie.reduce((a, m) => a + m.ingresos, 0) * peso))}</td>
                <td className="py-3 text-right tabular-nums text-negro/60">{euros(Math.round(c.serie.reduce((a, m) => a + m.gastos, 0) * peso))}</td>
                <td className="py-3 text-right font-semibold tabular-nums">{euros(Math.round(c.serie.reduce((a, m) => a + m.ingresos - m.gastos, 0) * peso))}</td>
              </tr>
            </tbody>
          </table>
        </Hoja>
      )}
    </div>
  );
}

