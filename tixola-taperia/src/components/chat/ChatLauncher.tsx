"use client";

import { usePathname } from "next/navigation";
import { motion, MotionConfig } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { useCookieBannerOpen } from "@/components/legal/CookieConsent";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useScrollPastViewport } from "@/hooks/useScrollPast";
import { stripLocale } from "@/i18n/config";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** id del botón para devolverle el foco al cerrar el widget. */
export const CHAT_LAUNCHER_ID = "tixola-chat-launcher";

/**
 * En la home y en móvil el lanzador espera a que el usuario haya bajado esta fracción del viewport,
 * igual que el botón de WhatsApp: así no tapa los CTAs de la portada en la primera impresión.
 */
const HOME_REVEAL_RATIO = 0.45;

export interface ChatLauncherProps {
  isOpen: boolean;
  /** true desde la primera apertura: retira el punto de aviso */
  hasOpened: boolean;
  onToggle: () => void;
  /**
   * Se llama al acercar el puntero o al enfocar el botón: ChatProvider aprovecha para pedir el chunk
   * del panel antes de la pulsación, de modo que al abrir ya esté en memoria.
   */
  onPreload?: () => void;
}

/**
 * Lanzador del camarero virtual: botón redondo de 56 px, cristal rojo, abajo a la IZQUIERDA
 * (el WhatsApp vive a la derecha). Por encima de la barra fija en móvil. Se recoge mientras el
 * widget está abierto (el panel nace de su misma esquina) y luce un punto pimentón hasta la primera apertura.
 * Al acercar el puntero o enfocarlo avisa a ChatProvider (`onPreload`) para que el chunk del panel
 * llegue antes que el clic.
 * Recibe el estado por props desde ChatProvider (así no hay ciclo de importación con el contexto).
 */
export default function ChatLauncher({ isOpen, hasOpened, onToggle, onPreload }: ChatLauncherProps) {
  const m = useMessages();
  const pathname = usePathname();
  const isHome = stripLocale(pathname ?? "/").path === "/";
  /* Del almacén único de scroll: este hook era una copia literal del de FloatingWhatsApp. */
  const scrolled = useScrollPastViewport(HOME_REVEAL_RATIO);
  const mobile = useIsMobile(768);

  /* Oculto (solo < md) mientras la portada de la home está a la vista; se resuelve con clases
     max-md:* para que el HTML del servidor ya salga correcto y no parpadee al hidratar. */
  const heroHidden = isHome && !scrolled && !isOpen;
  /* El aviso de cookies ocupa todo el ancho y ~350 px de alto en móvil: taparía este botón. Desde
     `md` se centra (`md:w-[min(42rem,100vw-3rem)]`), así que su borde izquierdo sigue cayendo sobre
     el lanzador hasta ~816 px de ancho — tablets en vertical. Por eso el apartado por el aviso usa
     un umbral propio (lg) y el de la portada se queda en el suyo (md). */
  const bannerOpen = useCookieBannerOpen();
  const bannerOverlaps = useIsMobile(1024);
  const hidden = isOpen || (heroHidden && mobile) || (bannerOpen && bannerOverlaps);

  return (
    <MotionConfig reducedMotion="user">
      <div
        inert={hidden ? true : undefined}
        className={cn(
          /* `translate`, no `transform`: `-translate-x-6` es la propiedad `translate` en Tailwind v4. */
          "fixed z-40 transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)]",
          /* MÓVIL: columna única pegada al borde derecho, sobre la barra inferior, y este botón ARRIBA
             del de WhatsApp. Antes había uno en cada esquina y a distinta altura, así que entre los dos
             barrían media pantalla: se comían el nombre de los platos y los botones "Reservar mesa" /
             "Llamar" de la tarjeta de horario (medido con el dedo, no de oído). Apilados y a 44 px —el
             mínimo que WCAG da por pulsable— ocupan una franja estrecha en la esquina en la que no hay
             texto, y dejan libre todo el ancho de lectura.
             Las dos alturas van EMPAREJADAS con las de `FloatingWhatsApp`: 0,75rem de respiro sobre la
             barra, 2,75rem del botón de abajo y 0,5rem de separación. Si cambia una, cambia la otra. */
          "right-3 bottom-[calc(var(--mobile-bar-h)+0.75rem+2.75rem+0.5rem+env(safe-area-inset-bottom))]",
          /* ESCRITORIO: donde estaba, abajo a la izquierda, que ahí no molesta a nadie. */
          "md:left-4 md:right-auto md:bottom-6",
          heroHidden && "max-md:pointer-events-none max-md:translate-x-6 max-md:opacity-0",
          bannerOpen && "max-lg:pointer-events-none max-lg:translate-x-6 max-lg:opacity-0",
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={isOpen ? { opacity: 0, scale: 0.4, x: 0 } : { opacity: 1, scale: 1, x: 0 }}
          transition={isOpen ? { duration: 0.25, ease: EASE_OUT_EXPO } : { duration: 0.8, ease: EASE_OUT_EXPO, delay: 1.2 }}
          className={cn(isOpen && "pointer-events-none")}
        >
          <button
            id={CHAT_LAUNCHER_ID}
            type="button"
            onClick={onToggle}
            onPointerEnter={onPreload}
            onFocus={onPreload}
            aria-label={m.chat.launcherAria}
            aria-expanded={isOpen}
            aria-controls="tixola-chat-widget"
            title={m.chat.launcher}
            tabIndex={hidden ? -1 : 0}
            className={cn(
              "group relative grid h-11 w-11 place-items-center rounded-full text-cream shadow-neon md:h-14 md:w-14",
              /* Burdeos opaco en TODAS las gamas (era lo que ya veían media y baja): el disco flota
                 sobre la portada, cuyas capas se mueven en bucle, así que un `backdrop-filter` habría
                 que recalcularlo con cada fotograma. Y sin leer la gama, este botón deja de suscribirse
                 al almacén de rendimiento. */
              "border border-pimenton-light/50 bg-burgundy",
              /* `scale` y `translate` son propiedades propias en Tailwind v4: van nombradas para que
                 `active:scale-95` responda en 100 ms y no herede los 300 del hover. */
              "transition-[translate,scale,background-color,box-shadow] duration-200 active:duration-100 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-pimenton/40 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light focus-visible:ring-offset-2 focus-visible:ring-offset-iron",
            )}
          >
            <MessageSquareText aria-hidden className="relative h-6 w-6" strokeWidth={1.8} />

            {/* Punto pimentón: "hay alguien al otro lado" hasta la primera apertura */}
            {!hasOpened && (
              <span aria-hidden className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-pimenton-light/60 [animation-duration:2.4s]" />
                <span className="relative h-3 w-3 rounded-full border-2 border-iron bg-pimenton-light" />
              </span>
            )}

            {/* Tooltip (solo con puntero fino) */}
            <span
              role="tooltip"
              className={cn(
                "pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5",
                /* Sin `backdrop-blur`: el fondo ya es hierro al 95 %, no había nada visible detrás. */
                "border border-cream/10 bg-iron-900/95 font-caps text-[11px] tracking-[0.25em] text-cream shadow-card",
                "-translate-x-1 opacity-0 transition-[translate,opacity] duration-150 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                "[@media(hover:hover)]:block",
              )}
            >
              {m.chat.launcher}
            </span>
          </button>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
