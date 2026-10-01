import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import { ChatProvider } from "@/components/chat/ChatProvider";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import Footer from "@/components/sections/Footer";
import VinosExplorer from "@/components/vinos/VinosExplorer";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  /* Claves dedicadas (≤ 60 / ≤ 160 caracteres), igual que en /carta: componer el título con los
     textos de pantalla dejaría fuera las palabras por las que de verdad se busca esto ("vinos
     gallegos Ourense"). El sufijo de marca lo añade la plantilla del layout de idioma.
     SE INDEXA aunque la lista de vinos todavía no esté: lo que hay publicado —el aviso y las cinco
     denominaciones— es contenido real y correcto. Es distinto de las páginas legales, que van con
     `noindex` mientras les falten los datos del responsable, porque allí lo que falta es justo lo
     que les da validez. */
  return pageMetadata(locale, "/vinos", {
    title: m.vinos.seoTitle,
    description: m.vinos.seoDescription,
  });
}

export default async function VinosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);

  /* Migas para Google. No se pinta un rastro de migas en pantalla —la cabecera ya dice dónde
     estás—, pero marcarlo hace que en los resultados salga "tixola.es › Vinos" en vez de la URL. */
  const migas = breadcrumbJsonLd([
    { name: m.nav.home, url: absoluteUrl(locale, "/") },
    { name: m.nav.links.wines },
  ]);

  return (
    <ChatProvider page="vinos">
      <Navbar />
      <main id="main" className="relative pt-[var(--header-h)]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(migas) }} />
        <VinosExplorer />
      </main>
      <Footer year={new Date().getFullYear()} />
      <MobileStickyBar />
    </ChatProvider>
  );
}
