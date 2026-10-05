import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import VisitBlock from "@/components/visita/VisitBlock";
import Manifesto from "@/components/home/Manifesto";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return pageMetadata(locale, "/visita", { title: m.visita.pageTitle, description: m.visita.pageLead });
}

export default async function VisitaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  const t = m.visita;
  return (
    <>
      <PageHeader kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} lead={t.pageLead} />
      <VisitBlock withHeading={false} />
      <Manifesto />
      <div className="container-page pb-6">
        <Link
          href={localePath(locale, "/preguntas")}
          className="pulsable inline-flex min-h-12 items-center gap-2 rounded-full border border-oro/40 px-6 text-[15px] font-semibold text-oro-light hover:bg-oro/10"
        >
          {t.faqLink}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </>
  );
}
