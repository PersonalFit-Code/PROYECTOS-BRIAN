/**
 * CSV para la exportación del panel (clientas, citas, cobros).
 *
 * RFC 4180 con dos decisiones pensadas para quien lo va a abrir, que es
 * Andrea con Excel en español:
 * - El separador es `;`. El Excel en español usa la coma como decimal, así
 *   que un CSV con comas se le abre todo en una columna.
 * - Empieza con la marca de orden de bytes (BOM) UTF-8. Sin ella Excel lee el
 *   fichero como Windows-1252 y "Peña" sale como "PeÃ±a".
 *
 * Los textos salen tal cual (las fechas también: quien exporta decide si van
 * en ISO o en "25/10/2026"). Los números no enteros llevan coma decimal por
 * el mismo motivo que el separador; si se pide `,` como separador, llevan
 * punto. `null` y `undefined` son celdas vacías.
 */

export type CeldaCsv = string | number | null | undefined;

export interface ColumnaCsv<F> {
  /** Campo de la fila que va en esta columna. */
  clave: keyof F & string;
  /** Lo que se lee en la primera línea. */
  cabecera: string;
}

export interface OpcionesCsv {
  /** Por defecto `;` (Excel en español). */
  separador?: string;
  /** Marca de orden de bytes al principio; por defecto sí. */
  bom?: boolean;
  /**
   * Neutralizar celdas que Excel ejecutaría como fórmula (`=`, `@`, y `+`/`-`
   * cuando no son un número). Por defecto sí: un nombre de clienta lo escribe
   * la clienta, y "=HYPERLINK(...)" en la hoja de Andrea no es una broma.
   */
  protegerFormulas?: boolean;
  /** RFC 4180 pide CRLF; por defecto se respeta. */
  finDeLinea?: "\r\n" | "\n";
}

const BOM = "﻿";

/** Un `+34 646 77 13 56` o un `-12,50` son números, no fórmulas. */
const NUMERO_CON_SIGNO = /^[+-][\d\s.,]*$/;

/**
 * Lo que una celda que empieza por `=`, `@`, `+` o `-` haría en Excel es
 * evaluarse (y con `cmd|...` lanzar programas, el ataque clásico de inyección
 * CSV). Se le antepone un apóstrofo, que Excel entiende como "texto". Los
 * teléfonos con `+` y los importes negativos se dejan en paz.
 */
function neutralizarFormula(texto: string): string {
  const primero = texto[0];
  if (primero === "=" || primero === "@" || primero === "\t" || primero === "\r") return `'${texto}`;
  if ((primero === "+" || primero === "-") && !NUMERO_CON_SIGNO.test(texto)) return `'${texto}`;
  return texto;
}

function celdaATexto(valor: CeldaCsv, separadorDecimal: string): string {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "number") {
    if (!Number.isFinite(valor)) return "";
    return Number.isInteger(valor) ? String(valor) : String(valor).replace(".", separadorDecimal);
  }
  return String(valor);
}

/** Comillas solo cuando hacen falta (separador, comillas o saltos de línea); las comillas internas se doblan. */
function entrecomillar(texto: string, separador: string): string {
  if (texto === "") return texto;
  const necesita = texto.includes(separador) || texto.includes('"') || texto.includes("\n") || texto.includes("\r");
  return necesita ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/**
 * Filas a CSV. `columnas` fija qué campos salen, en qué orden y con qué
 * cabecera: la exportación nunca vuelca una fila entera, así `notes` (las
 * alergias) solo sale si quien exporta la pide expresamente.
 */
export function aCsv<F extends Record<string, CeldaCsv>>(
  filas: readonly F[],
  columnas: readonly ColumnaCsv<F>[],
  opciones: OpcionesCsv = {},
): string {
  const separador = opciones.separador ?? ";";
  const bom = opciones.bom ?? true;
  const proteger = opciones.protegerFormulas ?? true;
  const finDeLinea = opciones.finDeLinea ?? "\r\n";
  // Con `;` entre columnas la coma queda libre para los decimales (Excel en
  // español); con `,` entre columnas, el punto.
  const separadorDecimal = separador === ";" ? "," : ".";

  const campo = (valor: CeldaCsv): string => {
    let texto = celdaATexto(valor, separadorDecimal);
    if (proteger && typeof valor === "string") texto = neutralizarFormula(texto);
    return entrecomillar(texto, separador);
  };

  const lineas = [columnas.map((c) => campo(c.cabecera)).join(separador)];
  for (const fila of filas) {
    lineas.push(columnas.map((c) => campo(fila[c.clave])).join(separador));
  }
  return (bom ? BOM : "") + lineas.join(finDeLinea) + finDeLinea;
}
