import "server-only";

import { BUSINESS } from "@/data/business";
import BonoCaduca from "@/emails/BonoCaduca";
import BonoEntregado from "@/emails/BonoEntregado";
import { urlFor } from "@/lib/hosts";
import { codigoDeRaise } from "@/lib/api";
import { fechaLarga } from "@/lib/fechas";
import { enviarCorreo, type ResultadoCorreo } from "@/lib/mail";
import { formatearEuros } from "@/lib/money";
import { nombreCorto } from "@/lib/reservas/citas";
import { SITE_URL } from "@/lib/siteUrl";
import { getAdminClient } from "@/lib/supabase/admin";
import type { PaymentMethod, VoucherRow } from "@/lib/supabase/types";
import { generarCodigoBono } from "./code";
import { urlBono } from "./enlaces";
import { qrPng } from "./qr";

/**
 * Emitir un bono: genera el código, lo crea con su cobro (`issue_voucher`, una transacción) y manda
 * el correo con el QR. Lo usan el webhook de Stripe y la venta en el salón.
 *
 * Idempotente con Stripe: si el pago ya emitió su bono, `issue_voucher` devuelve null y aquí se
 * devuelve el que existe sin mandar otro correo.
 */
export interface DatosEmision {
  productId: string;
  compradora: { nombre: string; email: string | null };
  paraQuien?: string | null;
  mensaje?: string | null;
  stripe?: { sessionId: string; paymentIntent: string | null };
  metodo: PaymentMethod;
  enSalon: boolean;
  actor: string | null;
}

export type ResultadoEmision =
  | { ok: true; bono: VoucherRow; nuevo: boolean }
  | { ok: false; error: string; codigo?: string };

export async function emitirBono(d: DatosEmision): Promise<ResultadoEmision> {
  const db = getAdminClient();
  // Un código repetido (improbable: 40 bits) choca con el `unique` y se prueba otro.
  for (let intento = 0; intento < 5; intento++) {
    const { data, error } = await db.rpc("issue_voucher", {
      p_product: d.productId,
      p_code: generarCodigoBono(),
      p_buyer_name: d.compradora.nombre,
      p_buyer_email: d.compradora.email,
      p_recipient_name: d.paraQuien ?? null,
      p_gift_message: d.mensaje ?? null,
      p_stripe_session: d.stripe?.sessionId ?? null,
      p_payment_intent: d.stripe?.paymentIntent ?? null,
      p_method: d.metodo,
      p_sold_in_salon: d.enSalon,
      p_actor: d.actor,
    });
    if (error) {
      if (error.code === "23505" && /code/.test(error.message)) continue;
      return { ok: false, error: error.message, codigo: codigoDeRaise(error) ?? undefined };
    }
    if (data && data.id) return { ok: true, bono: data, nuevo: true };

    // Ya existía (reintento del webhook): se devuelve el bono de ese pago.
    if (d.stripe) {
      const { data: existente } = await db
        .from("vouchers")
        .select("*")
        .eq("stripe_checkout_session_id", d.stripe.sessionId)
        .maybeSingle();
      if (existente) return { ok: true, bono: existente, nuevo: false };
    }
    return { ok: false, error: "No se pudo emitir el bono" };
  }
  return { ok: false, error: "No se pudo generar un código libre" };
}

export function queIncluye(b: Pick<VoucherRow, "kind" | "sessions_total" | "value_cents">): string {
  return b.kind === "sessions"
    ? `${b.sessions_total} ${b.sessions_total === 1 ? "sesión" : "sesiones"}`
    : `Tarjeta regalo de ${formatearEuros(b.value_cents ?? 0)}`;
}

export function textoCaducidad(expiresAt: string | null): string {
  return expiresAt ? `Válido hasta el ${fechaLarga(expiresAt).replace(/^[^,]+, /, "")}` : "No caduca";
}

/** Aviso de caducidad (uno por bono: `queue_notification` lo deduplica). */
export async function enviarAvisoCaducidad(bono: VoucherRow, opciones: { notificacionId?: string } = {}): Promise<ResultadoCorreo> {
  if (!bono.buyer_email || !bono.expires_at) return { ok: false, error: "Sin correo o sin caducidad" };
  const queda =
    bono.kind === "sessions"
      ? `Te ${bono.sessions_left === 1 ? "queda 1 sesión" : `quedan ${bono.sessions_left} sesiones`}`
      : `Te quedan ${formatearEuros(bono.balance_cents ?? 0)} de saldo`;
  return enviarCorreo({
    to: bono.buyer_email,
    subject: `Tu ${bono.name} caduca pronto`,
    react: (
      <BonoCaduca
        nombre={nombreCorto(bono.buyer_name) || "hola"}
        bono={bono.name}
        codigo={bono.code}
        queda={queda}
        fecha={fechaLarga(bono.expires_at).replace(/^[^,]+, /, "")}
        urlReservar={urlFor("reservar", "/")}
        urlBono={urlBono(bono.code)}
        pie={{ nombre: BUSINESS.name, direccion: BUSINESS.address.full, telefono: BUSINESS.phone.display, web: SITE_URL }}
      />
    ),
    registro: { kind: "voucher_expiring", voucherId: bono.id },
    notificacionId: opciones.notificacionId,
  });
}

/** Correo con el bono y su QR incrustado. Se apunta en `notifications` (uno por bono). */
export async function enviarBono(bono: VoucherRow, opciones: { notificacionId?: string } = {}): Promise<ResultadoCorreo> {
  if (!bono.buyer_email) return { ok: false, error: "El bono no tiene correo" };
  const url = urlBono(bono.code);
  const png = await qrPng(url);
  return enviarCorreo({
    to: bono.buyer_email,
    subject: `Tu ${bono.name} · ${BUSINESS.name}`,
    react: (
      <BonoEntregado
        nombre={nombreCorto(bono.buyer_name) || "hola"}
        bono={bono.name}
        codigo={bono.code}
        queIncluye={queIncluye(bono)}
        caducidad={textoCaducidad(bono.expires_at)}
        paraQuien={bono.recipient_name}
        mensaje={bono.gift_message}
        urlBono={url}
        qrCid="cid:qr-bono"
        pie={{ nombre: BUSINESS.name, direccion: BUSINESS.address.full, telefono: BUSINESS.phone.display, web: SITE_URL }}
      />
    ),
    attachments: [{ filename: `bono-${bono.code}.png`, content: png, contentType: "image/png", contentId: "qr-bono" }],
    registro: { kind: "voucher", voucherId: bono.id },
    notificacionId: opciones.notificacionId,
  });
}
