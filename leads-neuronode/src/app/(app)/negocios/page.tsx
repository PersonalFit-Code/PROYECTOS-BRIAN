import type { Metadata } from "next";
import Link from "next/link";
import { TarjetaNegocio, type NegocioConDolor } from "@/components/TarjetaNegocio";
import { Boton, Campo, Selector, Titulo, Vacio, claseBoton } from "@/components/ui";
import { getSesion } from "@/lib/sesion";
import { COMUNIDADES, ESTADOS, ESTADO_TXT, SECTORES, SECTOR_TXT, type Estado, type Sector } from "@/lib/tipos";

export const metadata: Metadata = { title: "Negocios" };

const POR_PAGINA = 40;

type Filtros = { q?: string; comunidad?: string; sector?: string; estado?: string; pagina?: string };

export default async function Negocios({ searchParams }: { searchParams: Promise<Filtros> }) {
  const { db } = await getSesion();
  const f = await searchParams;
  const pagina = Math.max(1, Number(f.pagina) || 1);
  const q = (f.q ?? "").trim().slice(0, 80);
  const comunidad = COMUNIDADES.find((c) => c === f.comunidad);
  const sector = SECTORES.find((s) => s === f.sector);
  const estado = ESTADOS.find((e) => e === f.estado);

  let consulta = db.from("negocios").select("*, diagnosticos(dolor)", { count: "exact" });
  // Los comodines de «ilike» se escapan: lo que escribe el usuario se busca tal cual.
  if (q) consulta = consulta.ilike("nombre", `%${q.replace(/[\\%_]/g, "\\$&")}%`);
  if (comunidad) consulta = consulta.eq("comunidad", comunidad);
  if (sector) consulta = consulta.eq("sector", sector);
  if (estado) consulta = consulta.eq("estado", estado);
  const { data, count } = await consulta.order("nombre").range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  const negocios = (data ?? []) as NegocioConDolor[];
  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const enlace = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (comunidad) sp.set("comunidad", comunidad);
    if (sector) sp.set("sector", sector);
    if (estado) sp.set("estado", estado);
    if (p > 1) sp.set("pagina", String(p));
    const s = sp.toString();
    return s ? `/negocios?${s}` : "/negocios";
  };

  return (
    <>
      <Titulo sub={`${total} ${total === 1 ? "negocio" : "negocios"}`}>Negocios</Titulo>

      <form className="mb-6 grid gap-3 rounded-2xl border border-line bg-side p-4 sm:grid-cols-2 lg:grid-cols-5" role="search">
        <Campo etiqueta="Buscar por nombre" name="q" defaultValue={q} type="search" />
        <Selector etiqueta="Comunidad" name="comunidad" defaultValue={comunidad ?? ""}>
          <option value="">Todas</option>
          {COMUNIDADES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Selector>
        <Selector etiqueta="Sector" name="sector" defaultValue={sector ?? ""}>
          <option value="">Todos</option>
          {SECTORES.map((s: Sector) => (
            <option key={s} value={s}>
              {SECTOR_TXT[s]}
            </option>
          ))}
        </Selector>
        <Selector etiqueta="Estado" name="estado" defaultValue={estado ?? ""}>
          <option value="">Todos</option>
          {ESTADOS.map((e: Estado) => (
            <option key={e} value={e}>
              {ESTADO_TXT[e]}
            </option>
          ))}
        </Selector>
        <div className="flex items-end">
          <Boton variante="primario" className="w-full">
            Filtrar
          </Boton>
        </div>
      </form>

      {negocios.length === 0 ? (
        <Vacio>No hay negocios con esos filtros.</Vacio>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {negocios.map((n) => (
            <TarjetaNegocio key={n.id} n={n} />
          ))}
        </ul>
      )}

      {paginas > 1 && (
        <nav aria-label="Páginas" className="mt-6 flex items-center justify-between gap-3">
          {pagina > 1 ? (
            <Link href={enlace(pagina - 1)} className={claseBoton()}>
              Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas ? (
            <Link href={enlace(pagina + 1)} className={claseBoton()}>
              Siguiente
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
