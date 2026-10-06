import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Migas from "@/components/seo/Migas";
import Timeline from "@/components/historia/Timeline";
import FamousCard from "@/components/historia/FamousCard";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata } from "@/lib/seo";
import { BUSINESS } from "@/data/business";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return pageMetadata(locale, "/historia", { title: m.seo.historia.title, description: m.seo.historia.description, imageAlt: m.seo.ogAlt });
}

export default async function HistoriaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  const t = m.historia;
  return (
    <>
      <Migas locale={locale} home={m.nav.items.home} name={m.nav.items.historia} path="/historia" />
      <PageHeader kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} after={t.titleAfter} lead={t.pageLead} />
      <Timeline />
      <div className="container-page max-w-3xl py-10">
        <FamousCard />
        <p className="mt-10 border-t border-cream/10 pt-6 text-xs leading-relaxed text-cream-faint">
          {t.sourceLabel}:{" "}
          <a href={BUSINESS.press.vozGalicia.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-cream">
            {t.source}
          </a>
        </p>
      </div>
    </>
  );
}
