import { z } from "zod";
import { LOCALES } from "@/i18n/config";
import { comprobarCuota, error, leerJson, ok } from "@/lib/api";
import { urlFor } from "@/lib/hosts";
import { crearLimitador } from "@/lib/rateLimit";
import { getStripe, stripeConfigurado } from "@/lib/stripe";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/bonos/checkout  { productId, nombre, email, paraQuien?, mensaje?, condiciones: true }
 *
 * Crea una sesión de Stripe Checkout ALOJADA (la clienta paga en la página de Stripe: cero JS de
 * Stripe aquí, Apple/Google Pay sin configurar nada, PCI SAQ-A) y devuelve su URL. El precio sale de
 * la base de datos, nunca del navegador. El bono se crea en el webhook, cuando Stripe confirma el
 * pago; esta ruta no crea nada.
 */
export const dynamic = "force-dynamic";

const limitador = crearLimitador({ maximo: 10, ventanaMs: 10 * 60_000 });

const Cuerpo = z.object({
  productId: z.uuid(),
  nombre: z.string().trim().min(2).max(80),
  email: z.email().trim().max(120),
  paraQuien: z.string().trim().max(80).optional().default(""),
  mensaje: z.string().trim().max(300).optional().default(""),
  condiciones: z.literal(true),
  locale: z.enum(LOCALES).optional().default("es"),
});

export async function POST(req: Request) {
  const cuota = comprobarCuota(limitador, req);
  if (cuota) return cuota;
  if (!stripeConfigurado()) return error(503, "ERROR_INTERNO", "Los bonos online aún no están activos");

  const lectura = await leerJson(req, Cuerpo);
  if (!lectura.ok) return lectura.respuesta;
  const d = lectura.datos;

  try {
    const { data: p } = await getAdminClient()
      .from("voucher_products")
      .select("id, name, description, price_cents, active, kind, sessions, value_cents, validity_months")
      .eq("id", d.productId)
      .maybeSingle();
    if (!p || !p.active) return error(400, "DATOS_INVALIDOS", "Ese bono ya no está a la venta");

    const metadata = {
      product_id: p.id,
      buyer_name: d.nombre,
      recipient_name: d.paraQuien,
      // Stripe limita cada valor de metadata a 500 caracteres; el mensaje va recortado a 300.
      gift_message: d.mensaje,
    };
    const sesion = await getStripe().checkout.sessions.create({
      mode: "payment",
      locale: "es",
      customer_email: d.email.toLowerCase(),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: p.price_cents,
            product_data: {
              name: p.name,
              description:
                (p.description ?? undefined) ||
                (p.validity_months ? `Válido ${p.validity_months} meses desde la compra` : "No caduca"),
            },
          },
        },
      ],
      metadata,
      payment_intent_data: { metadata, description: `${p.name} · Andrea Salón` },
      success_url: `${urlFor("web", "/bonos/gracias", d.locale)}?cs={CHECKOUT_SESSION_ID}`,
      cancel_url: urlFor("web", "/bonos", d.locale),
    });
    if (!sesion.url) return error(500, "ERROR_INTERNO");
    return ok({ url: sesion.url });
  } catch (e) {
    console.error("[bonos/checkout]", e);
    return error(500, "ERROR_INTERNO");
  }
}
