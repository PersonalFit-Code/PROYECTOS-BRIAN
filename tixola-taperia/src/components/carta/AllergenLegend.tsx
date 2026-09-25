"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { BookOpen, ChevronDown, Info, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import AllergenIcon from "@/components/ui/AllergenIcon";
import { ALLERGENS } from "@/data/allergens";
import { useInertBackground } from "@/hooks/useInertBackground";
import { cn } from "@/lib/utils";

/**
 * AllergenLegend — leyenda de los 14 alérgenos de declaración obligatoria (Reglamento (UE) 1169/2011).
 *
 *  - `AllergenLegendGrid`: rejilla de 14 tarjetas (icono + etiqueta + código + descripción) y nota legal.
 *  - `AllergenLegendPanel` (default): panel de cristal plegable, para el inicio y el final de la página.
 *  - `AllergenLegendFab`: botón flotante "Leyenda" (abajo a la derecha; en móvil, sobre la barra fija).
 *  - `AllergenLegendSheet`: la misma leyenda como modal centrado (lg) / bottom‑sheet (móvil), por portal.
 */

export const LEGAL_NOTE =
  "Información sobre alérgenos según el Reglamento (UE) 1169/2011. Consulta al personal ante cualquier duda; nuestra cocina manipula todos los alérgenos.";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* ───────────────────────── Rejilla ───────────────────────── */

export function AllergenLegendGrid({ className, dense = false }: { className?: string; dense?: boolean }) {
  return (
    <div className={className}>
      <ul
        className={cn("grid gap-2", dense ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}
        aria-label="Leyenda de alérgenos"
      >
        {ALLERGENS.map((a) => (
          <li
            key={a.id}
            title={`${a.code} · ${a.label}: ${a.description}`}
            className="carta-legend-item flex items-start gap-3 rounded-2xl border border-cream/10 bg-iron/40 p-3 transition-colors hover:border-cream/25"
          >
            <AllergenIcon id={a.id} size="md" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-cream">
                <span>{a.label}</span>
                <span
                  className="rounded-md border border-cream/15 px-1.5 py-0.5 font-condensed text-[11px] tracking-[0.15em] text-cream-muted"
                  aria-label={`Código ${a.code}`}
                >
                  {a.code}
                </span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-cream-faint">{a.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-cream-faint">
        <Info size={14} aria-hidden className="mt-0.5 shrink-0 text-pimenton-light" />
        <span>{LEGAL_NOTE}</span>
      </p>
    </div>
  );
}

/* ───────────────────────── Panel plegable ───────────────────────── */

export interface AllergenLegendPanelProps {
  defaultOpen?: boolean;
  title?: string;
  className?: string;
}

export default function AllergenLegendPanel({ defaultOpen = false, title = "Leyenda de alérgenos", className }: AllergenLegendPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section aria-label={title} className={cn("carta-legend glass rounded-3xl", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        className="carta-no-print flex w-full items-center justify-between gap-4 rounded-3xl p-4 text-left transition-colors hover:bg-cream/5 md:px-6"
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pimenton-light/40 bg-pimenton/20 text-pimenton-light">
            <BookOpen size={18} aria-hidden />
          </span>
          <span>
            <span className="block font-condensed text-2xl uppercase leading-none tracking-wide text-cream">{title}</span>
            <span className="mt-1 block text-xs text-cream-faint">Los 14 alérgenos de la UE, plato a plato</span>
          </span>
        </span>
        <ChevronDown size={20} aria-hidden className={cn("shrink-0 text-cream-muted transition-transform duration-500 ease-[var(--ease-out-expo)]", open && "rotate-180")} />
      </button>

      {/* Plegado con grid-template-rows (CSS puro). Se fuerza abierto al imprimir. */}
      <div
        id={contentId}
        aria-hidden={!open || undefined}
        inert={!open || undefined}
        className={cn(
          "carta-legend-body grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <AllergenLegendGrid className="px-4 pb-5 md:px-6 md:pb-6" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Botón flotante ───────────────────────── */

export function AllergenLegendFab({ onClick, open }: { onClick: () => void; open: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label="Abrir leyenda de alérgenos"
      className={cn(
        "carta-no-print group fixed right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-pimenton-light/60 bg-iron/85 pl-4 pr-5 text-sm font-semibold text-cream backdrop-blur-xl transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-pimenton hover:shadow-neon lg:right-8",
        "bottom-[calc(var(--mobile-bar-h)+16px+env(safe-area-inset-bottom))] md:bottom-6 lg:bottom-8",
        open && "pointer-events-none opacity-0",
      )}
    >
      <BookOpen size={18} aria-hidden className="text-pimenton-light transition-colors group-hover:text-cream" />
      Leyenda
    </button>
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

export function AllergenLegendSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
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
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  /* El sheet se porta a document.body: el resto de la página queda inert mientras esté montado. */
  useInertBackground(true, [rootRef]);

  /* Bloqueo de scroll + Escape + foco inicial / devolución del foco */
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
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
      previouslyFocused?.focus?.();
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
      <button type="button" aria-label="Cerrar leyenda" onClick={onClose} className="absolute inset-0 bg-iron-900/70 backdrop-blur-sm" />

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
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-pimenton-a11y">Alérgenos</p>
            <h2 id={titleId} className="mt-1 font-condensed text-3xl uppercase leading-none tracking-wide text-cream md:text-4xl">
              Leyenda de alérgenos
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar leyenda"
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
