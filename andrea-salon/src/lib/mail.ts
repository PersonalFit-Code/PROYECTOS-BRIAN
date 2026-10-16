import "server-only";

import type { ReactElement } from "react";
import { Resend } from "resend";
import { getAdminClient } from "@/lib/supabase/admin";
import type { NotificationChannel, NotificationKind } from "@/lib/supabase/types";

/**
 * Todo correo del sistema sale por aquí. Antes de enviar se apunta en `notifications` con
 * `queue_notification`, que devuelve null si ese correo ya existía: una confirmación que se
 * reintenta, o un cron que se ejecuta dos veces, no llega dos veces.
 *
 * Sin `RESEND_API_KEY` no se envía nada y la notificación queda en `failed` con el motivo:
 * en desarrollo es lo esperado, y en producción es lo que hay que ver en el panel.
 */
export interface Registro {
  kind: NotificationKind;
  bookingId?: string;
  voucherId?: string;
  channel?: NotificationChannel;
}

export interface Correo {
  to: string;
  subject: string;
  react: ReactElement;
  text?: string;
  /** `contentId` = imagen incrustada en el cuerpo (`<img src="cid:…">`), p. ej. el QR del bono. */
  attachments?: { filename: string; content: Buffer | string; contentType?: string; contentId?: string }[];
  /** Apunta el envío en `notifications` (y lo deduplica). */
  registro?: Registro;
  /**
   * Reintento del cron: la notificación ya existe (quedó en `failed`), así que no se vuelve a
   * encolar; se marca esa misma fila. Tiene prioridad sobre `registro`.
   */
  notificacionId?: string;
}

export type ResultadoCorreo =
  | { ok: true; id: string | null; duplicado?: boolean }
  | { ok: false; error: string };

let cliente: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cliente) cliente = new Resend(key);
  return cliente;
}

function remitente(): string {
  return process.env.EMAIL_FROM || "Andrea Salón <onboarding@resend.dev>";
}

export async function enviarCorreo(correo: Correo): Promise<ResultadoCorreo> {
  const db = getAdminClient();
  let notificacionId: string | null = correo.notificacionId ?? null;

  if (!notificacionId && correo.registro) {
    const { data, error } = await db.rpc("queue_notification", {
      p_channel: correo.registro.channel ?? "email",
      p_kind: correo.registro.kind,
      p_booking: correo.registro.bookingId ?? null,
      p_voucher: correo.registro.voucherId ?? null,
    });
    if (error) return { ok: false, error: `No se pudo apuntar la notificación: ${error.message}` };
    if (!data) return { ok: true, id: null, duplicado: true };
    notificacionId = data;
  }

  const resend = getResend();
  if (!resend) {
    await marcar(notificacionId, { status: "failed", error: "Sin RESEND_API_KEY en el entorno" });
    return { ok: false, error: "Sin RESEND_API_KEY en el entorno" };
  }

  const { data, error } = await resend.emails.send({
    from: remitente(),
    to: correo.to,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
    subject: correo.subject,
    react: correo.react,
    text: correo.text,
    attachments: correo.attachments,
  });

  if (error || !data) {
    const motivo = error?.message ?? "Resend no devolvió identificador";
    await marcar(notificacionId, { status: "failed", error: motivo });
    return { ok: false, error: motivo };
  }

  await marcar(notificacionId, { status: "sent", provider_id: data.id, sent_at: new Date().toISOString() });
  return { ok: true, id: data.id };
}

async function marcar(
  id: string | null,
  cambios: { status: "sent" | "failed"; error?: string; provider_id?: string; sent_at?: string },
): Promise<void> {
  if (!id) return;
  const db = getAdminClient();
  const { data: actual } = await db.from("notifications").select("attempts").eq("id", id).maybeSingle();
  await db
    .from("notifications")
    .update({
      status: cambios.status,
      error: cambios.error ?? null,
      provider_id: cambios.provider_id ?? null,
      sent_at: cambios.sent_at ?? null,
      attempts: (actual?.attempts ?? 0) + 1,
    })
    .eq("id", id);
}
