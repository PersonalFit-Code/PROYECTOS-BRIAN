import { ArrowLeft, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fechaCorta, hora } from "@/lib/fechas";
import { formatCents } from "@/lib/format";
import { requireSesion } from "@/lib/panel/sesion";
import { formatearTelefonoES } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ETIQUETAS } from "@/lib/panel/etiquetas";
import FichaForm from "./FichaForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clienta" };

const ESTADO: Record<string, string> = { confirmed: "Confirmada", done: "Hecha", cancelled: "Cancelada", no_show: "No vino", hold: "En curso" };

export default async function ClientaPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSesion();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await createClient();
  const [{ data: c }, { data: citas }] = await Promise.all([
    db.from("v_clients").select("*").eq("id", id).maybeSingle(),
    db
      .from("bookings")
      .select("id, starts_at, status, total_cents, booking_items(name, position), staff(name)")
      .eq("client_id", id)
      .neq("status", "hold")
      .order("starts_at", { ascending: false })
      .limit(50),
  ]);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/panel/clientas" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-carmin">
        <ArrowLeft aria-hidden className="size-4" /> Clientas
      </Link>
      <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold">{c.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.tags.map((t) => ETIQUETAS[t] && (
                <span key={t} title={ETIQUETAS[t].ayuda} className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", ETIQUETAS[t].clase)}>{ETIQUETAS[t].texto}</span>
              ))}
            </div>
          </div>
          {c.phone && (
            <a href={`tel:${c.phone}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-rosa-niebla px-4 text-sm font-semibold text-carmin">
              <Phone aria-hidden className="size-4" /> {formatearTelefonoES(c.phone)}
            </a>
          )}
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Dato t="Visitas" v={String(c.visits)} />
          <Dato t="Faltas" v={String(c.no_shows)} />
          <Dato t="Suele venir cada" v={c.median_gap_days ? `${Math.round(c.median_gap_days)} días` : "—"} />
          {s.role === "owner" ? <Dato t="Gastado" v={formatCents(c.spent_cents)} /> : <Dato t="Con" v={c.usual_staff ?? "—"} />}
          <Dato t="Favorito" v={c.favorite_service ?? "—"} />
          <Dato t="Próxima" v={c.next_visit_at ? fechaCorta(c.next_visit_at) : "—"} />
        </dl>
      </div>

      <FichaForm
        id={c.id}
        nombre={c.name}
        telefono={c.phone ? formatearTelefonoES(c.phone) : ""}
        email={c.email ?? ""}
        notas={c.notes ?? ""}
        marketing={c.marketing_consent}
        whatsapp={c.whatsapp_consent}
        puedeAnonimizar={s.role === "owner"}
      />

      <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Historial</h2>
        {(citas ?? []).length === 0 && <p className="mt-2 text-sm text-gris">Sin citas todavía.</p>}
        <ul className="mt-3 divide-y divide-[var(--capa-borde)]">
          {(citas ?? []).map((b) => {
            const items = [...((b.booking_items as { name: string; position: number }[] | null) ?? [])].sort((x, y) => x.position - y.position);
            return (
              <li key={b.id}>
                <Link href={`/panel/citas/${b.id}`} className="flex min-h-12 flex-wrap items-center justify-between gap-2 py-2 hover:text-carmin">
                  <span>
                    <span className="font-semibold tabular-nums">{fechaCorta(b.starts_at)} {hora(b.starts_at)}</span> · {items.map((i) => i.name).join(" + ")}
                    <span className="block text-xs text-gris">{(b.staff as { name: string } | null)?.name} · {ESTADO[b.status]}</span>
                  </span>
                  <span className="tabular-nums text-sm">{formatCents(b.total_cents ?? 0)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Dato({ t, v }: { t: string; v: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gris">{t}</dt>
      <dd className="mt-0.5 font-semibold">{v}</dd>
    </div>
  );
}
