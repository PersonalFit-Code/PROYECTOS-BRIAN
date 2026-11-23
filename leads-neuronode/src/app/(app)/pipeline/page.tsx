import type { Metadata } from "next";
import Link from "next/link";
import { Titulo } from "@/components/ui";
import { cx } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";
import { SECTORES, SECTOR_TXT, type Sector } from "@/lib/tipos";
import { Tablero, type Tarjeta } from "./Tablero";

export const metadata: Metadata = { title: "Pipeline" };

/** Sectores con tablero propio. «otro» no tiene ningún negocio y no sale. */
const PESTANAS = SECTORES.filter((s) => s !== "otro");

export default async function Pipeline({ searchParams }: { searchParams: Promise<{ sector?: string; todas?: string }> }) {
  const { db } = await getSesion();
  const f = await searchParams;
  const sector = PESTANAS.find((s) => s === f.sector) ?? null;
  const verTodas = f.todas === "1";

  const base = () => {
    const q = db.from("negocios").select("id, nombre, subsector, localidad, comunidad, telefono, instagram, estado");
    return sector ? q.eq("sector", sector) : q;
  };
  // Lo que ya está en marcha, entero; de lo pendiente, lo justo para la primera columna (por orden del reto).
  const [{ data: enMarcha }, { data: pendientes }, { count }] = await Promise.all([
    base().neq("estado", "pendiente").order("actualizado", { ascending: false }).range(0, 1999),
    base().eq("estado", "pendiente").order("dia", { ascending: true, nullsFirst: false }).order("nombre").range(0, verTodas ? 1999 : 29),
    (sector ? db.from("negocios").select("id", { count: "exact", head: true }).eq("sector", sector) : db.from("negocios").select("id", { count: "exact", head: true })).eq("estado", "pendiente"),
  ]);
  const tarjetas = [...((enMarcha ?? []) as Tarjeta[]), ...((pendientes ?? []) as Tarjeta[])];

  const enlace = (s: Sector | null, todas = false) => {
    const sp = new URLSearchParams();
    if (s) sp.set("sector", s);
    if (todas) sp.set("todas", "1");
    const q = sp.toString();
    return q ? `/pipeline?${q}` : "/pipeline";
  };

  return (
    <>
      <Titulo sub="Arrastra cada negocio a su columna, o usa «Mover a» en el móvil. Cada cambio queda en el historial de su ficha.">Pipeline</Titulo>

      <nav aria-label="Sectores" className="mb-5 flex flex-wrap gap-2">
        {[null, ...PESTANAS].map((s) => (
          <Link
            key={s ?? "todos"}
            href={enlace(s)}
            aria-current={s === sector ? "page" : undefined}
            className={cx("inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-bold", s === sector ? "bg-brand text-white" : "border border-line hover:bg-soft")}
          >
            {s ? SECTOR_TXT[s] : "Todos"}
          </Link>
        ))}
      </nav>

      <Tablero key={`${sector}-${verTodas}`} tarjetas={tarjetas} porContactarTotal={count ?? 0} verTodas={verTodas} enlaceTodas={enlace(sector, true)} />
    </>
  );
}
