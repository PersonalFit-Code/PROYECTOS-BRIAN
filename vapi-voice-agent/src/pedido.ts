/**
 * Calculo del total del pedido. Vive en el servidor a proposito: un modelo de
 * lenguaje sumando precios de viva voz se equivoca, y aqui el importe sale de
 * la misma carta que el agente ha leido al cliente.
 */

import {
  buscarPlato,
  formatearEuros,
  restaurante,
  type MenuItem,
} from "./restaurant";

export type TipoEntrega = "reparto" | "recogida";

export interface LineaPedido {
  plato: string;
  cantidad: number;
}

export interface LineaCalculada {
  nombre: string;
  cantidad: number;
  precioUnidadCentimos: number;
  importeCentimos: number;
}

export interface TotalPedido {
  lineas: LineaCalculada[];
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

export function calcularTotal(
  lineas: readonly LineaPedido[],
  tipoEntregaBruto: unknown,
): TotalPedido {
  if (!Array.isArray(lineas) || lineas.length === 0) {
    throw new PedidoInvalidoError("El pedido no lleva ningun plato.");
  }

  const tipoEntrega = normalizarTipoEntrega(tipoEntregaBruto);

  const calculadas: LineaCalculada[] = lineas.map((linea) => {
    const plato: MenuItem | undefined = buscarPlato(String(linea.plato ?? ""));
    if (!plato) {
      const disponibles = restaurante.carta.map((p) => p.nombre).join(", ");
      throw new PedidoInvalidoError(
        `"${linea.plato}" no esta en la carta. Solo hay: ${disponibles}.`,
      );
    }
    const cantidad = normalizarCantidad(linea.cantidad, plato.nombre);
    return {
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
    subtotalCentimos >= restaurante.entrega.envioGratisDesdeCentimos;

  const gastosEnvioCentimos = envioGratis
    ? 0
    : restaurante.entrega.gastosEnvioCentimos;

  return {
    lineas: calculadas,
    subtotalCentimos,
    gastosEnvioCentimos,
    totalCentimos: subtotalCentimos + gastosEnvioCentimos,
    envioGratis,
    tipoEntrega,
  };
}

/**
 * Convierte el calculo en una frase que el agente pueda leer en voz alta.
 * Vapi entrega el resultado de la herramienta al modelo como texto, asi que
 * sale mas fiable una frase ya redactada que un JSON que el modelo reinterprete.
 */
export function describirTotal(total: TotalPedido): string {
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
      `Envio gratis por superar ${formatearEuros(restaurante.entrega.envioGratisDesdeCentimos)}.`,
    );
  } else {
    partes.push(
      `Gastos de envio: ${formatearEuros(total.gastosEnvioCentimos)}.`,
    );
  }

  partes.push(`Total a pagar: ${formatearEuros(total.totalCentimos)}.`);
  return partes.join(" ");
}
