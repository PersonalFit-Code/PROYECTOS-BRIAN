import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { formatearEuros } from "@/lib/money";
import { getAdminClient } from "@/lib/supabase/admin";
import type { ServiceRow } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { DESPLEGABLE, RESUMEN_DESPLEGABLE, TARJETA } from "../_comun/estilos";
import { BotonAccion } from "../_comun/ui";
import { cambiarActivoServicio, moverServicio } from "./acciones";
import FormServicio from "./FormServicio";

export const dynamic = "force-dynamic";
export const metadata = { title: "Servicios" };

/**
 * Catálogo de servicios, agrupado por categoría como en la web. Se lee con el cliente de servicio:
 * el layout `(owner)` ya ha comprobado que es la dueña y ella ve todo, incluidos los inactivos.
 */
export default async function ServiciosPage() {
  const db = getAdminClient();
  const [categorias, servicios, equipo, relaciones] = await Promise.all([
    db.from("service_categories").select("id, name, position").order("position"),
    db.from("services").select("*").order("position").order("name"),
    db.from("staff").select("id, name, active").order("position").order("name"),
    db.from("service_staff").select("service_id, staff_id"),
  ]);
  const fallo = [categorias, servicios, equipo, relaciones].find((r) => r.error);
  if (fallo) {
    return (
      <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-carmin ring-1 ring-carmin/20">
        No se pudieron cargar los servicios. Recarga la página en un momento.
      </p>
    );
  }

  const quienHace = new Map<string, string[]>();
  for (const r of relaciones.data ?? []) {
    quienHace.set(r.service_id, [...(quienHace.get(r.service_id) ?? []), r.staff_id]);
  }
  const nombres = new Map((equipo.data ?? []).map((p) => [p.id, p.name]));
  const listaCategorias = categorias.data ?? [];
  const todos = servicios.data ?? [];

  const grupos: { id: string | null; name: string; servicios: ServiceRow[] }[] = [
    ...listaCategorias.map((c) => ({ id: c.id, name: c.name, servicios: todos.filter((s) => s.category_id === c.id) })),
    { id: null, name: "Sin categoría", servicios: todos.filter((s) => !s.category_id) },
  ].filter((g) => g.servicios.length > 0 || g.id !== null);

  const opcionesCategoria = listaCategorias.map((c) => ({ id: c.id, name: c.name }));
  const opcionesEquipo = equipo.data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Servicios</h1>
        <p className="mt-1 text-sm text-gris">
          Lo que se ve en la web y se puede reservar. Un servicio no se borra (las citas pasadas lo nombran): se desactiva.
        </p>
      </header>

      <details className={DESPLEGABLE}>
        <summary className={RESUMEN_DESPLEGABLE}>
          <span className="flex items-center gap-2">
            <Plus aria-hidden className="size-5" /> Nuevo servicio
          </span>
        </summary>
        <div className="border-t border-[var(--capa-borde)] p-4">
          <FormServicio categorias={opcionesCategoria} equipo={opcionesEquipo} categoriaPorDefecto={listaCategorias[0]?.id} />
        </div>
      </details>

      {grupos.map((g) => (
        <section key={g.id ?? "sin"} className={TARJETA} aria-labelledby={`cat-${g.id ?? "sin"}`}>
          <h2 id={`cat-${g.id ?? "sin"}`} className="font-display text-xl font-semibold">
            {g.name}
          </h2>
          {g.servicios.length === 0 ? (
            <p className="mt-2 text-sm text-gris">Sin servicios en esta categoría.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {g.servicios.map((s, i) => {
                const staff = quienHace.get(s.id) ?? [];
                return (
                  <li
                    key={s.id}
                    className={cn("rounded-2xl border border-[var(--capa-borde)] bg-white p-3", !s.active && "opacity-70")}
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-semibold text-tinta">{s.name}</span>
                          {!s.active && <Etiqueta>Inactivo</Etiqueta>}
                          {s.active && !s.bookable_online && <Etiqueta>Solo con consulta</Etiqueta>}
                          {s.active && staff.length === 0 && <Etiqueta aviso>Sin profesional</Etiqueta>}
                        </p>
                        <p className="mt-0.5 text-sm text-gris">
                          {s.duration_min} min{s.buffer_min > 0 ? ` + ${s.buffer_min} de recogida` : ""} ·{" "}
                          {s.price_is_from ? "desde " : ""}
                          {formatearEuros(s.price_cents)}
                        </p>
                        {staff.length > 0 && (
                          <p className="mt-0.5 truncate text-sm text-gris">{staff.map((id) => nombres.get(id) ?? "—").join(", ")}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {i > 0 && (
                          <BotonAccion
                            accion={moverServicio}
                            campos={{ id: s.id, direccion: "arriba" }}
                            etiqueta={`Subir ${s.name}`}
                            className="size-11 px-0"
                          >
                            <ArrowUp aria-hidden className="size-4" />
                          </BotonAccion>
                        )}
                        {i < g.servicios.length - 1 && (
                          <BotonAccion
                            accion={moverServicio}
                            campos={{ id: s.id, direccion: "abajo" }}
                            etiqueta={`Bajar ${s.name}`}
                            className="size-11 px-0"
                          >
                            <ArrowDown aria-hidden className="size-4" />
                          </BotonAccion>
                        )}
                      </div>
                    </div>

                    <details className="mt-2">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full px-3 text-sm font-semibold text-carmin hover:bg-rosa-niebla [&::-webkit-details-marker]:hidden">
                        Editar
                      </summary>
                      <div className="mt-3 space-y-4 border-t border-[var(--capa-borde)] pt-4">
                        <FormServicio
                          servicio={{ ...s, staff }}
                          categorias={opcionesCategoria}
                          equipo={opcionesEquipo}
                        />
                        <div className="flex flex-wrap gap-2 border-t border-[var(--capa-borde)] pt-4">
                          <BotonAccion
                            accion={cambiarActivoServicio}
                            campos={{ id: s.id, active: s.active ? "false" : "true" }}
                            confirmar={s.active ? `¿Desactivar «${s.name}»? Dejará de verse en la web y no se podrá reservar.` : undefined}
                          >
                            {s.active ? "Desactivar servicio" : "Volver a activar"}
                          </BotonAccion>
                        </div>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}

      <p className="text-sm text-gris">
        Las categorías (manicura, pedicura…) se cambian desde la base de datos; si necesitas una nueva, díselo a Brian.
      </p>
    </div>
  );
}

function Etiqueta({ children, aviso }: { children: ReactNode; aviso?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-semibold",
        aviso ? "bg-carmin text-white" : "bg-rosa-niebla text-carmin",
      )}
    >
      {children}
    </span>
  );
}
