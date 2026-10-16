import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAdminClient } from "./admin";
import type { Database } from "./types";
import { panelSinLogin } from "@/lib/panel/sinLogin";

/**
 * Cliente de Supabase para componentes de servidor, Server Actions y route handlers DEL PANEL:
 * va con la sesión del usuario (cookies), así que las políticas RLS mandan. Una empleada que
 * pidiera la agenda de otra recibiría una lista vacía aunque la interfaz se equivocara.
 *
 * Para lo público (reserva, bonos, cron, webhook) NO se usa este cliente: ahí no hay usuario y se
 * escribe con el de `admin.ts`, siempre desde el servidor y tras validar la entrada.
 */
export async function createClient() {
  /* Panel sin contraseña (ver `panelSinLogin` en lib/panel/sesion.ts): sin cookie de sesión, RLS no
     devolvería nada; se lee como la dueña, que lo ve todo. Mismo criterio que allí, repetido aquí
     para no importar la sesión desde el cliente de base de datos. */
  if (panelSinLogin()) {
    return getAdminClient() as unknown as ReturnType<typeof createServerClient<Database>>;
  }
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
