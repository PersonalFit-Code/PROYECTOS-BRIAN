"use client";

import { useDemo, type Conversacion, type Pago, type Reserva, type Solicitud } from "@/lib/demo";
import { sesiones, clasesHorario, type Sesion } from "@/data/horario";
import { capacidad, claveSesion, esReservable, ocupacionBase } from "@/data/plazas";
import { entrenadorDe, fichaBase, gastosMes, historico, ingresosMes, porEntrenador, socios, type SocioDemo } from "@/data/panel-demo";
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
