"use client";

import { useRef, type CSSProperties } from "react";
import { ExternalLink, Star } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { REVIEWS_SHOWN, type Review } from "@/data/reviews";
import { BUSINESS } from "@/data/business";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ReviewCard({ r }: { r: Review }) {
  const m = useMessages();
  const t = useFormat();
  return (
    <figure className="glass mb-4 rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5 text-carmin" role="img" aria-label={t(m.resenas.stars, { n: r.rating })}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} aria-hidden className="size-3.5" fill={i < r.rating ? "currentColor" : "none"} strokeWidth={1.5} />
          ))}
        </div>
        <span className="rounded-full bg-rosa px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-tinta ring-1 ring-carmin/10">
          <span className="sr-only">{t(m.resenas.platform, { platform: r.platform })}</span>
          <span aria-hidden>{r.platform}</span> · {r.when}
        </span>
      </div>
      <blockquote className="mt-3 text-[14px] leading-relaxed text-tinta/90">«{r.text}»</blockquote>
      <figcaption className="mt-4 flex items-center gap-2.5 text-[13px] text-gris">
        <span aria-hidden className="inline-flex size-7 items-center justify-center rounded-full bg-rosa font-display text-sm font-semibold text-carmin ring-1 ring-carmin/15">
          {r.author.replace(/[^\p{L}]/gu, "").charAt(0).toUpperCase() || "·"}
        </span>
        {r.author}
      </figcaption>
    </figure>
  );
}

/** Una columna que fluye en bucle: la lista va dos veces y la segunda copia es `aria-hidden`. */
function CascadeColumn({ reviews, reverse, duration, className }: { reviews: readonly Review[]; reverse?: boolean; duration: number; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className={cn("motion-reduce:animate-none group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]", reverse ? "animate-marquee-rev" : "animate-marquee")} style={{ animationDuration: `${duration}s` } as CSSProperties}>
        {[...reviews, ...reviews].map((r, i) => (
          <div key={`${r.id}-${i}`} aria-hidden={i >= reviews.length ? true : undefined}>
            <ReviewCard r={r} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reseñas en cascada (de Dos Puertas): tres columnas que suben a distinta velocidad, se paran al
 * pasar el ratón y, con movimiento reducido, se quedan quietas y se desplazan a mano. Solo las
 * `shown`; el enlace lleva a Google, donde están todas. La nota media solo sale cuando esté
 * confirmada (`BUSINESS.ratings.google.value`); nunca va al JSON-LD.
 */
export default function SocialProof({ titleAs = "h2" }: { titleAs?: "h1" | "h2" }) {
  const m = useMessages();
  const t = useFormat();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const r = m.resenas;
  const cols = [0, 1, 2].map((c) => REVIEWS_SHOWN.filter((_, i) => i % 3 === c));
  const google = BUSINESS.ratings.google;

  return (
    <section ref={ref} id="resenas" aria-labelledby="resenas-title" className="scroll-mt-24">
      <div aria-hidden className="filete container-page" />
      <div className="container-page py-20 sm:py-28">
        <SectionHeading as={titleAs} id="resenas-title" kicker={r.kicker} title={r.title} accent={r.accent} description={t(r.description, { count: REVIEWS_SHOWN.length })} />

        <div
          data-reveal="fade"
          className="group relative mt-10 grid h-[640px] grid-cols-1 gap-4 overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_10%,#000_90%,transparent)] motion-reduce:overflow-y-auto md:h-[680px] md:grid-cols-2 lg:grid-cols-3"
        >
          <CascadeColumn reviews={REVIEWS_SHOWN} duration={160} className="md:hidden" />
          <CascadeColumn reviews={cols[0]} duration={70} className="hidden md:block" />
          <CascadeColumn reviews={cols[1]} duration={82} reverse className="hidden md:block" />
          <CascadeColumn reviews={cols[2]} duration={64} className="hidden lg:block" />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <a href={BUSINESS.googleReviews} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-carmin underline-offset-4 hover:underline">
            {r.readOnGoogle}
            <ExternalLink aria-hidden className="size-4" />
            <span className="sr-only"> ({m.common.misc.newTab})</span>
          </a>
          {google.value !== null && google.count !== null ? (
            <span className="text-sm text-gris">{t(r.ratingLabel, { value: formatNumber(google.value, { decimals: 1 }), count: google.count })}</span>
          ) : null}
          <span className="text-xs text-gris">{r.truncatedNote}</span>
        </div>
      </div>
    </section>
  );
}
