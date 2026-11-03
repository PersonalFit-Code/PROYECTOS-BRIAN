/**
 * Reseñas reales de clientes. Su web no publica ninguna, así que la lista está VACÍA y la sección de
 * opiniones no se pinta. Cuando Jose pase 3 o más (de Google, de su Instagram o de pedidos de
 * WooCommerce), se copian aquí tal cual, con nombre y producto, y la sección aparece sola.
 */
export interface Opinion {
  autor: string;
  texto: string;
  producto?: string;
  /** De dónde sale, para poder enlazarla o justificarla. */
  fuente: "Google" | "Instagram" | "Pedido";
}

export const OPINIONES: readonly Opinion[] = [];
