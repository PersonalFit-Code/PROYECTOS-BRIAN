import { Plus } from "lucide-react";
import { requireOwner } from "@/lib/panel/sesion";
import type { ReactNode } from "react";
import { formatearEuros } from "@/lib/money";
import { getAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";
import { DESPLEGABLE, RESUMEN_DESPLEGABLE, TARJETA } from "../_comun/estilos";
import { BotonAccion } from "../_comun/ui";
import { cambiarActivoProducto } from "./acciones";
import FormBono from "./FormBono";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catálogo de bonos" };

/**
 * Los bonos que se venden (en la web y en el mostrador). Se lee con el cliente de servicio: el
 * layout `(owner)` ya ha comprobado que es la dueña, y ella ve también los retirados de la venta.
 */
export default async function BonosCatalogoPage() {
  // También aquí y no solo en el layout: la página lee con la clave de servicio, y un layout no
  // siempre se vuelve a ejecutar en una navegación parcial.
  await requireOwner();
  const db = getAdminClient();
  const [productos, servicios] = await Promise.all([
    db.from("voucher_products").select("*").order("position").order("name"),
    db.from("services").select("id, name, active").order("position").order("name"),
  ]);
  if (productos.error || servicios.error) {
    return (
      <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-carmin ring-1 ring-carmin/20">
        No se pudo cargar el catálogo de bonos. Recarga la página en un momento.
      </p>
    );
  }
  const lista = productos.data ?? [];
  const opcionesServicio = servicios.data ?? [];
  const nombreServicio = new Map(opcionesServicio.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Catálogo de bonos</h1>
        <p className="mt-1 text-sm text-gris">
          Lo que se vende en la web y en el mostrador. Un bono no se borra (los vendidos lo nombran): se retira de la venta.
          Cambiarlo no toca los ya vendidos: cada uno guarda lo que se compró.
        </p>
      </header>

      <details className={DESPLEGABLE} open={lista.length === 0}>
        <summary className={RESUMEN_DESPLEGABLE}>
          <span className="flex items-center gap-2">
            <Plus aria-hidden className="size-5" /> Nuevo bono
          </span>
        </summary>
        <div className="border-t border-[var(--capa-borde)] p-4">
          <FormBono servicios={opcionesServicio} />
        </div>
      </details>

      <section className={TARJETA} aria-labelledby="catalogo">
        <h2 id="catalogo" className="font-display text-xl font-semibold">
          Bonos
        </h2>
        {lista.length === 0 ? (
          <p className="mt-2 text-sm text-gris">Aún no hay ninguno. Crea el primero arriba.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {lista.map((p) => (
              <li key={p.id} className={cn("rounded-2xl border border-[var(--capa-borde)] p-3", p.active ? "bg-white" : "border-dashed bg-crema")}>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-tinta">{p.name}</span>
                  {!p.active && <Etiqueta>Retirado</Etiqueta>}
                  {p.validity_months ? <Etiqueta aviso>Caduca a los {p.validity_months} meses</Etiqueta> : <Etiqueta>No caduca</Etiqueta>}
                </p>
                <p className="mt-0.5 text-sm text-gris">
                  {p.kind === "sessions"
                    ? `${p.sessions ?? 0} ${p.sessions === 1 ? "sesión" : "sesiones"}${p.service_id ? ` de ${nombreServicio.get(p.service_id) ?? "un servicio"}` : " de cualquier servicio"}`
                    : `Tarjeta regalo de ${formatearEuros(p.value_cents ?? 0)}`}{" "}
                  · {formatearEuros(p.price_cents)}
                </p>

                <details className="mt-2">
                  <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full px-3 text-sm font-semibold text-carmin hover:bg-rosa-niebla [&::-webkit-details-marker]:hidden">
                    Editar
                  </summary>
                  <div className="mt-3 space-y-4 border-t border-[var(--capa-borde)] pt-4">
                    <FormBono producto={p} servicios={opcionesServicio} />
                    <div className="flex flex-wrap gap-2 border-t border-[var(--capa-borde)] pt-4">
                      <BotonAccion
                        accion={cambiarActivoProducto}
                        campos={{ id: p.id, active: p.active ? "false" : "true" }}
                        confirmar={p.active ? `¿Retirar «${p.name}» de la venta? Los ya vendidos siguen valiendo.` : undefined}
                      >
                        {p.active ? "Retirar de la venta" : "Volver a ponerlo a la venta"}
                      </BotonAccion>
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Etiqueta({ children, aviso }: { children: ReactNode; aviso?: boolean }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", aviso ? "bg-amber-100 text-amber-900" : "bg-rosa-niebla text-carmin")}>
      {children}
    </span>
  );
}
