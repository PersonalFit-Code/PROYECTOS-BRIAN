/**
 * Importa clientas desde un CSV (lo que entregue Elitek, o una hoja que rellene el salón).
 *
 *   npx tsx scripts/importar-clientas.ts clientas.csv            # ensayo: no escribe nada
 *   npx tsx scripts/importar-clientas.ts clientas.csv --aplicar  # escribe
 *
 * Columnas que entiende (cualquier nombre de la lista vale; mayúsculas y tildes dan igual):
 *   nombre | nombre_completo | cliente | clienta
 *   telefono | movil | tel | phone
 *   email | correo | e_mail
 *   notas | observaciones | alergias
 *   publicidad | acepta_publicidad   (sí/no; SOLO si consta que lo aceptó: si no, no)
 *
 * Reglas:
 * - El teléfono es la llave (como en la reserva online): se normaliza a +34… y, si ya existe una
 *   ficha con ese teléfono, se completa (correo y notas vacíos) sin pisar lo que haya.
 * - Una fila sin nombre, o con un teléfono que no es español, se salta y sale en el informe.
 * - El consentimiento de publicidad NO se presume: solo se marca si la columna dice que sí.
 *   Una exportación de otro proveedor no es un consentimiento nuevo (RGPD art. 7).
 *
 * Necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { campo, leerCsv } from "../src/lib/csvLeer";
import { normalizarTelefonoES } from "../src/lib/phone";
import type { Database } from "../src/lib/supabase/types";

const ruta = process.argv[2];
const aplicar = process.argv.includes("--aplicar");
if (!ruta) {
  console.error("Uso: npx tsx scripts/importar-clientas.ts <fichero.csv> [--aplicar]");
  process.exit(1);
}

const SI = /^(s|si|sí|yes|y|1|true|x)$/i;

async function main() {
  const { filas, cabeceras } = leerCsv(readFileSync(ruta!, "utf8"));
  console.log(`Columnas: ${cabeceras.join(", ")}`);
  console.log(`Filas: ${filas.length}${aplicar ? "" : "  (ENSAYO: no se escribe nada; añade --aplicar)"}`);

  const validas: { name: string; phone: string | null; email: string | null; notes: string | null; marketing: boolean }[] = [];
  const saltadas: string[] = [];
  const vistos = new Set<string>();

  filas.forEach((f, i) => {
    const linea = i + 2;
    const nombre = campo(f, ["nombre", "nombre_completo", "cliente", "clienta", "name"]);
    const telCrudo = campo(f, ["telefono", "movil", "tel", "phone", "telefono_movil"]);
    const email = campo(f, ["email", "correo", "e_mail", "mail"]).toLowerCase();
    const notas = campo(f, ["notas", "observaciones", "alergias", "notes"]);
    const publicidad = SI.test(campo(f, ["publicidad", "acepta_publicidad", "marketing"]));
    if (nombre.length < 2) return void saltadas.push(`línea ${linea}: sin nombre`);
    const telefono = telCrudo ? normalizarTelefonoES(telCrudo) : null;
    if (telCrudo && !telefono) return void saltadas.push(`línea ${linea}: teléfono no español "${telCrudo}" (${nombre})`);
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return void saltadas.push(`línea ${linea}: correo raro "${email}" (${nombre})`);
    if (telefono && vistos.has(telefono)) return void saltadas.push(`línea ${linea}: teléfono repetido en el fichero (${nombre})`);
    if (telefono) vistos.add(telefono);
    validas.push({ name: nombre, phone: telefono, email: email || null, notes: notas || null, marketing: publicidad });
  });

  console.log(`Válidas: ${validas.length} · Saltadas: ${saltadas.length}`);
  for (const s of saltadas) console.log(`  - ${s}`);
  if (!aplicar) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
  const db = createClient<Database>(url, key, { auth: { persistSession: false } });

  let nuevas = 0;
  let completadas = 0;
  for (const c of validas) {
    if (c.phone) {
      const { data: existente } = await db.from("clients").select("id, email, notes").eq("phone", c.phone).maybeSingle();
      if (existente) {
        const cambios: { email?: string; notes?: string } = {};
        if (!existente.email && c.email) cambios.email = c.email;
        if (!existente.notes && c.notes) cambios.notes = c.notes;
        if (Object.keys(cambios).length) {
          const { error } = await db.from("clients").update(cambios).eq("id", existente.id);
          if (error) throw error;
          completadas++;
        }
        continue;
      }
    }
    const { error } = await db.from("clients").insert({
      name: c.name,
      phone: c.phone,
      email: c.email,
      notes: c.notes,
      source: "import",
      marketing_consent: c.marketing,
      marketing_consent_at: c.marketing ? new Date().toISOString() : null,
    });
    if (error) throw error;
    nuevas++;
  }
  console.log(`Hecho: ${nuevas} nuevas, ${completadas} fichas completadas.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
