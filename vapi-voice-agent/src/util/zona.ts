/**
 * Horas locales de un negocio, sin librerias de fechas.
 *
 * Todo lo que entra y sale del sistema son instantes absolutos (Date). La zona
 * horaria solo aparece en los bordes: cuando la clinica dice "abrimos a las
 * nueve" y cuando el agente dice "manana a las diez y media". En medio no se
 * razona nunca con horas locales, porque es donde se cuelan los errores.
 *
 * El cambio de hora de marzo y octubre no es un detalle teorico: una agenda
 * que lo ignore ofrece citas una hora corridas durante media estacion.
 */

/**
 * Minutos que la zona va por delante de UTC en ese instante concreto.
 * Positivo en Espana (+60 en invierno, +120 en verano).
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
export interface FechaLocal {
  anio: number;
  mes: number;
  /** Dia del mes, 1-31. */
  dia: number;
  hora: number;
  minuto: number;
  /** Dia de la semana en formato ISO: 1 lunes ... 7 domingo. */
  diaSemana: number;
}

const ISO_POR_DIA: Record<string, number> = {
  Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
};

/** Descompone un instante en la hora local del negocio. */
export function enZona(instante: Date, zonaHoraria: string): FechaLocal {
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
 * Para una agenda de clinica da igual: nadie da cita a las dos y media de la
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
