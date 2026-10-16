/**
 * Horas locales del salón, sin librerías de fechas.
 *
 * Todo lo que entra y sale del sistema son instantes absolutos (Date). La zona
 * horaria solo aparece en los bordes: cuando el salón dice "abrimos a las
 * nueve y media" y cuando se le enseña a la clienta "mañana a las diez". En
 * medio no se razona nunca con horas locales, porque es donde se cuelan los
 * errores.
 *
 * El cambio de hora de marzo y octubre no es un detalle teórico: una agenda
 * que lo ignore ofrece citas una hora corridas durante media estación.
 *
 * Es una copia de `vapi-voice-agent/src/util/zona.ts` con dos añadidos al
 * final (`fechaLocal` y `diaSemanaIso`, más sus ayudantes) para manejar las
 * fechas "YYYY-MM-DD" que viajan entre el calendario de la web y la API.
 */

import type { DiaSemanaIso } from "./types";

/**
 * Minutos que la zona va por delante de UTC en ese instante concreto.
 * Positivo en España (+60 en invierno, +120 en verano).
 *
 * El truco: formatear el instante en la zona pedida y volver a leerlo como si
 * fuera UTC. La diferencia con el instante original es el desfase.
 */
export function desfaseMinutos(instante: Date, zonaHoraria: string): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zonaHoraria,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instante);

  const campo = (tipo: string): number =>
    Number(partes.find((p) => p.type === tipo)?.value ?? "0");

  // "24" en lugar de "00" para medianoche: ocurre en algunos entornos.
  const hora = campo("hour") % 24;

  const comoSiFueraUtc = Date.UTC(
    campo("year"),
    campo("month") - 1,
    campo("day"),
    hora,
    campo("minute"),
    campo("second"),
  );

  // Los milisegundos se pierden al formatear; se redondea al segundo para que
  // la resta no arrastre un resto que falsee el desfase.
  const original = Math.floor(instante.getTime() / 1000) * 1000;
  return (comoSiFueraUtc - original) / 60000;
}

/** Los campos de un instante, vistos desde la zona del negocio. */
export interface HoraLocal {
  anio: number;
  mes: number;
  /** Día del mes, 1-31. */
  dia: number;
  hora: number;
  minuto: number;
  /** Día de la semana en formato ISO: 1 lunes ... 7 domingo. */
  diaSemana: DiaSemanaIso;
}

const ISO_POR_DIA: Record<string, DiaSemanaIso> = {
  Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
};

/** Descompone un instante en la hora local del negocio. */
export function enZona(instante: Date, zonaHoraria: string): HoraLocal {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zonaHoraria,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instante);

  const texto = (tipo: string): string =>
    partes.find((p) => p.type === tipo)?.value ?? "";
  const numero = (tipo: string): number => Number(texto(tipo));

  return {
    anio: numero("year"),
    mes: numero("month"),
    dia: numero("day"),
    hora: numero("hour") % 24,
    minuto: numero("minute"),
    diaSemana: ISO_POR_DIA[texto("weekday")] ?? 1,
  };
}

/**
 * El instante en el que, en esa zona, el reloj marca esa fecha y esa hora.
 *
 * Hacen falta dos pasadas: la primera supone un desfase y la segunda lo
 * corrige, porque el desfase depende del propio instante que estamos
 * buscando. Con dos basta para cualquier zona real.
 *
 * En la madrugada del cambio de hora hay horas que no existen (en marzo el
 * reloj salta de las 2 a las 3) y horas que ocurren dos veces (en octubre).
 * Para la agenda de un salón da igual: nadie da cita a las dos y media de la
 * madrugada de un domingo de marzo.
 */
export function instanteEnZona(
  anio: number,
  mes: number,
  dia: number,
  hora: number,
  minuto: number,
  zonaHoraria: string,
): Date {
  const comoUtc = Date.UTC(anio, mes - 1, dia, hora, minuto);
  const primero = desfaseMinutos(new Date(comoUtc), zonaHoraria);
  const candidato = comoUtc - primero * 60000;
  const segundo = desfaseMinutos(new Date(candidato), zonaHoraria);
  if (segundo === primero) return new Date(candidato);
  return new Date(comoUtc - segundo * 60000);
}

/** "09:30" -> 570 minutos desde medianoche. Lanza si el formato no es ese. */
export function minutosDeHhMm(texto: string): number {
  const encaje = /^(\d{1,2}):(\d{2})$/.exec(String(texto).trim());
  if (!encaje) {
    throw new Error(`La hora "${texto}" no tiene el formato HH:MM.`);
  }
  const horas = Number(encaje[1]);
  const minutos = Number(encaje[2]);
  if (horas > 23 || minutos > 59) {
    throw new Error(`La hora "${texto}" no existe.`);
  }
  return horas * 60 + minutos;
}

/* ────────────────────────────────────────────────────────────
   Fechas civiles "YYYY-MM-DD"
   Es lo que viaja entre el calendario de la web y la API: un día del salón,
   sin hora y sin zona. Se convierten a instantes solo al cruzarlas con un
   horario, nunca con `new Date("2026-10-25")`, que las leería como UTC.
   ──────────────────────────────────────────────────────────── */

/** Una fecha civil ya troceada. */
export interface FechaCivil {
  anio: number;
  mes: number;
  dia: number;
}

const dos = (n: number): string => String(n).padStart(2, "0");

/** "YYYY-MM-DD" a partir de sus campos. */
export function formatearFechaLocal(fecha: FechaCivil): string {
  return `${fecha.anio}-${dos(fecha.mes)}-${dos(fecha.dia)}`;
}

/** El día del salón en el que cae un instante: "2026-10-25". */
export function fechaLocal(instante: Date, zonaHoraria: string): string {
  return formatearFechaLocal(enZona(instante, zonaHoraria));
}

/**
 * Trocea "YYYY-MM-DD" comprobando que la fecha exista. Lanza si no: una fecha
 * que viene de la URL no se puede dar por buena, y "2026-02-31" pasaría el
 * formato y acabaría siendo el 3 de marzo si se dejara a `Date.UTC`.
 */
export function descomponerFechaLocal(fecha: string): FechaCivil {
  const encaje = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fecha).trim());
  if (!encaje) {
    throw new Error(`La fecha "${fecha}" no tiene el formato YYYY-MM-DD.`);
  }
  const anio = Number(encaje[1]);
  const mes = Number(encaje[2]);
  const dia = Number(encaje[3]);
  const civil = new Date(Date.UTC(anio, mes - 1, dia));
  if (civil.getUTCFullYear() !== anio || civil.getUTCMonth() !== mes - 1 || civil.getUTCDate() !== dia) {
    throw new Error(`La fecha "${fecha}" no existe.`);
  }
  return { anio, mes, dia };
}

/**
 * La fecha civil que está `dias` días después (o antes, si es negativo).
 * Se avanza con `Date.UTC`, que normaliza el 32 de octubre al 1 de noviembre
 * sin que la zona horaria ni el cambio de hora pinten nada.
 */
export function desplazarFechaLocal(fecha: string, dias: number): string {
  const { anio, mes, dia } = descomponerFechaLocal(fecha);
  const civil = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return formatearFechaLocal({
    anio: civil.getUTCFullYear(),
    mes: civil.getUTCMonth() + 1,
    dia: civil.getUTCDate(),
  });
}

/** Día de la semana ISO (1 lunes ... 7 domingo) de una fecha "YYYY-MM-DD". */
export function diaSemanaIso(fecha: string): DiaSemanaIso {
  const { anio, mes, dia } = descomponerFechaLocal(fecha);
  const dow = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  return (dow === 0 ? 7 : dow) as DiaSemanaIso;
}
