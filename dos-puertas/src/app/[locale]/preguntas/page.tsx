import type { Metadata } from "next";
import { Phone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Faq from "@/components/faq/Faq";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata, serializeJsonLd } from "@/lib/seo";
import { BUSINESS } from "@/data/business";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return pageMetadata(locale, "/preguntas", { title: m.nav.items.preguntas, description: m.faq.pageLead });
}

export default async function PreguntasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const m = getMessages(isLocale(raw) ? raw : "es");
  const t = m.faq;
  /* El MISMO texto que se ve en la página. */
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.groups.flatMap((g) => g.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqLd) }} />
      <PageHeader kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} lead={t.pageLead} />
      <Faq />
      <div className="container-page pb-10">
        <div className="capa-alta flex flex-col gap-4 rounded-[28px] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-display text-2xl font-medium">{t.ctaTitle}</p>
            <p className="mt-1 text-sm text-cream-muted">{t.ctaText}</p>
          </div>
          <a
            href={`tel:${BUSINESS.phone.e164}`}
            className="pulsable inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full bg-oro px-6 text-[15px] font-semibold text-botella hover:bg-oro-light sm:self-auto"
          >
            <Phone aria-hidden className="size-4" />
            {BUSINESS.phone.display}
          </a>
        </div>
      </div>
    </>
  );
}
