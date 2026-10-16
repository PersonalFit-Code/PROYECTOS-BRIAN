import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import GaleriaGrid from "@/components/galeria/GaleriaGrid";
import { GALERIA } from "@/data/galeria";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { pageContext } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await pageContext(params);
  return pageMetadata(locale, "/galeria", { title: m.galeria.seo.title, description: m.galeria.seo.description });
}

/** Rejilla con revelados. El morph de scroll (plan §2) se monta encima cuando lleguen las fotos. */
export default async function GaleriaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await pageContext(params);
  const g = m.galeria;
  const migas = breadcrumbJsonLd([{ name: m.nav.items.home, url: absoluteUrl(locale, "/") }, { name: m.nav.items.galeria, url: absoluteUrl(locale, "/galeria") }]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(migas) }} />
      <PageHeader kicker={g.kicker} title={g.title} accent={g.accent} description={g.description} note={GALERIA.some((x) => x.pendiente) ? g.pendingNote : undefined} />
      <div className="container-page pb-20 sm:pb-28">
        <GaleriaGrid items={GALERIA} />
      </div>
    </>
  );
}
