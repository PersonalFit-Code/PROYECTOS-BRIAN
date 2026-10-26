/**
 * Calculo del total del pedido. Vive en el servidor a proposito: un modelo de
 * lenguaje sumando precios de viva voz se equivoca, y aqui el importe sale de
 * la misma carta que el agente ha leido al cliente.
 *
 * Todo entra por parametro: el negocio decide la carta y los gastos de envio,
 * asi que el mismo calculo sirve para cualquier local.
 */

import type { Business, MenuItem } from "./db/types";
import { buscarPlato } from "./util/carta";
import { formatearEuros } from "./util/format";

export type TipoEntrega = "reparto" | "recogida";

export interface LineaPedido {
  plato: string;
  cantidad: number;
}

export interface LineaCalculada {
  /** Identificador del plato en la carta, para guardarlo con el pedido. */
  platoId: string;
  nombre: string;
  cantidad: number;
  precioUnidadCentimos: number;
  importeCentimos: number;
}

export interface TotalPedido {
  lineas: LineaCalculada[];
  /** Unidades que hay que cocinar: todo menos bebidas y postres hechos. */
  unidadesACocinar: number;
  subtotalCentimos: number;
  gastosEnvioCentimos: number;
  totalCentimos: number;
  envioGratis: boolean;
  tipoEntrega: TipoEntrega;
}

export class PedidoInvalidoError extends Error {}

const MAX_UNIDADES_POR_LINEA = 20;

function normalizarCantidad(valor: unknown, nombrePlato: string): number {
  const cantidad = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new PedidoInvalidoError(
      `La cantidad de "${nombrePlato}" tiene que ser un numero entero de al menos 1.`,
    );
  }
  if (cantidad > MAX_UNIDADES_POR_LINEA) {
    throw new PedidoInvalidoError(
      `No se pueden pedir mas de ${MAX_UNIDADES_POR_LINEA} unidades de "${nombrePlato}" por telefono.`,
    );
  }
  return cantidad;
}

function normalizarTipoEntrega(valor: unknown): TipoEntrega {
  if (valor === "reparto" || valor === "recogida") return valor;
  throw new PedidoInvalidoError(
    'El tipo de entrega tiene que ser "reparto" o "recogida".',
  );
}

/**
 * Lo maximo que se le puede recitar a un negocio con carta corta. Por encima
 * de esto se le recuerda al modelo que ya la tiene y se le deja preguntar.
 */
const CARTA_QUE_CABE = 12;

/**
 * Que decirle al modelo cuando pide un plato que no existe.
 *
 * Con una carta corta se le devuelven los nombres, que es lo mas util. Con
 * una carta larga NO: La Vita Buona tiene 63 platos, y devolver los 63 en una
 * linea hace que el modelo se los lea en voz alta al cliente. La carta
 * completa ya la tiene en sus instrucciones, asi que basta recordarselo.
 */
function recordatorioDeCarta(business: Business): string {
  if (business.carta.length <= CARTA_QUE_CABE) {
    return `Solo hay: ${business.carta.map((p) => p.nombre).join(", ")}.`;
  }
  return (
    `La carta tiene ${business.carta.length} platos y la tienes entera en tus ` +
    "instrucciones. No se la leas al cliente: preguntale que le apetece y " +
    "ofrecele dos o tres opciones de las que haya."
  );
}

export function calcularTotal(
  business: Business,
  lineas: readonly LineaPedido[],
  tipoEntregaBruto: unknown,
): TotalPedido {
  if (!Array.isArray(lineas) || lineas.length === 0) {
    throw new PedidoInvalidoError(
      'El pedido no lleva ningun plato. Manda "articulos" como una lista de objetos, por ejemplo [{"plato": "identificador-de-la-carta", "cantidad": 1}], con todos los platos que ha pedido.',
    );
  }

  const tipoEntrega = normalizarTipoEntrega(tipoEntregaBruto);

  let sinCocina = 0;
  const calculadas: LineaCalculada[] = lineas.map((linea) => {
    const plato: MenuItem | undefined = buscarPlato(
      business.carta,
      String(linea.plato ?? ""),
    );
    if (!plato) {
      throw new PedidoInvalidoError(
        `"${linea.plato}" no esta en la carta. ${recordatorioDeCarta(business)}`,
      );
    }
    const cantidad = normalizarCantidad(linea.cantidad, plato.nombre);
    if (plato.sinCocina) sinCocina += cantidad;
    return {
      platoId: plato.id,
      nombre: plato.nombre,
      cantidad,
      precioUnidadCentimos: plato.precioCentimos,
      importeCentimos: plato.precioCentimos * cantidad,
    };
  });

  const subtotalCentimos = calculadas.reduce(
    (suma, linea) => suma + linea.importeCentimos,
    0,
  );

  const envioGratis =
    tipoEntrega === "recogida" ||
    subtotalCentimos >= business.entrega.envioGratisDesdeCentimos;

  const gastosEnvioCentimos = envioGratis
    ? 0
    : business.entrega.gastosEnvioCentimos;

  const unidades = calculadas.reduce((suma, linea) => suma + linea.cantidad, 0);

  return {
    lineas: calculadas,
    unidadesACocinar: unidades - sinCocina,
    subtotalCentimos,
    gastosEnvioCentimos,
    totalCentimos: subtotalCentimos + gastosEnvioCentimos,
    envioGratis,
    tipoEntrega,
  };
}

/**
 * Cuanto tarda un pedido, segun lo grande que sea.
 *
 * Antes el agente decia siempre el tiempo de la ficha ("entre 15 y 20
 * minutos"), tambien para diez pizzas, que no salen en ese tiempo. Ahora el
 * tiempo de la ficha vale para un pedido normal, de hasta UNIDADES_SIN_ESPERA
 * platos a cocinar, y cada tanda de UNIDADES_POR_TANDA mas suma
 * MINUTOS_POR_TANDA a los dos extremos. Diez pizzas para recoger: 15-20 se
 * convierte en 25-30.
 *
 * Los tres numeros son una estimacion razonable para un horno de pizzeria,
 * PENDIENTES DE CONFIRMAR con el local: cuantas pizzas caben a la vez y
 * cuanto tarda cada hornada.
 */
export const UNIDADES_SIN_ESPERA = 4;
export const UNIDADES_POR_TANDA = 3;
export const MINUTOS_POR_TANDA = 5;

export function tiempoEstimado(business: Business, total: TotalPedido): string {
  const base =
    total.tipoEntrega === "recogida"
      ? business.entrega.tiempoRecogida
      : business.entrega.tiempoReparto;
  // "entre 15 y 20 minutos": los dos primeros numeros son el margen. Si la
  // ficha lo escribe de otra forma, se dice tal cual y sin sumar nada.
  const numeros = base.match(/\d+/g);
  if (!numeros || numeros.length < 2) return base;

  const extra = Math.max(0, total.unidadesACocinar - UNIDADES_SIN_ESPERA);
  const tandas = Math.ceil(extra / UNIDADES_POR_TANDA);
  const desde = Number(numeros[0]) + tandas * MINUTOS_POR_TANDA;
  const hasta = Number(numeros[1]) + tandas * MINUTOS_POR_TANDA;
  return `entre ${desde} y ${hasta} minutos`;
}

/**
 * Convierte el calculo en una frase que el agente pueda leer en voz alta.
 * Vapi entrega el resultado de la herramienta al modelo como texto, asi que
 * sale mas fiable una frase ya redactada que un JSON que el modelo reinterprete.
 */
export function describirTotal(
  business: Business,
  total: TotalPedido,
): string {
  const lineas = total.lineas
    .map(
      (linea) =>
        `${linea.cantidad} x ${linea.nombre} = ${formatearEuros(linea.importeCentimos)}`,
    )
    .join("; ");

  const partes = [`Pedido: ${lineas}.`];
  partes.push(`Subtotal: ${formatearEuros(total.subtotalCentimos)}.`);

  if (total.tipoEntrega === "recogida") {
    partes.push("Recogida en el local, sin gastos de envio.");
  } else if (total.envioGratis) {
    partes.push(
      `Envio gratis por superar ${formatearEuros(business.entrega.envioGratisDesdeCentimos)}.`,
    );
  } else {
    partes.push(
      `Gastos de envio: ${formatearEuros(total.gastosEnvioCentimos)}.`,
    );
  }

  partes.push(`Total a pagar: ${formatearEuros(total.totalCentimos)}.`);
  const verbo = total.tipoEntrega === "recogida" ? "Estara listo" : "Llegara";
  partes.push(
    `Tiempo estimado para este pedido: ${verbo.toLowerCase()} ${tiempoEstimado(business, total)}. Di este tiempo, no otro.`,
  );
  return partes.join(" ");
}
