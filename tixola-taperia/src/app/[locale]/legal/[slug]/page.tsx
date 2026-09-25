import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { ReservationProvider } from "@/components/ui/ReservationProvider";
import { ChatProvider } from "@/components/chat/ChatProvider";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import Footer from "@/components/sections/Footer";
import LegalArticle from "@/components/legal/LegalArticle";
import { LEGAL_DOC_KEYS, type LegalDocKey } from "@/data/legal";
import { LOCALES, isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import legalEs from "@/i18n/messages/es/legal";
import type { Messages } from "@/i18n/types";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

/**
 * /[locale]/legal/[slug] — privacidad · aviso-legal · cookies.
 * Los slugs salen de `m.legal.<doc>.slug`. El español es la fuente de verdad y los demás idiomas
 * heredan sus slugs (así los enlaces del pie, el sitemap y hreflang apuntan a la misma ruta en
 * todos los idiomas); si un idioma definiera un slug propio, también se genera y se resuelve.
 * Cualquier otro slug → 404.
 */

export const dynamicParams = false;

/** Documento al que corresponde un slug en este idioma (con respaldo en los slugs en español). */
function resolveDocKey(m: Messages, slug: string): LegalDocKey | null {
  return LEGAL_DOC_KEYS.find((key) => m.legal[key].slug === slug || legalEs[key].slug === slug) ?? null;
}

export async function generateStaticParams(): Promise<Array<{ locale: Locale; slug: string }>> {
  const params: Array<{ locale: Locale; slug: string }> = [];
  for (const locale of LOCALES) {
    const m = await getMessages(locale);
    const slugs = new Set<string>();
    for (const key of LEGAL_DOC_KEYS) {
      slugs.add(legalEs[key].slug);
      slugs.add(m.legal[key].slug);
    }
    for (const slug of slugs) params.push({ locale, slug });
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  const key = resolveDocKey(m, slug);
  if (!key) return {};
  return {
    ...pageMetadata(locale, `/legal/${slug}`, { title: m.legal[key].title, description: m.legal.docs[key].description }),
    robots: { index: true, follow: true },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  const key = resolveDocKey(m, slug);
  if (!key) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: m.legal.page.home, url: absoluteUrl(locale, "/") },
    { name: m.legal[key].title, url: absoluteUrl(locale, `/legal/${slug}`) },
  ]);

  return (
    <ChatProvider page="legal">
      <ReservationProvider>
        <Navbar />
        <main id="main" className="relative pt-[var(--header-h)]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }} />
          <LegalArticle docKey={key} />
        </main>
        <Footer />
        <MobileStickyBar />
      </ReservationProvider>
    </ChatProvider>
  );
}
