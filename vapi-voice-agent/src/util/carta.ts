/**
 * Busquedas sobre la carta de un negocio.
 *
 * La carta entra por parametro, en lugar de leerse de una constante del
 * modulo: asi la misma busqueda sirve para cualquier negocio.
 */

import type { MenuItem } from "../db/types";

/**
 * Busca un plato por su identificador o por su nombre, sin distinguir
 * mayusculas. El modelo manda el id, pero a veces devuelve el nombre tal como
 * lo ha dicho el cliente.
 */
export function buscarPlato(
  carta: MenuItem[],
  idONombre: string,
): MenuItem | undefined {
  const normalizado = idONombre.trim().toLowerCase();
  return carta.find(
    (plato) =>
      plato.id.toLowerCase() === normalizado ||
      plato.nombre.toLowerCase() === normalizado,
  );
}
