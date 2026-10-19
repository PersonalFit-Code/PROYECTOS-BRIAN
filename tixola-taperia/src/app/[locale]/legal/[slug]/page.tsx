import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { ChatProvider } from "@/components/chat/ChatProvider";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import Footer from "@/components/sections/Footer";
import LegalArticle from "@/components/legal/LegalArticle";
import { LEGAL_DOC_KEYS, LEGAL_IDENTITY_PENDING, type LegalDocKey } from "@/data/legal";
import { LOCALES, isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import legalEs from "@/i18n/messages/es/legal";
import type { Messages } from "@/i18n/types";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";
import { SITE_URL_IS_PROVISIONAL } from "@/lib/siteUrl";

/**
 * /[locale]/legal/[slug] — privacidad · aviso-legal · cookies.
 * Los slugs salen de `m.legal.<doc>.slug`. El español es la fuente de verdad y los demás idiomas
 * heredan sus slugs (así los enlaces del pie, el sitemap y hreflang apuntan a la misma ruta en
 * todos los idiomas); si un idioma definiera un slug propio, también se genera y se resuelve.
 * Cualquier otro slug → 404 (en el enrutador, ver `dynamicParams` justo debajo).
 */

/* Lista cerrada: solo existen los slugs que devuelve `generateStaticParams`, y un slug desconocido
   (`/es/legal/lo-que-sea`) se corta en el ENRUTADOR, sin renderizar nada.
   Esto estuvo en `true` una temporada, y por un motivo que ya no se sostiene: entonces un 404 del
   enrutador caía en el 404 interno de Next —blanco, en inglés— y se prefería llegar al `notFound()`
   de abajo para que montara el 404 de la casa. Resultó que por ese camino Next sirve su esqueleto de
   error vacío (ver `src/app/global-not-found.tsx`), así que se cambiaba una página en inglés por una
   página en blanco. Con el 404 global, el corte en el enrutador sirve el 404 de la casa, traducido y
   con texto en el HTML: es el camino bueno, y encima no renderiza una página para tirarla. */
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
    /* DOS CANDADOS, y hacen falta los dos.
       · Mientras el responsable del tratamiento siga en marcadores («[RAZÓN SOCIAL]», «[NIF]»…) no
         publicamos un aviso legal incompleto (`LEGAL_IDENTITY_PENDING`).
       · Y mientras la web viva en el subdominio del proveedor, estas páginas siguen fuera de los
         buscadores como el resto del sitio (`SITE_URL_IS_PROVISIONAL`, que el layout ya aplica a
         todas las demás rutas). Sin esta segunda condición, rellenar el correo —que es lo que pasó
         el 15-10-2026— habría hecho que las tres páginas legales fueran las ÚNICAS indexables de
         toda la web, y encima colgando de un dominio que no es el del negocio. */
    robots: { index: !LEGAL_IDENTITY_PENDING && !SITE_URL_IS_PROVISIONAL, follow: true },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  const key = resolveDocKey(m, slug);
  /* Red de seguridad: con `dynamicParams = false` aquí no llega ningún slug que no esté en
     `generateStaticParams`. Se queda porque es lo que estrecha el tipo de `key` a `LegalDocKey`. */
  if (!key) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: m.legal.page.home, url: absoluteUrl(locale, "/") },
    { name: m.legal[key].title, url: absoluteUrl(locale, `/legal/${slug}`) },
  ]);

  return (
    <ChatProvider page="legal">
      <Navbar />
      <main id="main" className="relative pt-[var(--header-h)]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }} />
        <LegalArticle docKey={key} />
      </main>
      <Footer year={new Date().getFullYear()} />
      <MobileStickyBar />
    </ChatProvider>
  );
}
