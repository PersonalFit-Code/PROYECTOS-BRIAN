/**
 * Formato de importes y fechas.
 *
 * Estas funciones estan duplicadas ahora mismo en src/restaurant.ts. Cuando se
 * complete el refactor a Business, este fichero sera la fuente canonica y las
 * de alli desapareceran. Son puras a proposito: no leen ningun negocio, todo
 * entra por parametro.
 */

/** Formatea centimos como "9,50 €", en castellano. */
export function formatearEuros(centimos: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(centimos / 100);
}

/**
 * Fecha y hora actuales en la zona del negocio, para situar al agente.
 * A diferencia de la version de restaurant.ts, la zona horaria se recibe por
 * parametro: cada negocio puede tener la suya.
 */
export function momentoActual(zonaHoraria: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: zonaHoraria,
  }).format(new Date());
}
