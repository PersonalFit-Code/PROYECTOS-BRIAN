import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/supabase/types";

/**
 * Quién está usando el panel. `auth.getUser()` (no `getSession`) valida el token contra Supabase
 * en cada petición: una cookie manipulada no cuela. `cache` hace que layout, página y actions de
 * una misma petición compartan una sola consulta.
 *
 * REGLA: cada Server Action llama a `requireSesion()` o `requireOwner()` al principio, aunque la
 * página ya lo haga. Una action es un endpoint público con nombre raro; el layout no la protege.
 */
export interface Sesion {
  userId: string;
  email: string | null;
  role: Role;
  staffId: string | null;
  nombre: string;
}

export const getSesion = cache(async (): Promise<Sesion | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: perfil } = await supabase
    .from("profiles")
    .select("role, staff_id, display_name")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!perfil) return null;
  return {
    userId: data.user.id,
    email: data.user.email ?? null,
    role: perfil.role,
    staffId: perfil.staff_id,
    nombre: perfil.display_name ?? data.user.email ?? "",
  };
});

export async function requireSesion(): Promise<Sesion> {
  const s = await getSesion();
  if (!s) redirect("/panel/login");
  return s;
}

export async function requireOwner(): Promise<Sesion> {
  const s = await requireSesion();
  if (s.role !== "owner") redirect("/panel/sin-permiso");
  return s;
}

/** Una empleada solo toca sus citas; la dueña, todas. */
export function puedeTocarCita(s: Sesion, staffIdCita: string): boolean {
  return s.role === "owner" || s.staffId === staffIdCita;
}
