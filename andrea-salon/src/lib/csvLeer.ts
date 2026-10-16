/**
 * Lector de CSV para las importaciones (clientas y citas que exporte Elitek, o una hoja que
 * transcriba el salón). No sabemos qué nos van a dar: Excel en español guarda con `;`, otros con
 * `,`; puede venir con BOM, con comillas, con saltos de línea dentro de una celda. Se detecta el
 * separador mirando la cabecera y se aguanta todo eso. Puro y con tests.
 */

export interface TablaCsv {
  cabeceras: string[];
  filas: Record<string, string>[];
}

/** El separador que más aparece en la primera línea (fuera de comillas): `;`, `,` o tabulador. */
export function detectarSeparador(texto: string): string {
  const primera = texto.split(/\r?\n/, 1)[0] ?? "";
  let mejor = ";";
  let max = -1;
  for (const sep of [";", ",", "\t"]) {
    let n = 0;
    let dentro = false;
    for (const ch of primera) {
      if (ch === '"') dentro = !dentro;
      else if (ch === sep && !dentro) n++;
    }
    if (n > max) {
      max = n;
      mejor = sep;
    }
  }
  return mejor;
}

/** Filas crudas (RFC 4180: comillas dobles, `""` = comilla, saltos de línea dentro de comillas). */
export function filasCsv(texto: string, separador = detectarSeparador(texto)): string[][] {
  const limpio = texto.replace(/^﻿/, "");
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = "";
  let dentro = false;
  for (let i = 0; i < limpio.length; i++) {
    const ch = limpio[i]!;
    if (dentro) {
      if (ch === '"') {
        if (limpio[i + 1] === '"') {
          celda += '"';
          i++;
        } else dentro = false;
      } else celda += ch;
      continue;
    }
    if (ch === '"') dentro = true;
    else if (ch === separador) {
      fila.push(celda);
      celda = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && limpio[i + 1] === "\n") i++;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = "";
    } else celda += ch;
  }
  if (celda !== "" || fila.length > 0) {
    fila.push(celda);
    filas.push(fila);
  }
  // Las líneas totalmente vacías (final de fichero, separaciones) no son filas.
  return filas.filter((f) => f.some((c) => c.trim() !== ""));
}

/** Cabecera normalizada para emparejar columnas: minúsculas, sin tildes ni espacios raros. */
export function normalizarCabecera(c: string): string {
  return c
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** CSV → objetos con las cabeceras normalizadas como claves. */
export function leerCsv(texto: string): TablaCsv {
  const [cab, ...resto] = filasCsv(texto);
  const cabeceras = (cab ?? []).map(normalizarCabecera);
  return {
    cabeceras,
    filas: resto.map((f) => Object.fromEntries(cabeceras.map((c, i) => [c, (f[i] ?? "").trim()]))),
  };
}

/**
 * El valor de la primera columna que exista de una lista de alias ("telefono", "movil", "tel"...).
 * Cada exportación llama distinto a lo mismo; así el importador no exige un formato concreto.
 */
export function campo(fila: Record<string, string>, alias: readonly string[]): string {
  for (const a of alias) {
    const v = fila[normalizarCabecera(a)];
    if (v !== undefined && v !== "") return v;
  }
  return "";
}

/** "15/10/2026", "15-10-26", "2026-10-15" → "2026-10-15"; null si no se entiende. */
export function fechaEuropea(texto: string): string | null {
  const t = texto.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (m) return valida(Number(m[1]), Number(m[2]), Number(m[3]));
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/.exec(t);
  if (m) {
    const anio = m[3]!.length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return valida(anio, Number(m[2]), Number(m[1]));
  }
  return null;
}

function valida(anio: number, mes: number, dia: number): string | null {
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  if (d.getUTCFullYear() !== anio || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** "9:30", "09.30", "930", "9h30" → "09:30"; null si no es una hora. */
export function horaTexto(texto: string): string | null {
  const t = texto.trim().toLowerCase().replace("h", ":");
  const m = /^(\d{1,2})(?:[:.]?(\d{2}))?$/.exec(t);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2] ?? "0");
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
