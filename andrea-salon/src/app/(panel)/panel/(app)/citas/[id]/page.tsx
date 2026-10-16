import { ArrowLeft, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fechaLarga, fechaLocalISO, hora } from "@/lib/fechas";
import { formatCents } from "@/lib/format";
import { requireSesion } from "@/lib/panel/sesion";
import { formatearTelefonoES } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import CitaAcciones from "./CitaAcciones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cita" };

const ESTADO: Record<string, string> = {
  confirmed: "Confirmada",
  done: "Hecha y cobrada",
  cancelled: "Cancelada",
  no_show: "No vino",
  hold: "Reserva en curso",
};
const FUENTE: Record<string, string> = { web: "Web", phone: "Teléfono", walkin: "En el salón", panel: "Panel", import: "Importada" };
const METODO: Record<string, string> = { card: "Tarjeta", cash: "Efectivo", bizum: "Bizum", voucher: "Bono", stripe: "Online" };

export default async function CitaPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSesion();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await createClient();
  // RLS: una empleada no recibe la cita de otra (y aquí sale 404).
  const { data: c } = await db
    .from("bookings")
    .select("*, booking_items(name, duration_min, price_cents, position, service_id), clients(id, name, phone, email, notes), staff(id, name, color), payments(id, method, amount_cents, tip_cents, paid_at, kind)")
    .eq("id", id)
    .maybeSingle();
  if (!c) notFound();

  const items = [...((c.booking_items as { name: string; duration_min: number; price_cents: number; position: number; service_id: string | null }[] | null) ?? [])].sort((a, b) => a.position - b.position);
  const clienta = c.clients as { id: string; name: string; phone: string | null; email: string | null; notes: string | null } | null;
  const staff = c.staff as { id: string; name: string; color: string } | null;
  const pagos = (c.payments as { id: string; method: string; amount_cents: number; tip_cents: number; paid_at: string; kind: string }[] | null) ?? [];
  const total = c.total_cents ?? items.reduce((t, i) => t + i.price_cents, 0);

  const { data: equipo } = await db.from("staff").select("id, name").eq("active", true).order("position");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={`/panel/agenda?fecha=${fechaLocalISO(c.starts_at)}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-carmin">
        <ArrowLeft aria-hidden className="size-4" /> Agenda del día
      </Link>

      <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-rosa-niebla px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-carmin">{ESTADO[c.status]}</span>
          <span className="text-xs text-gris">Pedida por {FUENTE[c.source] ?? c.source}</span>
          {c.status === "confirmed" && (
            <span className="text-xs text-gris">{c.client_confirmed_at ? "· Ha confirmado que viene" : "· Aún no ha confirmado"}</span>
          )}
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold capitalize">
          {fechaLarga(c.starts_at)} · {hora(c.starts_at)}
        </h1>
        <p className="mt-1 flex items-center gap-2 text-gris">
          <span aria-hidden className="size-2.5 rounded-full" style={{ background: staff?.color }} /> {staff?.name}
        </p>
        <ul className="mt-4 divide-y divide-[var(--capa-borde)]">
          {items.map((i) => (
            <li key={i.position} className="flex justify-between py-2 text-[15px]">
              <span>
                {i.name} <span className="text-gris">· {i.duration_min} min</span>
              </span>
              <span className="tabular-nums">{formatCents(i.price_cents)}</span>
            </li>
          ))}
          <li className="flex justify-between py-2 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatCents(total)}</span>
          </li>
        </ul>
        {pagos.length > 0 && (
          <div className="mt-3 rounded-2xl bg-crema p-3 text-sm">
            {pagos.map((p) => (
              <p key={p.id}>
                Cobrado {formatCents(p.amount_cents)} · {METODO[p.method] ?? p.method}
                {p.tip_cents > 0 && ` · propina ${formatCents(p.tip_cents)}`} · {hora(p.paid_at)}
              </p>
            ))}
          </div>
        )}
      </div>

      {clienta && (
        <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href={`/panel/clientas/${clienta.id}`} className="font-display text-xl font-semibold hover:text-carmin">{clienta.name}</Link>
              <p className="text-sm text-gris">{clienta.email ?? "Sin correo"}</p>
            </div>
            {clienta.phone && (
              <a href={`tel:${clienta.phone}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-rosa-niebla px-4 text-sm font-semibold text-carmin">
                <Phone aria-hidden className="size-4" /> {formatearTelefonoES(clienta.phone)}
              </a>
            )}
          </div>
          {clienta.notes && <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm ring-1 ring-amber-200">⚠ {clienta.notes}</p>}
        </div>
      )}

      <CitaAcciones
        id={c.id}
        estado={c.status}
        totalCents={total}
        notas={c.notes ?? ""}
        servicios={items.map((i) => i.service_id).filter((x): x is string => x !== null)}
        staffId={c.staff_id}
        fecha={fechaLocalISO(c.starts_at)}
        pasada={new Date(c.starts_at) < new Date()}
        equipo={s.role === "owner" ? (equipo ?? []).map((p) => ({ id: p.id, nombre: p.name })) : []}
        tieneCorreo={Boolean(clienta?.email)}
      />
    </div>
  );
}
