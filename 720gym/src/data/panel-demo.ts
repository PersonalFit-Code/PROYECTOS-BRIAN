/**
 * DATOS SEMILLA DEL PANEL (FICTICIOS). Sirven para enseñar el panel de gestión con contenido
 * plausible: los importes salen de sus tarifas reales (dosier 2025-26 y PDF de 720 Pilates), pero
 * socios, cifras y movimientos son inventados y el panel los rotula como «Datos de demostración».
 * Lo que se hace en la web (reservas, solicitudes, chats y pagos) se suma en vivo desde @/lib/demo.
 */

export type EstadoPago = "Al día" | "Pendiente" | "Impagado";

export interface SocioDemo {
  id: string;
  nombre: string;
  plan: string;
  cuota: number;
  alta: string; // ISO (fecha)
  estado: EstadoPago;
  ultimoAcceso: number; // días desde el último acceso (0 = hoy)
  horaAcceso: string;
  asistencias: number;
}

/* Generador determinista: la demo sale igual en cada carga. */
function aleatorio(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const nombres = [
  "Lucía Pereira", "Martín Álvarez", "Sara Domínguez", "Iago Fernández", "Noelia Rodríguez", "Brais Outeiro", "Carmen Vázquez",
  "Diego Losada", "Paula Gil", "Antón Novoa", "Elena Castro", "Hugo Rivas", "Marta Iglesias", "Xoán Méndez", "Laura Blanco",
  "Pablo Seoane", "Andrea Figueiras", "Manuel Soto", "Sabela Lorenzo", "Javier Rey", "Uxía Carballo", "Adrián Prieto",
  "Rocío Gómez", "Daniel Paz", "Alba Varela", "Óscar Freire", "Nerea Bouzas", "Rubén Cid", "Iria Montero", "Sergio Barreiro",
  "Cristina Sanmartín", "Álex Rial", "Beatriz Fontán", "Raúl Pazos", "Aldara Quintela", "Miguel Otero", "Tania Doval",
  "Jorge Conde", "Patricia Ferro", "Iván Lamas",
];

const planes: { plan: string; cuota: number; peso: number }[] = [
  { plan: "Gimnasio libre", cuota: 35, peso: 46 },
  { plan: "Supervisión en grupo", cuota: 45, peso: 8 },
  { plan: "Reformer 2 días", cuota: 95, peso: 10 },
  { plan: "Reformer 1 día", cuota: 55, peso: 7 },
  { plan: "Mat Integral 2 días", cuota: 57, peso: 6 },
  { plan: "Mixto 2 días", cuota: 78, peso: 5 },
  { plan: "Hipopresivos 1 día", cuota: 35, peso: 4 },
  { plan: "Bono 10 sesiones", cuota: 270, peso: 6 },
  { plan: "Bono 5 sesiones", cuota: 150, peso: 4 },
  { plan: "Pareja · Bono 10", cuota: 430, peso: 4 },
];

function elegirPlan(r: () => number) {
  const total = planes.reduce((a, p) => a + p.peso, 0);
  let x = r() * total;
  for (const p of planes) {
    x -= p.peso;
    if (x <= 0) return p;
  }
  return planes[0];
}

export const socios: SocioDemo[] = (() => {
  const r = aleatorio(720);
  return nombres.map((nombre, i) => {
    const p = elegirPlan(r);
    const meses = Math.floor(r() * 18);
    const d = new Date(2026, 10 - meses, 1 + Math.floor(r() * 27));
    const e = r();
    const estado: EstadoPago = e < 0.8 ? "Al día" : e < 0.93 ? "Pendiente" : "Impagado";
    const ultimo = r() < 0.45 ? 0 : Math.floor(r() * (estado === "Impagado" ? 30 : 9));
    const h = 8 + Math.floor(r() * 14);
    return {
      id: `s${i + 1}`,
      nombre,
      plan: p.plan,
      cuota: p.cuota,
      alta: d.toISOString().slice(0, 10),
      estado,
      ultimoAcceso: ultimo,
      horaAcceso: `${String(h).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`,
      asistencias: estado === "Impagado" ? Math.floor(r() * 3) : 2 + Math.floor(r() * 16),
    };
  });
})();

/** Totales del centro (la tabla de socios muestra una muestra; esto es el conjunto). */
export const totales = {
  sociosActivos: 214,
  altasMes: 17,
  bajasMes: 4,
  aforoMaximo: 45,
};

/* ── Contabilidad del mes en curso ──────────────────────────────────────── */
export const ingresosMes: { concepto: string; importe: number; detalle: string }[] = [
  { concepto: "Cuotas gimnasio", importe: 5_780, detalle: "142 × 35 € + 18 × 45 € (supervisión)" },
  { concepto: "720 Pilates", importe: 5_576, detalle: "68 alumnas · media 82 €/mes" },
  { concepto: "Entrenamiento personal", importe: 2_430, detalle: "Bonos y sesiones de valoración" },
  { concepto: "Alquiler espacios 720P", importe: 750, detalle: "Clubes y talleres" },
  { concepto: "Entradas diarias", importe: 230, detalle: "46 entradas × 5 €" },
];

export const gastosMes: { concepto: string; importe: number }[] = [
  { concepto: "Nóminas y Seguridad Social", importe: 6_900 },
  { concepto: "Alquiler del local", importe: 2_400 },
  { concepto: "Suministros (luz, agua, internet)", importe: 680 },
  { concepto: "Mantenimiento y limpieza", importe: 420 },
  { concepto: "Marketing", importe: 250 },
  { concepto: "Software (web, panel, asistente)", importe: 95 },
];

/** Ingresos de los últimos 12 meses (el último es el mes en curso; se le suman los pagos online). */
export const historico: { mes: string; ingresos: number; gastos: number }[] = [
  { mes: "Dic", ingresos: 9_850, gastos: 9_420 },
  { mes: "Ene", ingresos: 12_940, gastos: 9_880 },
  { mes: "Feb", ingresos: 12_310, gastos: 9_760 },
  { mes: "Mar", ingresos: 12_880, gastos: 9_910 },
  { mes: "Abr", ingresos: 12_620, gastos: 10_020 },
  { mes: "May", ingresos: 13_150, gastos: 10_110 },
  { mes: "Jun", ingresos: 12_470, gastos: 10_090 },
  { mes: "Jul", ingresos: 11_380, gastos: 9_970 },
  { mes: "Ago", ingresos: 10_920, gastos: 9_940 },
  { mes: "Sep", ingresos: 14_060, gastos: 10_480 },
  { mes: "Oct", ingresos: 14_520, gastos: 10_610 },
  { mes: "Nov", ingresos: 14_766, gastos: 10_745 },
];

export interface MovimientoDemo {
  id: string;
  dia: number; // día del mes
  concepto: string;
  categoria: string;
  tipo: "Ingreso" | "Gasto";
  importe: number;
  metodo: string;
}

export const movimientos: MovimientoDemo[] = (() => {
  const r = aleatorio(1107);
  const lista: MovimientoDemo[] = [];
  const metodos = ["Domiciliación", "Tarjeta", "Bizum", "Efectivo"];
  let n = 0;
  const add = (m: Omit<MovimientoDemo, "id">) => lista.push({ ...m, id: `m${++n}` });
  socios.forEach((s) => {
    if (s.estado === "Al día") {
      const cat = s.plan.includes("Bono") ? "Entrenamiento personal" : /Reformer|Mat|Mixto|Hipopresivos/.test(s.plan) ? "720 Pilates" : "Cuotas gimnasio";
      add({ dia: 1 + Math.floor(r() * 7), concepto: `${s.plan} · ${s.nombre}`, categoria: cat, tipo: "Ingreso", importe: s.cuota, metodo: metodos[Math.floor(r() * 3)] });
    }
  });
  for (let i = 0; i < 8; i++) add({ dia: 1 + Math.floor(r() * 9), concepto: "Entrada diaria", categoria: "Entradas diarias", tipo: "Ingreso", importe: 5, metodo: r() < 0.5 ? "Tarjeta" : "Efectivo" });
  add({ dia: 3, concepto: "Alquiler sala · Capoeira Andaruê", categoria: "Alquiler espacios 720P", tipo: "Ingreso", importe: 250, metodo: "Transferencia" });
  add({ dia: 3, concepto: "Alquiler sala · BJJ Mambises", categoria: "Alquiler espacios 720P", tipo: "Ingreso", importe: 250, metodo: "Transferencia" });
  add({ dia: 5, concepto: "Alquiler sala · Taller de nutrición", categoria: "Alquiler espacios 720P", tipo: "Ingreso", importe: 120, metodo: "Bizum" });
  add({ dia: 1, concepto: "Alquiler del local", categoria: "Alquiler del local", tipo: "Gasto", importe: 2_400, metodo: "Transferencia" });
  add({ dia: 4, concepto: "Factura luz", categoria: "Suministros", tipo: "Gasto", importe: 486, metodo: "Domiciliación" });
  add({ dia: 6, concepto: "Agua", categoria: "Suministros", tipo: "Gasto", importe: 134, metodo: "Domiciliación" });
  add({ dia: 6, concepto: "Fibra y teléfono", categoria: "Suministros", tipo: "Gasto", importe: 60, metodo: "Domiciliación" });
  add({ dia: 2, concepto: "Limpieza mensual", categoria: "Mantenimiento", tipo: "Gasto", importe: 320, metodo: "Transferencia" });
  add({ dia: 7, concepto: "Revisión máquinas cardio", categoria: "Mantenimiento", tipo: "Gasto", importe: 100, metodo: "Tarjeta" });
  add({ dia: 8, concepto: "Campaña Instagram", categoria: "Marketing", tipo: "Gasto", importe: 250, metodo: "Tarjeta" });
  add({ dia: 1, concepto: "Web + panel + asistente", categoria: "Software", tipo: "Gasto", importe: 95, metodo: "Domiciliación" });
  return lista.sort((a, b) => b.dia - a.dia);
})();

/* ── Solicitudes y conversaciones de ejemplo ────────────────────────────── */
export const solicitudesSemilla = [
  { id: "q1", tipo: "prueba" as const, nombre: "Natalia Couto", actividad: "720 Pilates (Reformer, Mat, Hipopresivos)", detalle: "Jueves 19:00", hace: "hace 2 h", estado: "Nueva" as const },
  { id: "q2", tipo: "inscripcion" as const, nombre: "Roberto Vila", actividad: "Gimnasio libre (sala)", detalle: "Gimnasio libre · 35 €/mes", hace: "hace 5 h", estado: "Contactada" as const },
  { id: "q3", tipo: "entrada" as const, nombre: "Kevin Murphy", actividad: "Entrada diaria", detalle: "Mañana", hace: "ayer", estado: "Convertida" as const },
  { id: "q4", tipo: "prueba" as const, nombre: "Lorena Ares", actividad: "CrossGym 720", detalle: "Sábado 11:00", hace: "ayer", estado: "Convertida" as const },
  { id: "q5", tipo: "inscripcion" as const, nombre: "Fernando Sobrino", actividad: "Entrenamiento personal", detalle: "Bono 10 sesiones", hace: "hace 2 días", estado: "Contactada" as const },
  { id: "q6", tipo: "prueba" as const, nombre: "Ainhoa Ríos", actividad: "720 Yoga", detalle: "Lunes 20:00", hace: "hace 3 días", estado: "Convertida" as const },
];

export const conversacionesSemilla: { id: string; hace: string; resultado: "Reserva" | "Inscripción" | "Información"; mensajes: { rol: "usuario" | "asistente"; texto: string }[] }[] = [
  {
    id: "c1",
    hace: "hace 40 min",
    resultado: "Reserva",
    mensajes: [
      { rol: "usuario", texto: "¿Hay Reformer los jueves por la tarde?" },
      { rol: "asistente", texto: "Sí: jueves a las 19:00, grupo reducido de 6. Ahora quedan 2 plazas. ¿Te la reservo?" },
      { rol: "usuario", texto: "Sí, porfa" },
      { rol: "asistente", texto: "Hecho. Te llegará un recordatorio por WhatsApp el día antes." },
    ],
  },
  {
    id: "c2",
    hace: "hace 3 h",
    resultado: "Información",
    mensajes: [
      { rol: "usuario", texto: "¿Dónde se aparca?" },
      { rol: "asistente", texto: "Estamos en Calle Río Bibei 16. Hay aparcamiento fácil en la zona y varias líneas de autobús." },
    ],
  },
  {
    id: "c3",
    hace: "ayer",
    resultado: "Inscripción",
    mensajes: [
      { rol: "usuario", texto: "¿Cuánto cuesta el gimnasio?" },
      { rol: "asistente", texto: "Gimnasio libre: 35 €/mes, acceso ilimitado los 365 días. Puedes darte de alta online en un minuto." },
      { rol: "usuario", texto: "Me apunto" },
    ],
  },
  {
    id: "c4",
    hace: "ayer",
    resultado: "Información",
    mensajes: [
      { rol: "usuario", texto: "Vengo de vacaciones una semana, ¿puedo entrenar?" },
      { rol: "asistente", texto: "Claro: la entrada diaria cuesta 5 € y tenemos pases temporales. ¿Qué días vienes?" },
    ],
  },
];

export const preguntasFrecuentes = [
  { tema: "Horario y festivos", veces: 38 },
  { tema: "Precio del gimnasio", veces: 31 },
  { tema: "Pilates Reformer: plazas y precio", veces: 27 },
  { tema: "Entrada diaria / pases", veces: 14 },
  { tema: "Aparcamiento y cómo llegar", veces: 9 },
  { tema: "Entrenamiento personal", veces: 8 },
];

export const reservasSemilla = [
  { id: "r1", clase: "Pilates Reformer", dia: "Martes", hora: "19:00", nombre: "Carmen Vázquez" },
  { id: "r2", clase: "CrossGym", dia: "Miércoles", hora: "19:00", nombre: "Hugo Rivas" },
  { id: "r3", clase: "Yoga", dia: "Miércoles", hora: "20:00", nombre: "Elena Castro" },
  { id: "r4", clase: "Pilates Mat", dia: "Jueves", hora: "09:30", nombre: "Sabela Lorenzo" },
  { id: "r5", clase: "Powerlifting", dia: "Jueves", hora: "19:30", nombre: "Adrián Prieto" },
];

/* ── Gerencia: entrenadores, bonos, deudas e historial (ficticio) ───────── */
export const entrenadores = ["Brais", "Bea", "Pablo"] as const;
export type Entrenador = (typeof entrenadores)[number];

/** Reparto del centro por entrenador (clientes asignados, sesiones y peso en la facturación). */
export const porEntrenador: Record<Entrenador, { clientes: number; sesionesMes: number; sesionesHoy: number; peso: number; rol: string }> = {
  Brais: { clientes: 96, sesionesMes: 118, sesionesHoy: 6, peso: 0.42, rol: "Gerente · fuerza y entrenamiento personal" },
  Bea: { clientes: 74, sesionesMes: 156, sesionesHoy: 7, peso: 0.43, rol: "720 Pilates" },
  Pablo: { clientes: 44, sesionesMes: 64, sesionesHoy: 3, peso: 0.15, rol: "Sala y CrossGym" },
};

export function entrenadorDe(plan: string, i: number): Entrenador {
  if (/Reformer|Mat|Mixto|Hipopresivos/.test(plan)) return "Bea";
  if (/Bono|Pareja/.test(plan)) return i % 3 === 0 ? "Pablo" : "Brais";
  return i % 2 === 0 ? "Brais" : "Pablo";
}

export type Metodo = "Efectivo" | "Tarjeta" | "Bizum" | "Domiciliación" | "Online (web)";

export interface PagoCliente {
  id: string;
  fecha: string; // ISO fecha
  concepto: string;
  importe: number;
  metodo: Metodo;
}
export interface SesionCliente {
  fecha: string;
  entrenador: Entrenador;
  tipo: string;
  pagada: boolean;
}
export interface FichaBase {
  entrenador: Entrenador;
  bono?: { sesiones: number; usadas: number; precio: number };
  deuda: number;
  pagos: PagoCliente[];
  sesiones: SesionCliente[];
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Ficha de partida de cada socio, con fechas relativas a hoy. */
export function fichaBase(s: SocioDemo, indice: number, hoy: Date): FichaBase {
  const r = aleatorio(9000 + indice);
  const entrenador = entrenadorDe(s.plan, indice);
  const esBono = /Bono/.test(s.plan);
  const tam = s.plan.includes("15") ? 15 : s.plan.includes("Bono 5") ? 5 : 10;
  const bono = esBono ? { sesiones: tam, usadas: Math.min(tam, 1 + Math.floor(r() * tam)), precio: s.cuota } : undefined;
  const deuda = s.estado === "Pendiente" ? s.cuota : s.estado === "Impagado" ? s.cuota * 2 : 0;
  const metodos: Metodo[] = ["Domiciliación", "Tarjeta", "Bizum", "Efectivo"];
  const pagos: PagoCliente[] = [];
  const mesesPagados = s.estado === "Al día" ? 3 : s.estado === "Pendiente" ? 2 : 1;
  for (let m = 0; m < mesesPagados; m++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (s.estado === "Al día" ? m : m + (s.estado === "Pendiente" ? 1 : 2)), 1 + Math.floor(r() * 6));
    pagos.push({ id: `${s.id}-p${m}`, fecha: iso(d), concepto: esBono ? s.plan : `Cuota ${s.plan}`, importe: s.cuota, metodo: metodos[Math.floor(r() * metodos.length)] });
  }
  const sesiones: SesionCliente[] = [];
  const n = esBono ? (bono?.usadas ?? 0) : Math.min(8, s.asistencias);
  for (let k = 0; k < n; k++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (s.ultimoAcceso + k * (2 + Math.floor(r() * 3))));
    sesiones.push({
      fecha: iso(d),
      entrenador,
      tipo: esBono ? "Entrenamiento personal" : /Reformer/.test(s.plan) ? "Pilates Reformer" : /Mat|Mixto/.test(s.plan) ? "Pilates Mat" : /Hipo/.test(s.plan) ? "Hipopresivos" : "Sala",
      pagada: !(deuda > 0 && k < 2),
    });
  }
  return { entrenador, bono, deuda, pagos, sesiones };
}

/** Caja: reparto típico de cobros de un día por método (importes ficticios). */
export const cajaTipo: Record<Exclude<Metodo, "Domiciliación">, number> = {
  Efectivo: 85,
  Tarjeta: 240,
  Bizum: 110,
  "Online (web)": 0,
};

export const tareasSemilla = [
  { id: "t1", texto: "Llamar a los 3 socios con cuota impagada", prioridad: "Muy prioritaria" as const, hecha: false },
  { id: "t2", texto: "Confirmar horario de Pilates de diciembre con Bea", prioridad: "Prioritaria" as const, hecha: false },
  { id: "t3", texto: "Revisar mantenimiento de la cinta 2", prioridad: "Poco prioritaria" as const, hecha: false },
];
