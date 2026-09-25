"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Rotate3d, Sparkles, UtensilsCrossed, Wine, X } from "lucide-react";
import { useCallback, useEffect, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import type { StarDish } from "@/data/dishes";
import { formatPrice } from "@/data/menu";
import { AllergenRow } from "@/components/ui/AllergenIcon";
import DishVisual from "@/components/ui/DishVisual";
import NeonButton from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";

/**
 * DishFlipCard — tarjeta de plato estrella con volteo 3D.
 *
 *  Cara frontal: visual + nombre + precio + badge + pista "Toca para ver detalles".
 *  Cara trasera: titular, descripción, ingredientes, alérgenos, maridaje y CTAs.
 *
 *  `mode="flip"` (escritorio/tablet): click, Enter o Espacio voltean la tarjeta
 *  (rotateY 180º con preserve-3d + backface-hidden). Solo una tarjeta abierta a la vez:
 *  el estado `flipped` vive en el padre (StarDishes).
 *  `mode="spotlight"` (móvil): la tarjeta no se voltea; el toque delega en `onToggle`
 *  para abrir el zoom focal (DishSpotlight) y el visual comparte `layoutId`.
 */

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

/* ───────────────────────── Cara frontal (compartida) ───────────────────────── */

interface DishCardFrontProps {
  dish: StarDish;
  /** layoutId de framer‑motion para el elemento compartido con DishSpotlight */
  layoutId?: string;
  /** volutas de vapor en el visual */
  steam?: boolean;
  /** texto de la pista inferior */
  hint?: string;
}

export function DishCardFront({ dish, layoutId, steam = true, hint = "Toca para ver detalles" }: DishCardFrontProps) {
  const visual = <DishVisual dish={dish} steam={steam} />;
  return (
    <div className="relative flex h-full flex-col p-5">
      {dish.badge && (
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-pimenton-light/45 bg-gradient-to-br from-pimenton/45 to-pimenton-dark/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cream shadow-[0_0_20px_rgba(178,30,39,0.4)]">
          <Sparkles size={12} aria-hidden className="text-gold" />
          {dish.badge}
        </span>
      )}

      {/* visual: ocupa ~3/4 del ancho, centrado, con margen para el badge */}
      <div className="mx-auto mt-8 w-[74%] max-w-[260px]">
        {layoutId ? (
          <motion.div layoutId={layoutId} className="relative">
            {visual}
          </motion.div>
        ) : (
          visual
        )}
      </div>

      <div className="mt-auto pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-pimenton-light">{dish.kicker}</p>
        <h3 className="mt-1.5 font-display text-[1.3rem] leading-[1.15] text-cream md:text-[1.4rem]">{dish.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-condensed text-[2.6rem] leading-none tracking-wide text-cream">{formatPrice(dish.price)}</span>
          <span className="text-xs text-cream-muted">/ {dish.unit}</span>
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-cream-faint transition-colors duration-500 group-hover:text-cream-muted">
          <Rotate3d size={14} aria-hidden className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[360deg]" />
          {hint}
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── Detalles (compartidos con el bottom-sheet) ───────────────────────── */

interface DishDetailsProps {
  dish: StarDish;
  onReserve: () => void;
  /** tamaño compacto para la cara trasera de la tarjeta; "sheet" para el modal móvil */
  size?: "compact" | "sheet";
  className?: string;
}

export function DishDetails({ dish, onReserve, size = "compact", className }: DishDetailsProps) {
  const compact = size === "compact";
  const label = "text-[9.5px] font-bold uppercase tracking-[0.28em] text-cream-faint";
  return (
    <div className={cn("flex flex-col", compact ? "gap-3.5" : "gap-5", className)}>
      <div>
        <h4 className={cn("font-display leading-snug text-cream", compact ? "text-[1.05rem]" : "text-xl")}>{dish.headline}</h4>
        <p className={cn("mt-1.5 leading-relaxed text-cream-muted", compact ? "text-[12.5px]" : "text-[15px]")}>{dish.description}</p>
      </div>

      <div>
        <p className={label}>Ingredientes</p>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Ingredientes">
          {dish.ingredients.map((ing) => (
            <li
              key={ing}
              className={cn(
                "rounded-full border border-cream/15 bg-cream/[0.04] text-cream-200",
                compact ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
              )}
            >
              {ing}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className={label}>Alérgenos</p>
        <div className="mt-2">
          <AllergenRow ids={dish.allergens} size={compact ? "xs" : "sm"} />
        </div>
      </div>

      {/* Maridaje: bloque a modo de etiqueta de vino */}
      <div className="relative overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent px-3.5 py-3">
        <div className="flex items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.28em] text-gold">
          <Wine size={12} aria-hidden />
          Maridaje
          <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-gold/60 to-transparent" />
        </div>
        <p className={cn("mt-1.5 font-display text-cream", compact ? "text-[15px]" : "text-lg")}>
          {dish.pairing.wine} <em className={cn("font-display italic text-gold/90", compact ? "text-[13px]" : "text-sm")}>· {dish.pairing.do}</em>
        </p>
        <p className={cn("mt-1 leading-relaxed text-cream-muted", compact ? "text-[11.5px]" : "text-[13px]")}>{dish.pairing.why}</p>
      </div>

      <div className={cn("mt-auto flex gap-2 pt-1", compact ? "flex-col" : "flex-col sm:flex-row")}>
        <NeonButton
          href={`/carta#${dish.menuId}`}
          variant="outline"
          size={compact ? "sm" : "md"}
          icon={<UtensilsCrossed aria-hidden />}
          className={cn("w-full", !compact && "sm:flex-1")}
        >
          Ver en la carta
        </NeonButton>
        <NeonButton
          type="button"
          variant="primary"
          size={compact ? "sm" : "md"}
          icon={<CalendarCheck aria-hidden />}
          onClick={onReserve}
          className={cn("w-full", !compact && "sm:flex-1")}
        >
          Reservar
        </NeonButton>
      </div>
    </div>
  );
}

/* ───────────────────────── Tarjeta con volteo ───────────────────────── */

export interface DishFlipCardProps {
  dish: StarDish;
  /** cara trasera visible (controlado por el padre: solo una a la vez) */
  flipped: boolean;
  /** click/Enter/Espacio sobre la cara frontal, y botón "cerrar" de la trasera */
  onToggle: () => void;
  onReserve: () => void;
  /** "flip": voltea in situ · "spotlight": el toque abre un zoom focal externo */
  mode?: "flip" | "spotlight";
  /** layoutId del visual compartido con DishSpotlight (modo spotlight) */
  layoutId?: string;
  /** volutas de vapor (desactivar en tier "low") */
  steam?: boolean;
  className?: string;
}

/** Duración del volteo en ms (debe coincidir con `duration-700` de la clase) */
const FLIP_MS = 700;

export default function DishFlipCard({ dish, flipped, onToggle, onReserve, mode = "flip", layoutId, steam = true, className }: DishFlipCardProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasFlipped = useRef(flipped);
  const isFlip = mode === "flip";
  const showBack = isFlip && flipped;

  // Gestión de foco accesible: al voltear, el foco viaja al botón de cerrar de la
  // cara trasera; al cerrar, vuelve a la cara frontal.
  useEffect(() => {
    if (!isFlip) return;
    if (flipped === wasFlipped.current) return;
    wasFlipped.current = flipped;
    const t = window.setTimeout(() => {
      const target = flipped ? closeRef.current : frontRef.current;
      target?.focus({ preventScroll: true });
    }, FLIP_MS / 2);
    return () => window.clearTimeout(t);
  }, [flipped, isFlip]);

  const onFrontKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle],
  );

  // En la cara trasera, un click fuera de enlaces/botones también cierra; Escape cierra.
  const onBackClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const el = e.target as HTMLElement;
      if (el.closest("a, button")) return;
      onToggle();
    },
    [onToggle],
  );
  const onBackKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onToggle();
      }
    },
    [onToggle],
  );

  const vars: CSSVars = {
    "--accent": dish.accent,
    "--accent-40": `${dish.accent}66`,
    "--accent-glow": `${dish.accent}8c`,
  };

  // Superficie "humo": mismo degradado que `glass-smoke` pero SIN backdrop-filter — un
  // backdrop-filter dentro de un contexto preserve-3d rompe backface-visibility en
  // Chrome/Safari (la cara trasera se transparenta). El brillo de cristal lo da --shadow-glass.
  const face =
    "absolute inset-0 overflow-hidden rounded-3xl border border-cream/10 bg-[linear-gradient(160deg,rgba(26,26,26,0.97),rgba(15,15,15,0.94))] shadow-[var(--shadow-glass)] backface-hidden transition-[border-color,box-shadow] duration-500";
  const faceHover =
    "group-hover:[border-color:var(--accent-40)] group-hover:[box-shadow:0_0_0_1px_var(--accent-40),0_0_70px_-18px_var(--accent-glow),var(--shadow-glass)]";

  return (
    <div className={cn("group relative aspect-[3/4] w-full rounded-3xl perspective-1200", className)} style={vars}>
      <div
        className={cn(
          "relative h-full w-full rounded-3xl preserve-3d transition-transform duration-700 ease-[var(--ease-in-out-quart)]",
          showBack && "[transform:rotateY(180deg)]",
        )}
      >
        {/* ── Cara frontal ── */}
        <div
          ref={frontRef}
          role="button"
          tabIndex={showBack ? -1 : 0}
          aria-label={`${dish.name}: ver detalles, ingredientes y maridaje`}
          aria-expanded={isFlip ? flipped : undefined}
          aria-haspopup={isFlip ? undefined : "dialog"}
          inert={showBack}
          onClick={onToggle}
          onKeyDown={onFrontKey}
          className={cn(face, faceHover, "cursor-pointer [transform:rotateY(0deg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light")}
        >
          <DishCardFront dish={dish} layoutId={layoutId} steam={steam} hint={isFlip ? "Toca para ver detalles" : "Toca para ver el plato"} />
        </div>

        {/* ── Cara trasera (solo en modo flip) ── */}
        {isFlip && (
          <div
            aria-hidden={!flipped}
            inert={!flipped}
            onClick={onBackClick}
            onKeyDown={onBackKey}
            className={cn(face, "[transform:rotateY(180deg)]", flipped && "[border-color:var(--accent-40)] [box-shadow:0_0_0_1px_var(--accent-40),0_0_70px_-18px_var(--accent-glow),var(--shadow-glass)]")}
          >
            {/* brillo de acento en la esquina superior */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-60 blur-3xl"
              style={{ background: `radial-gradient(circle, ${dish.accent}66, transparent 70%)` }}
            />
            <div className="no-scrollbar relative flex h-full flex-col overflow-y-auto p-5 pb-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-pimenton-light">{dish.kicker}</p>
                  <p className="mt-0.5 truncate font-display text-sm text-cream-muted">{dish.name}</p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onToggle}
                  aria-label="Cerrar detalles"
                  className="-mr-1 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/15 bg-cream/5 text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>
              <DishDetails dish={dish} onReserve={onReserve} size="compact" className="flex-1" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
