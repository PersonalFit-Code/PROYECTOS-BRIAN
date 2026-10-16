/**
 * Qué huecos tiene libres el salón.
 *
 * Es el cálculo del que depende que una cita exista o se pise con otra, así
 * que no lo decide la interfaz ni el modelo del chat: lo calcula el servidor a
 * partir del horario que puso Andrea y de lo que ya hay en la agenda, y la web
 * se limita a pintar lo que le den. La última palabra la tiene de todos modos
 * la restricción de exclusión de `bookings` (`book_slot()` devuelve `23P01` si
 * dos personas eligen la misma hora a la vez); esto es lo que evita que esa
 * colisión sea lo normal.
 *
 * Todo entra por parámetro y no se llama a ninguna red ni a `Date.now()`: así
 * esto se puede probar entero, que es justo lo que no se puede hacer con una
 * agenda real.
 *
 * Portado de `vapi-voice-agent/src/citas/huecos.ts` (misma `fusionar`, misma
 * `chocaCon`, mismo avance por día civil) con tres cambios: varias
 * profesionales, varios servicios encadenados y una ventana de días pedida.
 */

import { descomponerFechaLocal, enZona, formatearFechaLocal, instanteEnZona, minutosDeHhMm } from "./tz";
import type {
  DiaConHueco,
  DiaSemanaIso,
  DuracionTotal,
  EntradaHuecos,
  Hueco,
  Intervalo,
  ProfesionalAgenda,
  ServicioElegido,
} from "./types";

/** El horario o los servicios no tienen sentido: franja invertida, duración imposible, paso cero... */
export class AgendaInvalidaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "AgendaInvalidaError";
  }
}

/** Por debajo de esto no es un servicio, es un error al teclear la duración. */
const DURACION_MINIMA = 5;

const MINUTOS = 60_000;
const UN_DIA = 86_400_000;

/* ────────────────────────────────────────────────────────────
   Intervalos
   ──────────────────────────────────────────────────────────── */

/** Une los tramos ocupados que se solapan o se tocan, para restar una sola vez. */
export function fusionar(tramos: readonly Intervalo[]): Intervalo[] {
  const ordenados = [...tramos]
    .filter((t) => t.hasta.getTime() > t.desde.getTime())
    .sort((a, b) => a.desde.getTime() - b.desde.getTime());

  const unidos: Intervalo[] = [];
  for (const tramo of ordenados) {
    const ultimo = unidos[unidos.length - 1];
    if (ultimo && tramo.desde.getTime() <= ultimo.hasta.getTime()) {
      if (tramo.hasta.getTime() > ultimo.hasta.getTime()) ultimo.hasta = tramo.hasta;
      continue;
    }
    unidos.push({ desde: tramo.desde, hasta: tramo.hasta });
  }
  return unidos;
}

/** Si [inicio, fin) pisa alguno de los tramos. Tocarse por los bordes no es pisarse. */
export function chocaCon(inicio: number, fin: number, bloqueado: readonly Intervalo[]): boolean {
  for (const tramo of bloqueado) {
    if (inicio < tramo.hasta.getTime() && fin > tramo.desde.getTime()) return true;
  }
  return false;
}

/* ────────────────────────────────────────────────────────────
   Servicios
   ──────────────────────────────────────────────────────────── */

/**
 * Lo que ocupa en la agenda una cadena de servicios.
 *
 * Las duraciones se suman. Del buffer solo cuenta el del último: el respiro
 * sirve para limpiar el puesto y cobrar cuando la clienta se va, y entre dos
 * servicios de la misma clienta no se va nadie. Si cada servicio llevara el
 * suyo, "manicura + pedicura" costaría media hora más de agenda que hacerlas
 * seguidas, que es lo que de verdad pasa en el salón.
 */
export function duracionTotal(servicios: readonly ServicioElegido[]): DuracionTotal {
  if (servicios.length === 0) {
    throw new AgendaInvalidaError("Sin servicios no hay cita que colocar.");
  }
  let minutos = 0;
  let bufferFinal = 0;
  servicios.forEach((servicio, i) => {
    if (!Number.isInteger(servicio.duracionMin) || servicio.duracionMin < DURACION_MINIMA) {
      throw new AgendaInvalidaError(
        `El servicio ${i + 1} tiene una duración imposible: ${servicio.duracionMin} minutos.`,
      );
    }
    if (!Number.isInteger(servicio.bufferMin) || servicio.bufferMin < 0) {
      throw new AgendaInvalidaError(
        `El servicio ${i + 1} tiene un buffer imposible: ${servicio.bufferMin} minutos.`,
      );
    }
    minutos += servicio.duracionMin;
    bufferFinal = servicio.bufferMin;
  });
  return { minutos, bufferFinal };
}

/* ────────────────────────────────────────────────────────────
   Preparación: se valida y se convierte todo una vez, no en cada día
   ──────────────────────────────────────────────────────────── */

interface FranjaMinutos {
  dia: DiaSemanaIso;
  desdeMin: number;
  hastaMin: number;
}

interface ProfesionalPreparada {
  id: string;
  franjas: readonly FranjaMinutos[];
  /** Sus citas y ausencias más los cierres del salón, fusionados y ordenados. */
  bloqueado: readonly Intervalo[];
}

interface Contexto {
  zona: string;
  /** El día de hoy en la zona del salón; el resto de días se cuentan desde aquí. */
  hoy: { anio: number; mes: number; dia: number };
  horizonteDias: number;
  noAntesDe: number;
  pasoMs: number;
  /** Duración más buffer final, en milisegundos: lo que ocupa cada hueco. */
  totalMs: number;
  profesionales: readonly ProfesionalPreparada[];
}

function prepararFranjas(profesional: ProfesionalAgenda): FranjaMinutos[] {
  return profesional.franjas.map((franja) => {
    let desdeMin: number;
    let hastaMin: number;
    try {
      desdeMin = minutosDeHhMm(franja.desde);
      hastaMin = minutosDeHhMm(franja.hasta);
    } catch (err) {
      throw new AgendaInvalidaError(
        `El horario de ${profesional.id} tiene una hora mal escrita: ${(err as Error).message}`,
      );
    }
    if (hastaMin <= desdeMin) {
      throw new AgendaInvalidaError(
        `La franja del día ${franja.dia} de ${profesional.id} acaba antes de empezar: de ${franja.desde} a ${franja.hasta}.`,
      );
    }
    return { dia: franja.dia, desdeMin, hastaMin };
  });
}

function preparar(e: EntradaHuecos): Contexto {
  const { minutos, bufferFinal } = duracionTotal(e.servicios);

  if (!Number.isInteger(e.pasoMin) || e.pasoMin < 1) {
    throw new AgendaInvalidaError(`El paso entre comienzos tiene que ser un entero positivo, no ${e.pasoMin}.`);
  }
  if (!Number.isInteger(e.horizonteDias) || e.horizonteDias < 1) {
    throw new AgendaInvalidaError(`El horizonte tiene que ser al menos un día, no ${e.horizonteDias}.`);
  }

  // Antes de esto no se ofrece nada: una cita dentro de diez minutos no le
  // sirve a nadie, ni a la clienta que tiene que llegar ni al salón. Una
  // antelación negativa (un despiste en la configuración) vale lo mismo que
  // ninguna; no merece tumbar la página de reservas.
  const noAntesDe = e.ahora.getTime() + Math.max(e.antelacionMin, 0) * MINUTOS;

  const hoy = enZona(e.ahora, e.zona);

  return {
    zona: e.zona,
    hoy: { anio: hoy.anio, mes: hoy.mes, dia: hoy.dia },
    horizonteDias: e.horizonteDias,
    noAntesDe,
    pasoMs: e.pasoMin * MINUTOS,
    totalMs: (minutos + bufferFinal) * MINUTOS,
    profesionales: e.profesionales.map((p) => ({
      id: p.id,
      franjas: prepararFranjas(p),
      // Un cierre del salón bloquea a todas; se mezcla con lo suyo para que el
      // bucle de abajo solo tenga una lista que mirar.
      bloqueado: fusionar([...(e.ocupado[p.id] ?? []), ...e.cierres]),
    })),
  };
}

/* ────────────────────────────────────────────────────────────
   Días
   ──────────────────────────────────────────────────────────── */

/** Días civiles que van de hoy a esa fecha (negativo si ya pasó). Lanza si la fecha no es válida. */
function saltoDesdeHoy(ctx: Contexto, fecha: string): number {
  let civil: { anio: number; mes: number; dia: number };
  try {
    civil = descomponerFechaLocal(fecha);
  } catch (err) {
    throw new AgendaInvalidaError((err as Error).message);
  }
  const utcHoy = Date.UTC(ctx.hoy.anio, ctx.hoy.mes - 1, ctx.hoy.dia);
  const utcFecha = Date.UTC(civil.anio, civil.mes - 1, civil.dia);
  return Math.round((utcFecha - utcHoy) / UN_DIA);
}

/**
 * La ventana pedida recortada al horizonte: nunca se ofrece nada de antes de
 * hoy ni de más allá de `horizonteDias` contando hoy, se pida lo que se pida.
 * Devuelve saltos desde hoy; si `ultimo < primero` la ventana queda vacía.
 */
function ventana(ctx: Contexto, desde: string | undefined, dias: number | undefined): { primero: number; ultimo: number } {
  const inicio = desde === undefined ? 0 : saltoDesdeHoy(ctx, desde);
  const cuantos = dias === undefined ? ctx.horizonteDias : Math.floor(dias);
  return {
    primero: Math.max(inicio, 0),
    ultimo: Math.min(inicio + cuantos - 1, ctx.horizonteDias - 1),
  };
}

/** La fecha civil que está `salto` días después de hoy, con sus campos y su día de la semana. */
function diaCivil(ctx: Contexto, salto: number): { anio: number; mes: number; dia: number; diaSemana: DiaSemanaIso } {
  // Se avanza por el calendario civil, no sumando 24 horas: el día que entra
  // el cambio de hora no dura 24 horas y sumarlas corre el día entero.
  const civil = new Date(Date.UTC(ctx.hoy.anio, ctx.hoy.mes - 1, ctx.hoy.dia + salto));
  const dow = civil.getUTCDay();
  return {
    anio: civil.getUTCFullYear(),
    mes: civil.getUTCMonth() + 1,
    dia: civil.getUTCDate(),
    diaSemana: (dow === 0 ? 7 : dow) as DiaSemanaIso,
  };
}

/**
 * Los huecos de un día, profesional a profesional, en el orden de entrada.
 * Con `soloPrimero` se para en cuanto encuentra uno: para pintar el calendario
 * basta con saber si el día tiene algo.
 */
function huecosDeUnDia(ctx: Contexto, salto: number, soloPrimero: boolean): Hueco[] {
  const { anio, mes, dia, diaSemana } = diaCivil(ctx, salto);
  const huecos: Hueco[] = [];

  for (const profesional of ctx.profesionales) {
    for (const franja of profesional.franjas) {
      if (franja.dia !== diaSemana) continue;

      const abre = instanteEnZona(anio, mes, dia, Math.floor(franja.desdeMin / 60), franja.desdeMin % 60, ctx.zona).getTime();
      const cierra = instanteEnZona(anio, mes, dia, Math.floor(franja.hastaMin / 60), franja.hastaMin % 60, ctx.zona).getTime();

      // Solo los tramos que tocan la franja: así cada comienzo se compara con
      // las citas de esa mañana, no con las de los otros cuarenta y cuatro días.
      const bloqueado = profesional.bloqueado.filter((t) => t.desde.getTime() < cierra && t.hasta.getTime() > abre);

      for (let t = abre; t + ctx.totalMs <= cierra; t += ctx.pasoMs) {
        if (t < ctx.noAntesDe) continue;
        const fin = t + ctx.totalMs;
        if (chocaCon(t, fin, bloqueado)) continue;
        huecos.push({ inicio: new Date(t), fin: new Date(fin), staffId: profesional.id });
        if (soloPrimero) return huecos;
      }
    }
  }
  return huecos;
}

/* ────────────────────────────────────────────────────────────
   API
   ──────────────────────────────────────────────────────────── */

/**
 * Todos los huecos libres de la ventana pedida (por defecto, de hoy al
 * horizonte), uno por profesional y comienzo, ordenados por hora. A igual
 * hora, en el orden en que vinieron las profesionales.
 *
 * `ocupado` y `cierres` son los tramos que ya están cogidos, tal como salen
 * de la base de datos. Entran por parámetro para que esto siga siendo puro:
 * quien llame decide si eso viene de Supabase, de una prueba o de un fichero.
 */
export function calcularHuecos(e: EntradaHuecos): Hueco[] {
  const ctx = preparar(e);
  const { primero, ultimo } = ventana(ctx, e.desde, e.dias);

  const huecos: Hueco[] = [];
  for (let salto = primero; salto <= ultimo; salto++) {
    huecos.push(...huecosDeUnDia(ctx, salto, false));
  }
  // El sort es estable: a igual inicio se conserva el orden de las profesionales.
  return huecos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}

/**
 * Los huecos de un día concreto, una entrada por hora.
 *
 * Cuando hay varias profesionales ("me da igual"), la misma hora sale una sola
 * vez: `staffId` es la primera que puede y `candidatas` las lista todas, en el
 * orden de entrada. La elección de verdad se hace al reservar, con
 * `elegirProfesional`, para repartir el día entre ellas. Un día fuera del
 * horizonte no tiene huecos; una fecha mal escrita lanza `AgendaInvalidaError`.
 */
export function huecosDelDia(e: EntradaHuecos, fecha: string): Hueco[] {
  const ctx = preparar(e);
  const salto = saltoDesdeHoy(ctx, fecha);
  if (salto < 0 || salto >= ctx.horizonteDias) return [];

  const porInicio = new Map<number, { hueco: Hueco; candidatas: string[] }>();
  for (const hueco of huecosDeUnDia(ctx, salto, false)) {
    const clave = hueco.inicio.getTime();
    const existente = porInicio.get(clave);
    if (existente) existente.candidatas.push(hueco.staffId);
    else porInicio.set(clave, { hueco, candidatas: [hueco.staffId] });
  }

  return [...porInicio.values()]
    .sort((a, b) => a.hueco.inicio.getTime() - b.hueco.inicio.getTime())
    .map(({ hueco, candidatas }) => ({ ...hueco, candidatas }));
}

/**
 * Qué días de la ventana (por defecto, los `horizonteDias` desde hoy) tienen
 * algo que ofrecer. Es lo que pinta el calendario del asistente; por eso es
 * barato: en cada día se para al primer hueco.
 */
export function diasConHueco(e: EntradaHuecos): DiaConHueco[] {
  const ctx = preparar(e);
  const { primero, ultimo } = ventana(ctx, e.desde, e.dias);

  const dias: DiaConHueco[] = [];
  for (let salto = primero; salto <= ultimo; salto++) {
    dias.push({
      fecha: formatearFechaLocal(diaCivil(ctx, salto)),
      hayHuecos: huecosDeUnDia(ctx, salto, true).length > 0,
    });
  }
  return dias;
}
