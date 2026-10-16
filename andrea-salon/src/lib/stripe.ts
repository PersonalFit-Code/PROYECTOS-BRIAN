import "server-only";

import Stripe from "stripe";

/**
 * Cliente de Stripe con la clave de la cuenta de ANDREA (`sk_test` en Preview, `sk_live` en
 * Production). El dinero va directo a su cuenta; esta app solo crea la sesión de pago y escucha el
 * webhook. Sin clave, los bonos online se desactivan con un mensaje y la venta en el salón sigue.
 */
let cliente: Stripe | null = null;

export function stripeConfigurado(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Falta STRIPE_SECRET_KEY en el entorno.");
  if (!cliente) cliente = new Stripe(key, { appInfo: { name: "Andrea Salón" } });
  return cliente;
}
