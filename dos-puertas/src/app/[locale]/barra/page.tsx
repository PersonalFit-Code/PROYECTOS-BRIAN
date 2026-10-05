import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import BarraExplorer from "@/components/barra/BarraExplorer";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  return pageMetadata(locale, "/barra", { title: m.barra.pageTitle, description: m.barra.pageLead });
}

export default async function BarraPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const m = getMessages(isLocale(raw) ? raw : "es");
  return (
    <>
      <PageHeader kicker={m.barra.kicker} before={m.barra.titleBefore} accent={m.barra.titleAccent} lead={m.barra.pageLead} />
      <BarraExplorer />
    </>
  );
}
