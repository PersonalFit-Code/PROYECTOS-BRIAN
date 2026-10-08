/**
 * Acceso a los negocios. Es el unico sitio desde el que se lee Firestore.
 *
 * Nada de aqui lanza: ante cualquier problema (sin Firebase, documento que no
 * existe, datos incompletos) se devuelve el negocio de ejemplo y se avisa por
 * consola. Una llamada de telefono en curso no se puede caer porque falte un
 * campo en la base de datos.
 */

import { fallbackBusiness } from "./fallbackBusiness";
import { firestore } from "./firebase";
import type { Accion, Business } from "./types";

const COLECCION = "businesses";

/**
 * Cache en memoria. Los tool-calls llegan varias veces por llamada y cada uno
 * necesita la carta, asi que sin cache se golpearia Firestore en cada uno. Con
 * un TTL corto los cambios de carta o de horario entran en caliente, sin
 * reiniciar el servidor.
 */
const TTL_MS = 60_000;

const cache = new Map<string, { business: Business; expira: number }>();

/** Para los tests y para forzar una relectura despues de cambiar un negocio. */
export function invalidateBusinessCache(id?: string): void {
  if (id === undefined) {
    cache.clear();
    return;
  }
  cache.delete(id.trim());
}

// Los avisos de "no hay Firebase" se dan una vez, no en cada tool-call.
let avisadoSinFirebase = false;
let avisadoSinId = false;

function esTextoNoVacio(valor: unknown): boolean {
  return typeof valor === "string" && valor.trim().length > 0;
}

const ACCIONES_VALIDAS: readonly Accion[] = ["pedidos", "reservas"];

/**
 * Comprueba el documento campo a campo y devuelve los que faltan o vienen mal,
 * para poder decir en el log exactamente que es lo que no cuadra.
 *
 * Se exporta para poder probarlo sin levantar Firestore.
 */
export function camposQueFaltan(valor: unknown): string[] {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return ["(el documento no es un objeto)"];
  }

  const doc = valor as Record<string, unknown>;
  const faltan: string[] = [];

  const textos = [
    "id",
    "nombre",
    "ciudad",
    "direccion",
    "zonaReparto",
    "zonaHoraria",
    "tipoLabel",
    "categorias",
    "categoriasSingular",
    "pago",
  ];
  for (const campo of textos) {
    if (!esTextoNoVacio(doc[campo])) faltan.push(campo);
  }

  // emailPedidos puede estar vacio, pero tiene que ser texto.
  if (typeof doc.emailPedidos !== "string") faltan.push("emailPedidos");

  const acciones = doc.acciones;
  if (
    !Array.isArray(acciones) ||
    acciones.length === 0 ||
    !acciones.every((accion) =>
      ACCIONES_VALIDAS.includes(accion as Accion),
    )
  ) {
    faltan.push("acciones");
  }

  const horario = doc.horario;
  if (!horario || typeof horario !== "object" || Array.isArray(horario)) {
    faltan.push("horario");
  } else {
    const h = horario as Record<string, unknown>;
    for (const campo of ["texto", "ultimoPedidoReparto", "diaCierre"]) {
      if (!esTextoNoVacio(h[campo])) faltan.push(`horario.${campo}`);
    }
  }

  const entrega = doc.entrega;
  if (!entrega || typeof entrega !== "object" || Array.isArray(entrega)) {
    faltan.push("entrega");
  } else {
    const e = entrega as Record<string, unknown>;
    if (typeof e.disponible !== "boolean") faltan.push("entrega.disponible");
    for (const campo of ["gastosEnvioCentimos", "envioGratisDesdeCentimos"]) {
      const importe = e[campo];
      if (typeof importe !== "number" || !Number.isFinite(importe) || importe < 0) {
        faltan.push(`entrega.${campo}`);
      }
    }
    for (const campo of ["tiempoReparto", "tiempoRecogida"]) {
      if (!esTextoNoVacio(e[campo])) faltan.push(`entrega.${campo}`);
    }
  }

  const carta = doc.carta;
  if (!Array.isArray(carta) || carta.length === 0) {
    faltan.push("carta");
  } else {
    for (const [indice, plato] of carta.entries()) {
      if (!plato || typeof plato !== "object" || Array.isArray(plato)) {
        faltan.push(`carta[${indice}]`);
        continue;
      }
      const p = plato as Record<string, unknown>;
      for (const campo of ["id", "nombre", "descripcion"]) {
        if (!esTextoNoVacio(p[campo])) faltan.push(`carta[${indice}].${campo}`);
      }
      const precio = p.precioCentimos;
      if (
        typeof precio !== "number" ||
        !Number.isInteger(precio) ||
        precio < 0
      ) {
        faltan.push(`carta[${indice}].precioCentimos`);
      }
    }
  }

  return faltan;
}

/** Type guard estructural: el documento sirve como Business. */
function esBusiness(valor: unknown): valor is Business {
  return camposQueFaltan(valor).length === 0;
}

/**
 * Devuelve el negocio pedido. Si no se puede, devuelve el de ejemplo: el
 * agente sigue atendiendo la llamada aunque sea con la carta de muestra.
 */
export async function getBusiness(id: string): Promise<Business> {
  if (!firestore) {
    if (!avisadoSinFirebase) {
      console.warn("Firebase no configurado, usando negocio de ejemplo.");
      avisadoSinFirebase = true;
    }
    return fallbackBusiness;
  }

  const buscado = id.trim();
  if (!buscado) {
    if (!avisadoSinId) {
      console.warn(
        "No se ha indicado ningun negocio, usando negocio de ejemplo.",
      );
      avisadoSinId = true;
    }
    return fallbackBusiness;
  }

  const enCache = cache.get(buscado);
  if (enCache && enCache.expira > Date.now()) {
    return enCache.business;
  }

  try {
    const documento = await firestore
      .collection(COLECCION)
      .doc(buscado)
      .get();

    if (!documento.exists) {
      console.warn(
        `El negocio "${buscado}" no existe en /${COLECCION}, usando negocio de ejemplo.`,
      );
      return fallbackBusiness;
    }

    // El id del documento manda sobre el campo id, si viniera distinto.
    const datos: unknown = { ...documento.data(), id: documento.id };

    if (!esBusiness(datos)) {
      console.error(
        `El negocio "${buscado}" tiene datos incompletos, usando negocio de ejemplo. Campos con problemas: ${camposQueFaltan(datos).join(", ")}`,
      );
      return fallbackBusiness;
    }

    cache.set(buscado, { business: datos, expira: Date.now() + TTL_MS });
    return datos;
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(
      `Error leyendo el negocio "${buscado}", usando negocio de ejemplo: ${motivo}`,
    );
    return fallbackBusiness;
  }
}
