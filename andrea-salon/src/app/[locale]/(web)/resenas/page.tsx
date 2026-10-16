import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ResenasLista from "@/components/resenas/ResenasLista";
import { BUSINESS } from "@/data/business";
import { REVIEWS_SHOWN } from "@/data/reviews";
import { format } from "@/i18n/getMessages";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { pageContext } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await pageContext(params);
  return pageMetadata(locale, "/resenas", { title: m.resenas.seo.title, description: m.resenas.seo.description });
}

/** Todas las reseñas publicadas, quietas y legibles. Sin `Review`/`AggregateRating` en JSON-LD. */
export default async function ResenasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, m } = await pageContext(params);
  const r = m.resenas;
  const migas = breadcrumbJsonLd([{ name: m.nav.items.home, url: absoluteUrl(locale, "/") }, { name: m.nav.items.resenas, url: absoluteUrl(locale, "/resenas") }]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(migas) }} />
      <PageHeader kicker={r.kicker} title={r.title} accent={r.accent} description={format(r.description, { count: REVIEWS_SHOWN.length })} />
      <ResenasLista />
      <div className="container-page -mt-10 pb-20 sm:pb-28">
        <a href={BUSINESS.googleReviews} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-carmin underline-offset-4 hover:underline">
          {r.readOnGoogle}
          <ExternalLink aria-hidden className="size-4" />
          <span className="sr-only"> ({m.common.misc.newTab})</span>
        </a>
        <p className="mt-2 text-xs text-gris">{r.truncatedNote}</p>
      </div>
    </>
  );
}
