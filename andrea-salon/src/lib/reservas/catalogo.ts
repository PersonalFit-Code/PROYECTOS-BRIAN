import "server-only";

import { unstable_cache } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";
import type { PublicStaffRow, ServiceCategoryRow, ServiceRow } from "@/lib/supabase/types";

/**
 * El catálogo que ve el público: categorías, servicios activos, equipo activo y quién hace qué.
 * Se cachea con la etiqueta `catalogo`; las actions del panel que tocan servicios o equipo
 * llaman a `revalidateTag("catalogo")` y la web se actualiza sola.
 */
export const TAG_CATALOGO = "catalogo";

export interface Catalogo {
  categorias: ServiceCategoryRow[];
  servicios: ServiceRow[];
  equipo: PublicStaffRow[];
  /** service_id → staff_id[] */
  quienHace: Record<string, string[]>;
}

async function cargarCatalogo(): Promise<Catalogo> {
  const db = getAdminClient();
  const [categorias, servicios, equipo, relaciones] = await Promise.all([
    db.from("service_categories").select("*").order("position"),
    db.from("services").select("*").eq("active", true).order("position"),
    db.from("public_staff").select("*").order("position"),
    db.from("service_staff").select("service_id, staff_id"),
  ]);
  for (const r of [categorias, servicios, equipo, relaciones]) {
    if (r.error) throw new Error(`No se pudo leer el catálogo: ${r.error.message}`);
  }

  const activos = new Set((equipo.data ?? []).map((s) => s.id));
  const quienHace: Record<string, string[]> = {};
  for (const rel of relaciones.data ?? []) {
    if (!activos.has(rel.staff_id)) continue;
    (quienHace[rel.service_id] ??= []).push(rel.staff_id);
  }

  return {
    categorias: categorias.data ?? [],
    servicios: servicios.data ?? [],
    equipo: equipo.data ?? [],
    quienHace,
  };
}

export const getCatalogo = unstable_cache(cargarCatalogo, ["catalogo"], {
  tags: [TAG_CATALOGO],
  revalidate: 3600,
});

/** Para la reserva: siempre fresco (un servicio desactivado hace un minuto no se puede reservar). */
export const getCatalogoFresco = cargarCatalogo;
