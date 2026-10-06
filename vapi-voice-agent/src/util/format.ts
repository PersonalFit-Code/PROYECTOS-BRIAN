/**
 * Formato de importes y fechas.
 *
 * Esta es la fuente canonica de estos helpers desde que desaparecio
 * src/restaurant.ts. Son puras a proposito: no leen ningun negocio, todo entra
 * por parametro.
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
 * La zona horaria se recibe por parametro: cada negocio tiene la suya.
 */
export function momentoActual(zonaHoraria: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: zonaHoraria,
  }).format(new Date());
}
