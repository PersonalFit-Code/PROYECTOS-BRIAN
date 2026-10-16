/**
 * Crea (o actualiza) un usuario del panel. No hay registro público: los usuarios los crea Brian.
 *
 *   npx tsx scripts/crear-usuario.ts --email andrea@… --nombre "Andrea" --rol owner
 *   npx tsx scripts/crear-usuario.ts --email carolina@… --nombre "Carolina" --rol staff --staff carolina
 *
 * Imprime una contraseña provisional (o usa --password). `--staff <slug>` vincula el usuario a su
 * columna de la agenda: una empleada sin `staff` no vería ninguna cita.
 * Necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/types";

function arg(nombre: string): string | undefined {
  const i = process.argv.indexOf(`--${nombre}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const email = arg("email")?.toLowerCase();
const nombre = arg("nombre");
const rol = arg("rol") === "owner" ? "owner" : "staff";
const staffSlug = arg("staff");
const password = arg("password") ?? randomBytes(9).toString("base64url");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !nombre || !url || !key) {
  console.error("Uso: --email … --nombre … [--rol owner|staff] [--staff <slug>] (y las variables de Supabase).");
  process.exit(1);
}

const db = createClient<Database>(url, key, { auth: { persistSession: false } });

async function main() {
  let staffId: string | null = null;
  if (staffSlug) {
    const { data } = await db.from("staff").select("id").eq("slug", staffSlug).maybeSingle();
    if (!data) throw new Error(`No hay ninguna profesional con slug "${staffSlug}".`);
    staffId = data.id;
  }

  const { data: lista } = await db.auth.admin.listUsers({ perPage: 1000 });
  const existente = lista?.users.find((u) => u.email?.toLowerCase() === email);
  let userId: string;
  if (existente) {
    const { error } = await db.auth.admin.updateUserById(existente.id, arg("password") ? { password } : {});
    if (error) throw error;
    userId = existente.id;
    console.log(`Usuario ya existía: ${email}${arg("password") ? " (contraseña cambiada)" : ""}`);
  } else {
    const { data, error } = await db.auth.admin.createUser({ email: email!, password, email_confirm: true });
    if (error || !data.user) throw error ?? new Error("No se creó el usuario");
    userId = data.user.id;
    console.log(`Creado ${email} · contraseña provisional: ${password}`);
  }

  // El trigger handle_new_user crea el perfil; aquí se fija rol, profesional y nombre.
  const { error } = await db.from("profiles").upsert({ id: userId, role: rol, staff_id: staffId, display_name: nombre });
  if (error) throw error;
  console.log(`Perfil: ${rol}${staffId ? ` · agenda de ${staffSlug}` : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
