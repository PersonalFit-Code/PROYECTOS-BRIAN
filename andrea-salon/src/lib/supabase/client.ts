"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Cliente de Supabase en el navegador. Solo lo usa el panel para iniciar y cerrar sesión; los
 * datos se leen y escriben desde el servidor. Devuelve siempre la misma instancia por pestaña.
 */
let instancia: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserClient() {
  if (!instancia) {
    instancia = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return instancia;
}
