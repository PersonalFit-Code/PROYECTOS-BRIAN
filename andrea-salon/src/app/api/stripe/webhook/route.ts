import { after } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getAdminClient } from "@/lib/supabase/admin";
import { emitirBono, enviarBono } from "@/lib/vouchers/emitir";

/**
 * POST /api/stripe/webhook — Stripe avisa de pagos y devoluciones.
 *
 * 1. Se lee el cuerpo CRUDO (`req.text()`) y se verifica la firma con `STRIPE_WEBHOOK_SECRET`: sin
 *    eso, cualquiera podría "regalarse" un bono llamando aquí.
 * 2. `checkout.session.completed` (o `async_payment_succeeded`) con el pago hecho → se emite el
 *    bono. Stripe reintenta si no recibe 200, y puede mandar el mismo evento dos veces: el
 *    `unique (stripe_checkout_session_id)` hace que solo exista un bono por pago.
 * 3. `charge.refunded` → el bono deja de valer (las devoluciones se hacen desde el dashboard de
 *    Stripe de Andrea; aquí no hay botón de devolver).
 *
 * El correo sale después de responder (`after`) para contestar a Stripe rápido.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  const firma = req.headers.get("stripe-signature");
  if (!secreto || !firma) return new Response("Sin firma", { status: 400 });

  const cuerpo = await req.text();
  let evento: Stripe.Event;
  try {
    evento = getStripe().webhooks.constructEvent(cuerpo, firma, secreto);
  } catch (e) {
    console.error("[stripe] firma no válida:", (e as Error).message);
    return new Response("Firma no válida", { status: 400 });
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = evento.data.object;
        if (s.payment_status !== "paid") break; // pagos diferidos: llega luego async_payment_succeeded
        const m = s.metadata ?? {};
        if (!m.product_id) break; // no es un bono (otro uso de la cuenta)
        const r = await emitirBono({
          productId: m.product_id,
          compradora: { nombre: m.buyer_name ?? "", email: s.customer_details?.email ?? s.customer_email ?? null },
          paraQuien: m.recipient_name || null,
          mensaje: m.gift_message || null,
          stripe: {
            sessionId: s.id,
            paymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? null),
          },
          metodo: "stripe",
          enSalon: false,
          actor: null,
        });
        if (!r.ok) {
          // 500 → Stripe reintenta. Mejor eso que un pago sin bono.
          console.error("[stripe] no se pudo emitir el bono:", r.error);
          return new Response("Error al emitir", { status: 500 });
        }
        if (r.nuevo) {
          const bono = r.bono;
          after(async () => {
            const c = await enviarBono(bono);
            if (!c.ok) console.error("[stripe] correo del bono:", c.error);
          });
        }
        break;
      }
      case "charge.refunded": {
        const c = evento.data.object;
        const pi = typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id;
        if (pi) {
          const { error } = await getAdminClient().rpc("refund_voucher", { p_payment_intent: pi, p_amount: c.amount_refunded });
          if (error) throw new Error(error.message);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("[stripe] webhook:", e);
    return new Response("Error", { status: 500 });
  }
  return new Response("ok", { status: 200 });
}
