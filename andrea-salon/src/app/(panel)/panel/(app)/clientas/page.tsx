import { Search } from "lucide-react";
import Link from "next/link";
import { fechaCorta } from "@/lib/fechas";
import { formatCents } from "@/lib/format";
import { requireSesion } from "@/lib/panel/sesion";
import { formatearTelefonoES, normalizarTelefonoES } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ETIQUETAS } from "@/lib/panel/etiquetas";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clientas" };


export default async function ClientasPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const s = await requireSesion();
  const { q = "", etiqueta = "" } = await searchParams;
  const db = await createClient();
  let consulta = db
    .from("v_clients")
    .select("id, name, phone, email, visits, last_visit_at, next_visit_at, spent_cents, tags, no_shows")
    .is("anonymized_at", null)
    .order("last_visit_at", { ascending: false, nullsFirst: false })
    .limit(100);
  const texto = q.trim();
  if (texto) {
    const tel = normalizarTelefonoES(texto);
    consulta = tel ? consulta.eq("phone", tel) : consulta.ilike("name", `%${texto.replace(/[%,()]/g, " ")}%`);
  }
  if (etiqueta && ETIQUETAS[etiqueta]) consulta = consulta.contains("tags", [etiqueta]);
  const { data: clientas, error } = await consulta;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold">Clientas</h1>
      <form className="flex flex-wrap gap-2" role="search">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Buscar por nombre o teléfono</span>
          <Search aria-hidden className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gris" />
          <input name="q" defaultValue={q} placeholder="Nombre o teléfono" className="min-h-12 w-full rounded-2xl border border-carmin/20 bg-white pl-10 pr-4 text-[16px]" />
        </label>
        {etiqueta && <input type="hidden" name="etiqueta" value={etiqueta} />}
        <button type="submit" className="min-h-12 rounded-full bg-carmin px-5 font-semibold text-white">Buscar</button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Link href={`/panel/clientas${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={cn("min-h-9 rounded-full px-3 py-1.5 text-sm ring-1 ring-carmin/15", !etiqueta && "bg-tinta text-white")}>Todas</Link>
        {Object.entries(ETIQUETAS).map(([k, v]) => (
          <Link key={k} href={`/panel/clientas?etiqueta=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`} title={v.ayuda} className={cn("min-h-9 rounded-full px-3 py-1.5 text-sm ring-1 ring-carmin/15", etiqueta === k ? "bg-tinta text-white" : "bg-white")}>
            {v.texto}
          </Link>
        ))}
      </div>

      {error && <p className="text-carmin">No se pudo cargar la lista.</p>}
      {clientas && clientas.length === 0 && <p className="text-gris">No hay clientas con ese filtro.</p>}
      <ul className="divide-y divide-[var(--capa-borde)] overflow-hidden rounded-3xl border border-[var(--capa-borde)] bg-white">
        {(clientas ?? []).map((c) => (
          <li key={c.id}>
            <Link href={`/panel/clientas/${c.id}`} className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-rosa-niebla/50">
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  {c.name}
                  {c.tags.map((t) => ETIQUETAS[t] && (
                    <span key={t} className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", ETIQUETAS[t].clase)}>{ETIQUETAS[t].texto}</span>
                  ))}
                </span>
                <span className="block text-sm text-gris">{c.phone ? formatearTelefonoES(c.phone) : c.email ?? "Sin contacto"}</span>
              </span>
              <span className="text-right text-sm text-gris">
                {c.visits} {c.visits === 1 ? "visita" : "visitas"}
                {c.last_visit_at && ` · última ${fechaCorta(c.last_visit_at)}`}
                {s.role === "owner" && <span className="block font-semibold text-tinta">{formatCents(c.spent_cents)}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
