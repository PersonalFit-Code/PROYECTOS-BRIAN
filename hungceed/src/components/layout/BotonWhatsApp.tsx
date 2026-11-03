import { MessageCircle } from "lucide-react";
import { NEGOCIO } from "@/data/negocio";

/**
 * WhatsApp flotante (el 80 % de sus clientes escribe por ahí y hoy no está en la web). Icono que se
 * despliega a texto al pasar el ratón o al enfocarlo con el teclado.
 */
export default function BotonWhatsApp() {
  return (
    <a
      href={NEGOCIO.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 inline-flex h-14 items-center rounded-full bg-rojo px-4 text-white shadow-[0_14px_30px_-10px_rgba(220,31,38,0.7)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-negro sm:right-6 sm:bottom-6"
    >
      <MessageCircle aria-hidden className="size-6 shrink-0" />
      <span className="max-w-0 overflow-hidden text-[13px] font-semibold whitespace-nowrap opacity-0 transition-all duration-300 group-hover:ml-2.5 group-hover:max-w-48 group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-48 group-focus-visible:opacity-100">
        ¿Dudas? Escríbenos
      </span>
      <span className="sr-only"> por WhatsApp</span>
    </a>
  );
}
