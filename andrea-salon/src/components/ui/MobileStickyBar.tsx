"use client";

import { motion, MotionConfig } from "framer-motion";
import { CalendarCheck, Phone } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { useCookieBannerOpen } from "@/components/consent/CookieConsent";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { urlFor } from "@/lib/hosts";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* Es la barra que más se pulsa en móvil: la realimentación del dedo tiene que verse en ~100 ms.
   Radio concéntrico: el dock es una cápsula de 56 px (radio 28) con 6 px de relleno, así que cada
   pestaña lleva 28 − 6 = 22 px y sus curvas corren paralelas a las del dock. */
const itemBase =
  "pulsable relative flex h-full items-center justify-center gap-2 rounded-[22px] px-3 text-center font-sans text-[13px] font-bold uppercase leading-tight tracking-[0.08em] [&>svg]:h-5 [&>svg]:w-5";
const itemGhost = "text-tinta hover:bg-carmin/5";
/* Dentro del dock: sin desenfoque propio (nunca cristal sobre cristal), solo el tinte de acento. */
const itemPrimary =
  "bg-carmin text-[var(--on-accent)] border border-carmin shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_18px_-10px_rgba(142,14,51,0.6)] hover:bg-carmin-oscuro";

/**
 * Barra de acciones fija en la parte inferior (solo móvil, < md): Reservar (carmín) · Llamar.
 * Dos acciones y no cuatro: en un salón lo que se hace desde el móvil es coger cita o llamar, y dos
 * botones anchos se pulsan mejor con el pulgar que cuatro estrechos.
 * Se esconde mientras el aviso de cookies está abierto (cae justo encima) y respeta el área segura
 * inferior (iPhone) con `env(safe-area-inset-bottom)`.
 */
export default function MobileStickyBar() {
  const m = useMessages();
  const t = useFormat();
  const hidden = useCookieBannerOpen();

  return (
    <MotionConfig reducedMotion="user">
      <motion.nav
        data-mobile-bar
        aria-label={m.common.misc.quickActions}
        aria-hidden={hidden}
        inert={hidden || undefined}
        initial={false}
        animate={{ y: hidden ? "115%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      >
        {/* EL DOCK DE CRISTAL: una cápsula que flota a 8 px de los cantos. La huella total es
            `--mobile-bar-h`: la cápsula mide 8 px menos y el margen inferior los pone. Casi todo el
            ancho de la pantalla: `cristal-ancho`, con el desenfoque real solo en gama alta. */}
        <div className="liquid-glass liquid-glass-strong cristal-ancho mx-2 mb-[calc(0.5rem+env(safe-area-inset-bottom))] rounded-[28px]">
          <ul className="grid h-[calc(var(--mobile-bar-h)-0.5rem)] grid-cols-2 gap-1 p-1.5">
            <li className="h-full">
              <a href={urlFor("reservar", "/")} className={cn(itemBase, itemPrimary, "w-full")}>
                <CalendarCheck aria-hidden />
                {m.common.cta.bookShort}
              </a>
            </li>
            <li className="h-full">
              <a href={BUSINESS.phone.tel} className={cn(itemBase, itemGhost)} aria-label={t(m.common.cta.callNumber, { phone: BUSINESS.phone.display })}>
                <Phone aria-hidden />
                {m.common.cta.call}
              </a>
            </li>
          </ul>
        </div>
      </motion.nav>
    </MotionConfig>
  );
}
