import ReactDOM from "react-dom";
import Navbar from "@/components/ui/Navbar";
import { ReservationProvider } from "@/components/ui/ReservationProvider";
import { ChatProvider } from "@/components/chat/ChatProvider";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import Hero from "@/components/sections/Hero";
import StarDishes from "@/components/sections/StarDishes";
import Experience from "@/components/sections/Experience";
import SocialProof from "@/components/sections/SocialProof";
import Footer from "@/components/sections/Footer";
import SmoothScrollProvider from "@/components/scroll/SmoothScrollProvider";
import ChapterNav from "@/components/scroll/ChapterNav";
import Chapter from "@/components/scroll/Chapter";
import HeroTransition from "@/components/scroll/HeroTransition";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";

/**
 * Home: portada 3D + capítulos con scroll cinematográfico.
 *  - `SmoothScrollProvider` (Lenis + GSAP) envuelve el contenido de <main>.
 *  - `HeroTransition` ancla la portada y la transforma mientras "Platos" se desliza por encima.
 *  - Cada sección conserva su `id`; `<Chapter>` solo añade `data-chapter`, el telón de entrada y
 *    el registro para la navegación lateral (`ChapterNav`).
 *  - `ReactDOM.preload` de la textura de hierro: es el elemento más grande de la primera pintura
 *    (fondo CSS de `HeroFallback`, que se sirve en el HTML de todos los visitantes) y, al venir de
 *    una hoja de estilos, el navegador no la descubriría hasta maquetar. Pesa en el LCP móvil.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const m = await getMessages(locale);

  ReactDOM.preload("/textures/iron.webp", { as: "image", fetchPriority: "high" });

  return (
    <ChatProvider page="home">
      <ReservationProvider>
        <Navbar />
        <main id="main" className="relative">
          <SmoothScrollProvider>
            <ChapterNav />
            <Hero />
            <HeroTransition />
            <Chapter id="platos" title={m.scroll.chapters.dishes} overlapsHero>
              <StarDishes />
            </Chapter>
            <Chapter id="experiencia" title={m.scroll.chapters.experience}>
              <Experience />
            </Chapter>
            <Chapter id="opiniones" title={m.scroll.chapters.social}>
              <SocialProof />
            </Chapter>
          </SmoothScrollProvider>
        </main>
        <Footer year={new Date().getFullYear()} />
        <MobileStickyBar />
      </ReservationProvider>
    </ChatProvider>
  );
}
