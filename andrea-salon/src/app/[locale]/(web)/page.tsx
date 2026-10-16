import type { Metadata } from "next";
import SmoothScrollProvider from "@/components/scroll/SmoothScrollProvider";
import Chapter from "@/components/scroll/Chapter";
import ChapterNav from "@/components/scroll/ChapterNav";
import Hero from "@/components/home/Hero";
import RecorridoVideo from "@/components/home/RecorridoVideo";
import ServiciosDestacados from "@/components/home/ServiciosDestacados";
import BonosTeaser from "@/components/home/BonosTeaser";
import Faq from "@/components/home/Faq";
import Cta from "@/components/home/Cta";
import SocialProof from "@/components/resenas/SocialProof";
import Contacto from "@/components/contacto/Contacto";
import { SERVICIOS_FIXTURE } from "@/data/fixtures";
import { RECORRIDO_VIDEO_READY } from "@/data/recorrido";
import { pageMetadata } from "@/lib/seo";
import { pageContext } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await pageContext(params);
  return pageMetadata(locale, "/", { title: m.home.seo.title, description: m.home.seo.description });
}

/**
 * Portada: hero → (recorrido, cuando haya vídeo) → servicios → bonos → reseñas → preguntas →
 * contacto → cierre. Cada sección va en un `<Chapter>` para la navegación lateral y el telón; Lenis
 * y GSAP solo existen aquí.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { m } = await pageContext(params);
  const ch = m.common.scroll.chapters;
  return (
    <SmoothScrollProvider>
      <ChapterNav />
      <Hero />
      {RECORRIDO_VIDEO_READY ? (
        <Chapter id="recorrido" title={m.home.recorrido.kicker}>
          <RecorridoVideo />
        </Chapter>
      ) : null}
      <Chapter id="servicios" title={ch.servicios} overlapsHero>
        {/* FIXTURE: en la fase 1b, los servicios salen de la DB (tag `catalogo`). */}
        <ServiciosDestacados servicios={SERVICIOS_FIXTURE} />
      </Chapter>
      <Chapter id="bonos" title={ch.bonos}>
        <BonosTeaser />
      </Chapter>
      <Chapter id="resenas" title={ch.resenas}>
        <SocialProof />
      </Chapter>
      <Faq />
      <Chapter id="contacto" title={ch.contacto}>
        <Contacto compact />
      </Chapter>
      <Cta />
    </SmoothScrollProvider>
  );
}
