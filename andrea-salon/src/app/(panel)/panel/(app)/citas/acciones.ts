"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { codigoDeRaise, esChoqueDeHorario } from "@/lib/api";
import { descomponerFechaLocal, instanteEnZona, minutosDeHhMm } from "@/lib/booking";
import { ZONA_SALON } from "@/lib/fechas";
import { puedeTocarCita, requireSesion, type Sesion } from "@/lib/panel/sesion";
import { normalizarTelefonoES } from "@/lib/phone";
import { enviarCambio, enviarCancelacion, enviarConfirmacion } from "@/lib/reservas/correos";
import { huecosDe, ReservaInvalidaError } from "@/lib/reservas/disponibilidad";
import { getAdminClient } from "@/lib/supabase/admin";
import type { PaymentMethod } from "@/lib/supabase/types";
import { normalizarCodigoBono } from "@/lib/vouchers/code";
import { ERRORES_BONO, queQueda } from "../bonos/comun";

/**
 * Acciones de citas del panel. Todas empiezan por `requireSesion()` y comprueban que la cita es de
 * quien la toca (una empleada solo las suyas). Escriben con la clave de servicio a través de las
 * funciones SQL de 0009, que dejan el autor en `audit_log`.
 */
export type Resultado<T = undefined> = { ok: true; datos?: T; mensaje?: string } | { ok: false; error: string };

const ERRORES: Record<string, string> = {
  // Los del bono (BONO_NO_EXISTE, BONO_SIN_SALDO, SESIONES_INVALIDAS…) son los mismos textos que
  // en la ficha del bono: viven en `bonos/comun.ts` para que no se desincronicen.
  ...ERRORES_BONO,
  CITA_NO_COBRABLE: "Esta cita no se puede cobrar (está cancelada o era una falta).",
  CITA_NO_MODIFICABLE: "Esta cita ya no se puede cambiar.",
  IMPORTE_INVALIDO: "El importe no es válido.",
  ESTADO_INVALIDO: "Ese cambio de estado no está permitido.",
};

function traducir(e: { code?: string | null; message: string } | null): string {
  if (esChoqueDeHorario(e)) return "Esa hora choca con otra cita de la misma profesional.";
  const c = codigoDeRaise(e);
  if (c && ERRORES[c]) return ERRORES[c];
  console.error("[panel/citas]", e?.message);
  return "No se pudo guardar. Prueba otra vez.";
}

async function citaPropia(s: Sesion, id: string) {
  const { data } = await getAdminClient().from("bookings").select("id, staff_id, status, starts_at, ends_at").eq("id", id).maybeSingle();
  if (!data || !puedeTocarCita(s, data.staff_id)) return null;
  return data;
}

function refrescar(id?: string) {
  revalidatePath("/panel");
  revalidatePath("/panel/agenda");
  if (id) revalidatePath(`/panel/citas/${id}`);
}

/* ── Huecos y clientas (lecturas para los formularios) ───── */

const PeticionHuecos = z.object({
  servicios: z.array(z.uuid()).min(1).max(8),
  staffId: z.uuid().nullable(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function huecosPanel(entrada: z.input<typeof PeticionHuecos>): Promise<Resultado<{ inicio: string; staffId: string; candidatas: string[] }[]>> {
  const s = await requireSesion();
  const p = PeticionHuecos.safeParse(entrada);
  if (!p.success) return { ok: false, error: "Elige servicios y día." };
  const staffId = s.role === "owner" ? p.data.staffId : s.staffId;
  try {
    const { huecos } = await huecosDe({ servicios: p.data.servicios, staffId, panel: true }, p.data.fecha);
    return { ok: true, datos: huecos.map((h) => ({ inicio: h.inicio, staffId: h.staffId, candidatas: h.candidatas })) };
  } catch (e) {
    if (e instanceof ReservaInvalidaError) {
      const textos: Record<string, string> = {
        SIN_PROFESIONAL: "Nadie hace esos servicios seguidos.",
        PROFESIONAL_NO_VALIDA: "Esa profesional no hace alguno de esos servicios.",
        FECHA_FUERA_DE_RANGO: "Ese día queda fuera de la agenda abierta (pasado o más allá del horizonte).",
        SERVICIO_DESCONOCIDO: "Algún servicio ya no está activo.",
      };
      return { ok: false, error: textos[e.codigo] ?? "No se pudieron calcular los huecos." };
    }
    console.error("[panel] huecos", e);
    return { ok: false, error: "No se pudieron calcular los huecos." };
  }
}

export async function buscarClientas(texto: string): Promise<{ id: string; nombre: string; telefono: string | null; email: string | null }[]> {
  await requireSesion();
  const t = texto.trim();
  if (t.length < 2) return [];
  const db = getAdminClient();
  const tel = normalizarTelefonoES(t);
  const limpio = t.replace(/[%,()]/g, " ");
  const q = db.from("clients").select("id, name, phone, email").is("anonymized_at", null).limit(8);
  const { data } = tel ? await q.eq("phone", tel) : await q.or(`name.ilike.%${limpio}%,phone.ilike.%${limpio.replace(/\s+/g, "")}%`);
  return (data ?? []).map((c) => ({ id: c.id, nombre: c.name, telefono: c.phone, email: c.email }));
}

/* ── Crear ───────────────────────────────────────────────── */

const NuevaCita = z
  .object({
    clientaId: z.uuid().nullable(),
    nombre: z.string().trim().max(80).default(""),
    telefono: z.string().trim().max(24).default(""),
    email: z.union([z.email(), z.literal("")]).default(""),
    servicios: z.array(z.uuid()).min(1).max(8),
    staffId: z.uuid(),
    /** hora elegida de los huecos… */
    inicio: z.iso.datetime({ offset: true }).nullable(),
    /** …o a mano (fuera de horario, por ejemplo): fecha y "HH:MM" */
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    horaManual: z.string().regex(/^\d{1,2}:\d{2}$/).nullable(),
    fuente: z.enum(["phone", "walkin", "panel"]).default("phone"),
    notas: z.string().trim().max(500).default(""),
    avisar: z.boolean().default(true),
  })
  .refine((d) => d.clientaId || d.nombre.length >= 2, { message: "Falta la clienta." })
  .refine((d) => d.inicio || (d.fecha && d.horaManual), { message: "Falta la hora." });

export async function crearCita(entrada: z.input<typeof NuevaCita>): Promise<Resultado<{ id: string }>> {
  const s = await requireSesion();
  const p = NuevaCita.safeParse(entrada);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Revisa los datos." };
  const d = p.data;
  if (s.role !== "owner" && d.staffId !== s.staffId) return { ok: false, error: "Solo puedes dar citas en tu agenda." };

  const db = getAdminClient();
  const { data: servicios } = await db.from("services").select("id, name, duration_min, buffer_min, price_cents, active").in("id", d.servicios);
  const porId = new Map((servicios ?? []).map((x) => [x.id, x]));
  const elegidos = d.servicios.map((id) => porId.get(id)).filter((x) => x !== undefined);
  if (elegidos.length !== d.servicios.length || elegidos.some((x) => !x.active)) return { ok: false, error: "Algún servicio ya no está activo." };

  let inicio: Date;
  if (d.inicio) inicio = new Date(d.inicio);
  else {
    const { anio, mes, dia } = descomponerFechaLocal(d.fecha!);
    const min = minutosDeHhMm(d.horaManual!);
    inicio = instanteEnZona(anio, mes, dia, Math.floor(min / 60), min % 60, ZONA_SALON);
  }
  const minutos = elegidos.reduce((t, x) => t + x.duration_min, 0) + (elegidos[elegidos.length - 1]?.buffer_min ?? 0);
  const fin = new Date(inicio.getTime() + minutos * 60_000);

  let clientaId = d.clientaId;
  if (!clientaId) {
    const telefono = d.telefono ? normalizarTelefonoES(d.telefono) : null;
    if (d.telefono && !telefono) return { ok: false, error: "Ese teléfono no parece español." };
    if (telefono) {
      const { data: c, error } = await db
        .from("clients")
        .upsert({ name: d.nombre, phone: telefono, email: d.email || null, source: "panel" }, { onConflict: "phone", ignoreDuplicates: false })
        .select("id")
        .single();
      if (error || !c) return { ok: false, error: "No se pudo guardar la clienta." };
      clientaId = c.id;
    } else {
      const { data: c, error } = await db.from("clients").insert({ name: d.nombre, email: d.email || null, source: "panel" }).select("id").single();
      if (error || !c) return { ok: false, error: "No se pudo guardar la clienta." };
      clientaId = c.id;
    }
  }

  const { data: cita, error } = await db.rpc("create_booking", {
    p_client: clientaId,
    p_staff: d.staffId,
    p_starts: inicio.toISOString(),
    p_ends: fin.toISOString(),
    p_items: elegidos.map((x) => ({ service_id: x.id, name: x.name, duration_min: x.duration_min, price_cents: x.price_cents })),
    p_source: d.fuente,
    p_notes: d.notas || null,
    p_actor: s.userId,
  });
  if (error || !cita) return { ok: false, error: traducir(error) };

  if (d.avisar) {
    after(async () => {
      const r = await enviarConfirmacion(cita.id);
      if (!r.ok) console.error("[panel] confirmación:", r.error);
    });
  }
  refrescar(cita.id);
  return { ok: true, datos: { id: cita.id } };
}

/* ── Cobrar, falta, cancelar, mover, notas ───────────────── */

const Cobro = z.object({
  id: z.uuid(),
  metodo: z.enum(["card", "cash", "bizum"]),
  importeCents: z.number().int().min(0).max(1_000_000),
  propinaCents: z.number().int().min(0).max(100_000).default(0),
  nota: z.string().trim().max(200).default(""),
});

export async function cobrarCita(entrada: z.input<typeof Cobro>): Promise<Resultado> {
  const s = await requireSesion();
  const p = Cobro.safeParse(entrada);
  if (!p.success) return { ok: false, error: "Revisa el importe." };
  if (!(await citaPropia(s, p.data.id))) return { ok: false, error: "No puedes tocar esta cita." };
  const { error } = await getAdminClient().rpc("complete_booking", {
    p_booking: p.data.id,
    p_method: p.data.metodo as PaymentMethod,
    p_amount: p.data.importeCents,
    p_tip: p.data.propinaCents,
    p_note: p.data.nota || null,
    p_actor: s.userId,
  });
  if (error) return { ok: false, error: traducir(error) };
  refrescar(p.data.id);
  return { ok: true, mensaje: "Cobro apuntado." };
}

const CobroBono = z.object({
  id: z.uuid(),
  code: z.string().trim().min(1).max(200),
  /** Solo cuenta en las tarjetas regalo (lo que se descuenta); en un bono de sesiones va una sesión. */
  importeCents: z.number().int().min(0).max(1_000_000).default(0),
  propinaCents: z.number().int().min(0).max(100_000).default(0),
  /** Lo que se paga aparte (el saldo no llega, o un extra que el bono no cubre). */
  resto: z
    .object({ metodo: z.enum(["card", "cash", "bizum"]), importeCents: z.number().int().min(1).max(1_000_000) })
    .nullable()
    .default(null),
});

/**
 * Cobrar la cita con un bono: `complete_booking_with_voucher` descuenta (una sesión o el importe),
 * cierra la cita y apunta el cobro con método «bono» en UNA transacción. Si el bono no vale, no se
 * cierra nada y la cita sigue esperando a que se cobre de otra forma.
 *
 * Si además paga algo aparte, va DESPUÉS y como un segundo cobro (`complete_booking` admite citas ya
 * hechas): primero lo que puede fallar por el bono (sin saldo, caducado), y solo si ha ido bien, el
 * resto. Hay que hacerlo aquí porque, cerrada la cita, el panel ya no enseña el botón de cobrar.
 */
export async function cobrarConBono(entrada: z.input<typeof CobroBono>): Promise<Resultado> {
  const s = await requireSesion();
  const p = CobroBono.safeParse(entrada);
  if (!p.success) return { ok: false, error: "Revisa el código del bono y el importe." };
  const code = normalizarCodigoBono(p.data.code);
  if (!code) return { ok: false, error: "Ese código no tiene buena pinta: es como AS-7K3M-Q9ZD." };
  if (!(await citaPropia(s, p.data.id))) return { ok: false, error: "No puedes tocar esta cita." };

  const db = getAdminClient();
  const { error } = await db.rpc("complete_booking_with_voucher", {
    p_booking: p.data.id,
    p_code: code,
    p_amount: p.data.importeCents,
    p_tip: p.data.propinaCents,
    p_actor: s.userId,
  });
  if (error) return { ok: false, error: traducir(error) };

  let avisoResto = "";
  if (p.data.resto) {
    const { error: e2 } = await db.rpc("complete_booking", {
      p_booking: p.data.id,
      p_method: p.data.resto.metodo as PaymentMethod,
      p_amount: p.data.resto.importeCents,
      p_tip: 0,
      p_note: `Resto tras pagar con el bono ${code}`,
      p_actor: s.userId,
    });
    if (e2) {
      console.error("[panel/citas] resto tras bono:", e2.message);
      avisoResto = " Ojo: el bono se descontó, pero lo que pagó aparte NO se pudo apuntar. Anótalo y avisa a la dueña.";
    }
  }

  // Lo que le queda, para decírselo a la clienta antes de que se vaya.
  const { data: tras } = await db
    .from("vouchers")
    .select("kind, sessions_left, sessions_total, balance_cents, value_cents")
    .eq("code", code)
    .maybeSingle();
  refrescar(p.data.id);
  revalidatePath("/panel/bonos");
  revalidatePath(`/panel/bonos/${code}`);
  const hecho = tras ? `Cobrada con el bono ${code}. ${queQueda(tras)}.` : "Cobrada con el bono.";
  return { ok: true, mensaje: hecho + avisoResto };
}

export async function marcarFalta(id: string): Promise<Resultado> {
  const s = await requireSesion();
  if (!z.uuid().safeParse(id).success || !(await citaPropia(s, id))) return { ok: false, error: "No puedes tocar esta cita." };
  const { error } = await getAdminClient().rpc("set_booking_status", { p_booking: id, p_status: "no_show", p_by: null, p_reason: null, p_actor: s.userId });
  if (error) return { ok: false, error: traducir(error) };
  refrescar(id);
  return { ok: true, mensaje: "Marcada como falta." };
}

export async function deshacerEstado(id: string): Promise<Resultado> {
  const s = await requireSesion();
  if (!z.uuid().safeParse(id).success || !(await citaPropia(s, id))) return { ok: false, error: "No puedes tocar esta cita." };
  const { error } = await getAdminClient().rpc("set_booking_status", { p_booking: id, p_status: "confirmed", p_by: null, p_reason: null, p_actor: s.userId });
  if (error) return { ok: false, error: traducir(error) };
  refrescar(id);
  return { ok: true, mensaje: "La cita vuelve a estar confirmada." };
}

const Cancelacion = z.object({
  id: z.uuid(),
  quien: z.enum(["salon", "client"]),
  motivo: z.string().trim().max(200).default(""),
  avisar: z.boolean().default(true),
});

export async function cancelarCita(entrada: z.input<typeof Cancelacion>): Promise<Resultado> {
  const s = await requireSesion();
  const p = Cancelacion.safeParse(entrada);
  if (!p.success || !(await citaPropia(s, p.data.id))) return { ok: false, error: "No puedes tocar esta cita." };
  const { error } = await getAdminClient().rpc("set_booking_status", {
    p_booking: p.data.id,
    p_status: "cancelled",
    p_by: p.data.quien,
    p_reason: p.data.motivo || null,
    p_actor: s.userId,
  });
  if (error) return { ok: false, error: traducir(error) };
  if (p.data.avisar) {
    const id = p.data.id;
    const porElSalon = p.data.quien === "salon";
    after(async () => {
      const r = await enviarCancelacion(id, porElSalon);
      if (!r.ok) console.error("[panel] cancelación:", r.error);
    });
  }
  refrescar(p.data.id);
  return { ok: true, mensaje: "Cita cancelada." };
}

const Mover = z.object({
  id: z.uuid(),
  inicio: z.iso.datetime({ offset: true }),
  staffId: z.uuid(),
  avisar: z.boolean().default(true),
});

export async function moverCita(entrada: z.input<typeof Mover>): Promise<Resultado<{ id: string }>> {
  const s = await requireSesion();
  const p = Mover.safeParse(entrada);
  if (!p.success) return { ok: false, error: "Elige la nueva hora." };
  const vieja = await citaPropia(s, p.data.id);
  if (!vieja) return { ok: false, error: "No puedes tocar esta cita." };
  if (s.role !== "owner" && p.data.staffId !== s.staffId) return { ok: false, error: "Solo puedes moverla dentro de tu agenda." };

  // Misma duración que tenía (incluye el respiro de limpieza).
  const duracion = new Date(vieja.ends_at).getTime() - new Date(vieja.starts_at).getTime();
  const inicio = new Date(p.data.inicio);
  const db = getAdminClient();
  const { data, error } = await db.rpc("reschedule_booking", {
    p_old: p.data.id,
    p_staff: p.data.staffId,
    p_starts: inicio.toISOString(),
    p_ends: new Date(inicio.getTime() + duracion).toISOString(),
    p_by: "salon",
  });
  if (error || !data) return { ok: false, error: traducir(error) };
  if (p.data.avisar) {
    const nueva = data.id;
    after(async () => {
      const r = await enviarCambio(nueva);
      if (!r.ok) console.error("[panel] cambio:", r.error);
    });
  }
  refrescar(data.id);
  return { ok: true, datos: { id: data.id } };
}

export async function guardarNotasCita(id: string, notas: string): Promise<Resultado> {
  const s = await requireSesion();
  if (!z.uuid().safeParse(id).success || !(await citaPropia(s, id))) return { ok: false, error: "No puedes tocar esta cita." };
  const { error } = await getAdminClient().from("bookings").update({ notes: notas.trim().slice(0, 500) || null }).eq("id", id);
  if (error) return { ok: false, error: "No se pudieron guardar las notas." };
  refrescar(id);
  return { ok: true, mensaje: "Notas guardadas." };
}
