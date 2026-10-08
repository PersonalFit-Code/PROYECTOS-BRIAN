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
 * - Una llamada, un pedido. El documento se guarda con el identificador de la
 *   llamada como clave, asi que un reintento de Vapi o una segunda llamada a
 *   la herramienta no pueden crear un pedido repetido.
 */

import { FieldValue } from "firebase-admin/firestore";

import { calcularTotal, type LineaPedido, type TotalPedido } from "../pedido";
import { firestore } from "./firebase";
import type {
  Business,
  Pedido,
  PedidoConId,
  TipoEntrega,
} from "./types";

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

export interface ResultadoGuardado {
  pedido: Pedido;
  /**
   * true cuando ya habia un pedido para esta llamada: no se ha vuelto a
   * guardar y lo que se devuelve es el que ya estaba.
   */
  yaExistia: boolean;
}

/** Codigo gRPC de Firestore cuando el documento ya existe. */
const YA_EXISTE = 6;

function esDocumentoYaExistente(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === YA_EXISTE
  );
}

/**
 * El identificador de la llamada hace de clave del pedido. Se limpia de
 * caracteres que Firestore no admite en un id de documento.
 */
function idDocumento(callId: string): string {
  return callId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 200);
}

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
): Promise<ResultadoGuardado> {
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

  const coleccion = firestore
    .collection("businesses")
    .doc(business.id)
    .collection(SUBCOLECCION);

  // Con identificador de llamada, ese es el id del documento; sin el no hay
  // forma de reconocer un repetido y se deja que Firestore ponga uno.
  const clave = idDocumento(texto(datos.callId));
  const documento = clave ? coleccion.doc(clave) : coleccion.doc();

  try {
    // create() falla si el documento ya existe, y esa es justo la proteccion:
    // la comprobacion y la escritura son una sola operacion, sin ventana por
    // la que se cuelen dos pedidos a la vez.
    await documento.create({
      ...pedido,
      creadoEn: FieldValue.serverTimestamp(),
    });

    console.log(
      `[pedido] guardado ${pedido.codigo} (${documento.id}) para ${business.id}: ${pedido.totalCentimos} centimos`,
    );
    return { pedido, yaExistia: false };
  } catch (error) {
    if (esDocumentoYaExistente(error)) {
      const anterior = (await documento.get()).data() as Pedido | undefined;
      if (anterior) {
        console.warn(
          `[pedido] la llamada ${clave} ya tenia el pedido ${anterior.codigo}; no se guarda otro`,
        );
        return { pedido: anterior, yaExistia: true };
      }
    }
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(
      `[pedido] NO GUARDADO, error de Firestore (${motivo}):`,
      JSON.stringify(pedido),
    );
    throw new PedidoNoGuardadoError(`no se ha podido guardar: ${motivo}`);
  }
}

/**
 * Instante en que empezo el dia de hoy en la zona horaria del negocio.
 *
 * No vale con la medianoche del servidor: puede estar en otro huso, y "los
 * pedidos de hoy" significa los de hoy en el restaurante.
 */
export function comienzoDelDia(zonaHoraria: string, ahora = new Date()): Date {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(ahora);

  const buscar = (tipo: string): number =>
    Number(partes.find((parte) => parte.type === tipo)?.value ?? "0");

  // Diferencia entre la hora local del negocio y la UTC, en milisegundos.
  const comoSiFueraUtc = Date.UTC(
    buscar("year"),
    buscar("month") - 1,
    buscar("day"),
    buscar("hour") === 24 ? 0 : buscar("hour"),
    buscar("minute"),
    buscar("second"),
  );
  const desfase = comoSiFueraUtc - Math.floor(ahora.getTime() / 1000) * 1000;

  const medianocheLocal = Date.UTC(
    buscar("year"),
    buscar("month") - 1,
    buscar("day"),
  );
  return new Date(medianocheLocal - desfase);
}

export interface FiltroPedidos {
  /** Solo los del dia en curso en la zona del negocio. Por defecto, si. */
  soloHoy?: boolean;
  zonaHoraria?: string;
  limite?: number;
}

/**
 * Pedidos de un negocio, del mas reciente al mas antiguo.
 *
 * Devuelve lista vacia si no hay Firestore o si la consulta falla: el panel
 * tiene que poder dibujarse igual y decir que no hay nada, en lugar de
 * reventar con un error en la cara.
 */
export async function listarPedidos(
  businessId: string,
  filtro: FiltroPedidos = {},
): Promise<PedidoConId[]> {
  if (!firestore) return [];

  const { soloHoy = true, zonaHoraria = "Europe/Madrid", limite = 100 } = filtro;

  try {
    let consulta = firestore
      .collection("businesses")
      .doc(businessId)
      .collection(SUBCOLECCION)
      .orderBy("creadoEn", "desc")
      .limit(limite);

    if (soloHoy) {
      // El rango y el orden van sobre el mismo campo, asi que Firestore no
      // necesita ningun indice compuesto para esto.
      consulta = consulta.where("creadoEn", ">=", comienzoDelDia(zonaHoraria));
    }

    const resultado = await consulta.get();
    return resultado.docs.map((documento) => ({
      ...(documento.data() as Pedido),
      docId: documento.id,
    }));
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(`[pedidos] no se han podido leer los de ${businessId}: ${motivo}`);
    return [];
  }
}

/**
 * Marca un pedido como atendido. Devuelve false si no se pudo, para que el
 * panel lo diga en lugar de aparentar que si.
 */
export async function marcarAtendido(
  businessId: string,
  docId: string,
): Promise<boolean> {
  if (!firestore || !docId) return false;

  try {
    await firestore
      .collection("businesses")
      .doc(businessId)
      .collection(SUBCOLECCION)
      .doc(docId)
      .update({ estado: "atendido", atendidoEnIso: new Date().toISOString() });

    console.log(`[pedido] ${docId} marcado como atendido en ${businessId}`);
    return true;
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(`[pedido] no se ha podido marcar ${docId}: ${motivo}`);
    return false;
  }
}
