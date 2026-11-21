import { normalizar } from "@/lib/formato";
import { SECTORES, type Sector } from "@/lib/tipos";

/** Lee un CSV con comillas dobles y comas (RFC 4180). Devuelve filas de celdas. */
export function leerCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = "";
  let dentro = false;
  const t = texto.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (dentro) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          celda += '"';
          i++;
        } else dentro = false;
      } else celda += c;
    } else if (c === '"') dentro = true;
    else if (c === ",") {
      fila.push(celda);
      celda = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      fila.push(celda);
      celda = "";
      if (fila.some((x) => x.trim() !== "")) filas.push(fila);
      fila = [];
    } else celda += c;
  }
  fila.push(celda);
  if (fila.some((x) => x.trim() !== "")) filas.push(fila);
  return filas;
}

export const COLUMNAS = [
  "nombre",
  "sector",
  "subsector",
  "comunidad",
  "provincia",
  "localidad",
  "direccion",
  "telefono",
  "web",
  "instagram",
  "email_generico",
  "fuente_url",
  "notas",
] as const;

export interface FilaNegocio {
  clave_unica: string;
  nombre: string;
  sector: Sector;
  subsector: string | null;
  comunidad: string;
  provincia: string | null;
  localidad: string | null;
  direccion: string | null;
  telefono: string | null;
  web: string | null;
  instagram: string | null;
  email_generico: string | null;
  fuente_url: string | null;
  notas: string | null;
  lote: number;
}

const vacioANull = (s: string | undefined) => {
  const v = (s ?? "").trim();
  return v === "" ? null : v.slice(0, 600);
};

/** Deja solo enlaces http(s); lo demás se descarta. */
function url(s: string | undefined): string | null {
  const v = vacioANull(s);
  if (!v) return null;
  try {
    const u = new URL(v.startsWith("http") ? v : `https://${v}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Teléfono a 9 dígitos, sin prefijo +34. Si no cuadra, se descarta. */
function telefono(s: string | undefined): string | null {
  const d = (s ?? "").replace(/\D/g, "").replace(/^(0034|34)(?=\d{9}$)/, "");
  return d.length === 9 ? d : null;
}

/** Solo correos genéricos del negocio: nada que parezca de una persona. */
const GENERICOS = /^(info|hola|contacto|contact|reservas|recepcion|administracion|admin|clinica|gimnasio|gym|club|centro|tienda|pedidos|atencion|comercial|oficina|estudio|box|hello|mail|correo|citas|consulta)[a-z0-9._-]*@/i;
function correoGenerico(s: string | undefined): string | null {
  const v = (s ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(v)) return null;
  return GENERICOS.test(v) ? v : null;
}

export interface ResultadoCsv {
  filas: FilaNegocio[];
  errores: string[];
}

/** Convierte el CSV (con la cabecera de FORMATO.md) en filas listas para guardar. */
export function filasDeCsv(texto: string, lote: number): ResultadoCsv {
  const tabla = leerCsv(texto);
  const errores: string[] = [];
  if (tabla.length < 2) return { filas: [], errores: ["El fichero está vacío o no tiene filas."] };
  const cab = tabla[0].map((c) => c.trim().toLowerCase());
  const falta = COLUMNAS.filter((c) => !cab.includes(c));
  if (falta.length) return { filas: [], errores: [`Faltan columnas: ${falta.join(", ")}.`] };
  const col = Object.fromEntries(COLUMNAS.map((c) => [c, cab.indexOf(c)])) as Record<(typeof COLUMNAS)[number], number>;

  const vistas = new Set<string>();
  const filas: FilaNegocio[] = [];
  tabla.slice(1).forEach((f, i) => {
    const n = i + 2;
    const nombre = (f[col.nombre] ?? "").trim().slice(0, 200);
    const comunidad = (f[col.comunidad] ?? "").trim();
    const sector = (f[col.sector] ?? "").trim().toLowerCase();
    if (!nombre || !comunidad) {
      errores.push(`Fila ${n}: falta el nombre o la comunidad.`);
      return;
    }
    if (!SECTORES.includes(sector as Sector)) {
      errores.push(`Fila ${n} (${nombre}): sector «${sector}» no reconocido.`);
      return;
    }
    const localidad = vacioANull(f[col.localidad]);
    const clave = `${normalizar(nombre)}|${normalizar(localidad ?? comunidad)}`;
    if (vistas.has(clave)) return;
    vistas.add(clave);
    filas.push({
      clave_unica: clave,
      nombre,
      sector: sector as Sector,
      subsector: vacioANull(f[col.subsector]),
      comunidad,
      provincia: vacioANull(f[col.provincia]),
      localidad,
      direccion: vacioANull(f[col.direccion]),
      telefono: telefono(f[col.telefono]),
      web: url(f[col.web]),
      instagram: url(f[col.instagram]),
      email_generico: correoGenerico(f[col.email_generico]),
      fuente_url: url(f[col.fuente_url]),
      notas: vacioANull(f[col.notas]),
      lote,
    });
  });
  return { filas, errores };
}
