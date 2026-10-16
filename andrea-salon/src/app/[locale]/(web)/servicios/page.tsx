import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ServiciosLista from "@/components/servicios/ServiciosLista";
import { SERVICIOS_FIXTURE } from "@/data/fixtures";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { pageContext } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await pageContext(params);
  return pageMetadata(locale, "/servicios", { title: m.servicios.seo.title, description: m.servicios.seo.description });
}

export default async function ServiciosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await pageContext(params);
  const s = m.servicios;
  /* FIXTURE: hasta conectar la DB (fase 1b). */
  const servicios = SERVICIOS_FIXTURE;
  const pendiente = servicios.some((x) => x.pendiente);
  const migas = breadcrumbJsonLd([{ name: m.nav.items.home, url: absoluteUrl(locale, "/") }, { name: m.nav.items.servicios, url: absoluteUrl(locale, "/servicios") }]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(migas) }} />
      <PageHeader kicker={s.kicker} title={s.title} accent={s.accent} description={s.description} note={pendiente ? s.pendingNote : undefined} />
      <div className="container-page pb-20 sm:pb-28">
        <ServiciosLista servicios={servicios} />
        <p className="mt-10 text-sm text-gris">{s.footnote}</p>
      </div>
    </>
  );
}
