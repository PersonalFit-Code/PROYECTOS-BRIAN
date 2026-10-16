import "server-only";

import { getAdminClient } from "@/lib/supabase/admin";

/** Lo que la web enseña de un bono a la venta: nada interno. */
export interface ProductoBono {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: "sessions" | "gift";
  sesiones: number | null;
  valorCents: number | null;
  precioCents: number;
  mesesValidez: number | null;
}

/**
 * Bonos activos, en el orden del panel. Si la base de datos no está conectada (antes del
 * lanzamiento) o falla, lista vacía: la página de bonos vuelve a su versión «muy pronto».
 */
export async function productosBono(): Promise<ProductoBono[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const { data, error } = await getAdminClient()
      .from("voucher_products")
      .select("id, name, description, kind, sessions, value_cents, price_cents, validity_months")
      .eq("active", true)
      .order("position");
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({
      id: p.id,
      nombre: p.name,
      descripcion: p.description,
      tipo: p.kind,
      sesiones: p.sessions,
      valorCents: p.value_cents,
      precioCents: p.price_cents,
      mesesValidez: p.validity_months,
    }));
  } catch (e) {
    console.error("[bonos] catálogo:", e);
    return [];
  }
}
