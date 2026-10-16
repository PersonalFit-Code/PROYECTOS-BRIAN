/**
 * Importa citas FUTURAS desde un CSV (la agenda de Elitek o una hoja transcrita por el salón), para
 * que el día del cambio no se pierda ninguna.
 *
 *   npx tsx scripts/importar-citas.ts citas.csv            # ensayo: comprueba todo, no escribe
 *   npx tsx scripts/importar-citas.ts citas.csv --aplicar
 *
 * Columnas (cualquier alias vale):
 *   fecha (15/10/2026 o 2026-10-15) · hora (9:30) · duracion | minutos (opcional)
 *   servicio | servicios (nombre o slug; varios separados por "+")
 *   profesional | empleada (nombre o slug)
 *   clienta | nombre · telefono | movil · email (opcional) · notas (opcional)
 *
 * Reglas:
 * - Solo citas desde HOY: el histórico no hace falta para trabajar y ensuciaría la analítica.
 * - Servicio y profesional tienen que existir ya en el panel (se buscan por slug o por nombre sin
 *   tildes). Si no, la fila se salta y sale en el informe: mejor una lista de pendientes que una
 *   cita con el servicio equivocado.
 * - La duración sale de los servicios (con su buffer); si el CSV trae minutos, mandan los del CSV.
 * - Se crean como confirmadas, origen "import", SIN correo a la clienta (ya sabe que tiene cita).
 * - Si dos citas chocan, la segunda se rechaza (restricción de exclusión) y sale en el informe.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { fechaLocal, instanteEnZona } from "../src/lib/booking";
import { campo, fechaEuropea, horaTexto, leerCsv, normalizarCabecera } from "../src/lib/csvLeer";
import { normalizarTelefonoES } from "../src/lib/phone";
import type { Database } from "../src/lib/supabase/types";

const ZONA = "Europe/Madrid";
const ruta = process.argv[2];
const aplicar = process.argv.includes("--aplicar");
if (!ruta) {
  console.error("Uso: npx tsx scripts/importar-citas.ts <fichero.csv> [--aplicar]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (hacen falta también en el ensayo, para buscar servicios y profesionales).");
  process.exit(1);
}
const db = createClient<Database>(url, key, { auth: { persistSession: false } });

const clave = (t: string) => normalizarCabecera(t);

async function main() {
  const [{ data: servicios }, { data: equipo }] = await Promise.all([
    db.from("services").select("id, slug, name, duration_min, buffer_min, price_cents"),
    db.from("staff").select("id, slug, name"),
  ]);
  const servicioDe = (t: string) => (servicios ?? []).find((s) => s.slug === clave(t).replace(/_/g, "-") || clave(s.name) === clave(t));
  const profesionalDe = (t: string) => (equipo ?? []).find((p) => p.slug === clave(t).replace(/_/g, "-") || clave(p.name) === clave(t));

  const { filas } = leerCsv(readFileSync(ruta!, "utf8"));
  const hoy = fechaLocal(new Date(), ZONA);
  const problemas: string[] = [];
  let pasadas = 0;
  let creadas = 0;
  let listas = 0;

  for (const [i, f] of filas.entries()) {
    const linea = i + 2;
    const fecha = fechaEuropea(campo(f, ["fecha", "dia", "date"]));
    const hora = horaTexto(campo(f, ["hora", "inicio", "time"]));
    if (!fecha || !hora) {
      problemas.push(`línea ${linea}: fecha u hora ilegible`);
      continue;
    }
    if (fecha < hoy) {
      pasadas++;
      continue;
    }
    const nombresServicio = campo(f, ["servicio", "servicios", "service"]).split("+").map((s) => s.trim()).filter(Boolean);
    const elegidos = nombresServicio.map(servicioDe);
    if (elegidos.length === 0 || elegidos.some((s) => !s)) {
      problemas.push(`línea ${linea}: servicio desconocido "${nombresServicio.join(" + ")}" (créalo en el panel o corrige el CSV)`);
      continue;
    }
    const prof = profesionalDe(campo(f, ["profesional", "empleada", "trabajadora", "staff"]));
    if (!prof) {
      problemas.push(`línea ${linea}: profesional desconocida "${campo(f, ["profesional", "empleada", "trabajadora", "staff"])}"`);
      continue;
    }
    const nombre = campo(f, ["clienta", "cliente", "nombre", "name"]);
    const telCrudo = campo(f, ["telefono", "movil", "tel", "phone"]);
    const telefono = telCrudo ? normalizarTelefonoES(telCrudo) : null;
    if (nombre.length < 2) {
      problemas.push(`línea ${linea}: sin nombre de clienta`);
      continue;
    }

    const lista = elegidos as NonNullable<(typeof elegidos)[number]>[];
    const minutosCsv = Number(campo(f, ["duracion", "minutos", "duration"]));
    const minutos = minutosCsv > 0 ? minutosCsv : lista.reduce((t, s) => t + s.duration_min, 0) + (lista[lista.length - 1]?.buffer_min ?? 0);
    const [a, m, d] = fecha.split("-").map(Number);
    const [h, mi] = hora.split(":").map(Number);
    const inicio = instanteEnZona(a!, m!, d!, h!, mi!, ZONA);
    const fin = new Date(inicio.getTime() + minutos * 60_000);
    listas++;
    if (!aplicar) continue;

    // Clienta: por teléfono si lo hay; si no, una ficha nueva con el nombre.
    let clientaId: string | null = null;
    if (telefono) {
      const { data: c } = await db.from("clients").select("id").eq("phone", telefono).maybeSingle();
      clientaId = c?.id ?? null;
    }
    if (!clientaId) {
      const email = campo(f, ["email", "correo"]).toLowerCase() || null;
      const { data: c, error } = await db.from("clients").insert({ name: nombre, phone: telefono, email, source: "import" }).select("id").single();
      if (error || !c) {
        problemas.push(`línea ${linea}: no se pudo crear la clienta (${error?.message})`);
        continue;
      }
      clientaId = c.id;
    }

    const { error } = await db.rpc("create_booking", {
      p_client: clientaId,
      p_staff: prof.id,
      p_starts: inicio.toISOString(),
      p_ends: fin.toISOString(),
      p_items: lista.map((s) => ({ service_id: s.id, name: s.name, duration_min: s.duration_min, price_cents: s.price_cents })),
      p_source: "import",
      p_notes: campo(f, ["notas", "observaciones"]) || null,
      p_actor: null, // sin usuario: `created_by` queda vacío y el registro dice "panel:desconocido"
    });
    if (error) {
      problemas.push(
        error.code === "23P01"
          ? `línea ${linea}: choca con otra cita de ${prof.name} el ${fecha} a las ${hora}`
          : `línea ${linea}: ${error.message}`,
      );
      continue;
    }
    creadas++;
  }

  console.log(`Filas: ${filas.length} · pasadas (no se importan): ${pasadas} · listas para importar: ${listas}`);
  if (aplicar) console.log(`Creadas: ${creadas}`);
  else console.log("ENSAYO: no se ha escrito nada. Revisa los problemas y repite con --aplicar.");
  if (problemas.length) {
    console.log(`Problemas (${problemas.length}):`);
    for (const p of problemas) console.log(`  - ${p}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
