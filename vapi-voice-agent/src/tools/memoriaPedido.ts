/**
 * Los platos del pedido, leidos aunque el modelo los mande raros, y
 * recordados por llamada.
 *
 * Paso en una prueba real: calcular_total recibio los platos bien, el cliente
 * confirmo, y registrar_pedido llego tres veces sin ellos ("El pedido no lleva
 * ningun plato"). El agente le hizo repetir el pedido al cliente una y otra
 * vez hasta que colgo. El modelo, en la herramienta con mas campos, a veces
 * manda la lista como texto JSON, o como un objeto suelto, o no la manda.
 *
 * Dos defensas:
 * 1. Se acepta la lista en cualquiera de esas formas.
 * 2. Lo que calculo calcular_total se guarda por llamada. Es justo lo que se
 *    le leyo al cliente y lo que confirmo, asi que si registrar_pedido llega
 *    sin platos se usa eso, en vez de volver a molestar al cliente.
 */

import type { LineaPedido } from "../pedido";

/** Lee la lista de platos venga como venga. Vacia si no hay nada usable. */
export function leerArticulos(valor: unknown): LineaPedido[] {
  if (typeof valor === "string") {
    const texto = valor.trim();
    if (!texto) return [];
    try {
      return leerArticulos(JSON.parse(texto));
    } catch {
      return [];
    }
  }
  if (Array.isArray(valor)) {
    return valor.flatMap((item) => leerArticulos(item));
  }
  if (valor && typeof valor === "object") {
    const objeto = valor as Record<string, unknown>;
    // Un plato suelto: { plato, cantidad }.
    if (typeof objeto.plato === "string") {
      return [{ plato: objeto.plato, cantidad: (objeto.cantidad ?? 1) as number }];
    }
    // La lista envuelta: { articulos: [...] }.
    if ("articulos" in objeto) return leerArticulos(objeto.articulos);
    // Un mapa { "p-margaritha": 2 }.
    const entradas = Object.entries(objeto);
    if (entradas.length > 0 && entradas.every(([, n]) => typeof n === "number")) {
      return entradas.map(([plato, cantidad]) => ({ plato, cantidad: cantidad as number }));
    }
  }
  return [];
}

interface Recordado {
  articulos: LineaPedido[];
  entrega: unknown;
  expira: number;
}

/** Una llamada no dura mas de 10 minutos (maxDurationSeconds); sobra con 1 hora. */
const DURACION_MS = 60 * 60 * 1000;
const recordados = new Map<string, Recordado>();

/** Se llama cuando calcular_total ha ido bien. */
export function recordarPedido(callId: string, articulos: LineaPedido[], entrega: unknown): void {
  if (!callId || articulos.length === 0) return;
  const ahora = Date.now();
  for (const [id, r] of recordados) if (r.expira < ahora) recordados.delete(id);
  recordados.set(callId, { articulos, entrega, expira: ahora + DURACION_MS });
}

/**
 * Lo que hay que registrar: lo que mande el modelo si trae platos; si no, lo
 * ultimo que se calculo en esta llamada. `deMemoria` dice si se ha tirado de
 * lo recordado, para dejarlo en el log.
 */
export function pedidoParaRegistrar(
  callId: string,
  argumentos: Record<string, unknown>,
): { articulos: LineaPedido[]; entrega: unknown; deMemoria: boolean } {
  const articulos = leerArticulos(argumentos.articulos);
  const recordado = recordados.get(callId);
  const entrega = argumentos.entrega ?? recordado?.entrega;

  if (articulos.length > 0) return { articulos, entrega, deMemoria: false };
  if (recordado && recordado.expira > Date.now()) {
    return { articulos: recordado.articulos, entrega, deMemoria: true };
  }
  return { articulos: [], entrega, deMemoria: false };
}

/** Para los tests. */
export function olvidarPedidos(): void {
  recordados.clear();
}
