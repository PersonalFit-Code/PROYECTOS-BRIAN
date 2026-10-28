"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function salir() {
  const db = await createSessionClient();
  await db.auth.signOut();
  redirect("/login");
}
