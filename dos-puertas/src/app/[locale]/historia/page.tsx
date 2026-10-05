import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Timeline from "@/components/historia/Timeline";
import FamousCard from "@/components/historia/FamousCard";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return pageMetadata(locale, "/historia", { title: m.historia.pageTitle, description: m.historia.pageLead });
}

export default async function HistoriaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const m = getMessages(isLocale(raw) ? raw : "es");
  const t = m.historia;
  return (
    <>
      <PageHeader kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} after={t.titleAfter} lead={t.pageLead} />
      <Timeline />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-3xl bg-cream/10 ring-1 ring-cream/10">
          {t.stats.map((s) => (
            <div key={s.label} className="bg-tinta-800 p-5 sm:p-6">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-condensed text-5xl leading-none tracking-wide text-gradient-marca">{s.value}</span>
                <span className="mt-2 block text-[13px] leading-snug text-cream-muted">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <FamousCard />
      </div>
    </>
  );
}
