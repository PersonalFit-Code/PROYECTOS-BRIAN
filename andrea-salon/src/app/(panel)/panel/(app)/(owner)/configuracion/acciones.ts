"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { descomponerFechaLocal, desplazarFechaLocal, instanteEnZona } from "@/lib/booking";
import { requireOwner } from "@/lib/panel/sesion";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import { primerError, textoOpcional, type EstadoAccion } from "../_comun/estado";
import { aMinutos, HORA_HHMM, problemaFranjas } from "../_comun/franjas";
import { DIAS_SALON, PASOS_HUECO, ZONA } from "./zona";

/**
 * Configuración del salón: reglas de la reserva online, cierres/ausencias y horario público.
 * Solo la dueña; `requireOwner()` en cada acción porque el layout no protege las Server Actions.
 *
 * Los ajustes se leen frescos en cada petición (`getAjustes`), así que no hay caché que invalidar
 * para la reserva: basta con refrescar esta página.
 */

const RUTA = "/panel/configuracion";

const numero = (min: number, max: number, nombre: string) =>
  z.coerce
    .number({ error: `${nombre}: escribe un número.` })
    .int(`${nombre}: sin decimales.`)
    .min(min, `${nombre}: como mínimo ${min}.`)
    .max(max, `${nombre}: como máximo ${max}.`);

const Reserva = z.object({
  horizon_days: numero(1, 120, "Días de antelación máxima"),
  min_lead_minutes: numero(0, 2880, "Antelación mínima"),
  slot_step_min: z.coerce
    .number()
    .refine((n) => (PASOS_HUECO as readonly number[]).includes(n), "Elige cada cuántos minutos se ofrecen las horas."),
  hold_minutes: numero(3, 30, "Minutos para terminar la reserva"),
  cancel_hours: numero(0, 168, "Horas para cancelar"),
  reminder_hour_local: z.string().regex(HORA_HHMM, "La hora del recordatorio tiene que ser HH:MM."),
  voucher_expiry_warning_days: numero(0, 180, "Aviso de bonos que caducan"),
});

async function guardarClaves(valores: Record<string, Json>): Promise<boolean> {
  const ahora = new Date().toISOString();
  const { error } = await getAdminClient()
    .from("settings")
    .upsert(
      Object.entries(valores).map(([key, value]) => ({ key, value, updated_at: ahora })),
      { onConflict: "key" },
    );
  return !error;
}

export async function guardarAjustesReserva(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();
  const datos = Reserva.safeParse(Object.fromEntries(Object.keys(Reserva.shape).map((k) => [k, form.get(k) ?? ""])));
  if (!datos.success) return primerError(datos.error);

  // Como escalares JSON (45, "10:00"), que es como los lee `setting_int` en la base de datos.
  if (!(await guardarClaves(datos.data))) return { ok: false, error: "No se pudieron guardar los ajustes. Inténtalo otra vez." };

  revalidatePath(RUTA);
  return { ok: true, mensaje: "Ajustes guardados. La reserva online ya funciona con ellos." };
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const Cierre = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("dias"),
    desde: z.string().regex(FECHA, "Elige el primer día del cierre."),
    hasta: z.string().regex(FECHA, "Elige el último día del cierre."),
  }),
  z.object({
    tipo: z.literal("horas"),
    fecha: z.string().regex(FECHA, "Elige el día."),
    horaDesde: z.string().regex(HORA_HHMM, "Elige la hora de inicio."),
    horaHasta: z.string().regex(HORA_HHMM, "Elige la hora de fin."),
  }),
]);

/**
 * Un cierre del salón (sin profesional) o una ausencia de una profesional. Lo que teclea Andrea es
 * hora de Ourense; se convierte a instante con la zona del salón para que un cierre de «todo el
 * 25 de octubre» no se desplace una hora el día del cambio de horario.
 *
 * «Días completos» va de las 00:00 del primer día a las 00:00 del día SIGUIENTE al último: así el
 * último día queda entero dentro y el motor de huecos no tiene que adivinar nada.
 */
export async function crearCierre(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  const sesion = await requireOwner();

  const alcance = textoOpcional(form, "staff_id");
  const staffId = alcance === null ? null : z.uuid().safeParse(alcance);
  if (staffId && !staffId.success) return { ok: false, error: "Elige a quién afecta el cierre." };

  const datos = Cierre.safeParse({
    tipo: form.get("tipo"),
    desde: form.get("desde") ?? "",
    hasta: form.get("hasta") ?? "",
    fecha: form.get("fecha") ?? "",
    horaDesde: form.get("horaDesde") ?? "",
    horaHasta: form.get("horaHasta") ?? "",
  });
  if (!datos.success) return primerError(datos.error);
  const motivo = textoOpcional(form, "reason");
  if (motivo && motivo.length > 200) return { ok: false, error: "El motivo es demasiado largo (máximo 200 caracteres)." };

  let inicio: Date;
  let fin: Date;
  try {
    if (datos.data.tipo === "dias") {
      const a = descomponerFechaLocal(datos.data.desde);
      const b = descomponerFechaLocal(desplazarFechaLocal(datos.data.hasta, 1));
      inicio = instanteEnZona(a.anio, a.mes, a.dia, 0, 0, ZONA);
      fin = instanteEnZona(b.anio, b.mes, b.dia, 0, 0, ZONA);
      if (datos.data.hasta < datos.data.desde) {
        return { ok: false, error: "El último día tiene que ser el mismo o posterior al primero." };
      }
      if (fin.getTime() - inicio.getTime() > 366 * 86_400_000) {
        return { ok: false, error: "Un cierre de más de un año parece un error. Revisa las fechas." };
      }
    } else {
      const { horaDesde, horaHasta } = datos.data;
      if (aMinutos(horaHasta) <= aMinutos(horaDesde)) {
        return { ok: false, error: "La hora de fin tiene que ser posterior a la de inicio." };
      }
      const d = descomponerFechaLocal(datos.data.fecha);
      const [h1, m1] = horaDesde.split(":").map(Number);
      const [h2, m2] = horaHasta.split(":").map(Number);
      inicio = instanteEnZona(d.anio, d.mes, d.dia, h1 ?? 0, m1 ?? 0, ZONA);
      fin = instanteEnZona(d.anio, d.mes, d.dia, h2 ?? 0, m2 ?? 0, ZONA);
    }
  } catch {
    return { ok: false, error: "Esa fecha no existe. Revísala." };
  }
  if (fin.getTime() <= Date.now()) return { ok: false, error: "Ese cierre ya ha pasado. Revisa las fechas." };

  const db = getAdminClient();
  if (staffId) {
    const { data } = await db.from("staff").select("id").eq("id", staffId.data).maybeSingle();
    if (!data) return { ok: false, error: "No se encontró a esa profesional." };
  }

  const { error } = await db.from("time_off").insert({
    staff_id: staffId?.data ?? null,
    starts_at: inicio.toISOString(),
    ends_at: fin.toISOString(),
    reason: motivo,
    created_by: sesion.userId,
  });
  if (error) return { ok: false, error: "No se pudo guardar el cierre. Inténtalo otra vez." };

  // El cierre solo impide reservas NUEVAS: las citas que ya hubiera siguen en pie. Se avisa para
  // que Andrea las mueva o las anule a mano y llame a las clientas.
  let citas = db
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .in("status", ["confirmed", "hold"])
    .lt("starts_at", fin.toISOString())
    .gt("ends_at", inicio.toISOString());
  if (staffId) citas = citas.eq("staff_id", staffId.data);
  const { count } = await citas;

  revalidatePath(RUTA);
  const aviso =
    count && count > 0
      ? ` Ojo: ya hay ${count === 1 ? "1 cita" : `${count} citas`} en ese tiempo y no se han anulado; revísalas en la agenda.`
      : "";
  return { ok: true, mensaje: `Cierre guardado.${aviso}` };
}

export async function eliminarCierre(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return { ok: false, error: "No se encontró el cierre." };

  const { error } = await getAdminClient().from("time_off").delete().eq("id", id.data);
  if (error) return { ok: false, error: "No se pudo quitar el cierre. Inténtalo otra vez." };

  revalidatePath(RUTA);
  return { ok: true, mensaje: "Cierre quitado." };
}

const FranjaSalon = z.object({
  inicio: z.string().regex(HORA_HHMM, "Alguna hora no tiene el formato HH:MM."),
  fin: z.string().regex(HORA_HHMM, "Alguna hora no tiene el formato HH:MM."),
});
// `partialRecord`: en zod 4 un `record` con claves de un enum las exige todas; un día que no venga
// se toma como cerrado.
const SemanaSalon = z.partialRecord(
  z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  z.array(FranjaSalon).max(4, "Como mucho cuatro franjas por día."),
);

/**
 * Horario público del salón (`settings.salon_hours`), el que pinta la web y la pastilla «abierto
 * ahora». No limita las reservas: eso lo deciden los horarios de cada profesional.
 */
export async function guardarHorarioSalon(_prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  await requireOwner();
  let crudo: unknown;
  try {
    crudo = JSON.parse(String(form.get("semana") ?? "{}"));
  } catch {
    return { ok: false, error: "No se pudo leer el horario. Recarga la página." };
  }
  const semana = SemanaSalon.safeParse(crudo);
  if (!semana.success) return primerError(semana.error);

  const valor: Record<string, { open: string; close: string }[]> = {};
  for (const d of DIAS_SALON) {
    const franjas = semana.data[d.clave] ?? [];
    const problema = problemaFranjas(franjas, d.nombre);
    if (problema) return { ok: false, error: problema.replace("hora de fin", "hora de cierre").replace("la de inicio", "la de apertura") };
    valor[d.clave] = [...franjas]
      .sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio))
      .map((f) => ({ open: f.inicio, close: f.fin }));
  }

  if (!(await guardarClaves({ salon_hours: valor }))) {
    return { ok: false, error: "No se pudo guardar el horario. Inténtalo otra vez." };
  }

  // La web pública enseña este horario en varias páginas (cabecera, contacto, pie): se refresca todo.
  revalidatePath("/", "layout");
  return { ok: true, mensaje: "Horario del salón guardado." };
}
