import "server-only";

import { BUSINESS } from "@/data/business";
import CitaCambiada from "@/emails/CitaCambiada";
import CitaCancelada from "@/emails/CitaCancelada";
import CitaConfirmada from "@/emails/CitaConfirmada";
import CitaRecordatorio from "@/emails/CitaRecordatorio";
import type { PieCorreo } from "@/emails/_layout";
import { generarIcs } from "@/emails/ics";
import { fechaLarga, hora as horaDe } from "@/lib/fechas";
import { urlFor } from "@/lib/hosts";
import { enviarCorreo, type ResultadoCorreo } from "@/lib/mail";
import { formatearEuros } from "@/lib/money";
import { SITE_URL } from "@/lib/siteUrl";
import type { NotificationRow } from "@/lib/supabase/types";
import { getAjustes, type Ajustes } from "./ajustes";
import { cargarCita, nombreCorto, salidaDe, type CitaCompleta } from "./citas";
import { urlAccionCita, urlCambiarCita, urlCita } from "./enlaces";

/**
 * Los correos de las citas, uno por función. Cada una carga la cita, monta la plantilla y la manda
 * por `enviarCorreo`, que la apunta en `notifications` y no la repite. Las llaman la API pública
 * (confirmar, cancelar, cambiar), las actions del panel y el cron (recordatorios y reintentos).
 *
 * Solo en castellano por ahora: las plantillas de `src/emails` lo están, y el gallego llega en la
 * fase 3 con el resto de la traducción.
 */
export interface OpcionesEnvio {
  /** Reintento: marcar esta notificación en vez de crear otra. */
  notificacionId?: string;
}

const SIN_CORREO: ResultadoCorreo = { ok: false, error: "La clienta no tiene correo" };
const NO_EXISTE: ResultadoCorreo = { ok: false, error: "La cita no existe" };

function pie(): PieCorreo {
  return {
    nombre: BUSINESS.name,
    direccion: BUSINESS.address.full,
    telefono: BUSINESS.phone.display,
    web: SITE_URL,
  };
}

function textos(c: CitaCompleta, ajustes: Ajustes) {
  const inicio = new Date(c.cita.starts_at);
  return {
    nombre: nombreCorto(c.clienta?.name) || "hola",
    fecha: fechaLarga(inicio, ajustes.timezone),
    hora: horaDe(inicio, ajustes.timezone),
    servicios: c.items.map((i) => i.name),
    profesional: c.profesional.nombre,
    total: formatearEuros(c.cita.total_cents ?? c.items.reduce((t, i) => t + i.price_cents, 0)),
  };
}

function adjuntoIcs(c: CitaCompleta, servicios: string[], url: string) {
  return {
    filename: "cita-andrea-salon.ics",
    content: generarIcs({
      uid: `${c.cita.manage_token}@andreasalon`,
      inicio: new Date(c.cita.starts_at),
      fin: salidaDe(c),
      titulo: `${BUSINESS.name} · ${servicios.join(" + ")}`,
      descripcion: `Con ${c.profesional.nombre}. Ver o cambiar la cita: ${url}`,
      lugar: BUSINESS.address.full,
      url,
    }),
  };
}

async function cargar(bookingId: string): Promise<{ c: CitaCompleta; ajustes: Ajustes } | null> {
  const [c, ajustes] = await Promise.all([cargarCita(bookingId), getAjustes()]);
  return c ? { c, ajustes } : null;
}

export async function enviarConfirmacion(bookingId: string, opciones: OpcionesEnvio = {}): Promise<ResultadoCorreo> {
  const cargado = await cargar(bookingId);
  if (!cargado) return NO_EXISTE;
  const { c, ajustes } = cargado;
  const to = c.clienta?.email;
  if (!to) return SIN_CORREO;

  const t = textos(c, ajustes);
  const token = c.cita.manage_token;
  const urlVer = urlCita(token);
  return enviarCorreo({
    to,
    subject: `Cita confirmada: ${t.fecha} a las ${t.hora}`,
    react: (
      <CitaConfirmada
        {...t}
        urlVer={urlVer}
        urlCambiar={urlCambiarCita(token)}
        urlCancelar={urlAccionCita(token, "cancelar")}
        horasCancelacion={ajustes.cancelHours}
        pie={pie()}
      />
    ),
    attachments: [adjuntoIcs(c, t.servicios, urlVer)],
    registro: { kind: "confirmation", bookingId },
    notificacionId: opciones.notificacionId,
  });
}

export async function enviarRecordatorio(bookingId: string, opciones: OpcionesEnvio = {}): Promise<ResultadoCorreo> {
  const cargado = await cargar(bookingId);
  if (!cargado) return NO_EXISTE;
  const { c, ajustes } = cargado;
  const to = c.clienta?.email;
  if (!to) return SIN_CORREO;
  if (c.cita.status !== "confirmed") return { ok: false, error: `La cita está en estado ${c.cita.status}` };

  const t = textos(c, ajustes);
  const token = c.cita.manage_token;
  return enviarCorreo({
    to,
    subject: `Mañana a las ${t.hora} en ${BUSINESS.name}`,
    react: (
      <CitaRecordatorio
        {...t}
        urlSiVoy={urlAccionCita(token, "si-voy")}
        urlNoPuedo={urlAccionCita(token, "no-puedo")}
        urlCambiar={urlCambiarCita(token)}
        pie={pie()}
      />
    ),
    registro: { kind: "reminder", bookingId },
    notificacionId: opciones.notificacionId,
  });
}

export async function enviarCancelacion(
  bookingId: string,
  porElSalon: boolean,
  opciones: OpcionesEnvio = {},
): Promise<ResultadoCorreo> {
  const cargado = await cargar(bookingId);
  if (!cargado) return NO_EXISTE;
  const { c, ajustes } = cargado;
  const to = c.clienta?.email;
  if (!to) return SIN_CORREO;

  const t = textos(c, ajustes);
  return enviarCorreo({
    to,
    subject: `Cita cancelada: ${t.fecha} a las ${t.hora}`,
    react: (
      <CitaCancelada
        nombre={t.nombre}
        fecha={t.fecha}
        hora={t.hora}
        porElSalon={porElSalon}
        urlReservar={urlFor("reservar", "/")}
        pie={pie()}
      />
    ),
    registro: { kind: "cancelled", bookingId },
    notificacionId: opciones.notificacionId,
  });
}

/** `bookingId` es la cita NUEVA; la anterior se lee de `rescheduled_from`. */
export async function enviarCambio(bookingId: string, opciones: OpcionesEnvio = {}): Promise<ResultadoCorreo> {
  const cargado = await cargar(bookingId);
  if (!cargado) return NO_EXISTE;
  const { c, ajustes } = cargado;
  const to = c.clienta?.email;
  if (!to) return SIN_CORREO;

  const anterior = c.cita.rescheduled_from ? await cargarCita(c.cita.rescheduled_from) : null;
  const t = textos(c, ajustes);
  const inicioAnterior = anterior ? new Date(anterior.cita.starts_at) : null;
  const urlVer = urlCita(c.cita.manage_token);
  return enviarCorreo({
    to,
    subject: `Cita cambiada: ${t.fecha} a las ${t.hora}`,
    react: (
      <CitaCambiada
        {...t}
        fechaAnterior={inicioAnterior ? fechaLarga(inicioAnterior, ajustes.timezone) : "la fecha anterior"}
        horaAnterior={inicioAnterior ? horaDe(inicioAnterior, ajustes.timezone) : ""}
        urlVer={urlVer}
        pie={pie()}
      />
    ),
    attachments: [adjuntoIcs(c, t.servicios, urlVer)],
    registro: { kind: "rescheduled", bookingId },
    notificacionId: opciones.notificacionId,
  });
}

/** Reintento de una notificación que quedó en `failed` (lo llama el cron). */
export async function reenviarNotificacion(n: NotificationRow): Promise<ResultadoCorreo> {
  if (n.channel !== "email") return { ok: false, error: `Canal ${n.channel} no implementado` };
  if (!n.booking_id) return { ok: false, error: "Reintento de bonos: fase 2" };
  const opciones = { notificacionId: n.id };
  switch (n.kind) {
    case "confirmation":
      return enviarConfirmacion(n.booking_id, opciones);
    case "reminder":
      return enviarRecordatorio(n.booking_id, opciones);
    case "cancelled": {
      const c = await cargarCita(n.booking_id);
      return enviarCancelacion(n.booking_id, c?.cita.cancelled_by === "salon", opciones);
    }
    case "rescheduled":
      return enviarCambio(n.booking_id, opciones);
    default:
      return { ok: false, error: `Tipo ${n.kind} sin plantilla de cita` };
  }
}
