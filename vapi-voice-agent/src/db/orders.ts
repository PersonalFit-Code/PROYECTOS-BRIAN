/**
 * Guardado de pedidos en Firestore, en /businesses/{businessId}/pedidos.
 *
 * Es el final del recorrido de una llamada: hasta aqui el agente solo hablaba.
 * Dos decisiones importantes:
 *
 * - El total NO lo manda el modelo. Se recalcula aqui contra la carta del
 *   negocio, de modo que lo que queda guardado es lo mismo que el agente dijo
 *   en voz alta y no lo que el modelo crea recordar.
 * - Si no se puede guardar, no se finge que si. Quien llame a esta funcion
 *   recibe el error y debe decirle al cliente que confirme por telefono; el
 *   pedido se vuelca ademas al log para no perderlo.
 */

import { FieldValue } from "firebase-admin/firestore";

import { calcularTotal, type LineaPedido, type TotalPedido } from "../pedido";
import { firestore } from "./firebase";
import type { Business, Pedido, TipoEntrega } from "./types";

const SUBCOLECCION = "pedidos";

/** Datos que llegan de la herramienta registrar_pedido. */
export interface DatosPedido {
  articulos: readonly LineaPedido[];
  entrega: unknown;
  direccion?: string;
  telefono?: string;
  notas?: string;
  callId?: string;
}

export class PedidoNoGuardadoError extends Error {}

/**
 * Alfabeto sin caracteres que se confunden al deletrearlos por telefono: sin
 * O ni 0, sin I ni 1, sin S ni 5.
 */
const ALFABETO = "ABCDEFGHJKLMNPQRTUVWXYZ2346789";

function generarCodigo(): string {
  let codigo = "";
  for (let i = 0; i < 4; i += 1) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/**
 * Construye el pedido a partir del total ya calculado. Se separa del guardado
 * para poder comprobarlo sin tocar Firestore.
 */
export function construirPedido(
  business: Business,
  datos: DatosPedido,
  total: TotalPedido,
): Pedido {
  const direccion = texto(datos.direccion);

  if (total.tipoEntrega === "reparto" && !direccion) {
    throw new PedidoNoGuardadoError(
      "falta la direccion de entrega, que es obligatoria para el reparto",
    );
  }

  return {
    codigo: generarCodigo(),
    businessId: business.id,
    lineas: total.lineas.map((linea) => ({
      platoId: linea.platoId,
      nombre: linea.nombre,
      cantidad: linea.cantidad,
      precioUnidadCentimos: linea.precioUnidadCentimos,
      importeCentimos: linea.importeCentimos,
    })),
    subtotalCentimos: total.subtotalCentimos,
    gastosEnvioCentimos: total.gastosEnvioCentimos,
    totalCentimos: total.totalCentimos,
    tipoEntrega: total.tipoEntrega as TipoEntrega,
    direccion,
    telefono: texto(datos.telefono),
    notas: texto(datos.notas),
    callId: texto(datos.callId),
    estado: "pendiente",
    creadoEnIso: new Date().toISOString(),
  };
}

/**
 * Recalcula el total, arma el pedido y lo guarda. Devuelve el pedido guardado,
 * con su codigo, para que el agente se lo lea al cliente.
 */
export async function guardarPedido(
  business: Business,
  datos: DatosPedido,
): Promise<Pedido> {
  // El total se recalcula aqui: es la misma funcion que uso calcular_total.
  const total = calcularTotal(business, datos.articulos, datos.entrega);
  const pedido = construirPedido(business, datos, total);

  if (!firestore) {
    // Sin base de datos no se puede guardar. Se vuelca al log para que quede
    // rastro y se avisa hacia arriba: el agente no debe decir que esta hecho.
    console.error(
      "[pedido] NO GUARDADO, Firebase no configurado:",
      JSON.stringify(pedido),
    );
    throw new PedidoNoGuardadoError("la base de datos no esta configurada");
  }

  try {
    const documento = await firestore
      .collection("businesses")
      .doc(business.id)
      .collection(SUBCOLECCION)
      .add({ ...pedido, creadoEn: FieldValue.serverTimestamp() });

    console.log(
      `[pedido] guardado ${pedido.codigo} (${documento.id}) para ${business.id}: ${pedido.totalCentimos} centimos`,
    );
    return pedido;
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(
      `[pedido] NO GUARDADO, error de Firestore (${motivo}):`,
      JSON.stringify(pedido),
    );
    throw new PedidoNoGuardadoError(`no se ha podido guardar: ${motivo}`);
  }
}
