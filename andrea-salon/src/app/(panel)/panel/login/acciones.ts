"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { crearLimitador } from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";

/**
 * Entrar al panel. Cinco intentos cada quince minutos por IP: suficiente para quien se equivoca
 * de contraseña, inútil para quien prueba contraseñas en bucle. El error es SIEMPRE el mismo
 * («usuario o contraseña incorrectos»): no se dice si el correo existe.
 */
const limitador = crearLimitador({ maximo: 5, ventanaMs: 15 * 60_000 });

const Datos = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1).max(200) });

export interface EstadoLogin {
  error: string | null;
}

export async function entrar(_prev: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const cuota = limitador.permitir(`login:${ip}`);
  if (!cuota.ok) {
    return { error: `Demasiados intentos. Espera ${Math.ceil(cuota.reintentarEnMs / 60_000)} minutos.` };
  }

  const datos = Datos.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!datos.success) return { error: "Usuario o contraseña incorrectos." };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { error: "El panel aún no está conectado a la base de datos." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(datos.data);
  if (error) return { error: "Usuario o contraseña incorrectos." };

  redirect("/panel");
}

export async function salir(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/panel/login");
}
