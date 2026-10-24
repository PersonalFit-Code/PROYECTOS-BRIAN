"use client";

import { MessageCircle, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { BUSINESS } from "@/content";
import { cn } from "@/lib/format";
import { GENERIC_ORDER_TEXT, whatsappUrl } from "@/lib/whatsapp";
import useScrolledPast from "@/hooks/useScrolledPast";

/**
 * Barra de pedido: fija abajo en el móvil, flotante a la derecha en escritorio. Aparece tras
 * 400 px de scroll. En /monta-tu-taco no sale: allí el configurador ya tiene su propia barra.
 */
export default function StickyOrderBar() {
  const pathname = usePathname();
  const past = useScrolledPast(400);
  if (pathname.startsWith("/monta-tu-taco")) return null;
  const show = past;
  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed z-30 transition-[opacity,transform] duration-300 ease-[var(--ease-out)]",
        "inset-x-0 bottom-0 border-t border-line bg-[var(--header-bg)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl",
        "lg:inset-x-auto lg:bottom-auto lg:right-5 lg:top-1/2 lg:-translate-y-1/2 lg:rounded-[20px] lg:border lg:p-2",
        show ? "translate-y-0 opacity-100 lg:translate-x-0" : "pointer-events-none translate-y-full opacity-0 lg:translate-x-4 lg:translate-y-[-50%]",
      )}
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-3 lg:flex lg:flex-col">
        <a tabIndex={show ? 0 : -1} className="press btn btn-salsa lg:min-h-14 lg:w-14 lg:p-0" href={whatsappUrl(GENERIC_ORDER_TEXT)} target="_blank" rel="noopener noreferrer" aria-label="Pedir por WhatsApp">
          <MessageCircle className="h-5 w-5" aria-hidden />
          <span className="lg:sr-only">WhatsApp</span>
        </a>
        <a tabIndex={show ? 0 : -1} className="press btn btn-primary lg:min-h-14 lg:w-14 lg:p-0" href={`tel:${BUSINESS.phone.tel}`} aria-label={`Llamar al ${BUSINESS.phone.display}`}>
          <Phone className="h-5 w-5" aria-hidden />
          <span className="lg:sr-only">Llamar</span>
        </a>
      </div>
    </div>
  );
}
