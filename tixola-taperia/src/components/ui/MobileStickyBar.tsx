"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { BookOpen, CalendarCheck, Navigation, Phone } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { useChat } from "@/components/chat/ChatProvider";
import { useReservation } from "@/components/ui/ReservationProvider";
import { useFormat, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const itemBase =
  "flex h-full flex-col items-center justify-center gap-1 rounded-2xl font-sans text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ease-[var(--ease-out-expo)] active:scale-95 [&>svg]:h-5 [&>svg]:w-5";
const itemGhost = "text-cream-200 hover:bg-cream/8 hover:text-cream";
const itemPrimary =
  "bg-pimenton text-cream border border-pimenton-light/60 shadow-[0_0_24px_rgba(178,30,39,0.55)] hover:bg-pimenton-light";

/**
 * Barra de acciones fija en la parte inferior (solo móvil, < md):
 *  Reservar (destacado en pimentón, máxima prioridad según el brief) · Ver carta · Llamar · Cómo llegar.
 * Se desliza fuera de la pantalla mientras el modal de reserva o el camarero virtual están abiertos.
 * Respeta el área segura inferior (iPhone) con `env(safe-area-inset-bottom)`.
 */
export default function MobileStickyBar() {
  const m = useMessages();
  const t = useFormat();
  const lp = useLocalePath();
  const { isOpen: reservationOpen, open: openReservation } = useReservation();
  const { isOpen: chatOpen } = useChat();
  const hidden = reservationOpen || chatOpen;

  return (
    <MotionConfig reducedMotion="user">
      <motion.nav
        aria-label={m.common.misc.quickActions}
        aria-hidden={hidden}
        inert={hidden || undefined}
        initial={false}
        animate={{ y: hidden ? "115%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      >
        {/* Cristal ahumado (mismas capas que `glass-smoke`, pero solo con borde superior) */}
        <div className="border-t border-cream/10 bg-[linear-gradient(160deg,rgba(20,20,20,0.86),rgba(20,20,20,0.7))] pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl backdrop-saturate-[1.2]">
          <ul className="grid h-[var(--mobile-bar-h)] grid-cols-4 gap-1 px-2 py-1.5">
            <li className="h-full">
              <button type="button" onClick={openReservation} className={cn(itemBase, itemPrimary, "w-full")}>
                <CalendarCheck aria-hidden />
                {m.common.cta.reserveShort}
              </button>
            </li>
            <li className="h-full">
              <Link href={lp("/carta")} className={cn(itemBase, itemGhost)}>
                <BookOpen aria-hidden />
                {m.common.cta.menuShort}
              </Link>
            </li>
            <li className="h-full">
              <a href={BUSINESS.phone.tel} className={cn(itemBase, itemGhost)} aria-label={t(m.common.cta.callNumber, { phone: BUSINESS.phone.display })}>
                <Phone aria-hidden />
                {m.common.cta.call}
              </a>
            </li>
            <li className="h-full">
              <a
                href={BUSINESS.social.directions}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(itemBase, itemGhost)}
                aria-label={m.common.cta.directionsAria}
              >
                <Navigation aria-hidden />
                {m.common.cta.directions}
              </a>
            </li>
          </ul>
        </div>
      </motion.nav>
    </MotionConfig>
  );
}
