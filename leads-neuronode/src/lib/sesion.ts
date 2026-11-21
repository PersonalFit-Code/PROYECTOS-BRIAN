import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";
import { sinLogin } from "@/lib/sinLogin";

export interface Sesion {
  db: SupabaseClient;
  userId: string;
  email: string;
}

/**
 * La sesión de la petición, o a /login. Cacheada por petición: el layout y la página la piden los
 * dos y no hace falta ir dos veces a Supabase.
 */
export const getSesion = cache(async (): Promise<Sesion> => {
  if (sinLogin()) return { db: getAdminClient(), userId: process.env.APP_USER_ID!, email: "desarrollo" };
  const db = await createSessionClient();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect("/login");
  return { db, userId: data.user.id, email: data.user.email ?? "" };
});
