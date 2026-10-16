import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Refresca la sesión de Supabase en cada petición al panel.
 *
 * Los componentes de servidor no pueden escribir cookies, así que si el token de acceso ha caducado
 * y solo lo renovara `server.ts`, la cookie nueva nunca llegaría al navegador y la sesión "se
 * caería" al rato. El proxy sí puede escribir cookies: aquí se llama a `getUser()` (que renueva si
 * hace falta) y las cookies resultantes se copian en la respuesta que ya tengamos (un rewrite o un
 * `next()`), sin cambiarla.
 *
 * Sin variables de Supabase (p. ej. una build sin `.env`), no se hace nada: el panel pedirá login
 * y fallará ahí con un error claro, que es mejor que romper el proxy entero.
 */
export async function updateSession(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

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
  await supabase.auth.getUser();
  return response;
}
