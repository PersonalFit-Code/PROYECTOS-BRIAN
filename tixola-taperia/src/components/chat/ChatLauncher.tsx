"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
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

/** true cuando el usuario ha bajado más de `ratio` × alto del viewport (listener con rAF). */
function useScrolledPast(ratio: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setPast(window.scrollY > window.innerHeight * ratio);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [ratio]);
  return past;
}

export interface ChatLauncherProps {
  isOpen: boolean;
  /** true desde la primera apertura: retira el punto de aviso */
  hasOpened: boolean;
  onToggle: () => void;
}

/**
 * Lanzador del camarero virtual: botón redondo de 56 px, cristal rojo, abajo a la IZQUIERDA
 * (el WhatsApp vive a la derecha). Por encima de la barra fija en móvil. Se recoge mientras el
 * widget está abierto (el panel nace de su misma esquina) y luce un punto pimentón hasta la primera apertura.
 * Recibe el estado por props desde ChatProvider (así no hay ciclo de importación con el contexto).
 */
export default function ChatLauncher({ isOpen, hasOpened, onToggle }: ChatLauncherProps) {
  const m = useMessages();
  const { tier } = usePerformanceTier();
  const pathname = usePathname();
  const isHome = stripLocale(pathname ?? "/").path === "/";
  const scrolled = useScrolledPast(HOME_REVEAL_RATIO);
  const mobile = useIsMobile(768);

  /* Oculto (solo < md) mientras la portada de la home está a la vista; se resuelve con clases
     max-md:* para que el HTML del servidor ya salga correcto y no parpadee al hidratar. */
  const heroHidden = isHome && !scrolled && !isOpen;
  const hidden = isOpen || (heroHidden && mobile);

  return (
    <MotionConfig reducedMotion="user">
      <div
        inert={hidden ? true : undefined}
        className={cn(
          "fixed left-4 z-40 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]",
          "bottom-[calc(var(--mobile-bar-h)+16px+env(safe-area-inset-bottom))] md:bottom-6",
          heroHidden && "max-md:pointer-events-none max-md:-translate-x-6 max-md:opacity-0",
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: -24 }}
          animate={isOpen ? { opacity: 0, scale: 0.4, x: 0 } : { opacity: 1, scale: 1, x: 0 }}
          transition={isOpen ? { duration: 0.25, ease: EASE_OUT_EXPO } : { duration: 0.8, ease: EASE_OUT_EXPO, delay: 1.2 }}
          className={cn(isOpen && "pointer-events-none")}
        >
          <button
            id={CHAT_LAUNCHER_ID}
            type="button"
            onClick={onToggle}
            aria-label={m.chat.launcherAria}
            aria-expanded={isOpen}
            aria-controls="tixola-chat-widget"
            title={m.chat.launcher}
            tabIndex={hidden ? -1 : 0}
            className={cn(
              "group relative grid h-14 w-14 place-items-center rounded-full text-cream shadow-neon",
              tier === "low" ? "border border-pimenton-light/50 bg-burgundy" : "glass-red",
              "transition-[transform,background-color,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-pimenton/40 active:scale-95",
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
                "border border-cream/10 bg-iron-900/95 font-caps text-[11px] tracking-[0.25em] text-cream shadow-card backdrop-blur",
                "-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
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
