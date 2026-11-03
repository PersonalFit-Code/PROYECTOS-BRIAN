import { MessageCircle } from "lucide-react";
import { NEGOCIO } from "@/data/negocio";

/**
 * El único botón de WhatsApp de la web (el 80 % de sus clientes escribe por ahí). Flotante, abajo a
 * la derecha; en el móvil va un poco más alto para no tapar la cinta roja ni los botones de la
 * portada. El icono se despliega a texto al pasar el ratón o al enfocarlo con el teclado.
 */
export default function BotonWhatsApp() {
  return (
    <a
      href={NEGOCIO.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 inline-flex h-13 items-center rounded-full bg-rojo px-3.5 text-white shadow-[0_14px_30px_-12px_rgba(10,10,11,0.45)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-carbon sm:right-6 sm:bottom-6 sm:h-14 sm:px-4"
    >
      <MessageCircle aria-hidden className="size-6 shrink-0" />
      <span className="max-w-0 overflow-hidden text-[13px] font-semibold whitespace-nowrap opacity-0 transition-all duration-300 group-hover:ml-2.5 group-hover:max-w-48 group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-48 group-focus-visible:opacity-100">
        ¿Dudas? Escríbenos
      </span>
      <span className="sr-only"> por WhatsApp</span>
    </a>
  );
}
