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
}

/**
 * La sesión de la petición, o a /login. Cacheada por petición (`cache`): el layout y la página la
 * piden los dos y no hace falta ir dos veces a Supabase.
 *
 * La primera vez que entra un usuario se crean sus datos de partida (`seed_user`, idempotente).
 */
export const getSesion = cache(async (): Promise<Sesion> => {
  if (sinLogin()) {
    const userId = process.env.APP_USER_ID!;
    const db = getAdminClient();
    await db.rpc("seed_user", { uid: userId });
    return { db, userId };
  }
  const db = await createSessionClient();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect("/login");
  const { count } = await db.from("settings").select("user_id", { count: "exact", head: true });
  if (!count) await getAdminClient().rpc("seed_user", { uid: data.user.id });
  return { db, userId: data.user.id };
});

/** Igual que getSesion pero para rutas de API: null en vez de redirigir. */
export async function getSesionApi(): Promise<Sesion | null> {
  if (sinLogin()) return getSesion();
  const db = await createSessionClient();
  const { data } = await db.auth.getUser();
  if (!data.user) return null;
  return { db, userId: data.user.id };
}
