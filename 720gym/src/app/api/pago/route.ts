import { NextResponse } from "next/server";
import { planPorId } from "@/data/pagos";

/**
 * PASARELA DE PAGO (Stripe Checkout). Crea la sesión de pago y devuelve su URL.
 *  - Con STRIPE_SECRET_KEY en las variables de entorno de Vercel: pago real (tarjeta, Apple Pay,
 *    Google Pay). Las cuotas mensuales se crean como suscripción con cobro automático cada mes.
 *  - Sin clave: responde { demo: true } y la web muestra la pasarela en modo demostración.
 * La clave NUNCA va en el código (repositorio público).
 */
export async function POST(req: Request) {
  let datos: { planId?: string; nombre?: string; email?: string; telefono?: string };
  try {
    datos = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
  }
  const plan = planPorId(datos.planId);
  if (!plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });

  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) return NextResponse.json({ demo: true });

  const origen = new URL(req.url).origin;
  const f = new URLSearchParams();
  f.set("mode", plan.mensual ? "subscription" : "payment");
  f.set("line_items[0][quantity]", "1");
  f.set("line_items[0][price_data][currency]", "eur");
  f.set("line_items[0][price_data][unit_amount]", String(Math.round(plan.precio * 100)));
  f.set("line_items[0][price_data][product_data][name]", `720 GYM CLUB · ${plan.nombre}`);
  if (plan.mensual) f.set("line_items[0][price_data][recurring][interval]", "month");
  f.set("success_url", `${origen}/alta?estado=ok&plan=${plan.id}`);
  f.set("cancel_url", `${origen}/alta?plan=${plan.id}`);
  f.set("locale", "es");
  if (datos.email) f.set("customer_email", String(datos.email).slice(0, 200));
  f.set("metadata[nombre]", String(datos.nombre ?? "").slice(0, 200));
  f.set("metadata[telefono]", String(datos.telefono ?? "").slice(0, 40));
  f.set("metadata[plan]", plan.id);

  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: f,
      signal: AbortSignal.timeout(10000),
    });
    const j = (await r.json()) as { url?: string; error?: { message?: string } };
    if (!r.ok || !j.url) return NextResponse.json({ error: j.error?.message ?? "No se pudo iniciar el pago" }, { status: 502 });
    return NextResponse.json({ url: j.url });
  } catch {
    return NextResponse.json({ error: "La pasarela no responde. Inténtalo de nuevo." }, { status: 502 });
  }
}
