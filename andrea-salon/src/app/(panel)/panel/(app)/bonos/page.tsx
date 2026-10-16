import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { fechaCorta } from "@/lib/fechas";
import { formatearEuros } from "@/lib/money";
import { requireSesion } from "@/lib/panel/sesion";
import { createClient } from "@/lib/supabase/server";
import type { VoucherStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { normalizarCodigoBono } from "@/lib/vouchers/code";
import CanjearCodigo from "./CanjearCodigo";
import { CLASE_ESTADO, ESTADO_BONO, estadoVisible, queQueda } from "./comun";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bonos" };

/**
 * Bonos vendidos. Arriba, lo que se hace con una clienta delante: canjear (código o QR). Debajo,
 * la lista para buscar uno por código o por quién lo compró. Las cifras de dinero (cobrado,
 * consumido y pendiente) solo las ve la dueña: el pendiente es dinero cobrado que aún se debe en
 * sesiones o saldo, y no es beneficio hasta que se da el servicio.
 */
const FILTROS: { clave: string; texto: string }[] = [
  { clave: "", texto: "Todos" },
  { clave: "active", texto: "Activos" },
  { clave: "pronto", texto: "Caducan pronto" },
  { clave: "used", texto: "Gastados" },
  { clave: "expired", texto: "Caducados" },
  { clave: "refunded", texto: "Devueltos" },
  { clave: "void", texto: "Anulados" },
];

export default async function BonosPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const s = await requireSesion();
  const { q = "", estado = "" } = await searchParams;
  const esDuena = s.role === "owner";
  const db = await createClient();
  const ahora = new Date();
  const ahoraIso = ahora.toISOString();

  let consulta = db
    .from("v_voucher_balance")
    .select("id, code, name, kind, status, purchased_at, expires_at, sessions_total, sessions_left, value_cents, balance_cents, buyer_name, recipient_name, expiring_soon")
    .order("purchased_at", { ascending: false })
    .limit(100);

  const texto = q.trim();
  // Sin `%`, comas, paréntesis ni comillas: rompen el filtro `or` de PostgREST. Los valores van
  // entre comillas dobles por si llevan puntos («M. José») o dos puntos (las fechas).
  const limpio = texto.replace(/[%,()*"\\:]/g, " ").trim();
  if (limpio) {
    // El código exacto va JUNTO a los nombres y no en su lugar: «Mercedes» también tiene pinta de
    // código (ocho letras del alfabeto de los bonos) y no puede dejar de encontrar a Mercedes.
    const code = normalizarCodigoBono(texto);
    const filtros = [`code.ilike."%${limpio}%"`, `buyer_name.ilike."%${limpio}%"`, `recipient_name.ilike."%${limpio}%"`];
    if (code) filtros.unshift(`code.eq.${code}`);
    consulta = consulta.or(filtros.join(","));
  }
  // Un bono con la fecha pasada sigue en `active` en la base de datos hasta que se intenta usar:
  // los filtros de activos y caducados lo tienen en cuenta para no mentir.
  if (estado === "active") consulta = consulta.eq("status", "active").or(`expires_at.is.null,expires_at.gte."${ahoraIso}"`);
  else if (estado === "expired") consulta = consulta.or(`status.eq.expired,and(status.eq.active,expires_at.lt."${ahoraIso}")`);
  else if (estado === "pronto") consulta = consulta.eq("expiring_soon", true).gte("expires_at", ahoraIso);
  else if (estado === "used" || estado === "refunded" || estado === "void") consulta = consulta.eq("status", estado);

  const [lista, totales] = await Promise.all([
    consulta,
    esDuena ? db.from("v_voucher_balance").select("status, expires_at, price_cents, consumed_cents, pending_cents") : null,
  ]);
  const bonos = lista.data;

  const enlace = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ ...(q ? { q } : {}), ...(estado ? { estado } : {}), ...extra });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const t = p.toString();
    return `/panel/bonos${t ? `?${t}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Bonos</h1>
        <Link href="/panel/bonos/nuevo" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-carmin px-5 font-semibold text-white">
          <Plus aria-hidden className="size-5" /> Nuevo bono
        </Link>
      </header>

      <section aria-labelledby="canjear" className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <h2 id="canjear" className="font-display text-2xl font-semibold">Canjear</h2>
        <p className="mb-4 mt-1 text-sm text-gris">Escanea el QR de la clienta o escribe su código para ver qué le queda.</p>
        <CanjearCodigo />
      </section>

      {esDuena && totales && !totales.error && <Totales filas={totales.data ?? []} ahora={ahora} />}

      <section aria-labelledby="vendidos" className="space-y-4">
        <h2 id="vendidos" className="font-display text-xl font-semibold">Bonos vendidos</h2>
        <form className="flex flex-wrap gap-2" role="search">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Buscar por código o por quién lo compró</span>
            <Search aria-hidden className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gris" />
            <input name="q" defaultValue={q} placeholder="Código o nombre" className="min-h-12 w-full rounded-2xl border border-carmin/20 bg-white pl-10 pr-4 text-[16px]" />
          </label>
          {estado && <input type="hidden" name="estado" value={estado} />}
          <button type="submit" className="min-h-12 rounded-full bg-carmin px-5 font-semibold text-white">Buscar</button>
        </form>
        <nav aria-label="Filtrar por estado" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTROS.map((f) => (
            <Link
              key={f.clave || "todos"}
              href={enlace({ estado: f.clave })}
              aria-current={estado === f.clave ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm ring-1 ring-carmin/15",
                estado === f.clave ? "bg-tinta text-white" : "bg-white",
              )}
            >
              {f.texto}
            </Link>
          ))}
        </nav>

        {lista.error && <p role="alert" className="text-carmin">No se pudo cargar la lista. Recarga la página en un momento.</p>}
        {bonos && bonos.length === 0 && (
          <p className="rounded-3xl border border-dashed border-carmin/20 bg-white/60 px-4 py-6 text-center text-gris">
            {texto || estado ? "No hay bonos con ese filtro." : "Todavía no se ha vendido ningún bono."}
          </p>
        )}
        {bonos && bonos.length > 0 && (
          <ul className="divide-y divide-[var(--capa-borde)] overflow-hidden rounded-3xl border border-[var(--capa-borde)] bg-white">
            {bonos.map((b) => {
              const visible = estadoVisible(b.status, b.expires_at, ahora);
              const pronto = visible === "active" && b.expiring_soon;
              return (
                <li key={b.id}>
                  <Link href={`/panel/bonos/${b.code}`} className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 hover:bg-rosa-niebla/50">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[15px] font-semibold tracking-[0.06em]">{b.code}</span>
                        <Estado estado={visible} />
                        {pronto && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">Caduca pronto</span>}
                      </span>
                      <span className="block truncate text-sm text-gris">
                        {b.name}
                        {b.buyer_name && ` · ${b.buyer_name}`}
                        {b.recipient_name && ` → ${b.recipient_name}`}
                      </span>
                    </span>
                    <span className="text-sm sm:text-right">
                      <span className={cn("block font-semibold", visible === "active" ? "text-tinta" : "text-gris")}>{queQueda(b)}</span>
                      <span className="block text-gris">
                        {fechaCorta(b.purchased_at)}
                        {b.expires_at && ` · caduca ${fechaCorta(b.expires_at)}`}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {bonos && bonos.length === 100 && <p className="text-sm text-gris">Se enseñan los 100 más recientes. Busca por código o nombre para encontrar uno más antiguo.</p>}
      </section>
    </div>
  );
}

function Estado({ estado }: { estado: VoucherStatus }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]", CLASE_ESTADO[estado])}>{ESTADO_BONO[estado]}</span>;
}

/**
 * Las tres cifras de la dueña, sobre TODOS los bonos (no solo los de la lista filtrada):
 * - Cobrado: lo que se pagó por ellos, menos lo devuelto.
 * - Consumido: el valor de las sesiones dadas y del saldo gastado.
 * - Pendiente: lo que aún se debe en bonos que se pueden usar. Lo que queda en bonos caducados o
 *   anulados ya no se debe, y por eso no entra (se cuenta aparte, debajo).
 */
function Totales({
  filas,
  ahora,
}: {
  filas: { status: VoucherStatus; expires_at: string | null; price_cents: number; consumed_cents: number; pending_cents: number }[];
  ahora: Date;
}) {
  let cobrado = 0;
  let consumido = 0;
  let pendiente = 0;
  let sinUsar = 0;
  for (const f of filas) {
    if (f.status === "refunded") continue;
    cobrado += f.price_cents;
    consumido += f.consumed_cents;
    const vivo = estadoVisible(f.status, f.expires_at, ahora) === "active";
    if (vivo) pendiente += Math.max(0, f.pending_cents);
    else if (f.status !== "used") sinUsar += Math.max(0, f.pending_cents);
  }
  return (
    <section aria-labelledby="cuentas">
      <h2 id="cuentas" className="sr-only">Cuentas de los bonos</h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi etiqueta="Cobrado" valor={formatearEuros(cobrado)} detalle="Lo pagado por los bonos, sin las devoluciones." />
        <Kpi etiqueta="Consumido" valor={formatearEuros(consumido)} detalle="Sesiones dadas y saldo gastado." />
        <Kpi
          etiqueta="Pendiente"
          valor={formatearEuros(pendiente)}
          detalle={`Cobrado y aún por dar: no es beneficio todavía.${sinUsar > 0 ? ` Además, ${formatearEuros(sinUsar)} en bonos caducados o anulados sin gastar.` : ""}`}
        />
      </dl>
    </section>
  );
}

function Kpi({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle: string }) {
  return (
    <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-gris">{etiqueta}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{valor}</dd>
      <dd className="mt-0.5 text-xs text-gris">{detalle}</dd>
    </div>
  );
}
