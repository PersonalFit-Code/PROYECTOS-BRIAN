import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import EquipoCarousel from "@/components/equipo/EquipoCarousel";
import { EQUIPO_FIXTURE } from "@/data/fixtures";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { pageContext } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await pageContext(params);
  return pageMetadata(locale, "/equipo", { title: m.equipo.seo.title, description: m.equipo.seo.description });
}

export default async function EquipoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await pageContext(params);
  const e = m.equipo;
  /* FIXTURE: hasta conectar la DB (fase 1b). */
  const equipo = EQUIPO_FIXTURE;
  const migas = breadcrumbJsonLd([{ name: m.nav.items.home, url: absoluteUrl(locale, "/") }, { name: m.nav.items.equipo, url: absoluteUrl(locale, "/equipo") }]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(migas) }} />
      <PageHeader kicker={e.kicker} title={e.title} accent={e.accent} description={e.description} note={equipo.some((p) => p.pendiente) ? e.pendingNote : undefined} />
      <div className="container-page pb-20 sm:pb-28">
        <EquipoCarousel equipo={equipo} />
      </div>
    </>
  );
}
