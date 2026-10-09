/**
 * Lectura de las llamadas a herramientas que manda Vapi en un "tool-calls".
 *
 * Vapi no manda siempre la misma forma. En una llamada real llegaron los dos
 * arrays a la vez, con la misma llamada repetida, y en toolCallList el nombre
 * y los argumentos venian dentro de "function", no en el primer nivel como
 * dice la documentacion. Leer solo una de las formas dejaba el nombre en
 * undefined: el servidor contestaba "herramienta no disponible", el modelo
 * se inventaba el total y el pedido no se registraba.
 *
 * Por eso aqui se aceptan todas las variantes conocidas y, cuando la misma
 * llamada llega dos veces, cada dato se toma de la copia que lo traiga.
 */

import type { VapiMessage } from "../types/vapi";

export interface LlamadaHerramienta {
  id: string;
  nombre: string;
  argumentos: Record<string, unknown>;
}

/** Los argumentos pueden llegar como objeto o como JSON en texto. */
export function parseArgs(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function comoObjeto(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === "object" && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : {};
}

function primerTexto(...valores: unknown[]): string {
  for (const valor of valores) {
    if (typeof valor === "string" && valor.trim() !== "") return valor.trim();
  }
  return "";
}

/** Una llamada suelta, venga en el formato que venga. */
function leerLlamada(bruto: unknown): LlamadaHerramienta | null {
  const item = comoObjeto(bruto);
  const id = primerTexto(item.id);
  if (!id) return null;

  const funcion = comoObjeto(item.function);
  const nombre = primerTexto(item.name, funcion.name);

  // El primer campo que traiga argumentos de verdad; uno vacio no tapa a otro.
  let argumentos: Record<string, unknown> = {};
  for (const candidato of [
    item.parameters,
    item.arguments,
    funcion.arguments,
    funcion.parameters,
  ]) {
    const leidos = parseArgs(candidato);
    if (Object.keys(leidos).length > 0) {
      argumentos = leidos;
      break;
    }
  }

  return { id, nombre, argumentos };
}

export function normalizarLlamadas(message: VapiMessage): LlamadaHerramienta[] {
  const porId = new Map<string, LlamadaHerramienta>();
  const brutos: unknown[] = [
    ...(Array.isArray(message.toolCallList) ? message.toolCallList : []),
    ...(Array.isArray(message.toolCalls) ? message.toolCalls : []),
  ];

  for (const bruto of brutos) {
    const llamada = leerLlamada(bruto);
    if (!llamada) continue;

    const previa = porId.get(llamada.id);
    if (!previa) {
      porId.set(llamada.id, llamada);
      continue;
    }
    // Misma llamada repetida: se completa lo que le faltara a la primera.
    porId.set(llamada.id, {
      id: llamada.id,
      nombre: previa.nombre || llamada.nombre,
      argumentos:
        Object.keys(previa.argumentos).length > 0
          ? previa.argumentos
          : llamada.argumentos,
    });
  }

  return [...porId.values()];
}
