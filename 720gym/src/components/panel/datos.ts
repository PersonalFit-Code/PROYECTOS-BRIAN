"use client";

import { useDemo, type Conversacion, type Pago, type Reserva, type Solicitud } from "@/lib/demo";
import { sesiones, clasesHorario, type Sesion } from "@/data/horario";
import { capacidad, claveSesion, esReservable, ocupacionBase } from "@/data/plazas";
import { entrenadorDe, fichaBase, gastosMes, historico, ingresosMes, movimientos, porEntrenador, socios, type SocioDemo } from "@/data/panel-demo";
import type { EstadoPanel } from "./almacen";
import type { Filtro } from "./contexto";

/** Todo lo que viene de la web en vivo, en un solo sitio. */
export function useDatosVivos() {
  const reservas = useDemo<Reserva>("reservas");
  const solicitudes = useDemo<Solicitud>("solicitudes");
  const chats = useDemo<Conversacion>("chats");
  const pagos = useDemo<Pago>("pagos");
  return { reservas, solicitudes, chats, pagos };
}

export const nombreClase = (id: string) => clasesHorario.find((c) => c.id === id)?.nombre ?? id;

export function ocupacion(s: Sesion, reservas: Reserva[]) {
  const total = capacidad[s.clase] ?? 0;
  const web = reservas.filter((r) => r.clave === claveSesion(s)).length;
  return { total, ocupadas: Math.min(total, ocupacionBase(s) + web), web };
}

export const sesionesReservables = sesiones.filter((s) => esReservable(s.clase));

export function ocupacionMedia(reservas: Reserva[]) {
  let o = 0;
  let t = 0;
  for (const s of sesionesReservables) {
    const x = ocupacion(s, reservas);
    o += x.ocupadas;
    t += x.total;
  }
  return t ? Math.round((o / t) * 100) : 0;
}

export function cuentas(pagos: Pago[]) {
  const online = pagos.reduce((a, p) => a + p.importe, 0);
  const ingresos = ingresosMes.reduce((a, i) => a + i.importe, 0) + online;
  const gastos = gastosMes.reduce((a, g) => a + g.importe, 0);
  const serie = historico.map((h, i) => (i === historico.length - 1 ? { ...h, ingresos: h.ingresos + online } : h));
  return { online, ingresos, gastos, beneficio: ingresos - gastos, margen: ingresos ? ((ingresos - gastos) / ingresos) * 100 : 0, serie };
}

/** Ficha completa de un socio: la de partida + lo que la gerencia ha registrado en el panel. */
export function ficha(s: SocioDemo, hoy: Date, panel: EstadoPanel) {
  const i = socios.findIndex((x) => x.id === s.id);
  const base = fichaBase(s, i, hoy);
  const extra = panel.pagos[s.id] ?? [];
  const renov = panel.renovaciones[s.id] ?? 0;
  const pagado = extra.reduce((a, p) => a + p.importe, 0);
  const cargo = base.deuda + renov * (base.bono?.precio ?? 0);
  const bono = base.bono ? { ...base.bono, sesiones: base.bono.sesiones + renov * base.bono.sesiones } : undefined;
  return {
    ...base,
    bono,
    deuda: Math.max(0, cargo - pagado),
    pagos: [...extra, ...base.pagos].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    registrados: extra,
  };
}

export const sociosFiltrados = (filtro: Filtro) => socios.filter((s, i) => filtro === "Todos" || entrenadorDe(s.plan, i) === filtro);

export const pesoFiltro = (filtro: Filtro) => (filtro === "Todos" ? 1 : porEntrenador[filtro].peso);

/* ── Movimientos y flujo de caja (vista «Resumen», «Movimientos» e «Informes») ── */

export interface MovimientoVivo {
  id: string;
  fecha: Date;
  concepto: string;
  categoria: string;
  tipo: "Ingreso" | "Gasto";
  importe: number;
  metodo: string;
  web?: boolean;
}

/** Movimientos del mes en curso: los de partida + los pagos hechos en la web (marcados «web»). */
export function movimientosVivos(pagos: Pago[], hoy: Date): MovimientoVivo[] {
  const a = hoy.getFullYear();
  const m = hoy.getMonth();
  const base: MovimientoVivo[] = movimientos.map((x) => ({ ...x, fecha: new Date(a, m, x.dia, 9 + (x.dia % 9), (x.importe * 7) % 60) }));
  const web: MovimientoVivo[] = pagos.map((p) => ({
    id: p.id,
    fecha: new Date(p.creada),
    concepto: `${p.concepto} · ${p.nombre}`,
    categoria: "Pagos online (web)",
    tipo: "Ingreso",
    importe: p.importe,
    metodo: p.metodo,
    web: true,
  }));
  return [...web, ...base].sort((x, y) => y.fecha.getTime() - x.fecha.getTime());
}

export type Periodo = "semana" | "mes" | "año";
export interface PuntoFlujo {
  etiqueta: string;
  ingresos: number;
  gastos: number;
}

const diasCortos = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const mesesCortos = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Series del flujo de caja para semana (7 días), mes (día a día) y año (12 meses). */
export function seriesFlujo(pagos: Pago[], hoy: Date, peso: number): Record<Periodo, PuntoFlujo[]> {
  const lista = movimientosVivos(pagos, hoy);
  /* Los movimientos de partida son una muestra: se escalan para que el mes cuadre con la contabilidad. */
  const base = lista.filter((x) => !x.web);
  const total = (t: MovimientoVivo["tipo"]) => base.filter((x) => x.tipo === t).reduce((a, x) => a + x.importe, 0) || 1;
  const factor = { Ingreso: ingresosMes.reduce((a, x) => a + x.importe, 0) / total("Ingreso"), Gasto: gastosMes.reduce((a, x) => a + x.importe, 0) / total("Gasto") };
  const hoyDia = Math.max(7, hoy.getDate());
  const dias: PuntoFlujo[] = Array.from({ length: hoyDia }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), i + 1);
    const delDia = lista.filter((x) => x.fecha.getMonth() === d.getMonth() && x.fecha.getDate() === i + 1);
    const suma = (t: MovimientoVivo["tipo"]) => Math.round(delDia.filter((x) => x.tipo === t).reduce((a, x) => a + x.importe * (x.web ? 1 : factor[t] * peso), 0));
    return { etiqueta: `${diasCortos[d.getDay()]} ${i + 1}`, ingresos: suma("Ingreso"), gastos: suma("Gasto") };
  });
  const año = cuentas(pagos).serie.map((h) => ({ etiqueta: h.mes, ingresos: Math.round(h.ingresos * peso), gastos: Math.round(h.gastos * peso) }));
  return {
    semana: dias.slice(-7),
    mes: dias.map((p, i) => ({ ...p, etiqueta: `${i + 1} ${mesesCortos[hoy.getMonth()]}` })),
    año,
  };
}
