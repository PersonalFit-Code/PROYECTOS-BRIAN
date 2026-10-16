import type { Metadata } from "next";
import Boton from "@/components/ui/Boton";
import PageHeader from "@/components/ui/PageHeader";
import { WhatsAppGlyph } from "@/components/ui/FloatingWhatsApp";
import { BUSINESS } from "@/data/business";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { pageContext } from "@/lib/page";
import TiendaBonos from "@/components/bonos/TiendaBonos";
import { stripeConfigurado } from "@/lib/stripe";
import { productosBono } from "@/lib/vouchers/catalogo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await pageContext(params);
  return pageMetadata(locale, "/bonos", { title: m.bonos.seo.title, description: m.bonos.seo.description });
}

/**
 * Bonos. Con bonos en el catálogo (panel → Catálogo de bonos) y Stripe conectado, es la tienda;
 * si falta cualquiera de las dos cosas, la versión «muy pronto»: cómo funciona y WhatsApp para
 * comprarlos en el salón. Se revalida cada 5 minutos: un bono nuevo del panel aparece solo.
 */
export const revalidate = 300;

export default async function BonosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await pageContext(params);
  const b = m.bonos;
  const migas = breadcrumbJsonLd([{ name: m.nav.items.home, url: absoluteUrl(locale, "/") }, { name: m.nav.items.bonos, url: absoluteUrl(locale, "/bonos") }]);
  const productos = stripeConfigurado() ? await productosBono() : [];

  if (productos.length > 0) {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(migas) }} />
        <PageHeader kicker={b.kicker} title={b.tienda.title} accent={b.tienda.accent} description={b.tienda.description} />
        <div className="container-page pb-20 sm:pb-28">
          <TiendaBonos productos={productos} />
        </div>
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(migas) }} />
      <PageHeader kicker={b.kicker} title={b.title} accent={b.accent} description={b.description} />
      <div className="container-page pb-20 sm:pb-28">
        <h2 className="font-display text-2xl font-semibold text-tinta sm:text-3xl">{b.how.title}</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {b.how.steps.map((step, i) => (
            <li key={step.title} className="glass-alta rounded-3xl p-5">
              <span aria-hidden className="font-display text-3xl font-semibold text-carmin">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-xl font-semibold text-tinta">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gris">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="glass-rosa mt-10 rounded-3xl p-6">
          <h2 className="font-sans text-[11px] font-semibold tracking-[0.28em] text-carmin-suave uppercase">{b.conditionsTitle}</h2>
          <p className="mt-2 text-sm text-tinta">{b.conditionsPending}</p>
        </div>
        <div className="mt-8">
          <Boton href={BUSINESS.whatsapp.url} target="_blank" icon={<WhatsAppGlyph size="size-5" />}>
            {b.cta}
          </Boton>
        </div>
      </div>
    </>
  );
}
