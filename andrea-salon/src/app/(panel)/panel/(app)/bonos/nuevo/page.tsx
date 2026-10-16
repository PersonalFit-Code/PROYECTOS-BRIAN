import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireSesion } from "@/lib/panel/sesion";
import { createClient } from "@/lib/supabase/server";
import VentaForm from "./VentaForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vender un bono" };

/**
 * Venta de un bono en el mostrador (lo puede hacer todo el equipo). Solo se ofrecen los bonos
 * activos del catálogo, en el orden en que los ha puesto la dueña.
 */
export default async function NuevoBonoPage() {
  const s = await requireSesion();
  const db = await createClient();
  const { data: productos, error } = await db
    .from("voucher_products")
    .select("id, name, description, kind, sessions, value_cents, price_cents, validity_months")
    .eq("active", true)
    .order("position")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/panel/bonos" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-carmin">
        <ArrowLeft aria-hidden className="size-4" /> Bonos
      </Link>
      <header>
        <h1 className="font-display text-3xl font-semibold">Vender un bono</h1>
        <p className="mt-1 text-sm text-gris">Se apunta el cobro y, si deja correo, le llega el bono con su QR.</p>
      </header>

      {error && (
        <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-carmin ring-1 ring-carmin/20">
          No se pudo cargar el catálogo de bonos. Recarga la página en un momento.
        </p>
      )}
      {productos && productos.length === 0 && (
        <p className="rounded-3xl border border-dashed border-carmin/20 bg-white/60 px-4 py-6 text-center text-gris">
          No hay ningún bono a la venta.{" "}
          {s.role === "owner" ? (
            <Link href="/panel/bonos-catalogo" className="font-semibold text-carmin underline underline-offset-2">
              Crea uno en el catálogo
            </Link>
          ) : (
            "Pídele a Andrea que cree uno en el catálogo."
          )}
        </p>
      )}
      {productos && productos.length > 0 && (
        <VentaForm
          productos={productos.map((p) => ({
            id: p.id,
            nombre: p.name,
            descripcion: p.description,
            kind: p.kind,
            sesiones: p.sessions,
            valorCents: p.value_cents,
            precioCents: p.price_cents,
            meses: p.validity_months,
          }))}
        />
      )}
    </div>
  );
}
