/**
 * A quién se le asigna una cita cuando la clienta dijo "me da igual".
 *
 * El motor de huecos ofrece la unión de lo que pueden todas; la profesional
 * concreta se decide al hacer el hold, aquí, y con un criterio que se pueda
 * explicar en una frase: la que menos minutos tenga ocupados ese día. Así el
 * trabajo se reparte en vez de caer siempre en la primera de la lista, que es
 * lo que pasaría si se cogiera la primera candidata sin más.
 *
 * Puro, como el resto de `booking/`: los tramos ocupados entran por parámetro.
 */

import { fusionar } from "./slots";
import { descomponerFechaLocal, fechaLocal, instanteEnZona } from "./tz";
import type { Intervalo } from "./types";

const MINUTOS = 60_000;

/**
 * Minutos que una profesional tiene ocupados en un día local ("YYYY-MM-DD").
 *
 * Se cuenta solo la parte de cada tramo que cae dentro del día: unas
 * vacaciones de una semana no suman siete días a cada uno de ellos. Los tramos
 * que se solapan (un hold encima de una ausencia) se cuentan una vez. Una
 * profesional sin entrada en `ocupado` tiene cero minutos.
 */
export function minutosOcupadosEnDia(
  staffId: string,
  fecha: string,
  ocupado: Readonly<Record<string, readonly Intervalo[]>>,
  zona: string,
): number {
  const { anio, mes, dia } = descomponerFechaLocal(fecha);
  const inicioDia = instanteEnZona(anio, mes, dia, 0, 0, zona).getTime();
  // El día acaba cuando empieza el siguiente en el reloj local: 23, 24 o 25
  // horas según toque cambio de hora, no 24 fijas.
  const siguiente = new Date(Date.UTC(anio, mes - 1, dia + 1));
  const finDia = instanteEnZona(
    siguiente.getUTCFullYear(),
    siguiente.getUTCMonth() + 1,
    siguiente.getUTCDate(),
    0,
    0,
    zona,
  ).getTime();

  let ms = 0;
  for (const tramo of fusionar(ocupado[staffId] ?? [])) {
    const desde = Math.max(tramo.desde.getTime(), inicioDia);
    const hasta = Math.min(tramo.hasta.getTime(), finDia);
    if (hasta > desde) ms += hasta - desde;
  }
  return Math.round(ms / MINUTOS);
}

/**
 * La candidata con menos minutos ocupados el día de la cita. En caso de
 * empate, la primera de la lista: el orden de entrada es el `position` del
 * panel, así que Andrea decide quién va por delante.
 */
export function elegirProfesional(
  inicio: Date,
  candidatas: readonly string[],
  ocupado: Readonly<Record<string, readonly Intervalo[]>>,
  zona: string,
): string {
  const fecha = fechaLocal(inicio, zona);
  let elegida: string | undefined;
  let menor = Infinity;
  for (const id of candidatas) {
    const minutos = minutosOcupadosEnDia(id, fecha, ocupado, zona);
    // Estrictamente menor: a igualdad se queda la que ya estaba, la primera.
    if (elegida === undefined || minutos < menor) {
      elegida = id;
      menor = minutos;
    }
  }
  if (elegida === undefined) {
    throw new Error("No hay ninguna profesional candidata a la que asignar la cita.");
  }
  return elegida;
}
