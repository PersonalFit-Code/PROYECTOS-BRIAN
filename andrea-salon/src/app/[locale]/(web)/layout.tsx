import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import MobileStickyBar from "@/components/ui/MobileStickyBar";

/**
 * La web pública: cabecera con menú curvo, pie, WhatsApp flotante y barra inferior de móvil.
 * `#app-shell` es lo que el menú lateral deja `inert` al abrirse; los flotantes van FUERA para que
 * sigan siendo pulsables y no hereden ese `inert`. El scroll suave (Lenis + capítulos) NO va aquí:
 * lo monta solo la portada (`page.tsx`), para no meter GSAP en /servicios o las legales.
 */
export default function WebLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="app-shell">
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </div>
      <FloatingWhatsApp />
      <MobileStickyBar />
    </>
  );
}
