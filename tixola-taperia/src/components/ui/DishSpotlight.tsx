"use client";

import { AnimatePresence, MotionConfig, motion, useDragControls, useReducedMotion, type PanInfo, type Variants } from "framer-motion";
import { CalendarCheck, MessageCircle, Sparkles, UtensilsCrossed, Wine, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { useChat } from "@/components/chat/ChatProvider";
import { AllergenRow } from "@/components/ui/AllergenIcon";
import DishVisual, { DISH_LAYOUT_TRANSITION, dishVisualLayoutId, type DishSlide } from "@/components/ui/DishVisual";
import NeonButton from "@/components/ui/NeonButton";
import { formatPrice } from "@/data/menu";
import { useInertBackground } from "@/hooks/useInertBackground";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { localizeAllergenMap } from "@/i18n/data";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * DishSpotlight — detalle del plato estrella, en todos los tamaños de pantalla.
 *
 *  · Móvil: bottom‑sheet (se cierra arrastrando el asa hacia abajo). Tablet/escritorio: diálogo
 *    centrado a dos columnas (foto + ficha).
 *  · La foto viaja desde la tarjeta del carrusel como elemento compartido (`layoutId`) y vuelve al cerrar.
 *  · Contenido: foto (o tixola compuesta), nombre, kicker, titular, descripción, ingredientes, alérgenos
 *    (icono + etiqueta localizada), maridaje (vino · D.O. · por qué) y CTAs "Ver en la carta" / "Reservar",
 *    más un atajo al camarero virtual.
 *  · Accesibilidad: `role="dialog"` modal, Escape / fondo / botón cierran, foco inicial en "cerrar" y
 *    devolución del foco a la tarjeta al cerrar, resto de la página `inert`, scroll del documento bloqueado
 *    (SmoothScrollProvider detecta el bloqueo y para Lenis) y `data-lenis-prevent` en el área desplazable.
 *
 * Se monta en `document.body` por portal (con un host persistente) para escapar de cualquier ancestro con
 * `transform`/`overflow` (Embla, Chapter) y para que el `inert` del fondo se libere en cuanto se cierra,
 * antes de que termine la animación de salida — así "Reservar" puede abrir su modal sin esperar.
 */

/** Alias por compatibilidad con la iteración 1 (el id vive en DishVisual). */
export const dishSpotlightLayoutId = dishVisualLayoutId;

export interface DishSpotlightProps {
  /** plato (y su foto) a mostrar; `null` cierra el detalle */
  slide: DishSlide | null;
  onClose: () => void;
  onReserve: () => void;
  /** volutas de vapor en el visual compuesto (desactivar en tier "low") */
  steam?: boolean;
}

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SHEET_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 380px";

/** Bottom‑sheet (móvil): entra deslizándose desde abajo. */
const SHEET_VARIANTS: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { type: "spring", stiffness: 320, damping: 34, mass: 0.9 } },
  exit: { y: "100%", transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } },
};
/** Diálogo centrado (md+): fundido + leve elevación. */
const DIALOG_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.25, ease: "easeIn" } },
};

/** `true` solo tras la hidratación (el portal necesita `document.body`); `false` en el servidor. */
const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

export default function DishSpotlight({ slide, onClose, onReserve, steam = true }: DishSpotlightProps) {
  const isClient = useIsClient();
  const isMobile = useIsMobile();
  const hostRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const open = slide !== null;

  /* El resto de la página sale del árbol de accesibilidad mientras el detalle está abierto. */
  useInertBackground(open, [hostRef]);

  /* Bloqueo de scroll del documento + devolución del foco al elemento que abrió el detalle.
     Ambos se liberan en cuanto `slide` vuelve a null (la animación de salida sigue su curso). */
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      const el = returnFocusRef.current;
      returnFocusRef.current = null;
      if (el?.isConnected) el.focus({ preventScroll: true });
    };
  }, [open]);

  /* Escape cierra. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!isClient) return null;

  return createPortal(
    <div ref={hostRef} data-dish-spotlight="">
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {slide && <Sheet key={slide.dish.id} slide={slide} mobile={isMobile} steam={steam} onClose={onClose} onReserve={onReserve} />}
        </AnimatePresence>
      </MotionConfig>
    </div>,
    document.body,
  );
}

/* ───────────────────────── Panel ───────────────────────── */

interface SheetProps {
  slide: DishSlide;
  mobile: boolean;
  steam: boolean;
  onClose: () => void;
  onReserve: () => void;
}

function Sheet({ slide, mobile, steam, onClose, onReserve }: SheetProps) {
  const { dish, photo } = slide;
  const m = useMessages();
  const glass = usePerformanceTier().tier === "high";
  const reducedMotion = useReducedMotion();
  const dragControls = useDragControls();
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  /* Foco inicial en "cerrar" (tras la primera pintura del panel). */
  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(timer);
  }, []);

  /* Arrastrar hacia abajo para cerrar (solo móvil). El gesto arranca desde el asa: si el panel entero
     fuese arrastrable, framer fijaría `touch-action` y bloquearía el scroll nativo del contenido. */
  const onHandlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      dragControls.start(e);
    },
    [dragControls],
  );
  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > 110 || info.velocity.y > 600) onClose();
    },
    [onClose],
  );

  const vars: CSSVars = { "--accent": dish.accent };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center overflow-hidden sm:items-center sm:p-4 md:p-8" role="presentation">
      {/* Fondo */}
      <motion.button
        type="button"
        aria-label={m.dishes.spotlight.closeOverlay}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 cursor-default bg-black/80"
      />

      {/* Panel. Sin `overflow-hidden`: la foto (elemento compartido) no debe recortarse mientras viaja. */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        variants={mobile ? SHEET_VARIANTS : DIALOG_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        drag={mobile && !reducedMotion ? "y" : false}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
        style={vars}
        className={cn(
          "noise after:noise-after after:rounded-[inherit] relative flex max-h-[92dvh] w-full flex-col rounded-t-[28px] shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.9)] outline-none",
          /* `glass-smoke` lleva backdrop-filter: solo en gama alta. El velo ya es opaco al 80 %,
             así que fuera de ese tier el panel es hierro sólido y no hay una segunda pasada de
             desenfoque a pantalla casi completa mientras el panel se anima o se arrastra. */
          glass ? "glass-smoke" : "border border-cream/10 bg-iron-900/95 shadow-glass",
          "sm:max-w-lg sm:rounded-[28px] sm:shadow-card",
          "md:h-[min(86dvh,760px)] md:max-h-none md:max-w-4xl md:flex-row",
        )}
      >
        {/* Halo del color de acento tras el panel */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full opacity-50 blur-3xl md:-left-24 md:top-1/2 md:h-96 md:w-96 md:-translate-y-1/2"
          style={{ background: `radial-gradient(circle, ${dish.accent}59, transparent 70%)` }}
        />

        {/* Cerrar (esquina superior derecha del panel; en móvil queda sobre la foto) */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={m.dishes.spotlight.close}
          className="absolute right-3 top-3 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-iron-900/70 text-cream backdrop-blur-sm transition-colors duration-300 hover:bg-cream/10 md:right-4 md:top-4"
        >
          <X size={18} aria-hidden />
        </button>

        {/* ── Foto / tixola compuesta ── */}
        <div className="relative shrink-0 md:w-[42%] md:self-stretch">
          <motion.div
            layoutId={dishVisualLayoutId(dish.id)}
            transition={DISH_LAYOUT_TRANSITION}
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-t-[28px] md:absolute md:inset-0 md:aspect-auto md:rounded-l-[28px] md:rounded-tr-none"
          >
            {/* `layout` en el hijo: framer corrige la distorsión al cambiar de proporción (3:4 → 4:3) */}
            <motion.div layout transition={DISH_LAYOUT_TRANSITION} className="absolute inset-0">
              <DishVisual dish={dish} photo={photo} sizes={SHEET_SIZES} steam={steam} variant="sheet" />
            </motion.div>
            {/* Funde el borde inferior de la foto con el panel (móvil) / el lateral (escritorio) */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-iron-900/85 to-transparent md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-16 md:bg-gradient-to-l" />
          </motion.div>

          {/* Asa de arrastre (móvil) */}
          <div
            onPointerDown={onHandlePointerDown}
            className="absolute inset-x-0 top-0 z-20 flex h-12 touch-none items-start justify-center pt-2.5 md:hidden"
          >
            <span aria-hidden className="h-1.5 w-12 rounded-full bg-cream/45 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
            <span className="sr-only">{m.dishes.spotlight.dragHandle}</span>
          </div>
        </div>

        {/* ── Ficha ── */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            data-lenis-prevent=""
            className="relative flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 sm:rounded-b-[28px] md:rounded-l-none md:rounded-r-[28px] md:px-8 md:pb-8 md:pt-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT_EXPO }}
            >
              <DishDetails dish={dish} titleId={titleId} descId={descId} onClose={onClose} onReserve={onReserve} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── Ficha del plato ───────────────────────── */

interface DishDetailsProps {
  dish: DishSlide["dish"];
  titleId: string;
  descId: string;
  onClose: () => void;
  onReserve: () => void;
}

const LABEL = "font-caps text-[10px] uppercase tracking-[0.28em] text-cream-faint";

function DishDetails({ dish, titleId, descId, onClose, onReserve }: DishDetailsProps) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const lp = useLocalePath();
  const { open: openChat } = useChat();

  const allergenMap = useMemo(() => localizeAllergenMap(locale), [locale]);
  const allergenList = dish.allergens.map((id) => allergenMap[id].label.toLowerCase()).join(", ");

  /* Los CTAs cierran el detalle antes de abrir otro modal: así el `inert` del fondo se libera y el
     modal de reserva / el chat reciben el foco sin pelearse con este diálogo. */
  const handleReserve = useCallback(() => {
    onClose();
    onReserve();
  }, [onClose, onReserve]);
  const handleAsk = useCallback(() => {
    onClose();
    openChat({ prefill: t(m.dishes.spotlight.askWaiterPrefill, { name: dish.name }), page: "home" });
  }, [onClose, openChat, t, m.dishes.spotlight.askWaiterPrefill, dish.name]);

  return (
    <div>
      {/* Cabecera: kicker, nombre, badge, precio */}
      <p className="font-caps text-[10px] uppercase tracking-[0.3em] text-pimenton-a11y">{dish.kicker}</p>
      <h3 id={titleId} className="mt-2 pr-12 font-display text-3xl leading-[1.02] text-cream md:pr-14 md:text-4xl">
        {dish.name}
      </h3>
      {dish.badge && (
        <span className="glass-red mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-caps text-[10px] uppercase tracking-[0.18em] text-cream">
          <Sparkles size={12} aria-hidden className="text-gold" />
          {dish.badge}
        </span>
      )}
      <p className="mt-4 flex items-baseline gap-2">
        <span className="sr-only">{m.dishes.spotlight.priceLabel}</span>
        <span className="font-condensed text-[2.75rem] leading-none tracking-wide text-cream">{formatPrice(dish.price, locale)}</span>
        <span className="text-sm text-cream-muted">{t(m.dishes.spotlight.perUnit, { unit: dish.unit })}</span>
      </p>

      {/* Titular + descripción */}
      <p id={descId} className="mt-4 font-display text-xl italic leading-snug text-cream-200 md:text-2xl">
        {dish.headline}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-cream-muted">{dish.description}</p>

      <div className="divider-iron my-5" />

      {/* Ingredientes */}
      <p className={LABEL}>{m.dishes.ingredients}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={m.dishes.ingredients}>
        {dish.ingredients.map((ingredient) => (
          <li key={ingredient} className="rounded-full border border-cream/15 bg-cream/[0.04] px-3 py-1 text-xs text-cream-200">
            {ingredient}
          </li>
        ))}
      </ul>

      {/* Alérgenos: iconos (AllergenRow) + etiquetas localizadas en texto */}
      <p className={cn(LABEL, "mt-5")}>{m.dishes.allergens}</p>
      {dish.allergens.length > 0 ? (
        <>
          <div className="mt-2">
            <AllergenRow ids={dish.allergens} size="sm" />
          </div>
          <p className="mt-2 text-xs text-cream-muted">{t(m.dishes.spotlight.contains, { list: allergenList })}</p>
        </>
      ) : (
        <p className="mt-2 text-xs text-cream-muted">{m.dishes.noAllergens}</p>
      )}
      <p className="mt-1 text-[11px] leading-relaxed text-cream-faint">{m.dishes.allergensNote}</p>

      {/* Maridaje: bloque a modo de etiqueta de vino */}
      <div className="relative mt-5 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent px-4 py-3.5">
        <p className="flex items-center gap-2 font-caps text-[10px] uppercase tracking-[0.28em] text-gold">
          <Wine size={13} aria-hidden />
          {m.dishes.pairing}
          <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-gold/60 to-transparent" />
        </p>
        <p className="mt-2 font-display text-2xl leading-tight text-cream">
          {dish.pairing.wine} <em className="font-display text-base italic text-gold/90">· {dish.pairing.do}</em>
        </p>
        <p className="mt-2 font-caps text-[9px] uppercase tracking-[0.2em] text-cream-faint">{m.dishes.pairingWhy}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-cream-muted">{dish.pairing.why}</p>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <NeonButton
          href={lp(`/carta#${dish.menuId}`)}
          onClick={onClose}
          variant="outline"
          size="md"
          icon={<UtensilsCrossed aria-hidden />}
          className="w-full sm:flex-1"
        >
          {m.dishes.seeInMenu}
        </NeonButton>
        <NeonButton type="button" variant="primary" size="md" icon={<CalendarCheck aria-hidden />} onClick={handleReserve} className="w-full sm:flex-1">
          {m.common.cta.reserveShort}
        </NeonButton>
      </div>
      <button
        type="button"
        onClick={handleAsk}
        className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-cream-muted underline-offset-4 transition-colors duration-300 hover:text-cream hover:underline"
      >
        <MessageCircle size={16} aria-hidden />
        {m.dishes.spotlight.askWaiter}
      </button>
    </div>
  );
}
