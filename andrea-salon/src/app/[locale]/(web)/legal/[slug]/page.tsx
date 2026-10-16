import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalArticle from "@/components/legal/LegalArticle";
import { LEGAL_DOC_KEYS, LEGAL_IDENTITY_PENDING, type LegalDocKey } from "@/data/legal";
import { LOCALES, type Locale } from "@/i18n/config";
import legalEs from "@/i18n/messages/es/legal";
import type { Messages } from "@/i18n/types";
import { getMessages } from "@/i18n/getMessages";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { SITE_URL_IS_PROVISIONAL } from "@/lib/siteUrl";
import { pageContext } from "@/lib/page";

/**
 * /[locale]/legal/[slug] — privacidad · aviso-legal · cookies. Los slugs salen de
 * `m.legal.<doc>.slug` (el español manda). Cualquier otro slug → 404 dentro del layout de idioma.
 */
function resolveDocKey(m: Messages, slug: string): LegalDocKey | null {
  return LEGAL_DOC_KEYS.find((key) => m.legal[key].slug === slug || legalEs[key].slug === slug) ?? null;
}

export async function generateStaticParams(): Promise<Array<{ locale: Locale; slug: string }>> {
  const params: Array<{ locale: Locale; slug: string }> = [];
  for (const locale of LOCALES) {
    const m = await getMessages(locale);
    for (const slug of new Set(LEGAL_DOC_KEYS.flatMap((k) => [legalEs[k].slug, m.legal[k].slug]))) params.push({ locale, slug });
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { locale, m } = await pageContext(params);
  const key = resolveDocKey(m, slug);
  if (!key) return {};
  return {
    ...pageMetadata(locale, `/legal/${slug}`, { title: m.legal[key].title, description: m.legal.docs[key].description }),
    /* DOS CANDADOS: sin el NIF (y el resto de datos de la titular) no se publica un aviso legal
       incompleto, y en el subdominio prestado no se indexa nada. */
    robots: { index: !LEGAL_IDENTITY_PENDING && !SITE_URL_IS_PROVISIONAL, follow: true },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const { locale, m } = await pageContext(params);
  const key = resolveDocKey(m, slug);
  if (!key) notFound();
  const migas = breadcrumbJsonLd([{ name: m.legal.page.home, url: absoluteUrl(locale, "/") }, { name: m.legal[key].title, url: absoluteUrl(locale, `/legal/${slug}`) }]);
  return (
    <div className="pt-[var(--header-h)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(migas) }} />
      <LegalArticle docKey={key} />
    </div>
  );
}
