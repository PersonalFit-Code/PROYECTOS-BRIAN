import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { ipDePeticion, type Limitador } from "@/lib/rateLimit";

/**
 * Lo común de los route handlers públicos: respuestas JSON sin caché, errores con un código que la
 * interfaz traduce (los textos viven en `i18n/messages`, no aquí), lectura de cuerpo y de query con
 * zod, y la cuota por IP. Los mensajes en castellano que acompañan al código son para quien mire la
 * red o los logs, no para enseñarlos.
 */
export type CodigoError =
  | "DATOS_INVALIDOS"
  | "DEMASIADAS_PETICIONES"
  | "SERVICIO_DESCONOCIDO"
  | "SERVICIO_NO_RESERVABLE"
  | "SIN_PROFESIONAL"
  | "PROFESIONAL_NO_VALIDA"
  | "FECHA_FUERA_DE_RANGO"
  | "HORA_OCUPADA"
  | "HOLD_CADUCADO"
  | "TELEFONO_INVALIDO"
  | "ENLACE_INVALIDO"
  | "CITA_NO_MODIFICABLE"
  | "FUERA_DE_PLAZO"
  | "NO_AUTORIZADO"
  | "AGENDA_INVALIDA"
  | "ERROR_INTERNO";

const SIN_CACHE = { "cache-control": "no-store" } as const;

export function ok<T>(datos: T, init: ResponseInit = {}): NextResponse {
  return NextResponse.json(datos, { ...init, headers: { ...SIN_CACHE, ...(init.headers ?? {}) } });
}

export function error(status: number, codigo: CodigoError, mensaje?: string, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ codigo, mensaje: mensaje ?? codigo, ...extra }, { status, headers: SIN_CACHE });
}

/** 429 con `retry-after` si la IP ha agotado la cuota; null si puede seguir. */
export function comprobarCuota(limitador: Limitador, req: Request): NextResponse | null {
  const resultado = limitador.permitir(ipDePeticion(req));
  if (resultado.ok) return null;
  const segundos = Math.max(1, Math.ceil(resultado.reintentarEnMs / 1000));
  return NextResponse.json(
    { codigo: "DEMASIADAS_PETICIONES", mensaje: `Espera ${segundos} segundos.` },
    { status: 429, headers: { ...SIN_CACHE, "retry-after": String(segundos) } },
  );
}

type Lectura<T> = { ok: true; datos: T } | { ok: false; respuesta: NextResponse };

function primerProblema(issues: { path: PropertyKey[]; message: string }[]): string {
  const i = issues[0];
  if (!i) return "Datos inválidos";
  const ruta = i.path.map(String).join(".");
  return ruta ? `${ruta}: ${i.message}` : i.message;
}

/** Cuerpo JSON validado con zod. Un cuerpo que no es JSON o no encaja → 400 DATOS_INVALIDOS. */
export async function leerJson<T>(req: Request, esquema: ZodType<T>): Promise<Lectura<T>> {
  let crudo: unknown;
  try {
    crudo = await req.json();
  } catch {
    return { ok: false, respuesta: error(400, "DATOS_INVALIDOS", "El cuerpo no es JSON") };
  }
  const resultado = esquema.safeParse(crudo);
  if (!resultado.success) {
    return { ok: false, respuesta: error(400, "DATOS_INVALIDOS", primerProblema(resultado.error.issues)) };
  }
  return { ok: true, datos: resultado.data };
}

/** Query string validada con zod (cada clave, su primer valor). */
export function leerQuery<T>(url: URL, esquema: ZodType<T>): Lectura<T> {
  const crudo: Record<string, string> = {};
  url.searchParams.forEach((valor, clave) => {
    if (!(clave in crudo)) crudo[clave] = valor;
  });
  const resultado = esquema.safeParse(crudo);
  if (!resultado.success) {
    return { ok: false, respuesta: error(400, "DATOS_INVALIDOS", primerProblema(resultado.error.issues)) };
  }
  return { ok: true, datos: resultado.data };
}

/** Error de Postgres tal como lo devuelve supabase-js (`code` es el SQLSTATE; `message` el texto de RAISE). */
export interface ErrorPostgres {
  code?: string | null;
  message: string;
}

/** 23P01 = exclusion_violation: la restricción `bookings_no_overlap` ha hecho su trabajo. */
export function esChoqueDeHorario(e: ErrorPostgres | null | undefined): boolean {
  return e?.code === "23P01";
}

/** Lo que lanzó una función plpgsql con `raise exception 'CODIGO'` (errcode P0001). */
export function codigoDeRaise(e: ErrorPostgres | null | undefined): string | null {
  if (!e || e.code !== "P0001") return null;
  const m = /^([A-Z_]+)/.exec(e.message.trim());
  return m ? m[1] : null;
}
