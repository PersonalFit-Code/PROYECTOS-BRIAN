import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import { ReservationProvider } from "@/components/ui/ReservationProvider";
import { ChatProvider } from "@/components/chat/ChatProvider";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import Footer from "@/components/sections/Footer";
import CartaExplorer from "@/components/carta/CartaExplorer";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  return pageMetadata(locale, "/carta", {
    title: `${m.carta.title} ${m.carta.accent} · ${m.carta.legend}`,
    description: `${m.carta.description} ${m.carta.legendSub}.`,
  });
}

export default function CartaPage() {
  return (
    <ChatProvider page="carta">
      <ReservationProvider>
        <Navbar />
        <main id="main" className="relative pt-[var(--header-h)]">
          <CartaExplorer />
        </main>
        <Footer />
        <MobileStickyBar />
      </ReservationProvider>
    </ChatProvider>
  );
}
