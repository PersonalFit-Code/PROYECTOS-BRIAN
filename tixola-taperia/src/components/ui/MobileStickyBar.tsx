"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, MotionConfig } from "framer-motion";
import { BookOpen, CalendarCheck, Navigation, Phone } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { useChat } from "@/components/chat/ChatProvider";
import { useReservation } from "@/components/ui/ReservationProvider";
import { useSectionInView } from "@/hooks/useSectionInView";
import { useFormat, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* Es la barra que más se pulsa en móvil: la realimentación del dedo (`active:scale-95`) tiene que
   verse en ~100 ms, y con el `transition-all duration-300` anterior tardaba 300. Lista explícita
   (`scale` es una propiedad propia en Tailwind v4, no va dentro de `transform`).

   `leading-tight` + `text-center`: las etiquetas son de una palabra salvo en inglés, y si alguna
   necesitara dos líneas la caja las admite en vez de recortarlas contra el borde de la barra. */
const itemBase =
  "relative flex h-full flex-col items-center justify-center gap-1 rounded-2xl px-0.5 text-center font-sans text-[11px] font-bold uppercase leading-tight tracking-[0.1em] transition-[scale,background-color,color] duration-180 active:duration-100 ease-[var(--ease-out-expo)] active:scale-95 [&>svg]:h-5 [&>svg]:w-5";
const itemGhost = "text-cream-200 hover:bg-cream/8 hover:text-cream";
/** "Estás aquí": el mismo rojo de la marca, pero sin relleno, para no confundirse con el botón de acción. */
const itemHere = "bg-pimenton/12 text-pimenton-light";
const itemPrimary =
  "bg-pimenton text-cream border border-pimenton-light/60 shadow-[0_0_24px_rgba(178,30,39,0.55)] hover:bg-pimenton-light";

/** Secciones de la home que tienen su reflejo en la barra. La carta es una ruta aparte. */
const WATCHED_SECTIONS = ["experiencia"] as const;

/**
 * Barra de acciones fija en la parte inferior (solo móvil, < md):
 *  Reservar (destacado en pimentón, máxima prioridad según el brief) · Ver carta · Llamar · Llegar.
 *
 * SEÑALA DÓNDE ESTÁS. El cliente lo pidió con estas palabras: "si estoy en carta, que abajo me
 * aparezca que estoy en la carta, señalizado en rojo". Dos fuentes, ninguna cara:
 *  · la ruta (`usePathname`) marca "Ver carta" mientras se está en /carta;
 *  · un `IntersectionObserver` marca "Llegar" cuando la sección de ubicación ocupa el centro.
 * El estado activo NO es la píldora roja rellena: esa se queda para "Reservar", que es una ACCIÓN y
 * no un sitio. El "estás aquí" es texto en pimentón, fondo apenas teñido y un filo superior; se
 * distinguen de un vistazo y no compiten. `aria-current` lo dice también a los lectores de pantalla.
 *
 * Se desliza fuera de la pantalla mientras el modal de reserva o el camarero virtual están abiertos.
 * Respeta el área segura inferior (iPhone) con `env(safe-area-inset-bottom)`.
 */
export default function MobileStickyBar() {
  const m = useMessages();
  const t = useFormat();
  const lp = useLocalePath();
  const pathname = usePathname();
  const { isOpen: reservationOpen, open: openReservation } = useReservation();
  const { isOpen: chatOpen } = useChat();
  const hidden = reservationOpen || chatOpen;

  const section = useSectionInView(WATCHED_SECTIONS);
  /* `/es/carta`, `/gl/carta`… y cualquier subruta suya. */
  const onMenu = /\/carta(\/|$)/.test(pathname ?? "");
  const onLocation = !onMenu && section === "experiencia";

  /** Filo superior del elemento activo: el remate que hace que se lea como pestaña, no como botón. */
  const hereEdge = (
    <span aria-hidden className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-pimenton-light shadow-[0_0_10px_rgba(216,50,60,0.8)]" />
  );

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
        {/* Hierro casi opaco en lugar de cristal: esta barra está fija sobre la portada, cuyas capas
            (halo de calor, vaho, chispas) se mueven en bucle, y un `backdrop-filter` obligaría a volver
            a desenfocar toda la franja en cada fotograma (el escenario móvil más caro de la página). */}
        <div className="border-t border-cream/10 bg-[linear-gradient(160deg,rgba(20,20,20,0.97),rgba(16,16,16,0.95))] pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.7)]">
          <ul className="grid h-[var(--mobile-bar-h)] grid-cols-4 gap-1 px-2 py-1.5">
            <li className="h-full">
              <button type="button" onClick={openReservation} className={cn(itemBase, itemPrimary, "w-full")}>
                <CalendarCheck aria-hidden />
                {m.common.cta.reserveShort}
              </button>
            </li>
            <li className="h-full">
              <Link
                href={lp("/carta")}
                aria-current={onMenu ? "page" : undefined}
                className={cn(itemBase, onMenu ? itemHere : itemGhost)}
              >
                {onMenu && hereEdge}
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
                aria-current={onLocation ? "true" : undefined}
                className={cn(itemBase, onLocation ? itemHere : itemGhost)}
                aria-label={m.common.cta.directionsAria}
              >
                {onLocation && hereEdge}
                <Navigation aria-hidden />
                {m.common.cta.directionsShort}
              </a>
            </li>
          </ul>
        </div>
      </motion.nav>
    </MotionConfig>
  );
}
