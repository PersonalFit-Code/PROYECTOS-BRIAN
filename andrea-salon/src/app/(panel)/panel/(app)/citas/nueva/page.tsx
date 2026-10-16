import { fechaValida, hoyLocal } from "@/lib/panel/columnas";
import { requireSesion } from "@/lib/panel/sesion";
import { createClient } from "@/lib/supabase/server";
import NuevaCitaForm from "./NuevaCitaForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nueva cita" };

export default async function NuevaCitaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const s = await requireSesion();
  const q = await searchParams;
  const db = await createClient();
  const [servicios, categorias, equipo, relaciones] = await Promise.all([
    db.from("services").select("id, name, duration_min, price_cents, category_id, position").eq("active", true).order("position"),
    db.from("service_categories").select("id, name").order("position"),
    db.from("staff").select("id, name").eq("active", true).order("position"),
    db.from("service_staff").select("service_id, staff_id"),
  ]);
  const nombreCat = new Map((categorias.data ?? []).map((c) => [c.id, c.name]));
  const quienHace: Record<string, string[]> = {};
  for (const r of relaciones.data ?? []) (quienHace[r.service_id] ??= []).push(r.staff_id);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold">Nueva cita</h1>
      <NuevaCitaForm
        servicios={(servicios.data ?? []).map((x) => ({
          id: x.id,
          nombre: x.name,
          duracionMin: x.duration_min,
          precioCents: x.price_cents,
          categoria: (x.category_id && nombreCat.get(x.category_id)) || "Otros",
        }))}
        equipo={(equipo.data ?? []).map((p) => ({ id: p.id, nombre: p.name }))}
        quienHace={quienHace}
        fechaInicial={fechaValida(q.fecha) ?? hoyLocal()}
        staffFijo={s.role === "owner" ? null : s.staffId}
      />
    </div>
  );
}
