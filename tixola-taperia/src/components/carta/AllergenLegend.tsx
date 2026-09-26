"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import AllergenIcon from "@/components/ui/AllergenIcon";
import { useInertBackground } from "@/hooks/useInertBackground";
import { localizeAllergens } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * AllergenLegend — leyenda de los 14 alérgenos de declaración obligatoria (Reglamento (UE) 1169/2011).
 *
 * Por decisión del cliente los alérgenos quedan en segundo plano: la leyenda NO ocupa la parte alta
 * de la página, se abre bajo demanda como modal centrado (lg) / bottom-sheet (móvil) desde el panel
 * de filtros o desde el pie de los resultados.
 *
 *  - `AllergenLegendGrid`: rejilla de 14 tarjetas (icono + etiqueta + código + descripción) y nota legal.
 *  - `AllergenLegendSheet` (default): la leyenda en un diálogo accesible por portal (foco inicial,
 *    Escape, fondo `inert`, bloqueo de scroll y devolución del foco).
 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* ───────────────────────── Rejilla ───────────────────────── */

export function AllergenLegendGrid({ className, dense = false }: { className?: string; dense?: boolean }) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const allergens = useMemo(() => localizeAllergens(locale), [locale]);

  return (
    <div className={className}>
      <ul className={cn("grid gap-2", dense ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")} aria-label={m.carta.legend}>
        {allergens.map((a) => (
          <li
            key={a.id}
            title={`${a.code} · ${a.label}: ${a.description}`}
            className="flex items-start gap-3 rounded-2xl border border-cream/10 bg-iron/40 p-3 transition-colors hover:border-cream/25"
          >
            <AllergenIcon id={a.id} size="md" decorative />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-cream">
                <span>{a.label}</span>
                <span className="rounded-md border border-cream/15 px-1.5 py-0.5 font-condensed text-[11px] tracking-[0.15em] text-cream-muted" aria-label={t(m.carta.legendCode, { code: a.code })}>
                  {a.code}
                </span>
              </p>
              <p className="mt-0.5 text-xs leading-snug text-cream-faint">{a.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-cream-faint">
        <Info size={14} aria-hidden className="mt-0.5 shrink-0 text-pimenton-light" />
        <span>{m.carta.legendNote}</span>
      </p>
    </div>
  );
}

/* ───────────────────────── Modal / bottom-sheet ───────────────────────── */

const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

export interface AllergenLegendSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function AllergenLegendSheet({ open, onClose }: AllergenLegendSheetProps) {
  const isClient = useIsClient();
  if (!isClient) return null;

  return createPortal(
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{open && <SheetInner onClose={onClose} />}</AnimatePresence>
    </MotionConfig>,
    document.body,
  );
}

function SheetInner({ onClose }: { onClose: () => void }) {
  const m = useMessages();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  /* El sheet se porta a document.body: el resto de la página queda inert mientras esté montado. */
  useInertBackground(true, [rootRef]);

  /* Bloqueo de scroll + Escape + foco inicial / devolución del foco */
  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Fondo */}
      <button type="button" aria-label={m.carta.legendClose} onClick={onClose} className="absolute inset-0 bg-iron-900/70 backdrop-blur-sm" />

      {/* Hoja */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 48, opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="glass-smoke relative flex max-h-[88dvh] w-full flex-col rounded-t-3xl lg:max-h-[85dvh] lg:max-w-4xl lg:rounded-3xl"
      >
        {/* Asa (móvil) */}
        <span aria-hidden className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-cream/25 lg:hidden" />

        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 md:px-7 md:pt-6">
          <div>
            <p className="font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">{m.carta.legendKicker}</p>
            <h2 id={titleId} className="mt-1 font-condensed text-3xl uppercase leading-none tracking-wide text-cream md:text-4xl">
              {m.carta.legend}
            </h2>
            <p className="mt-1 text-xs text-cream-faint">{m.carta.legendSub}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={m.carta.legendClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/15 text-cream-muted transition-colors hover:border-cream/40 hover:text-cream"
          >
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:px-7 md:pb-7">
          <AllergenLegendGrid dense />
        </div>
      </motion.div>
    </motion.div>
  );
}
