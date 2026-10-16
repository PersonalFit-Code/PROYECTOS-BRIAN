import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { fechaCorta, fechaLarga, hora } from "@/lib/fechas";
import { formatearEuros } from "@/lib/money";
import { requireSesion } from "@/lib/panel/sesion";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { normalizarCodigoBono } from "@/lib/vouchers/code";
import { textoCaducidad } from "@/lib/vouchers/emitir";
import { firmaBono, urlBono } from "@/lib/vouchers/enlaces";
import CanjearCodigo from "../CanjearCodigo";
import { CLASE_ESTADO, ESTADO_BONO, estadoVisible, queQueda } from "../comun";
import AccionesBono from "./AccionesBono";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bono" };

/**
 * Ficha de un bono: lo primero, qué le queda y si se puede usar (es lo que se mira con la clienta
 * delante); luego el QR, quién lo compró y en qué se ha gastado. Se llega escaneando, tecleando el
 * código o desde la lista.
 */
const POR_QUE_NO: Partial<Record<string, string>> = {
  used: "Este bono ya está gastado.",
  expired: "Este bono ha caducado.",
  refunded: "Este bono se devolvió: ya no vale.",
  void: "Este bono está anulado: ya no vale.",
};

function Volver() {
  return (
    <Link href="/panel/bonos" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-carmin">
      <ArrowLeft aria-hidden className="size-4" /> Bonos
    </Link>
  );
}

function NoEncontrado({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Volver />
      <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5 sm:p-6">
        <h1 className="font-display text-2xl font-semibold">{titulo}</h1>
        <p className="mb-4 mt-1 text-gris">{texto}</p>
        <CanjearCodigo />
      </div>
    </div>
  );
}

export default async function BonoPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const s = await requireSesion();
  const { code: crudo } = await params;
  const { nuevo } = await searchParams;
  let texto = crudo;
  try {
    texto = decodeURIComponent(crudo);
  } catch {
    // Un `%` suelto en la dirección: se intenta con el texto tal cual.
  }
  const code = normalizarCodigoBono(texto);
  if (!code) return <NoEncontrado titulo="Código no válido" texto="Un código de bono son 8 letras y números, como AS-7K3M-Q9ZD. Prueba otra vez." />;
  // Siempre en la forma canónica: así la dirección que se comparte y la que se revalida coinciden.
  if (code !== texto) redirect(`/panel/bonos/${code}${nuevo ? `?nuevo=${encodeURIComponent(nuevo)}` : ""}`);

  const esDuena = s.role === "owner";
  const db = await createClient();
  const { data: b, error } = await db.from("vouchers").select("*").eq("code", code).maybeSingle();
  if (error) {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <Volver />
        <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-carmin ring-1 ring-carmin/20">
          No se pudo cargar el bono. Recarga la página en un momento.
        </p>
      </div>
    );
  }
  if (!b) return <NoEncontrado titulo="Ese código no existe" texto={`No hay ningún bono con el código ${code}. Revisa que esté bien escrito.`} />;

  const [canjes, balance] = await Promise.all([
    db
      .from("voucher_redemptions")
      .select("id, booking_id, sessions_used, amount_cents, redeemed_by, redeemed_at")
      .eq("voucher_id", b.id)
      .order("redeemed_at", { ascending: false }),
    db.from("v_voucher_balance").select("consumed_cents, pending_cents, expiring_soon").eq("id", b.id).maybeSingle(),
  ]);
  const historial = canjes.data ?? [];

  // Nombres de quién canjeó y quién vendió. RLS solo deja a una empleada leer su propio perfil, así
  // que se leen con la clave de servicio (ya hay sesión comprobada y solo se piden los nombres).
  const ids = [...new Set([...historial.map((r) => r.redeemed_by), b.created_by].filter((x): x is string => Boolean(x)))];
  const nombres = new Map<string, string>();
  if (ids.length > 0) {
    const { data: perfiles } = await getAdminClient().from("profiles").select("id, display_name").in("id", ids);
    for (const p of perfiles ?? []) if (p.display_name) nombres.set(p.id, p.display_name);
  }

  // `firmaBono` necesita TOKEN_SECRET: sin él, la ficha funciona igual y solo falta el QR.
  let qr: string | null = null;
  let enlace: string | null = null;
  try {
    qr = `/api/bonos/${code}/qr?t=${firmaBono(code)}`;
    enlace = urlBono(code);
  } catch (e) {
    console.error("[panel/bonos] QR:", e);
  }

  const ahora = new Date();
  const estado = estadoVisible(b.status, b.expires_at, ahora);
  const conAlgo = b.kind === "sessions" ? (b.sessions_left ?? 0) > 0 : (b.balance_cents ?? 0) > 0;
  const usable = estado === "active" && conAlgo;
  const pronto = estado === "active" && Boolean(balance.data?.expiring_soon);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Volver />

      {nuevo && (
        <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Bono creado y cobro apuntado.{" "}
          {nuevo === "correo" ? "Le llegará el correo con el QR en un momento." : "No dejó correo: enséñale el QR de esta pantalla o que le haga una foto."}
        </p>
      )}

      {/* Una sola rejilla plana: en el móvil el QR queda justo debajo de los botones (no al final de
          todo) y en escritorio sube a la columna derecha. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6 lg:col-start-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]", CLASE_ESTADO[estado])}>{ESTADO_BONO[estado]}</span>
            {pronto && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Caduca pronto</span>}
            <span className="text-xs text-gris">{b.sold_in_salon ? "Vendido en el salón" : "Comprado en la web"}</span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold">{b.name}</h1>
          <p className="mt-1 break-all font-mono text-lg font-semibold tracking-[0.1em] text-tinta">{b.code}</p>
          <p className={cn("mt-4 font-display text-3xl font-semibold", usable ? "text-carmin" : "text-gris")}>{queQueda(b)}</p>
          <p className={cn("mt-1 text-[15px]", pronto ? "font-semibold text-amber-800" : "text-gris")}>{textoCaducidad(b.expires_at)}</p>
          {!usable && (
            <p className="mt-4 rounded-2xl bg-crema px-4 py-3 text-sm font-semibold text-tinta ring-1 ring-carmin/10">
              {POR_QUE_NO[estado] ?? (b.kind === "sessions" ? "A este bono no le quedan sesiones." : "A esta tarjeta regalo no le queda saldo.")}
            </p>
          )}
          {esDuena && (
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--capa-borde)] pt-4 text-sm">
              <Dato etiqueta="Pagado">{formatearEuros(b.price_cents)}</Dato>
              <Dato etiqueta="Consumido">{formatearEuros(balance.data?.consumed_cents ?? 0)}</Dato>
              <Dato etiqueta="Pendiente">{formatearEuros(estado === "active" ? Math.max(0, balance.data?.pending_cents ?? 0) : 0)}</Dato>
            </dl>
          )}
        </section>

        <div className="lg:col-start-1">
          <AccionesBono
            code={b.code}
            kind={b.kind}
            usable={usable}
            sesionesQuedan={b.sessions_left ?? 0}
            sesionesTotal={b.sessions_total ?? 0}
            saldoCents={b.balance_cents ?? 0}
            esDuena={esDuena}
            anulable={b.status === "active"}
            email={b.buyer_email}
          />
        </div>

        <aside className="lg:col-start-2 lg:row-span-4 lg:row-start-1">
          <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5 text-center lg:sticky lg:top-8">
            {qr ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- PNG dinámico y firmado de nuestra API: no hay nada que optimizar */}
                <img
                  src={qr}
                  alt={`QR del bono ${b.code}`}
                  width={240}
                  height={240}
                  className={cn("mx-auto aspect-square w-full max-w-60 rounded-2xl", !usable && "opacity-30")}
                />
                <p className="mt-3 text-sm text-gris">Es el mismo QR del correo. Si no dejó correo, que le haga una foto.</p>
                {enlace && (
                  <a href={enlace} target="_blank" rel="noopener" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-carmin ring-1 ring-carmin/30 hover:bg-rosa-niebla">
                    <ExternalLink aria-hidden className="size-4" /> Ver como la clienta
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-gris">El QR no está disponible ahora mismo. El código de arriba vale igual.</p>
            )}
          </div>
        </aside>

        <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5 lg:col-start-1">
          <h2 className="font-display text-xl font-semibold">Quién lo compró</h2>
          <dl className="mt-3 grid gap-3 text-[15px] sm:grid-cols-2">
            <Dato etiqueta="Compradora">
              {b.buyer_name ?? "Sin nombre"}
              <span className="block break-all text-sm text-gris">{b.buyer_email ?? "Sin correo"}</span>
            </Dato>
            <Dato etiqueta="Para">{b.recipient_name ?? "Para ella misma"}</Dato>
            <Dato etiqueta="Fecha de compra">
              <span className="capitalize">{fechaLarga(b.purchased_at)}</span>
              {b.created_by && nombres.get(b.created_by) && <span className="block text-sm text-gris">Lo vendió {nombres.get(b.created_by)}</span>}
            </Dato>
            {b.gift_message && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gris">Dedicatoria</dt>
                <dd className="mt-1 whitespace-pre-line rounded-2xl bg-crema px-4 py-3 italic">«{b.gift_message}»</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5 lg:col-start-1">
          <h2 className="font-display text-xl font-semibold">Historial de uso</h2>
          {historial.length === 0 ? (
            <p className="mt-2 text-sm text-gris">Todavía no se ha usado.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--capa-borde)]">
              {historial.map((r) => (
                <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-[15px]">
                  <span>
                    <span className="font-semibold">
                      {b.kind === "sessions" ? `${r.sessions_used} ${r.sessions_used === 1 ? "sesión" : "sesiones"}` : formatearEuros(r.amount_cents)}
                    </span>
                    {b.kind === "sessions" && esDuena && <span className="text-sm text-gris"> · {formatearEuros(r.amount_cents)}</span>}
                    <span className="block text-sm text-gris">
                      {r.redeemed_by && nombres.get(r.redeemed_by) ? `Canjeado por ${nombres.get(r.redeemed_by)}` : "Canjeado"}
                      {r.booking_id && (
                        <>
                          {" · "}
                          <Link href={`/panel/citas/${r.booking_id}`} className="font-semibold text-carmin underline underline-offset-2">
                            ver la cita
                          </Link>
                        </>
                      )}
                    </span>
                  </span>
                  <span className="text-sm tabular-nums text-gris">
                    {fechaCorta(r.redeemed_at)} · {hora(r.redeemed_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gris">{etiqueta}</dt>
      <dd className="mt-1 font-semibold tabular-nums text-tinta">{children}</dd>
    </div>
  );
}
