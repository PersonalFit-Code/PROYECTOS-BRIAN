import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalDoc from "@/components/legal/LegalDoc";
import { LEGAL_PAGES, type LegalSlug } from "@/components/layout/navItems";
import { LOCALES, isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";

function isLegalSlug(v: string): v is LegalSlug {
  return (LEGAL_PAGES as readonly string[]).includes(v);
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => LEGAL_PAGES.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const m = getMessages(isLocale(raw) ? raw : "es");
  if (!isLegalSlug(slug)) return {};
  /* Sin indexar hasta que estén los datos del titular. */
  return { title: m.legal.docs[slug].title, description: m.legal.docs[slug].lead, robots: { index: false, follow: true } };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  const locale: Locale = isLocale(raw) ? raw : "es";
  return <LegalDoc slug={slug} locale={locale} m={getMessages(locale)} />;
}
