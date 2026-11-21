import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente con la sesión del usuario (cookies): las políticas RLS mandan, así que aunque una consulta
 * olvidara filtrar por user_id, solo vería las filas propias.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Un componente de servidor no puede escribir cookies; el proxy ya refresca la sesión.
        }
      },
    },
  });
}
