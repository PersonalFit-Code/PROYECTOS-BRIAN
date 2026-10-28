import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la clave de servicio: SE SALTA LAS POLÍTICAS RLS. Solo en el servidor y solo donde no
 * hay sesión: el cron, las notificaciones y el modo sin login de desarrollo (lib/sesion.ts).
 * Quien lo use filtra SIEMPRE por user_id a mano.
 */
let instancia: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!instancia) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
    }
    instancia = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return instancia;
}
