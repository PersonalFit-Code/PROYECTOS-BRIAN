"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { BookOpen, Navigation, Phone } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { useReservation } from "@/components/ui/ReservationProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const itemBase =
  "flex h-full flex-col items-center justify-center gap-1 rounded-2xl font-sans text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300 ease-[var(--ease-out-expo)] active:scale-95 [&>svg]:h-5 [&>svg]:w-5";
const itemGhost = "text-cream-200 hover:bg-cream/8 hover:text-cream";
const itemPrimary =
  "bg-pimenton text-cream border border-pimenton-light/60 shadow-[0_0_24px_rgba(178,30,39,0.55)] hover:bg-pimenton-light";

/**
 * Barra de acciones fija en la parte inferior (solo móvil, < md):
 *  Llamar · Ver carta (destacado en pimentón) · Cómo llegar.
 * Se desliza fuera de la pantalla mientras el modal de reserva está abierto para no solapar.
 * Respeta el área segura inferior (iPhone) con `env(safe-area-inset-bottom)`.
 */
export default function MobileStickyBar() {
  const { isOpen } = useReservation();

  return (
    <MotionConfig reducedMotion="user">
      <motion.nav
        aria-label="Acciones rápidas"
        aria-hidden={isOpen}
        initial={false}
        animate={{ y: isOpen ? "115%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      >
        {/* Cristal ahumado (mismas capas que `glass-smoke`, pero solo con borde superior) */}
        <div className="border-t border-cream/10 bg-[linear-gradient(160deg,rgba(20,20,20,0.86),rgba(20,20,20,0.7))] pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl backdrop-saturate-[1.2]">
          <ul className="grid h-[var(--mobile-bar-h)] grid-cols-3 gap-1 px-2 py-1.5">
            <li className="h-full">
              <a href={BUSINESS.phone.tel} className={cn(itemBase, itemGhost)} aria-label={`Llamar al ${BUSINESS.phone.display}`}>
                <Phone aria-hidden />
                Llamar
              </a>
            </li>
            <li className="h-full">
              <Link href="/carta" className={cn(itemBase, itemPrimary)}>
                <BookOpen aria-hidden />
                Ver carta
              </Link>
            </li>
            <li className="h-full">
              <a
                href={BUSINESS.social.directions}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(itemBase, itemGhost)}
                aria-label="Cómo llegar (abre Google Maps)"
              >
                <Navigation aria-hidden />
                Cómo llegar
              </a>
            </li>
          </ul>
        </div>
      </motion.nav>
    </MotionConfig>
  );
}
