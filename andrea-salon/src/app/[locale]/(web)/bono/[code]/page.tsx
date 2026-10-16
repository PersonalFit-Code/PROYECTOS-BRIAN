import type { Metadata } from "next";
import Boton from "@/components/ui/Boton";
import { format } from "@/i18n/getMessages";
import { urlFor } from "@/lib/hosts";
import { formatCents } from "@/lib/format";
import { pageContext } from "@/lib/page";
import { getAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";
import { normalizarCodigoBono } from "@/lib/vouchers/code";
import { textoCaducidad } from "@/lib/vouchers/emitir";
import { firmaBono, firmaBonoValida } from "@/lib/vouchers/enlaces";

/**
 * La página del bono (la que abre el QR): `/bono/<code>?t=<firma>`. Enseña lo que queda y el QR
 * para el mostrador. Sin firma válida no se confirma ni que el código exista. Nunca se indexa.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; code: string }> }): Promise<Metadata> {
  const { m } = await pageContext(params);
  return { title: { absolute: m.bonos.bono.seoTitle }, robots: { index: false, follow: false } };
}

export default async function BonoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; code: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale, m } = await pageContext(params);
  const b = m.bonos.bono;
  const { code: crudo } = await params;
  const { t } = await searchParams;
  const code = normalizarCodigoBono(decodeURIComponent(crudo));

  let bono = null;
  try {
    if (code && firmaBonoValida(code, t)) {
      const { data } = await getAdminClient()
        .from("vouchers")
        .select("code, name, kind, status, sessions_total, sessions_left, value_cents, balance_cents, recipient_name, expires_at")
        .eq("code", code)
        .maybeSingle();
      bono = data;
    }
  } catch (e) {
    console.error("[bono] página:", e);
  }

  if (!bono) {
    return (
      <div className="container-page flex min-h-[70dvh] items-center justify-center pb-20 pt-32">
        <p className="max-w-md text-center text-gris">{b.invalido}</p>
      </div>
    );
  }

  const activo = bono.status === "active";
  const queda =
    bono.kind === "sessions"
      ? format(b.quedan, { n: bono.sessions_left ?? 0, total: bono.sessions_total ?? 0 })
      : format(b.saldo, { saldo: formatCents(bono.balance_cents ?? 0), total: formatCents(bono.value_cents ?? 0) });

  return (
    <div className="container-page flex min-h-[70dvh] items-center justify-center pb-20 pt-32">
      <div className="w-full max-w-md rounded-[32px] border border-[var(--capa-borde)] bg-white p-7 text-center shadow-[var(--shadow-card)]">
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
            activo ? "bg-rosa-niebla text-carmin" : "bg-zinc-100 text-zinc-700",
          )}
        >
          {b.estado[bono.status]}
        </span>
        <h1 className="mt-3 font-display text-2xl font-semibold text-tinta">{bono.name}</h1>
        {bono.recipient_name && <p className="mt-1 text-gris">{format(b.para, { nombre: bono.recipient_name })}</p>}
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG dinámico de nuestra API, sin optimizar */}
        <img
          src={`/api/bonos/${bono.code}/qr?t=${firmaBono(bono.code)}`}
          alt={`QR ${bono.code}`}
          width={240}
          height={240}
          className={cn("mx-auto mt-5 rounded-[3px]", !activo && "opacity-30")}
        />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-gris">{b.codigo}</p>
        <p className="font-display text-2xl font-semibold tracking-[0.12em] text-tinta">{bono.code}</p>
        <p className="mt-4 text-lg font-semibold text-carmin">{queda}</p>
        <p className="mt-1 text-sm text-gris">{textoCaducidad(bono.expires_at)}</p>
        {activo && (
          <>
            <p className="mt-5 text-sm text-tinta">{b.comoUsar}</p>
            <div className="mt-5">
              <Boton href={urlFor("reservar", "/", locale)}>{b.reservar}</Boton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
