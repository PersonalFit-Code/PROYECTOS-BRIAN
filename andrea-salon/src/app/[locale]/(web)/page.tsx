import type { Metadata } from "next";
import SmoothScrollProvider from "@/components/scroll/SmoothScrollProvider";
import Chapter from "@/components/scroll/Chapter";
import Hero from "@/components/home/Hero";
import MarquesinaServicios from "@/components/home/MarquesinaServicios";
import RecorridoVideo from "@/components/home/RecorridoVideo";
import ServiciosEditorial from "@/components/home/ServiciosEditorial";
import BonosTeaser from "@/components/home/BonosTeaser";
import Faq from "@/components/home/Faq";
import Cta from "@/components/home/Cta";
import SocialProof from "@/components/resenas/SocialProof";
import Contacto from "@/components/contacto/Contacto";
import { RECORRIDO_VIDEO_READY } from "@/data/recorrido";
import { pageMetadata } from "@/lib/seo";
import { pageContext } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, m } = await pageContext(params);
  return pageMetadata(locale, "/", { title: m.home.seo.title, description: m.home.seo.description });
}

/**
 * Portada editorial: portada → carril de servicios → (recorrido, cuando haya vídeo) → servicios
 * 01–04 → reseñas → bonos → preguntas → contacto → cierre. Sin navegación lateral de capítulos: en
 * esta línea la página respira y se lee de arriba abajo. Lenis y GSAP solo existen aquí.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { m } = await pageContext(params);
  return (
    <SmoothScrollProvider>
      <Hero />
      <MarquesinaServicios />
      {RECORRIDO_VIDEO_READY ? (
        <Chapter id="recorrido" title={m.home.recorrido.kicker}>
          <RecorridoVideo />
        </Chapter>
      ) : null}
      <ServiciosEditorial />
      <SocialProof />
      <BonosTeaser />
      <Faq />
      <Contacto compact />
      <Cta />
    </SmoothScrollProvider>
  );
}
