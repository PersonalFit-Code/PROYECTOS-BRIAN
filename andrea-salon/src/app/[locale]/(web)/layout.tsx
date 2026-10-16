import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChatProvider } from "@/components/chat/ChatProvider";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import MobileStickyBar from "@/components/ui/MobileStickyBar";

/**
 * La web pública: cabecera con menú curvo, pie, WhatsApp flotante, barra inferior de móvil y el
 * asistente de preguntas frecuentes.
 * `#app-shell` es lo que el menú lateral deja `inert` al abrirse; los flotantes van FUERA para que
 * sigan siendo pulsables y no hereden ese `inert` (el lanzador y el panel del asistente los pinta
 * `ChatProvider` detrás de sus hijos, así que también quedan fuera). El scroll suave (Lenis +
 * capítulos) NO va aquí: lo monta solo la portada (`page.tsx`), para no meter GSAP en /servicios o
 * las legales.
 *
 * El asistente va SOLO en este grupo: ni en la reserva `(reservar)`, que ya es un asistente que sí
 * reserva, ni en el panel.
 */
export default function WebLayout({ children }: { children: ReactNode }) {
  /* Si el asistente responde con IA. Se mira en el servidor (la clave nunca llega al navegador) y
     solo viaja este sí/no, para que la nota de privacidad del panel diga a dónde va lo que se escribe.
     Es la misma condición con la que `/api/chat` decide si llama a Anthropic. */
  const conIA = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <ChatProvider conIA={conIA}>
      <div id="app-shell">
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </div>
      <FloatingWhatsApp />
      <MobileStickyBar />
    </ChatProvider>
  );
}
