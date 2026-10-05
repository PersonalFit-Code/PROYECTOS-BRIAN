"use client";

import { useRef, type CSSProperties } from "react";
import { ExternalLink, Star } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";
import { useReveal } from "@/hooks/useReveal";
import { REVIEWS, type Review } from "@/data/reviews";
import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/cn";

function ReviewCard({ r }: { r: Review }) {
  const m = useMessages();
  return (
    <figure className="capa mb-4 rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5 text-oro" role="img" aria-label={format(m.social.stars, { n: r.rating })}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} aria-hidden className="size-3.5" fill={i < r.rating ? "currentColor" : "none"} strokeWidth={1.5} />
          ))}
        </div>
        <span className="rounded-full bg-cream/[0.06] px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-cream-faint ring-1 ring-cream/10">{r.platform}</span>
      </div>
      <blockquote className="mt-3 text-[14px] leading-relaxed text-cream/85">«{r.text}»</blockquote>
      <figcaption className="mt-4 flex items-center gap-2.5 text-[13px] text-cream-muted">
        <span aria-hidden className="inline-flex size-7 items-center justify-center rounded-full bg-oro/15 font-display text-sm text-oro-light ring-1 ring-oro/25">
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
      <div
        className={cn("motion-reduce:animate-none group-hover:[animation-play-state:paused]", reverse ? "animate-marquee-rev" : "animate-marquee")}
        style={{ animationDuration: `${duration}s` } as CSSProperties}
      >
        {[...reviews, ...reviews].map((r, i) => (
          <div key={`${r.id}-${i}`} aria-hidden={i >= reviews.length ? true : undefined}>
            <ReviewCard r={r} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SocialProof() {
  const m = useMessages();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = m.social;
  const cols = [0, 1, 2].map((c) => REVIEWS.filter((_, i) => i % 3 === c));

  return (
    <section ref={ref} id="resenas" aria-labelledby="resenas-title" className="scroll-mt-24">
      <div aria-hidden className="filete container-page" />
      <div className="container-page py-20 sm:py-28">
        <SectionHeading id="resenas-title" kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} lead={format(t.lead, { count: REVIEWS.length })} />

        <div
          data-reveal="fade"
          className="group relative mt-10 grid h-[640px] grid-cols-1 gap-4 overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_10%,#000_90%,transparent)] motion-reduce:overflow-y-auto md:h-[680px] md:grid-cols-2 lg:grid-cols-3"
        >
          {/* En móvil, una sola columna con todas; en tableta, dos; en escritorio, tres. */}
          <CascadeColumn reviews={REVIEWS} duration={150} className="md:hidden" />
          <CascadeColumn reviews={cols[0]} duration={70} className="hidden md:block" />
          <CascadeColumn reviews={cols[1]} duration={82} reverse className="hidden md:block" />
          <CascadeColumn reviews={cols[2]} duration={64} className="hidden lg:block" />
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          <a href={BUSINESS.maps} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-oro-a11y underline-offset-4 hover:underline">
            {t.readOnGoogle}
            <ExternalLink aria-hidden className="size-4" />
          </a>
          <a href={BUSINESS.social.tripadvisor} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-oro-a11y underline-offset-4 hover:underline">
            {t.readOn}
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
