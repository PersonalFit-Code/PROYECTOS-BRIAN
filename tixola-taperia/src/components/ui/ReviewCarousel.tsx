"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { animate, motion, MotionConfig, useInView, useMotionValue, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { Review } from "@/data/reviews";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { cn, clamp } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Constantes
   ────────────────────────────────────────────────────────────── */

/** Separación entre tarjetas (px). Se usa tanto en CSS (columnGap) como en el cálculo del desplazamiento. */
const GAP = 20;
/** Intervalo del auto-avance (ms). */
const AUTOPLAY_MS = 6000;
const SPRING = { type: "spring", stiffness: 240, damping: 34, mass: 0.9 } as const;

const MONTHS_ES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."];

/** "2026-07" → "jul. 2026" · "2026" → "2026" */
export function formatReviewDate(date: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(date);
  if (!m) return date;
  const month = MONTHS_ES[Number(m[2]) - 1] ?? "";
  return `${month} ${m[1]}`.trim();
}

/* ──────────────────────────────────────────────────────────────
   Piezas reutilizables (también las usan SocialProof y Footer)
   ────────────────────────────────────────────────────────────── */

export type ReviewSource = Review["source"];

/** Glifo de plataforma (G de Google / búho de TripAdvisor) como SVG inline. */
export function PlatformGlyph({ source, className }: { source: ReviewSource; className?: string }) {
  if (source === "Google") {
    return (
      <svg viewBox="0 0 24 24" className={cn("h-4 w-4 shrink-0", className)} aria-hidden>
        <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" fill="#4285F4" />
        <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.8 19.8 8.1 22 12 22z" fill="#34A853" />
        <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.6L6.4 14z" fill="#FBBC05" />
        <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" fill="#EA4335" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4 shrink-0", className)} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#34E0A1" />
      <path d="M4.2 10c2.2-2 4.9-2.7 7.8-2.7s5.6.7 7.8 2.7" fill="none" stroke="#0b1f18" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 7.6 13.5 9.9h-3z" fill="#0b1f18" />
      <circle cx="8.2" cy="13.4" r="3.1" fill="none" stroke="#0b1f18" strokeWidth="1.5" />
      <circle cx="15.8" cy="13.4" r="3.1" fill="none" stroke="#0b1f18" strokeWidth="1.5" />
      <circle cx="8.2" cy="13.4" r="1.25" fill="#0b1f18" />
      <circle cx="15.8" cy="13.4" r="1.25" fill="#0b1f18" />
    </svg>
  );
}

/** Fila de 5 estrellas doradas con relleno parcial (4,4 → cuatro y media larga). */
export function Stars({ rating, size = "md", className }: { rating: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const pct = `${clamp((rating / 5) * 100, 0, 100)}%`;
  const dim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4.5 w-4.5";
  const row = (fill: boolean) => (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(dim, fill ? "fill-gold text-gold drop-shadow-[0_0_6px_rgba(232,194,122,0.5)]" : "fill-transparent text-cream/25")}
          strokeWidth={1.6}
          aria-hidden
        />
      ))}
    </span>
  );
  return (
    <span
      className={cn("relative inline-flex", className)}
      role="img"
      aria-label={`${rating.toLocaleString("es-ES", { maximumFractionDigits: 1 })} de 5 estrellas`}
    >
      {row(false)}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: pct }} aria-hidden>
        {row(true)}
      </span>
    </span>
  );
}

/** Envuelve la primera aparición de `highlight` dentro de `text` con un <mark> rojo. */
function HighlightedText({ text, highlight }: { text: string; highlight?: string }): ReactNode {
  if (!highlight) return text;
  const idx = text.toLocaleLowerCase("es").indexOf(highlight.toLocaleLowerCase("es"));
  if (idx < 0) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);
  return (
    <>
      {before}
      <mark className="rounded-sm bg-pimenton/35 px-1 py-0.5 font-semibold text-cream shadow-[inset_0_-2px_0_rgba(216,50,60,0.9)]">
        {match}
      </mark>
      {after}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   Tarjeta de opinión ("cristal ahumado")
   ────────────────────────────────────────────────────────────── */

interface ReviewCardProps {
  review: Review;
  index: number;
  total: number;
  active: boolean;
  /** Posición relativa a la activa: -1 izquierda, 0 activa, 1 derecha. */
  side: -1 | 0 | 1;
  tilt: boolean;
  onFocus: () => void;
}

function ReviewCard({ review, index, total, active, side, tilt, onFocus }: ReviewCardProps) {
  return (
    <motion.article
      role="group"
      aria-roledescription="opinión"
      aria-label={`Opinión ${index + 1} de ${total}`}
      aria-current={active ? "true" : undefined}
      tabIndex={active ? 0 : -1}
      onFocus={onFocus}
      className={cn(
        "glass-smoke relative flex h-full w-[min(82vw,340px)] shrink-0 flex-col overflow-hidden rounded-3xl p-6 md:w-[440px] md:p-8 lg:w-[480px]",
        "select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light/80",
      )}
      style={{ transformPerspective: 1200 }}
      animate={{
        scale: active ? 1 : 0.9,
        opacity: active ? 1 : 0.45,
        rotateY: tilt ? side * 9 : 0,
        y: active ? 0 : 14,
      }}
      transition={SPRING}
    >
      {/* Brillo superior + comillas decorativas */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cream/30 to-transparent" />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-2 -top-3 transition-opacity duration-700",
          active ? "opacity-100" : "opacity-40",
        )}
      >
        <Quote className="h-24 w-24 rotate-180 fill-pimenton/15 text-pimenton/25" strokeWidth={0.8} />
      </span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-pimenton/25 blur-3xl transition-opacity duration-700",
          active ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="relative flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        <span className="font-condensed text-lg tracking-widest text-cream-faint">
          {review.rating}
          <span className="text-cream/30">/5</span>
        </span>
      </div>

      {review.title && (
        <h3 className="relative mt-4 font-display text-xl leading-snug text-cream md:text-2xl text-balance">{review.title}</h3>
      )}

      <blockquote className="relative mt-3 text-[15px] leading-relaxed text-cream-muted md:text-base text-pretty">
        <p>
          «<HighlightedText text={review.text} highlight={review.highlight} />»
        </p>
      </blockquote>

      <footer className="relative mt-auto flex items-end justify-between gap-4 border-t border-cream/10 pt-5">
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold text-cream">{review.author}</p>
          <p className="truncate text-xs text-cream-faint">{review.location ? `${review.location} · ` : ""}Cliente verificado</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/10 bg-iron/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-cream-200">
            <PlatformGlyph source={review.source} className="h-3.5 w-3.5" />
            {review.source}
          </span>
          <time dateTime={review.date} className="text-[11px] text-cream-faint">
            {formatReviewDate(review.date)}
          </time>
        </div>
      </footer>
    </motion.article>
  );
}

/* ──────────────────────────────────────────────────────────────
   Carrusel
   ────────────────────────────────────────────────────────────── */

interface ReviewCarouselProps {
  reviews: Review[];
  className?: string;
}

interface Metrics {
  container: number;
  slide: number;
}

/**
 * Carrusel de opiniones con tarjetas de cristal ahumado.
 *  - Móvil: arrastre horizontal (framer-motion drag) con imán a la tarjeta más cercana y
 *    proyección de la velocidad (un "flick" salta varias tarjetas).
 *  - Escritorio: flechas laterales + puntos, también arrastrable.
 *  - Auto-avance cada 6 s, pausado con hover, foco dentro, arrastre o fuera del viewport.
 *  - La tarjeta activa está centrada y a escala 1; las vecinas se inclinan (rotateY) y atenúan.
 *  - Teclado: ← → dentro de la región. Con `prefers-reduced-motion` (MotionConfig) no hay transforms.
 */
export default function ReviewCarousel({ reviews, className }: ReviewCarouselProps) {
  const total = reviews.length;
  const { tier, reducedMotion } = usePerformanceTier();
  const tilt = tier !== "low" && !reducedMotion;

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstSlideRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  const [active, setActive] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({ container: 0, slide: 0 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inView = useInView(rootRef, { amount: 0.35 });

  const x = useMotionValue(0);

  /** Desplazamiento del carril que centra la tarjeta `i` en el viewport. */
  const targetFor = useCallback(
    (i: number) => (metrics.container - metrics.slide) / 2 - i * (metrics.slide + GAP),
    [metrics],
  );

  const goTo = useCallback((i: number) => setActive(clamp(i, 0, total - 1)), [total]);
  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive((a) => (a - 1 + total) % total), [total]);

  /* Ref espejo de `active` para efectos que no deben re-ejecutarse al cambiar de tarjeta. */
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  /* Medición del viewport y de la primera tarjeta (ResizeObserver dispara al observar y en cada cambio). */
  useEffect(() => {
    const viewport = viewportRef.current;
    const slide = firstSlideRef.current;
    if (!viewport || !slide) return;
    const ro = new ResizeObserver(() => {
      setMetrics((prevMetrics) => {
        const nextMetrics = { container: viewport.clientWidth, slide: slide.offsetWidth };
        return prevMetrics.container === nextMetrics.container && prevMetrics.slide === nextMetrics.slide ? prevMetrics : nextMetrics;
      });
    });
    ro.observe(viewport);
    ro.observe(slide);
    return () => ro.disconnect();
  }, []);

  /* Al medir / redimensionar recolocamos sin animación. */
  useEffect(() => {
    x.jump(targetFor(activeRef.current));
  }, [metrics, targetFor, x]);

  /* Al cambiar la activa deslizamos con muelle. */
  useEffect(() => {
    const controls = animate(x, targetFor(active), SPRING);
    return () => controls.stop();
  }, [active, targetFor, x]);

  /* Auto-avance. */
  const paused = hovered || focused || dragging || !inView || reducedMotion || total < 2;
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, next]);

  /* Fin del arrastre: proyectamos la posición con la velocidad y elegimos la tarjeta más cercana. */
  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      setDragging(false);
      const step = metrics.slide + GAP;
      if (step <= 0) return;
      const projected = x.get() + info.velocity.x * 0.2;
      const center = (metrics.container - metrics.slide) / 2;
      const nearest = clamp(Math.round((center - projected) / step), 0, total - 1);
      if (nearest === active) {
        animate(x, targetFor(active), SPRING);
      } else {
        setActive(nearest);
      }
    },
    [metrics, x, total, active, targetFor],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      }
    },
    [next, prev, goTo, total],
  );

  const dragConstraints = useMemo(() => ({ left: targetFor(total - 1), right: targetFor(0) }), [targetFor, total]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Opiniones de clientes"
        className={cn("relative", className)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
        onKeyDown={onKeyDown}
      >
        {/* Viewport con máscara lateral */}
        <div
          ref={viewportRef}
          className="overflow-hidden py-6 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)] md:py-8"
        >
          <motion.div
            className={cn("flex items-stretch touch-pan-y", dragging ? "cursor-grabbing" : "cursor-grab")}
            style={{ x, columnGap: GAP }}
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.12}
            dragMomentum={false}
            onDragStart={() => setDragging(true)}
            onDragEnd={onDragEnd}
          >
            {reviews.map((review, i) => {
              const side: -1 | 0 | 1 = i < active ? -1 : i > active ? 1 : 0;
              return (
                <div key={review.id} ref={i === 0 ? firstSlideRef : undefined} className="flex shrink-0">
                  <ReviewCard
                    review={review}
                    index={i}
                    total={total}
                    active={i === active}
                    side={side}
                    tilt={tilt}
                    onFocus={() => goTo(i)}
                  />
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Flechas (escritorio) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between md:flex">
          <button
            type="button"
            onClick={prev}
            aria-label="Opinión anterior"
            className="glass pointer-events-auto grid h-12 w-12 place-items-center rounded-full text-cream transition-all duration-300 hover:-translate-x-0.5 hover:border-pimenton-light/60 hover:text-pimenton-light hover:shadow-neon"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Opinión siguiente"
            className="glass pointer-events-auto grid h-12 w-12 place-items-center rounded-full text-cream transition-all duration-300 hover:translate-x-0.5 hover:border-pimenton-light/60 hover:text-pimenton-light hover:shadow-neon"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Puntos + contador */}
        <div className="mt-2 flex items-center justify-center gap-4 md:mt-4">
          <div className="flex items-center gap-2" aria-label="Seleccionar opinión">
            {reviews.map((review, i) => {
              const isActive = i === active;
              return (
                <button
                  key={review.id}
                  type="button"
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`Ir a la opinión ${i + 1}`}
                  onClick={() => goTo(i)}
                  className="group grid h-11 w-6 place-items-center"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]",
                      isActive ? "w-6 bg-pimenton-light shadow-neon" : "w-1.5 bg-cream/25 group-hover:bg-cream/60",
                    )}
                  />
                </button>
              );
            })}
          </div>
          <span className="font-condensed text-base tracking-widest text-cream-faint" aria-live="polite" aria-atomic>
            {String(active + 1).padStart(2, "0")}
            <span className="text-cream/30"> / {String(total).padStart(2, "0")}</span>
          </span>
        </div>
      </div>
    </MotionConfig>
  );
}
