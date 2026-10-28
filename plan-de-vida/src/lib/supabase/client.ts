"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Cliente del navegador: solo para iniciar y cerrar sesión. Los datos van por el servidor. */
let instancia: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!instancia) {
    instancia = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return instancia;
}
