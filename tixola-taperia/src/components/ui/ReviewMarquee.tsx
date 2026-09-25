"use client";

import { useInView } from "framer-motion";
import { useMemo, useRef, useSyncExternalStore } from "react";
import Marquee from "@/components/ui/Marquee";
import ReviewCard from "@/components/ui/ReviewCard";
import { REVIEWS, type Review } from "@/data/reviews";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Selección de reseñas
   ────────────────────────────────────────────────────────────── */

/** Mínimo de tarjetas para que tres columnas se vean pobladas. */
const MIN_REVIEWS = 9;
/** Tope: con 3 copias por columna, más tarjetas solo añaden DOM sin aportar variedad visible. */
const MAX_REVIEWS = 12;

/**
 * Reseñas de 5★ (en el orden del fichero, las más recientes primero); si no llegan a `min`,
 * se completan con 4★. Nunca más de `max`.
 */
export function selectReviews(all: readonly Review[], min = MIN_REVIEWS, max = MAX_REVIEWS): Review[] {
  const five = all.filter((r) => r.rating === 5);
  const picked = five.length >= min ? five : [...five, ...all.filter((r) => r.rating === 4).slice(0, min - five.length)];
  return picked.slice(0, max);
}

/** Reparto en columnas por turnos (1→A, 2→B, 3→C, 4→A…): mezcla longitudes y fechas en cada columna. */
function splitColumns<T>(items: readonly T[], columns: number): T[][] {
  const out: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => out[i % columns].push(item));
  return out;
}

/* ──────────────────────────────────────────────────────────────
   Disposición según ancho (1 fila horizontal · 2 · 3 columnas)
   ────────────────────────────────────────────────────────────── */

type Columns = 1 | 2 | 3;
const MQ_MD = "(min-width: 768px)";
const MQ_LG = "(min-width: 1024px)";

function subscribeLayout(onChange: () => void) {
  const queries = [window.matchMedia(MQ_MD), window.matchMedia(MQ_LG)];
  queries.forEach((mq) => mq.addEventListener("change", onChange));
  return () => queries.forEach((mq) => mq.removeEventListener("change", onChange));
}
function getColumns(): Columns {
  if (window.matchMedia(MQ_LG).matches) return 3;
  if (window.matchMedia(MQ_MD).matches) return 2;
  return 1;
}
/** Mobile-first: el servidor pinta la fila horizontal; el cliente corrige tras hidratar. */
const getServerColumns = (): Columns => 1;

/** Velocidades distintas por columna para que el conjunto respire (la central va en sentido inverso). */
const COLUMN_DURATION = ["[--duration:62s]", "[--duration:78s]", "[--duration:70s]"] as const;

/* ──────────────────────────────────────────────────────────────
   Componente
   ────────────────────────────────────────────────────────────── */

export interface ReviewMarqueeProps {
  className?: string;
}

/**
 * ReviewMarquee — columnas de reseñas reales en marquee vertical (referencia marquee-03 de 21st.dev).
 *  · lg: 3 columnas de 600 px (la central en sentido inverso) · md: 2 columnas · móvil: UNA fila
 *    horizontal con tarjetas de 300 px. Degradados de fundido arriba/abajo (o a los lados).
 *  · Se pausa al pasar el ratón / enfocar y cuando la sección sale del viewport (CPU en reposo).
 *  · `prefers-reduced-motion`: rejilla estática con las seis primeras reseñas.
 *  · Cristal ahumado solo en tier "high"; en gama media/móvil las tarjetas usan fondo hierro opaco
 *    (docenas de backdrop-filter en movimiento son lo más caro que puede pintar un móvil).
 */
export default function ReviewMarquee({ className }: ReviewMarqueeProps) {
  const m = useMessages();
  const t = useFormat();
  const { tier, reducedMotion } = usePerformanceTier();
  const columns = useSyncExternalStore(subscribeLayout, getColumns, getServerColumns);

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.1 });

  const reviews = useMemo(() => selectReviews(REVIEWS), []);
  const glass = tier === "high";
  const summary = t(m.social.marquee.summary, { count: reviews.length });

  return (
    <div ref={rootRef} role="region" aria-label={m.social.marquee.label} className={cn("relative", className)}>
      <p className="sr-only">{summary}</p>

      {reducedMotion ? (
        /* Lista estática: sin movimiento, sin copias, sin recortes */
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => (
            <li key={review.id} className="flex">
              <ReviewCard review={review} glass={glass} className="w-full" />
            </li>
          ))}
        </ul>
      ) : columns === 1 ? (
        /* Móvil: una fila horizontal continua */
        <Marquee pauseOnHover paused={!inView} repeat={2} className="[--duration:70s] [--gap:1rem] py-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} glass={glass} maxLines={6} className="w-[300px]" />
          ))}
        </Marquee>
      ) : (
        /* Tablet / escritorio: columnas verticales, la central invertida */
        <div className={cn("grid h-[600px] gap-4", columns === 3 ? "grid-cols-3" : "grid-cols-2")}>
          {splitColumns(reviews, columns).map((column, i) => (
            <Marquee
              key={i}
              vertical
              reverse={i === 1}
              pauseOnHover
              paused={!inView}
              repeat={3}
              className={cn("h-full", COLUMN_DURATION[i] ?? COLUMN_DURATION[0], "[--gap:1rem]")}
              trackClassName="w-full"
            >
              {column.map((review) => (
                <ReviewCard key={review.id} review={review} glass={glass} className="w-full" />
              ))}
            </Marquee>
          ))}
        </div>
      )}
    </div>
  );
}
