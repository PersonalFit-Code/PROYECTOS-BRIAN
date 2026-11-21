import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Refresca la sesión de Supabase en cada petición y dice si hay usuario.
 *
 * Los componentes de servidor no pueden escribir cookies: si el token caduca y solo se renovara allí,
 * la cookie nueva no llegaría al navegador. El proxy sí puede: `getUser()` renueva y las cookies se
 * copian en la respuesta.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<{ response: NextResponse; logueado: boolean }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { response, logueado: false };

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // No quitar: es la llamada que renueva el token caducado y dispara `setAll`.
  const { data } = await supabase.auth.getUser();
  return { response, logueado: Boolean(data.user) };
}
