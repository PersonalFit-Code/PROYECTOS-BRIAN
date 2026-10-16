/**
 * Carga el catálogo de PRUEBA (servicios y equipo de `src/data/fixtures.ts`) en la base de datos de
 * desarrollo, con horarios de lunes a viernes y quién hace qué. Sirve para probar la reserva de
 * punta a punta antes de que Andrea pase su lista real; cuando llegue, se sustituye por la suya o se
 * mete a mano desde el panel.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run seed
 *
 * Es idempotente (upsert por slug). Se niega a correr si la URL parece de producción y no se pasa
 * `--forzar`: el catálogo real no se pisa con datos de ejemplo por un despiste.
 */
import { createClient } from "@supabase/supabase-js";
import { EQUIPO_FIXTURE, SERVICIOS_FIXTURE } from "../src/data/fixtures";
import type { Database } from "../src/lib/supabase/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (process.env.SEED_PRODUCCION !== "1" && !process.argv.includes("--forzar") && process.env.VERCEL_ENV === "production") {
  console.error("Esto parece producción. Si de verdad quieres datos de ejemplo ahí, añade --forzar.");
  process.exit(1);
}

const db = createClient<Database>(url, key, { auth: { persistSession: false } });

/* La categoría de la UI pública (manos/pies/mirada) → la de la base de datos (seed.sql). */
const CATEGORIA: Record<string, string> = {
  "manicura-completa": "manicura",
  "manicura-rusa": "manicura",
  "manicura-personalizada": "manicura",
  nivelacion: "unas-esculpidas",
  "gel-acrylgel": "unas-esculpidas",
  "nail-art": "nail-art",
  "pedicura-completa": "pedicura",
  "diseno-cejas": "mirada",
  "laminado-cejas": "mirada",
  "lifting-pestanas": "mirada",
};

/* Horario de prueba: el del directorio (L–J partido, V seguido). */
const FRANJAS: { weekday: number; start_time: string; end_time: string }[] = [
  ...[1, 2, 3, 4].flatMap((d) => [
    { weekday: d, start_time: "09:30", end_time: "13:30" },
    { weekday: d, start_time: "15:30", end_time: "19:30" },
  ]),
  { weekday: 5, start_time: "09:30", end_time: "19:30" },
];

const COLORES = ["#8E0E33", "#B8365A", "#E7A6BD", "#7C6B72"];

async function main() {
  const { data: cats, error: eCats } = await db.from("service_categories").select("id, slug");
  if (eCats) throw eCats;
  const catId = new Map((cats ?? []).map((c) => [c.slug, c.id]));

  const { data: servicios, error: eSrv } = await db
    .from("services")
    .upsert(
      SERVICIOS_FIXTURE.map((s, i) => ({
        slug: s.slug,
        name: s.nombre,
        description: s.descripcion,
        category_id: catId.get(CATEGORIA[s.slug] ?? "") ?? null,
        duration_min: s.duracionMin,
        buffer_min: 10,
        price_cents: s.precioCents ?? 0,
        price_is_from: s.precioDesde || s.precioCents === null,
        active: true,
        bookable_online: s.reservableOnline,
        position: i + 1,
      })),
      { onConflict: "slug" },
    )
    .select("id, slug");
  if (eSrv) throw eSrv;

  const { data: equipo, error: eStaff } = await db
    .from("staff")
    .upsert(
      EQUIPO_FIXTURE.map((p, i) => ({
        slug: p.slug,
        name: p.nombre,
        bio: p.bio,
        specialties: [...p.especialidades],
        instagram: p.instagram,
        color: COLORES[i % COLORES.length],
        active: true,
        bookable_online: p.reservableOnline,
        position: i + 1,
      })),
      { onConflict: "slug" },
    )
    .select("id, slug");
  if (eStaff) throw eStaff;

  const staffIds = (equipo ?? []).map((p) => p.id);
  // Todas hacen todo en la base de prueba; la mirada solo Andrea, para probar el filtro de candidatas.
  const andrea = (equipo ?? []).find((p) => p.slug === "andrea")?.id;
  const relaciones = (servicios ?? []).flatMap((s) =>
    (CATEGORIA[s.slug] === "mirada" && andrea ? [andrea] : staffIds).map((staff_id) => ({ service_id: s.id, staff_id })),
  );
  const { error: eRel } = await db.from("service_staff").upsert(relaciones, { onConflict: "service_id,staff_id" });
  if (eRel) throw eRel;

  const { error: eDel } = await db.from("staff_hours").delete().in("staff_id", staffIds);
  if (eDel) throw eDel;
  const { error: eHoras } = await db
    .from("staff_hours")
    .insert(staffIds.flatMap((staff_id) => FRANJAS.map((f) => ({ ...f, staff_id }))));
  if (eHoras) throw eHoras;

  console.log(`Listo: ${servicios?.length ?? 0} servicios, ${staffIds.length} profesionales, ${relaciones.length} relaciones.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
