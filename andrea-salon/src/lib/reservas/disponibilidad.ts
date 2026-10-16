import "server-only";

import {
  diasConHueco,
  duracionTotal,
  huecosDelDia,
  elegirProfesional,
  type EntradaHuecos,
  type Franja,
  type Hueco,
  type Intervalo,
  type ProfesionalAgenda,
} from "@/lib/booking";
import { fechaLocalISO, sumarDias } from "@/lib/fechas";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ServiceRow, StaffHoursRow } from "@/lib/supabase/types";
import { getAjustes, type Ajustes } from "./ajustes";
import { getCatalogoFresco } from "./catalogo";

/**
 * Une lo que hay en la base de datos con el motor puro de `lib/booking`:
 * carga servicios, profesionales, horarios, citas y ausencias, y le pasa todo por parámetro.
 * Aquí no se decide nada sobre huecos; eso es del motor (y de sus tests).
 */

export class ReservaInvalidaError extends Error {
  constructor(
    public readonly codigo:
      | "SERVICIO_DESCONOCIDO"
      | "SERVICIO_NO_RESERVABLE"
      | "SIN_PROFESIONAL"
      | "PROFESIONAL_NO_VALIDA"
      | "FECHA_FUERA_DE_RANGO"
      | "DEMASIADO_LARGO",
    mensaje?: string,
  ) {
    super(mensaje ?? codigo);
  }
}

/** Lo más largo que se reserva desde la web en una sola cita (servicios encadenados). */
export const MAX_MINUTOS_WEB = 300;

export interface Peticion {
  /** ids de servicio en el orden elegido */
  servicios: string[];
  /** id de profesional, o null = "me da igual" */
  staffId: string | null;
  ahora?: Date;
  /**
   * Desde el panel: valen también los servicios y profesionales que no se reservan por internet
   * (siguen teniendo que estar activos) y no hay antelación mínima (la clienta está en el mostrador).
   */
  panel?: boolean;
}

export interface Contexto {
  ajustes: Ajustes;
  servicios: ServiceRow[];
  candidatas: ProfesionalAgenda[];
  entrada: EntradaHuecos;
  /** nombre de cada candidata, para las respuestas */
  nombres: Record<string, string>;
}

function franjasDe(filas: StaffHoursRow[]): Franja[] {
  return filas.map((f) => ({
    dia: f.weekday as Franja["dia"],
    desde: f.start_time.slice(0, 5),
    hasta: f.end_time.slice(0, 5),
  }));
}

/**
 * Prepara la entrada del motor para una petición. Falla con `ReservaInvalidaError` si algún
 * servicio no existe o no se reserva por internet, o si nadie hace esa combinación.
 */
export async function prepararContexto(peticion: Peticion): Promise<Contexto> {
  const ahora = peticion.ahora ?? new Date();
  const [ajustes, catalogo] = await Promise.all([getAjustes(), getCatalogoFresco()]);

  const porId = new Map(catalogo.servicios.map((s) => [s.id, s]));
  const servicios: ServiceRow[] = [];
  for (const id of peticion.servicios) {
    const s = porId.get(id);
    if (!s) throw new ReservaInvalidaError("SERVICIO_DESCONOCIDO");
    if (!s.bookable_online && !peticion.panel) throw new ReservaInvalidaError("SERVICIO_NO_RESERVABLE");
    servicios.push(s);
  }

  // Un servicio repetido o una cadena de seis servicios largos sirve para bloquear el día de una
  // profesional con una sola reserva temporal. Desde la web: sin repetidos y como mucho 5 horas.
  if (!peticion.panel) {
    if (new Set(peticion.servicios).size !== peticion.servicios.length) throw new ReservaInvalidaError("SERVICIO_DESCONOCIDO", "Servicio repetido");
    if (servicios.reduce((t, s) => t + s.duration_min, 0) > MAX_MINUTOS_WEB) throw new ReservaInvalidaError("DEMASIADO_LARGO");
  }

  // Candidatas: hacen TODOS los servicios, están activas y se reservan por internet.
  let candidatasIds = catalogo.equipo.filter((p) => p.bookable_online || peticion.panel).map((p) => p.id);
  for (const s of servicios) {
    const hacen = new Set(catalogo.quienHace[s.id] ?? []);
    candidatasIds = candidatasIds.filter((id) => hacen.has(id));
  }
  if (peticion.staffId) {
    if (!candidatasIds.includes(peticion.staffId)) throw new ReservaInvalidaError("PROFESIONAL_NO_VALIDA");
    candidatasIds = [peticion.staffId];
  }
  if (candidatasIds.length === 0) throw new ReservaInvalidaError("SIN_PROFESIONAL");

  const hoy = fechaLocalISO(ahora, ajustes.timezone);
  const finVentana = sumarDias(hoy, ajustes.horizonDays + 1);
  const desdeISO = new Date(ahora.getTime() - 24 * 3_600_000).toISOString();
  const hastaISO = `${finVentana}T23:59:59.000Z`;

  const db = getAdminClient();
  const [horarios, citas, ausencias] = await Promise.all([
    db.from("staff_hours").select("*").in("staff_id", candidatasIds),
    db
      .from("bookings")
      .select("staff_id, starts_at, ends_at, status, expires_at")
      .in("staff_id", candidatasIds)
      .in("status", ["hold", "confirmed", "done"])
      .gte("ends_at", desdeISO)
      .lte("starts_at", hastaISO),
    db
      .from("time_off")
      .select("staff_id, starts_at, ends_at")
      .or(`staff_id.is.null,staff_id.in.(${candidatasIds.join(",")})`)
      .gte("ends_at", desdeISO)
      .lte("starts_at", hastaISO),
  ]);
  for (const r of [horarios, citas, ausencias]) {
    if (r.error) throw new Error(`No se pudo leer la agenda: ${r.error.message}`);
  }

  const ocupado: Record<string, Intervalo[]> = {};
  const cierres: Intervalo[] = [];
  for (const id of candidatasIds) ocupado[id] = [];

  for (const c of citas.data ?? []) {
    // Un hold caducado ya no cuenta (book_slot lo borra al siguiente intento).
    if (c.status === "hold" && c.expires_at && new Date(c.expires_at).getTime() <= ahora.getTime()) continue;
    ocupado[c.staff_id]?.push({ desde: new Date(c.starts_at), hasta: new Date(c.ends_at) });
  }
  for (const a of ausencias.data ?? []) {
    const tramo = { desde: new Date(a.starts_at), hasta: new Date(a.ends_at) };
    if (a.staff_id === null) cierres.push(tramo);
    else ocupado[a.staff_id]?.push(tramo);
  }

  const candidatas: ProfesionalAgenda[] = candidatasIds.map((id) => ({
    id,
    franjas: franjasDe((horarios.data ?? []).filter((h) => h.staff_id === id)),
  }));

  const nombres: Record<string, string> = {};
  for (const p of catalogo.equipo) nombres[p.id] = p.name;

  const entrada: EntradaHuecos = {
    ahora,
    zona: ajustes.timezone,
    horizonteDias: ajustes.horizonDays,
    antelacionMin: peticion.panel ? 0 : ajustes.minLeadMinutes,
    pasoMin: ajustes.slotStepMin,
    servicios: servicios.map((s) => ({ duracionMin: s.duration_min, bufferMin: s.buffer_min })),
    profesionales: candidatas,
    ocupado,
    cierres,
  };

  return { ajustes, servicios, candidatas, entrada, nombres };
}

export interface DiaDisponible {
  fecha: string;
  hayHuecos: boolean;
}

export interface HuecoPublico {
  inicio: string;
  fin: string;
  staffId: string;
  candidatas: string[];
}

export async function diasDisponibles(peticion: Peticion): Promise<{ dias: DiaDisponible[]; ctx: Contexto }> {
  const ctx = await prepararContexto(peticion);
  return { dias: diasConHueco(ctx.entrada), ctx };
}

export async function huecosDe(peticion: Peticion, fecha: string): Promise<{ huecos: HuecoPublico[]; ctx: Contexto }> {
  const ctx = await prepararContexto(peticion);
  // El horizonte cuenta hoy: con 45 días, el último ofrecible es hoy + 44 (igual que el motor).
  const hoy = fechaLocalISO(ctx.entrada.ahora, ctx.ajustes.timezone);
  if (fecha < hoy || fecha >= sumarDias(hoy, ctx.ajustes.horizonDays)) {
    throw new ReservaInvalidaError("FECHA_FUERA_DE_RANGO");
  }
  const huecos = huecosDelDia(ctx.entrada, fecha);
  return { huecos: huecos.map(publico), ctx };
}

function publico(h: Hueco): HuecoPublico {
  return {
    inicio: h.inicio.toISOString(),
    fin: h.fin.toISOString(),
    staffId: h.staffId,
    candidatas: h.candidatas && h.candidatas.length > 0 ? [...h.candidatas] : [h.staffId],
  };
}

/**
 * Comprueba que una hora concreta sigue libre para esa combinación y decide la profesional
 * (la elegida, o la menos cargada ese día si daba igual). Devuelve lo necesario para el hold.
 */
export async function resolverHueco(
  peticion: Peticion,
  inicioISO: string,
): Promise<{ ctx: Contexto; staffId: string; inicio: Date; fin: Date; totalMin: number } | null> {
  const ctx = await prepararContexto(peticion);
  const inicio = new Date(inicioISO);
  if (Number.isNaN(inicio.getTime())) return null;

  const fecha = fechaLocalISO(inicio, ctx.ajustes.timezone);
  const huecos = huecosDelDia(ctx.entrada, fecha);
  const hueco = huecos.find((h) => h.inicio.getTime() === inicio.getTime());
  if (!hueco) return null;

  const candidatas = hueco.candidatas && hueco.candidatas.length > 0 ? hueco.candidatas : [hueco.staffId];
  const staffId = peticion.staffId ?? elegirProfesional(inicio, candidatas, ctx.entrada.ocupado, ctx.ajustes.timezone);
  const { minutos, bufferFinal } = duracionTotal(ctx.entrada.servicios);
  const fin = new Date(inicio.getTime() + (minutos + bufferFinal) * 60_000);

  return { ctx, staffId, inicio, fin, totalMin: minutos };
}
