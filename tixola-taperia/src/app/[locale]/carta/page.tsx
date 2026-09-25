import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import { ReservationProvider } from "@/components/ui/ReservationProvider";
import { ChatProvider } from "@/components/chat/ChatProvider";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import Footer from "@/components/sections/Footer";
import CartaExplorer from "@/components/carta/CartaExplorer";
import { isLocale, type Locale } from "@/i18n/config";
import { localizeCategories, localizeMenuItems } from "@/i18n/data";
import { getMessages } from "@/i18n/getMessages";
import { menuJsonLd, pageMetadata, serializeJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  return pageMetadata(locale, "/carta", {
    title: `${m.carta.title} ${m.carta.accent} · ${m.carta.legend}`,
    description: `${m.carta.description} ${m.carta.legendSub}.`,
  });
}

export default async function CartaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  /* schema.org Menu → MenuSection[] → MenuItem[] (precio EUR, dietas aptas) en el idioma de la página */
  const menu = menuJsonLd(locale, localizeCategories(locale), localizeMenuItems(locale), `${m.carta.title} ${m.carta.accent}`);

  return (
    <ChatProvider page="carta">
      <ReservationProvider>
        <Navbar />
        <main id="main" className="relative pt-[var(--header-h)]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(menu) }} />
          <CartaExplorer />
        </main>
        <Footer />
        <MobileStickyBar />
      </ReservationProvider>
    </ChatProvider>
  );
}
