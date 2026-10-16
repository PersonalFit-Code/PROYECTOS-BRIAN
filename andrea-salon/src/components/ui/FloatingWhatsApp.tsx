"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { motion, MotionConfig } from "framer-motion";
import { BUSINESS } from "@/data/business";
import { useCookieBannerOpen } from "@/components/consent/CookieConsent";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useScrollPastViewport } from "@/hooks/useScrollPast";
import { stripLocale } from "@/i18n/config";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * En la home y en móvil el botón espera a que el usuario haya bajado esta fracción del viewport:
 * así no se solapa con los CTAs a ancho completo de la portada en la primera impresión.
 */
const HOME_REVEAL_RATIO = 0.45;

/* ─────────────────────────────────────────────────────────────────────────────
   ALMACÉN "EL DEDO ESTÁ DESPLAZANDO" (portado de tixola)
   ─────────────────────────────────────────────────────────────────────────────
   Un botón fijo sobre contenido a ancho completo SIEMPRE tapa algo en un móvil. La salida que usan
   las apps es no pelearse por el sitio: mientras el dedo desplaza, el flotante se aparta, y vuelve
   cuando el usuario se queda quieto — justo cuando deja de leer y quiere pulsar.

   Este almacén NO mide nada: no lee `scrollY` ni nada del layout, solo apunta un booleano y
   reinicia un temporizador. Se arma con `touchmove`/`wheel` y no con `scroll` a secas: los enlaces de
   ancla, Lenis y ScrollTrigger emiten `scroll` sin que nadie haya movido un dedo, y con ellos el botón
   se quedaba apartado segundos de más.
*/

/** Milisegundos quieto que hacen falta para que el flotante vuelva. */
const SCROLL_IDLE_MS = 600;
/** Milisegundos sin `scroll` tras los que se da la página por asentada y toca mirar qué hay debajo. */
const SCROLL_SETTLE_MS = 180;

let isScrolling = false;
let fingerScroll = false;
let idleTimer = 0;
let settleTimer = 0;
const idleListeners = new Set<() => void>();
const settleListeners = new Set<() => void>();

function publishScrolling(next: boolean) {
  if (isScrolling === next) return;
  isScrolling = next;
  for (const listener of idleListeners) listener();
}

function onScrollTick() {
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => {
    for (const listener of settleListeners) listener();
  }, SCROLL_SETTLE_MS);

  if (!fingerScroll) return;
  publishScrolling(true);
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    fingerScroll = false;
    publishScrolling(false);
  }, SCROLL_IDLE_MS);
}

function onFingerScroll() {
  fingerScroll = true;
  onScrollTick();
}

function attachScrollListeners() {
  window.addEventListener("scroll", onScrollTick, { passive: true });
  window.addEventListener("touchmove", onFingerScroll, { passive: true });
  window.addEventListener("wheel", onFingerScroll, { passive: true });
}

function detachScrollListeners() {
  window.removeEventListener("scroll", onScrollTick);
  window.removeEventListener("touchmove", onFingerScroll);
  window.removeEventListener("wheel", onFingerScroll);
  window.clearTimeout(idleTimer);
  window.clearTimeout(settleTimer);
  idleTimer = 0;
  settleTimer = 0;
  fingerScroll = false;
  isScrolling = false;
}

function attachIfFirst(): void {
  if (idleListeners.size + settleListeners.size === 0) attachScrollListeners();
}
function detachIfLast(): void {
  if (idleListeners.size + settleListeners.size === 0) detachScrollListeners();
}

function subscribeScrollIdle(listener: () => void): () => void {
  attachIfFirst();
  idleListeners.add(listener);
  return () => {
    idleListeners.delete(listener);
    detachIfLast();
  };
}

function subscribeScrollSettled(listener: () => void): () => void {
  attachIfFirst();
  settleListeners.add(listener);
  return () => {
    settleListeners.delete(listener);
    detachIfLast();
  };
}

/**
 * `true` mientras el USUARIO está desplazando con el dedo o la rueda; vuelve a `false` tras
 * `SCROLL_IDLE_MS` quieto. En servidor y en el primer render es `false`.
 */
export function useIsScrolling(): boolean {
  return useSyncExternalStore(
    subscribeScrollIdle,
    () => isScrolling,
    () => false,
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   "¿HAY UN CONTROL DEBAJO DEL DISCO?"
   ─────────────────────────────────────────────────────────────────────────────
   Lo que de verdad importa no es tapar texto (se lee moviendo el pulgar) sino caer sobre algo que
   hay que PULSAR: el botón «Reservar» de una tarjeta de servicio, el enlace de las reseñas. Ahí el
   disco se come el toque. Así que al asentarse la página el flotante mira qué le ha quedado debajo
   y, si es un control, no vuelve.
*/

const INTERACTIVE_SELECTOR =
  'a[href],button,input,select,textarea,summary,label,[role="button"],[role="link"],[role="tab"],[role="checkbox"],[role="switch"],[tabindex]:not([tabindex="-1"])';

/** Barrido de 3 × 3 puntos por la caja pulsable del disco. */
function controlUnder(box: DOMRect): boolean {
  if (box.width < 2 || box.height < 2) return false;
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const x = box.left + 2 + ((box.width - 4) * i) / 2;
      const y = box.top + 2 + ((box.height - 4) * j) / 2;
      for (const node of document.elementsFromPoint(x, y)) {
        if (!(node instanceof HTMLElement)) continue;
        /* Nuestra propia capa y el cromo fijo no cuentan. */
        if (node.closest("[data-floating]") || node.closest("[data-mobile-bar]")) continue;
        if (node.closest(INTERACTIVE_SELECTOR)) return true;
      }
    }
  }
  return false;
}

/**
 * `true` cuando la caja pulsable de `ref` tiene un control del contenido debajo. Se recalcula al
 * asentarse la página, al cambiar de tamaño, al navegar y cuando cambia `recalcularCon` (el aviso de
 * cookies: una capa fija que se quita sin mover el scroll ni cambiar la ruta).
 */
export function useControlUnderFloat(ref: RefObject<HTMLElement | null>, enabled: boolean, recalcularCon?: unknown): boolean {
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const check = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const el = ref.current;
        if (el) setBlocked(controlUnder(el.getBoundingClientRect()));
      });
    };
    check();
    const unsubscribe = subscribeScrollSettled(check);
    window.addEventListener("resize", check);
    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
      window.removeEventListener("resize", check);
    };
  }, [enabled, pathname, recalcularCon, ref]);

  return enabled && blocked;
}

/**
 * Alto, en píxeles, de la franja de abajo que ocupa el flotante en móvil: barra (64) + margen (8) +
 * caja pulsable (44). Es la caja pulsable y no el disco porque es la que roba el toque.
 */
const FLOAT_BAND_PX = 64 + 8 + 44;

/**
 * `true` cuando el pie ya ha subido lo bastante como para quedar DEBAJO del disco. El pie tiene el
 * teléfono y WhatsApp en texto, así que retirarse del todo no deja a nadie sin contacto. Se rearma
 * con la ruta: el flotante vive en el layout y no se desmonta al navegar.
 */
export function useFooterUnderFloats(): boolean {
  const pathname = usePathname();
  const [seen, setSeen] = useState({ path: "", covered: false });

  useEffect(() => {
    const footer = document.getElementById("footer");
    if (!footer) return;
    const path = pathname ?? "";
    const io = new IntersectionObserver(
      ([entry]) => setSeen({ path, covered: entry?.isIntersecting ?? false }),
      { rootMargin: `0px 0px -${FLOAT_BAND_PX}px 0px`, threshold: 0 },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, [pathname]);

  return seen.path === (pathname ?? "") && seen.covered;
}

/** Transición común: `motion-safe:` y solo `max-md:`; se anima `opacity` y `translate`, nunca maqueta. */
export const FLOATING_TRANSITION = "transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)]";

/** Glifo oficial de WhatsApp (trazado de Simple Icons, caja 24×24). */
const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

export interface WhatsAppGlyphProps {
  /** Medidas del glifo (clases de alto/ancho). Es una prop APARTE de `className` a propósito:
      sin tailwind-merge, un `h-5 w-5` del llamante perdería en la cascada contra el valor por defecto. */
  size?: string;
  className?: string;
}

export function WhatsAppGlyph({ size = "h-7 w-7", className }: WhatsAppGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn(size, className)} aria-hidden fill="currentColor">
      <path d={WHATSAPP_PATH} />
    </svg>
  );
}

/**
 * Botón flotante de WhatsApp (cristal teñido de carmín):
 *  - Escritorio (md+): pegado al borde derecho y centrado verticalmente, disco de 56 px.
 *  - Móvil: esquina inferior derecha, pegado a la barra fija; disco de 36 px dentro de una zona
 *    pulsable de 44 (el mínimo de WCAG).
 * Se aparta en cuatro casos, todos por la misma razón (no tapar algo que hay que leer o pulsar):
 * portada de la home a la vista, aviso de cookies abierto, pie a la vista, mientras el dedo desplaza
 * y cuando al asentarse la página le ha quedado un CONTROL debajo.
 * Abre `https://wa.me/34646771356?text=…` con el mensaje de `BUSINESS.whatsapp.message`.
 */
export default function FloatingWhatsApp() {
  const m = useMessages();
  const pathname = usePathname();
  const isHome = stripLocale(pathname ?? "/").path === "/";
  const scrolled = useScrollPastViewport(HOME_REVEAL_RATIO);
  const mobile = useIsMobile(768);
  const scrolling = useIsScrolling();

  /* Oculto (solo < md) mientras la portada de la home está a la vista. Se resuelve con clases
     max-md:* para que el HTML del servidor ya salga correcto y no haya parpadeo al hidratar. */
  const heroHidden = isHome && !scrolled;
  const bannerOpen = useCookieBannerOpen();
  const footerUnder = useFooterUnderFloats();
  const covered = (bannerOpen || footerUnder) && mobile;

  /* El halo de «mírame» se apaga en cuanto el usuario se acerca al botón: es una animación sin fin y
     su trabajo es llamar la atención una vez. */
  const [noticed, setNoticed] = useState(false);
  const notice = useCallback(() => setNoticed(true), []);

  const boxRef = useRef<HTMLDivElement>(null);
  const overControl = useControlUnderFloat(boxRef, true, bannerOpen);

  const hidden = (heroHidden && mobile) || covered || overControl;
  const pinging = !noticed && !hidden;

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={boxRef}
        data-floating="whatsapp"
        inert={hidden ? true : undefined}
        className={cn(
          /* ESTA CAJA NO SE MUEVE NUNCA: es la posición de reposo. El apartado vive en la capa de
             dentro, para que al medir qué hay debajo se lea el rectángulo de verdad. */
          "fixed right-3 z-40",
          "bottom-[calc(var(--mobile-bar-h)+0.5rem+env(safe-area-inset-bottom))]",
          "md:right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2",
          (heroHidden || bannerOpen || footerUnder) && "max-md:pointer-events-none",
          overControl && "pointer-events-none",
          scrolling && "max-md:motion-safe:pointer-events-none",
        )}
      >
        <div
          className={cn(
            FLOATING_TRANSITION,
            /* Los motivos "de verdad" (portada, cookies, pie, control debajo) NO llevan `motion-safe:`:
               retirarse no es adorno, es dejar libre algo que hay que poder pulsar. */
            (heroHidden || bannerOpen || footerUnder) && "max-md:translate-x-6 max-md:opacity-0",
            overControl && "translate-x-6 opacity-0",
            scrolling && "max-md:motion-safe:translate-x-8 max-md:motion-safe:opacity-0",
          )}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 1.4 }}
          >
            <a
              href={BUSINESS.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={m.common.cta.whatsappAria}
              title={m.common.cta.whatsapp}
              onPointerEnter={notice}
              onFocus={notice}
              onClick={notice}
              className="group relative grid h-11 w-11 place-items-center rounded-full outline-none md:h-14 md:w-14"
            >
              <span
                className={cn(
                  "relative grid h-9 w-9 place-items-center rounded-full md:h-14 md:w-14",
                  /* Liquid Glass tintado: un botón flotante es un control, va en cristal, teñido con el
                     acento para que siga siendo LA acción de la casa. */
                  "liquid-glass liquid-glass-accent",
                  "transition-[translate,scale,background-color] duration-[var(--dur-morph)] group-active:duration-100 ease-[var(--ease-muelle)] group-hover:-translate-y-0.5 group-hover:[--glass-bg:rgba(17,16,18,0.96)] group-active:scale-[0.96]",
                  "group-focus-visible:ring-2 group-focus-visible:ring-carmin group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-crema",
                )}
              >
                {pinging && (
                  <span aria-hidden className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-carmin-suave/35 [animation-duration:2.6s]" />
                )}
                <WhatsAppGlyph size="h-5 w-5 md:h-7 md:w-7" className="relative" />
              </span>

              {/* Tooltip (solo con puntero fino): cristal fuerte porque lleva texto. */}
              <span
                role="tooltip"
                className={cn(
                  "pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5",
                  "liquid-glass liquid-glass-strong font-sans text-[11px] font-semibold tracking-[0.2em] text-tinta uppercase",
                  "translate-x-1 opacity-0 transition-[translate,opacity] duration-150 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                  "[@media(hover:hover)]:block",
                )}
              >
                {m.common.cta.whatsapp}
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
