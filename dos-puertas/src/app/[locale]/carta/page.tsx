import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Migas from "@/components/seo/Migas";
import BarraExplorer from "@/components/barra/BarraExplorer";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return pageMetadata(locale, "/carta", { title: m.seo.carta.title, description: m.seo.carta.description, imageAlt: m.seo.ogAlt });
}

export default async function CartaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return (
    <>
      <Migas locale={locale} home={m.nav.items.home} name={m.nav.items.carta} path="/carta" />
      <PageHeader kicker={m.barra.pageTitle} before={m.barra.titleBefore} accent={m.barra.titleAccent} lead={m.barra.pageLead} />
      <BarraExplorer />
    </>
  );
}
