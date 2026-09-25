"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { BUSINESS } from "@/data/business";
import { useIsMobile } from "@/hooks/useIsMobile";
import { stripLocale } from "@/i18n/config";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * En la home y en móvil el botón espera a que el usuario haya bajado esta fracción del viewport:
 * así no se solapa con los CTAs a ancho completo de la portada en la primera impresión.
 */
const HOME_REVEAL_RATIO = 0.45;

/** Glifo oficial de WhatsApp (trazado de Simple Icons, caja 24×24). */
const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-7 w-7", className)} aria-hidden fill="currentColor">
      <path d={WHATSAPP_PATH} />
    </svg>
  );
}

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

/**
 * Botón flotante de WhatsApp (56 px, pimentón, halo neón pulsante):
 *  - Escritorio (md+): pegado al borde derecho y centrado verticalmente.
 *  - Móvil: abajo a la derecha, por encima de la barra fija y sin chocar con el lanzador
 *    del camarero virtual (que vive abajo a la izquierda). En la home aparece al empezar a
 *    hacer scroll para no tapar los CTAs de la portada.
 * Se monta desde Navbar.tsx para aparecer en todas las páginas.
 */
export default function FloatingWhatsApp() {
  const m = useMessages();
  const pathname = usePathname();
  const isHome = stripLocale(pathname ?? "/").path === "/";
  const scrolled = useScrolledPast(HOME_REVEAL_RATIO);
  const mobile = useIsMobile(768);

  /* Oculto (solo < md) mientras la portada de la home está a la vista. Se resuelve con clases
     max-md:* para que el HTML del servidor ya salga correcto y no haya parpadeo al hidratar. */
  const heroHidden = isHome && !scrolled;

  return (
    <MotionConfig reducedMotion="user">
      <div
        inert={heroHidden && mobile ? true : undefined}
        className={cn(
          "fixed right-4 z-40 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]",
          "bottom-[calc(var(--mobile-bar-h)+88px+env(safe-area-inset-bottom))]",
          "md:bottom-auto md:top-1/2 md:-translate-y-1/2",
          heroHidden && "max-md:pointer-events-none max-md:translate-x-6 max-md:opacity-0",
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 1.4 }}
        >
          <a
            href={BUSINESS.phone.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={m.common.cta.whatsapp}
            title={m.common.cta.whatsappAria}
            className={cn(
              "group relative grid h-14 w-14 place-items-center rounded-full",
              "border border-pimenton-light/60 bg-pimenton text-cream shadow-neon animate-neon-pulse",
              "transition-[transform,background-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-pimenton-light active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light focus-visible:ring-offset-2 focus-visible:ring-offset-iron",
            )}
          >
            {/* Halo exterior suave (ping lento) */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-pimenton-light/35 [animation-duration:2.6s]"
            />
            <WhatsAppGlyph className="relative" />

            {/* Tooltip (solo con puntero fino) */}
            <span
              role="tooltip"
              className={cn(
                "pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5",
                "border border-cream/10 bg-iron-900/95 font-caps text-[11px] tracking-[0.25em] text-cream shadow-card backdrop-blur",
                "translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                "[@media(hover:hover)]:block",
              )}
            >
              {m.common.cta.whatsapp}
            </span>
          </a>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
