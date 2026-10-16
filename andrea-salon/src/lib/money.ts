/**
 * Dinero en céntimos enteros.
 *
 * Ni un solo número con coma flotante: 0,1 + 0,2 no es 0,3 en JavaScript y un
 * precio que se descuadra un céntimo al sumar propinas es el tipo de error que
 * la dueña detecta y nosotros no. La base de datos guarda `*_cents integer` y
 * aquí se convierte solo en los bordes: al pintar y al leer lo que se teclea.
 *
 * Las funciones que reciben céntimos lanzan `TypeError` si no son enteros:
 * un 25,5 aquí es un error de quien llama, no un dato que se pueda redondear
 * en silencio.
 */

/**
 * Espacio fino de no separación (U+202F) entre la cifra y el símbolo: es el
 * que marca la tipografía para unidades y, al ser de no separación, "25" y "€"
 * nunca acaban en líneas distintas.
 */
export const ESPACIO_FINO = " ";

function comprobarEntero(valor: number, nombre: string): void {
  if (typeof valor !== "number" || !Number.isInteger(valor)) {
    throw new TypeError(`${nombre} tiene que ser un entero en céntimos, no ${String(valor)}.`);
  }
}

/**
 * Separador de miles como en es-ES: "1250" se deja junto y a partir de cinco
 * cifras se agrupa, "12.345". Es lo que hace `Intl` para `es` y lo que
 * recomienda la RAE; se escribe a mano para no depender de los datos ICU del
 * entorno en el que corra.
 */
function agruparMiles(entero: number): string {
  const digitos = String(entero);
  if (digitos.length <= 4) return digitos;
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export interface OpcionesFormatoEuros {
  /**
   * `true`: siempre dos decimales ("25,00 €"). `false`: nunca, redondeando al
   * euro ("25,50 €" -> "26 €"; para precios "desde"). Sin indicar: decimales
   * solo cuando los hay ("25 €", "25,50 €").
   */
  conDecimales?: boolean;
}

/** 2550 -> "25,50 €"; 2500 -> "25 €"; 1234567 -> "12.345,67 €". */
export function formatearEuros(centimos: number, opciones: OpcionesFormatoEuros = {}): string {
  comprobarEntero(centimos, "centimos");
  const { conDecimales } = opciones;

  let valor = centimos;
  if (conDecimales === false) {
    // Mitad hacia arriba en valor absoluto, que es como redondea una persona.
    valor = Math.sign(centimos) * Math.round(Math.abs(centimos) / 100) * 100;
  }

  const negativo = valor < 0;
  const absoluto = Math.abs(valor);
  const euros = Math.trunc(absoluto / 100);
  const resto = absoluto % 100;

  const mostrarDecimales = conDecimales === true || (conDecimales === undefined && resto !== 0);
  const cifra = mostrarDecimales
    ? `${agruparMiles(euros)},${String(resto).padStart(2, "0")}`
    : agruparMiles(euros);

  return `${negativo ? "-" : ""}${cifra}${ESPACIO_FINO}€`;
}

/** Si el texto, sin el separador, son grupos de tres cifras ("1.250.000"). */
function sonGruposDeMiles(entero: string, separador: string): boolean {
  const grupos = entero.split(separador);
  const primero = grupos[0] ?? "";
  return (
    grupos.length >= 2 &&
    primero.length >= 1 &&
    primero.length <= 3 &&
    grupos.slice(1).every((g) => g.length === 3)
  );
}

/**
 * Lo que teclea una persona en un campo de precio, a céntimos: "25,50" ->
 * 2550. Acepta coma o punto decimal, el símbolo del euro y separadores de
 * miles ("1.250,00"). Devuelve `null` si no se entiende, nunca lanza.
 *
 * La ambigüedad del punto se resuelve como en España: un solo punto seguido
 * de una o dos cifras es decimal ("25.5"), seguido de tres es de miles
 * ("1.250"). La coma siempre es decimal.
 */
export function eurosACentimos(texto: string): number | null {
  if (typeof texto !== "string") return null;

  let limpio = texto
    .replace(/[\s   ]/g, "")
    .replace(/(€|eur|euros?)$/i, "");
  if (limpio === "") return null;

  let negativo = false;
  if (limpio.startsWith("-") || limpio.startsWith("−")) {
    negativo = true;
    limpio = limpio.slice(1);
  }
  if (!/^[\d.,]+$/.test(limpio)) return null;

  const ultimaComa = limpio.lastIndexOf(",");
  const ultimoPunto = limpio.lastIndexOf(".");
  let entera: string;
  let decimal = "";

  if (ultimaComa === -1 && ultimoPunto === -1) {
    entera = limpio;
  } else if (ultimaComa !== -1 && ultimoPunto !== -1) {
    // Los dos: el que aparece más a la derecha es el decimal y el otro, de
    // miles ("1.250,50" o, tecleado a la inglesa, "1,250.50").
    const posDecimal = Math.max(ultimaComa, ultimoPunto);
    const sepMiles = posDecimal === ultimaComa ? "." : ",";
    entera = limpio.slice(0, posDecimal);
    decimal = limpio.slice(posDecimal + 1);
    if (decimal.includes(sepMiles) || !sonGruposDeMiles(entera, sepMiles)) return null;
    entera = entera.split(sepMiles).join("");
  } else if (ultimaComa !== -1) {
    const partes = limpio.split(",");
    if (partes.length !== 2) return null;
    entera = partes[0] ?? "";
    decimal = partes[1] ?? "";
  } else {
    const partes = limpio.split(".");
    const tras = partes[1] ?? "";
    if (partes.length === 2 && tras.length <= 2) {
      entera = partes[0] ?? "";
      decimal = tras;
    } else if (sonGruposDeMiles(limpio, ".")) {
      entera = partes.join("");
    } else {
      return null;
    }
  }

  if (entera === "" && decimal === "") return null;
  if (!/^\d*$/.test(entera) || !/^\d{0,2}$/.test(decimal)) return null;

  const centimos = Number(entera || "0") * 100 + Number((decimal + "00").slice(0, 2));
  if (!Number.isSafeInteger(centimos)) return null;
  return negativo ? -centimos : centimos;
}

/** Suma de céntimos; lanza si alguno no es entero. Sin argumentos, 0. */
export function sumarCentimos(...cantidades: number[]): number {
  let total = 0;
  cantidades.forEach((cantidad, i) => {
    comprobarEntero(cantidad, `La cantidad ${i + 1}`);
    total += cantidad;
  });
  return total;
}
