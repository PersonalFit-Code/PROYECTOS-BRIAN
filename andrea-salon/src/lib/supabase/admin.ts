import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cliente con la clave de servicio: SE SALTA LAS POLÍTICAS RLS. Solo existe en el servidor
 * (`server-only` hace que importarlo desde un componente de cliente rompa la build) y solo se usa
 * donde no hay usuario: la reserva pública, el webhook de Stripe, el cron y los scripts.
 *
 * Regla: quien lo use valida la entrada antes (zod) y limita el ritmo (rateLimit). Este cliente no
 * tiene red de seguridad por debajo.
 */
let instancia: SupabaseClient<Database> | null = null;

export function getAdminClient(): SupabaseClient<Database> {
  if (!instancia) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
    }
    instancia = createSupabaseClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return instancia;
}
