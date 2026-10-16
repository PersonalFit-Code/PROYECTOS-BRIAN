/**
 * Analítica del panel: cuentas puras sobre filas ya leídas de la base de datos.
 *
 * Puro a propósito (como `lib/booking`): entra lo que hay en la agenda y en los cobros, sale lo que
 * pinta la página. Así cada número que Andrea ve en «Analítica» está cubierto por un test, y una
 * fórmula se cambia en un sitio. Todo el dinero en céntimos enteros; las fechas, días civiles del
 * salón ("YYYY-MM-DD") convertidos con la zona en los bordes.
 *
 * Qué es cada cifra (lo mismo que dice la ayuda de la página):
 * - Facturado: cobros de citas + ventas de bonos − devoluciones, SIN propinas (las propinas son de
 *   quien atiende y se enseñan aparte). Es registro de gestión, no contabilidad fiscal.
 * - Cobrado con bono: parte de los cobros de citas pagada con un bono ya vendido antes. Se excluye
 *   de «Facturado» para no contar dos veces el mismo dinero (se contó al vender el bono).
 * - Ocupación: minutos con cita (hechas, confirmadas y faltas: la hora estaba cogida) / minutos
 *   abiertos según el horario de cada profesional menos sus ausencias y los cierres del salón.
 */

import { descomponerFechaLocal, desplazarFechaLocal, diaSemanaIso, enZona, fechaLocal, instanteEnZona, minutosDeHhMm } from "../booking";
import type { BookingStatus, PaymentKind, PaymentMethod } from "../supabase/types";

export interface CitaAnalitica {
  inicio: string;
  fin: string;
  estado: BookingStatus;
  staffId: string;
  clientaId: string | null;
  servicios: { nombre: string; precioCents: number }[];
}

export interface PagoAnalitica {
  fecha: string;
  tipo: PaymentKind;
  metodo: PaymentMethod;
  importeCents: number;
  propinaCents: number;
  /** profesional de la cita (null en ventas de bonos) */
  staffId: string | null;
}

export interface FranjaAnalitica {
  staffId: string;
  dia: number;
  desde: string;
  hasta: string;
}

export interface AusenciaAnalitica {
  staffId: string | null;
  inicio: string;
  fin: string;
}

export interface Periodo {
  /** primer día incluido */
  desde: string;
  /** días que abarca */
  dias: number;
}

export interface Entrada {
  periodo: Periodo;
  zona: string;
  citas: CitaAnalitica[];
  pagos: PagoAnalitica[];
  franjas: FranjaAnalitica[];
  ausencias: AusenciaAnalitica[];
  staff: { id: string; nombre: string }[];
}

const MIN = 60_000;

/** [inicio, fin) del periodo en instantes. */
export function limites(p: Periodo, zona: string): { desde: Date; hasta: Date } {
  const a = descomponerFechaLocal(p.desde);
  const b = descomponerFechaLocal(desplazarFechaLocal(p.desde, p.dias));
  return { desde: instanteEnZona(a.anio, a.mes, a.dia, 0, 0, zona), hasta: instanteEnZona(b.anio, b.mes, b.dia, 0, 0, zona) };
}

/** El periodo inmediatamente anterior, de la misma longitud (para los deltas). */
export function periodoAnterior(p: Periodo): Periodo {
  return { desde: desplazarFechaLocal(p.desde, -p.dias), dias: p.dias };
}

function solape(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

/** Minutos abiertos de una profesional en el periodo (horario − ausencias suyas y del salón). */
export function capacidadMinutos(e: Pick<Entrada, "periodo" | "zona" | "franjas" | "ausencias">, staffId: string): number {
  let total = 0;
  const ausencias = e.ausencias
    .filter((a) => a.staffId === null || a.staffId === staffId)
    .map((a) => [new Date(a.inicio).getTime(), new Date(a.fin).getTime()] as const);
  for (let i = 0; i < e.periodo.dias; i++) {
    const fecha = desplazarFechaLocal(e.periodo.desde, i);
    const dia = diaSemanaIso(fecha);
    const { anio, mes, dia: d } = descomponerFechaLocal(fecha);
    for (const f of e.franjas) {
      if (f.staffId !== staffId || f.dia !== dia) continue;
      const m0 = minutosDeHhMm(f.desde);
      const m1 = minutosDeHhMm(f.hasta);
      const t0 = instanteEnZona(anio, mes, d, Math.floor(m0 / 60), m0 % 60, e.zona).getTime();
      const t1 = instanteEnZona(anio, mes, d, Math.floor(m1 / 60), m1 % 60, e.zona).getTime();
      // Las ausencias pueden solaparse entre sí (vacaciones + festivo): se recorta sobre lo que
      // queda abierto para no restar dos veces.
      let abierto: [number, number][] = [[t0, t1]];
      for (const [a0, a1] of ausencias) {
        abierto = abierto.flatMap(([x0, x1]) => {
          if (solape(x0, x1, a0, a1) === 0) return [[x0, x1] as [number, number]];
          const trozos: [number, number][] = [];
          if (a0 > x0) trozos.push([x0, a0]);
          if (a1 < x1) trozos.push([a1, x1]);
          return trozos;
        });
      }
      total += abierto.reduce((s, [x0, x1]) => s + (x1 - x0), 0);
    }
  }
  return Math.round(total / MIN);
}

function ocupaHora(c: CitaAnalitica): boolean {
  return c.estado === "done" || c.estado === "confirmed" || c.estado === "no_show";
}

function minutosCita(c: CitaAnalitica): number {
  return Math.round((new Date(c.fin).getTime() - new Date(c.inicio).getTime()) / MIN);
}

export interface Kpis {
  facturadoCents: number;
  citasCents: number;
  ventaBonosCents: number;
  devolucionesCents: number;
  cobradoConBonoCents: number;
  propinasCents: number;
  citasHechas: number;
  faltas: number;
  canceladas: number;
  /** facturado de citas / citas hechas (0 si no hay) */
  ticketMedioCents: number;
  /** 0–1, o null si no había horario abierto */
  ocupacion: number | null;
  /** faltas / (hechas + faltas), o null */
  tasaFaltas: number | null;
  clientasDistintas: number;
}

export function kpis(e: Entrada): Kpis {
  let citasCents = 0;
  let ventaBonosCents = 0;
  let devolucionesCents = 0;
  let cobradoConBonoCents = 0;
  let propinasCents = 0;
  for (const p of e.pagos) {
    propinasCents += p.propinaCents;
    if (p.tipo === "refund") devolucionesCents += p.importeCents;
    else if (p.tipo === "voucher_sale") ventaBonosCents += p.importeCents;
    else if (p.metodo === "voucher") cobradoConBonoCents += p.importeCents;
    else citasCents += p.importeCents;
  }
  const hechas = e.citas.filter((c) => c.estado === "done");
  const faltas = e.citas.filter((c) => c.estado === "no_show").length;
  const canceladas = e.citas.filter((c) => c.estado === "cancelled").length;

  const capacidad = e.staff.reduce((s, p) => s + capacidadMinutos(e, p.id), 0);
  const ocupados = e.citas.filter(ocupaHora).reduce((s, c) => s + minutosCita(c), 0);

  return {
    facturadoCents: citasCents + ventaBonosCents - devolucionesCents,
    citasCents,
    ventaBonosCents,
    devolucionesCents,
    cobradoConBonoCents,
    propinasCents,
    citasHechas: hechas.length,
    faltas,
    canceladas,
    ticketMedioCents: hechas.length ? Math.round((citasCents + cobradoConBonoCents) / hechas.length) : 0,
    ocupacion: capacidad > 0 ? Math.min(1, ocupados / capacidad) : null,
    tasaFaltas: hechas.length + faltas > 0 ? faltas / (hechas.length + faltas) : null,
    clientasDistintas: new Set(hechas.map((c) => c.clientaId).filter(Boolean)).size,
  };
}

/** Variación relativa (0,12 = +12 %); null si no hay base con la que comparar. */
export function variacion(actual: number, anterior: number): number | null {
  if (anterior === 0) return actual === 0 ? 0 : null;
  return (actual - anterior) / Math.abs(anterior);
}

export interface PuntoSerie {
  /** "YYYY-MM-DD": el día, o el lunes de la semana si se agrupa por semanas */
  fecha: string;
  cents: number;
}

/**
 * Facturado por día (hasta 45 días) o por semana (más largo, para que las barras no queden de un
 * píxel). Los días sin cobros salen a 0: un hueco en el eje mentiría sobre el calendario.
 */
export function serieFacturado(e: Entrada): { agrupado: "dia" | "semana"; puntos: PuntoSerie[] } {
  const agrupado = e.periodo.dias > 45 ? "semana" : "dia";
  const clave = (fecha: string) => (agrupado === "dia" ? fecha : desplazarFechaLocal(fecha, 1 - diaSemanaIso(fecha)));
  const puntos = new Map<string, number>();
  for (let i = 0; i < e.periodo.dias; i++) puntos.set(clave(desplazarFechaLocal(e.periodo.desde, i)), 0);
  for (const p of e.pagos) {
    if (p.metodo === "voucher") continue;
    const k = clave(fechaLocal(new Date(p.fecha), e.zona));
    if (!puntos.has(k)) continue;
    const signo = p.tipo === "refund" ? -1 : 1;
    puntos.set(k, (puntos.get(k) ?? 0) + signo * p.importeCents);
  }
  return { agrupado, puntos: [...puntos].map(([fecha, cents]) => ({ fecha, cents })) };
}

export interface FilaProfesional {
  staffId: string;
  nombre: string;
  facturadoCents: number;
  propinasCents: number;
  citas: number;
  faltas: number;
  ocupacion: number | null;
}

/** Por profesional (solo la dueña lo ve: es información de rendimiento de cada empleada). */
export function porProfesional(e: Entrada): FilaProfesional[] {
  return e.staff
    .map((s) => {
      const suyas = e.citas.filter((c) => c.staffId === s.id);
      const pagos = e.pagos.filter((p) => p.staffId === s.id && p.tipo === "booking");
      const capacidad = capacidadMinutos(e, s.id);
      const ocupados = suyas.filter(ocupaHora).reduce((t, c) => t + minutosCita(c), 0);
      return {
        staffId: s.id,
        nombre: s.nombre,
        facturadoCents: pagos.reduce((t, p) => t + p.importeCents, 0),
        propinasCents: pagos.reduce((t, p) => t + p.propinaCents, 0),
        citas: suyas.filter((c) => c.estado === "done").length,
        faltas: suyas.filter((c) => c.estado === "no_show").length,
        ocupacion: capacidad > 0 ? Math.min(1, ocupados / capacidad) : null,
      };
    })
    .sort((a, b) => b.facturadoCents - a.facturadoCents);
}

export interface FilaServicio {
  nombre: string;
  veces: number;
  cents: number;
}

/** Servicios hechos, por veces. Por nombre congelado en la cita: un servicio renombrado sigue contando. */
export function topServicios(e: Entrada, limite = 8): { filas: FilaServicio[]; resto: FilaServicio | null } {
  const mapa = new Map<string, FilaServicio>();
  for (const c of e.citas) {
    if (c.estado !== "done") continue;
    for (const s of c.servicios) {
      const f = mapa.get(s.nombre) ?? { nombre: s.nombre, veces: 0, cents: 0 };
      f.veces += 1;
      f.cents += s.precioCents;
      mapa.set(s.nombre, f);
    }
  }
  const todas = [...mapa.values()].sort((a, b) => b.veces - a.veces || b.cents - a.cents);
  const filas = todas.slice(0, limite);
  const cola = todas.slice(limite);
  // Más de ocho no se pinta como más barras: se agrupa en «Otros» (regla de la casa para gráficas).
  const resto = cola.length
    ? { nombre: `Otros (${cola.length})`, veces: cola.reduce((t, f) => t + f.veces, 0), cents: cola.reduce((t, f) => t + f.cents, 0) }
    : null;
  return { filas, resto };
}

export interface Mapa {
  /** días ISO que aparecen (1 lunes … 7 domingo), solo los que tienen horario o citas */
  dias: number[];
  /** horas locales enteras de la rejilla */
  horas: number[];
  /** celdas[díaIdx][horaIdx] = citas que empiezan en esa hora */
  celdas: number[][];
  maximo: number;
}

/** Cuándo se llena el salón: citas (no canceladas) por día de la semana y hora de comienzo. */
export function mapaCalor(e: Entrada): Mapa {
  const vivas = e.citas.filter(ocupaHora);
  const diasSet = new Set<number>(e.franjas.map((f) => f.dia));
  let hMin = 24;
  let hMax = 0;
  for (const f of e.franjas) {
    hMin = Math.min(hMin, Math.floor(minutosDeHhMm(f.desde) / 60));
    hMax = Math.max(hMax, Math.ceil(minutosDeHhMm(f.hasta) / 60) - 1);
  }
  for (const c of vivas) {
    const z = enZona(new Date(c.inicio), e.zona);
    diasSet.add(z.diaSemana);
    hMin = Math.min(hMin, z.hora);
    hMax = Math.max(hMax, z.hora);
  }
  if (hMin > hMax) return { dias: [], horas: [], celdas: [], maximo: 0 };
  const dias = [...diasSet].sort((a, b) => a - b);
  const horas = Array.from({ length: hMax - hMin + 1 }, (_, i) => hMin + i);
  const celdas = dias.map(() => horas.map(() => 0));
  for (const c of vivas) {
    const z = enZona(new Date(c.inicio), e.zona);
    const di = dias.indexOf(z.diaSemana);
    const hi = horas.indexOf(z.hora);
    if (di >= 0 && hi >= 0) celdas[di]![hi]! += 1;
  }
  return { dias, horas, celdas, maximo: Math.max(0, ...celdas.flat()) };
}

export interface FilaMetodo {
  metodo: PaymentMethod;
  cents: number;
  cobros: number;
}

/** Cómo se cobra (citas y ventas de bonos, sin devoluciones). */
export function porMetodo(e: Entrada): FilaMetodo[] {
  const mapa = new Map<PaymentMethod, FilaMetodo>();
  for (const p of e.pagos) {
    if (p.tipo === "refund") continue;
    const f = mapa.get(p.metodo) ?? { metodo: p.metodo, cents: 0, cobros: 0 };
    f.cents += p.importeCents;
    f.cobros += 1;
    mapa.set(p.metodo, f);
  }
  return [...mapa.values()].sort((a, b) => b.cents - a.cents);
}

/** El escalón (0–4) de una celda en la rampa de 5 pasos; −1 = sin citas. */
export function escalon(valor: number, maximo: number): number {
  if (valor <= 0 || maximo <= 0) return -1;
  // El máximo siempre cae en el paso más oscuro; el resto, en proporción.
  return Math.min(4, Math.max(0, Math.ceil((valor / maximo) * 5) - 1));
}
