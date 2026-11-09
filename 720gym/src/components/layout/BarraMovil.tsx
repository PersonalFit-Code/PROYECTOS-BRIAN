"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { claseBoton } from "@/components/ui/Boton";
import { cn } from "@/lib/utils";
import { wa } from "@/data/negocio";

/**
 * Barra fija del móvil: sin cuellos de botella. En cuanto se pasa la portada, siempre a un toque:
 * Inscríbete (venta), Pregunta (asistente) y WhatsApp (información).
 */
export default function BarraMovil() {
  const ruta = usePathname();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const f = () => setVisible(window.scrollY > window.innerHeight * 0.75);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  if (ruta.startsWith("/alta") || ruta.startsWith("/panel")) return null;
  return (
    <div
      className={cn(
        "vidrio vidrio-denso fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-[1.75rem] p-2 transition-[transform,opacity] duration-500 lg:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0",
      )}
    >
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        <Link href="/alta" className={cn(claseBoton("venta"), "h-12 rounded-full")}>
          Inscríbete
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("abrir-asistente"))}
          className={cn(claseBoton("contorno"), "sin-flecha h-12 rounded-full px-4")}
          aria-label="Preguntar al asistente"
        >
          <MessageCircle className="size-5" aria-hidden /> Pregunta
        </button>
        <a href={wa("Hola, quiero información sobre 720 GYM CLUB.")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="vidrio-verde grid h-12 w-12 place-items-center rounded-full text-white">
          <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
            <path d="M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.3 11.3 0 0 0 12.05.7C5.79.7.7 5.79.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.4l5.82-1.53a11.3 11.3 0 0 0 5.42 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.03" />
          </svg>
        </a>
      </div>
    </div>
  );
}
