import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import Reintento from "@/components/bonos/Reintento";
import Boton from "@/components/ui/Boton";
import { format } from "@/i18n/getMessages";
import { localePath } from "@/i18n/config";
import { pageContext } from "@/lib/page";
import { getAdminClient } from "@/lib/supabase/admin";
import { urlBono } from "@/lib/vouchers/enlaces";

/**
 * Vuelta de Stripe: `/bonos/gracias?cs=<checkout session>`. El bono lo crea el webhook; aquí solo
 * se busca por la sesión. Si aún no está, se reintenta unos segundos (`Reintento`).
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { m } = await pageContext(params);
  return { title: { absolute: m.bonos.gracias.seoTitle }, robots: { index: false, follow: false } };
}

async function bonoDeSesion(cs: string | undefined) {
  if (!cs || !/^cs_[A-Za-z0-9_]{10,200}$/.test(cs)) return { valida: false, bono: null };
  try {
    const { data } = await getAdminClient()
      .from("vouchers")
      .select("code, buyer_email")
      .eq("stripe_checkout_session_id", cs)
      .maybeSingle();
    return { valida: true, bono: data };
  } catch {
    return { valida: true, bono: null };
  }
}

export default async function GraciasPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale, m } = await pageContext(params);
  const g = m.bonos.gracias;
  const { cs } = await searchParams;
  const { valida, bono } = await bonoDeSesion(cs);

  return (
    <div className="container-page flex min-h-[70dvh] items-center justify-center pb-20 pt-[calc(var(--header-h)+3rem)]">
      <div className="w-full max-w-lg rounded-[3px] border border-[var(--capa-borde)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <CheckCircle2 aria-hidden className="mx-auto size-14 text-carmin" />
        <h1 className="mt-4 font-display text-3xl font-semibold text-tinta">{g.title}</h1>
        <p className="mt-3 text-gris" role="status">
          {!valida ? g.sinSesion : bono ? format(g.listo, { email: bono.buyer_email ?? "" }) : g.esperando}
        </p>
        {valida && !bono && <Reintento />}
        <div className="mt-6 flex flex-col items-center gap-3">
          {bono && <Boton href={urlBono(bono.code, locale)}>{g.verBono}</Boton>}
          <Boton href={localePath(locale, "/")} variant="fantasma">
            {g.volver}
          </Boton>
        </div>
      </div>
    </div>
  );
}
