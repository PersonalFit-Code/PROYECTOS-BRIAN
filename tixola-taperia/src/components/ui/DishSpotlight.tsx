"use client";

import { AnimatePresence, MotionConfig, motion, useDragControls, useReducedMotion, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useSyncExternalStore, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import type { StarDish } from "@/data/dishes";
import { formatPrice } from "@/data/menu";
import { useInertBackground } from "@/hooks/useInertBackground";
import { DishDetails } from "@/components/ui/DishFlipCard";
import DishVisual from "@/components/ui/DishVisual";

/**
 * DishSpotlight — "zoom focal" para móvil / pantallas pequeñas.
 *
 * Al tocar una tarjeta se abre un bottom‑sheet con los mismos detalles que la cara
 * trasera de la tarjeta de escritorio. El visual del plato viaja desde la tarjeta hasta
 * el sheet como elemento compartido (`layoutId`), y el sheet se puede cerrar arrastrando
 * hacia abajo, con Escape, con el botón de cerrar o tocando el fondo.
 *
 * Se monta en `document.body` mediante portal para escapar de cualquier ancestro con
 * `transform` / `perspective` (que romperían el `position: fixed`).
 */

export const dishSpotlightLayoutId = (dishId: string) => `dish-spotlight-visual-${dishId}`;

export interface DishSpotlightProps {
  /** plato a mostrar; `null` cierra el sheet */
  dish: StarDish | null;
  onClose: () => void;
  onReserve: () => void;
  /** volutas de vapor (desactivar en tier "low") */
  steam?: boolean;
}

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** `true` solo tras la hidratación (el portal necesita `document.body`); `false` en el servidor. */
const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

export default function DishSpotlight({ dish, onClose, onReserve, steam = true }: DishSpotlightProps) {
  const isClient = useIsClient();
  if (!isClient) return null;

  return createPortal(
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {dish && <Sheet key={dish.id} dish={dish} onClose={onClose} onReserve={onReserve} steam={steam} />}
      </AnimatePresence>
    </MotionConfig>,
    document.body,
  );
}

/* ───────────────────────── Sheet ───────────────────────── */

interface SheetProps {
  dish: StarDish;
  onClose: () => void;
  onReserve: () => void;
  steam: boolean;
}

function Sheet({ dish, onClose, onReserve, steam }: SheetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const dragControls = useDragControls();
  const titleId = `dish-spotlight-title-${dish.id}`;

  /* El sheet se porta a document.body: el resto de la página queda inert mientras esté montado. */
  useInertBackground(true, [rootRef]);

  // Bloqueo de scroll del documento + Escape + foco inicial
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 80);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [onClose]);

  // Arrastrar hacia abajo para cerrar. El gesto solo arranca desde la cabecera (asa):
  // si el sheet entero fuese arrastrable, framer fijaría `touch-action` y bloquearía el
  // scroll nativo del contenido.
  const onHandlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("button")) return;
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
    <div ref={rootRef} className="fixed inset-0 z-[90] flex items-end justify-center" role="presentation">
      {/* Fondo */}
      <motion.button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={vars}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
        drag={reducedMotion ? false : "y"}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
        className="glass-smoke relative flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.9)]"
      >
        {/* glow de acento tras el visual */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-70 blur-3xl"
          style={{ background: `radial-gradient(circle, ${dish.accent}66, transparent 70%)` }}
        />

        {/* Asa de arrastre + cerrar */}
        <div className="relative flex touch-none items-center justify-between px-4 pb-1 pt-3" onPointerDown={onHandlePointerDown}>
          <span aria-hidden className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-cream/25" />
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-pimenton-light">{dish.kicker}</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalles del plato"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 bg-cream/5 text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="no-scrollbar relative flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-1">
          <div className="group mx-auto w-[58%] max-w-[240px]">
            <motion.div layoutId={dishSpotlightLayoutId(dish.id)} transition={{ duration: 0.55, ease: EASE_OUT_EXPO }} className="relative">
              <DishVisual dish={dish} steam={steam} size="sheet" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT_EXPO }}
          >
            <div className="mt-2 flex items-end justify-between gap-4">
              <div className="min-w-0">
                {dish.badge && (
                  <span className="glass-red mb-2 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cream">
                    {dish.badge}
                  </span>
                )}
                <h3 id={titleId} className="font-display text-2xl leading-tight text-cream">
                  {dish.name}
                </h3>
              </div>
              <div className="shrink-0 text-right">
                <span className="block font-condensed text-[2.75rem] leading-none tracking-wide text-cream">{formatPrice(dish.price)}</span>
                <span className="text-xs text-cream-muted">/ {dish.unit}</span>
              </div>
            </div>

            <div className="divider-iron my-5" />

            <DishDetails dish={dish} onReserve={onReserve} size="sheet" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
