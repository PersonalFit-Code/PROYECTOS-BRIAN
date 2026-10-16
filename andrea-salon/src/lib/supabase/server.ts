import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Cliente de Supabase para componentes de servidor, Server Actions y route handlers DEL PANEL:
 * va con la sesión del usuario (cookies), así que las políticas RLS mandan. Una empleada que
 * pidiera la agenda de otra recibiría una lista vacía aunque la interfaz se equivocara.
 *
 * Para lo público (reserva, bonos, cron, webhook) NO se usa este cliente: ahí no hay usuario y se
 * escribe con el de `admin.ts`, siempre desde el servidor y tras validar la entrada.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
          } catch {
            // Un componente de servidor no puede escribir cookies: no pasa nada, el proxy
            // (`proxy-session.ts`) ya refresca la sesión en cada petición.
          }
        },
      },
    },
  );
}
