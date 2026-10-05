import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import VisitBlock from "@/components/visita/VisitBlock";
import Faq from "@/components/visita/Faq";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata, serializeJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return pageMetadata(locale, "/visita", { title: m.visita.pageTitle, description: m.visita.pageLead });
}

export default async function VisitaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const m = getMessages(isLocale(raw) ? raw : "es");
  const t = m.visita;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }} />
      <PageHeader kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} lead={t.pageLead} />
      <VisitBlock withHeading={false} />
      <Faq />
    </>
  );
}
