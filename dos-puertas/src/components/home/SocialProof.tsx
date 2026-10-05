"use client";

import { useRef } from "react";
import { ExternalLink, Star } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";
import { useReveal } from "@/hooks/useReveal";
import { REVIEWS, type Review } from "@/data/reviews";
import { BUSINESS } from "@/data/business";

function ReviewCard({ r }: { r: Review }) {
  const m = useMessages();
  return (
    <figure className="capa mb-4 break-inside-avoid rounded-3xl p-5">
      <div className="flex items-center gap-0.5 text-oro" role="img" aria-label={format(m.social.stars, { n: r.rating })}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} aria-hidden className="size-4" fill={i < r.rating ? "currentColor" : "none"} strokeWidth={1.5} />
        ))}
      </div>
      <p className="mt-3 font-display text-lg leading-snug">{r.title}</p>
      <blockquote className="mt-2 text-sm leading-relaxed text-cream-muted">«{r.text}»</blockquote>
      <figcaption className="mt-3 text-xs text-cream-faint">
        {r.author} · {r.platform}
        {r.date ? ` · ${r.date.split("-").reverse().join("/")}` : ""}
      </figcaption>
    </figure>
  );
}

export default function SocialProof() {
  const m = useMessages();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = m.social;
  const half = Math.ceil(REVIEWS.length / 2);
  const cols = [REVIEWS.slice(0, half), REVIEWS.slice(half)];

  return (
    <section ref={ref} id="resenas" aria-labelledby="resenas-title" className="scroll-mt-24">
      <div aria-hidden className="filete container-page" />
      <div className="container-page py-20 sm:py-28">
        <SectionHeading id="resenas-title" kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} lead={t.lead} />

        {/* Cifras: 2×2 en móvil, 1×4 en escritorio, separadas por filos de 1 px */}
        <dl data-reveal className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-cream/10 ring-1 ring-cream/10 lg:grid-cols-4">
          {m.historia.stats.map((s) => (
            <div key={s.label} className="bg-tinta-800 p-5 sm:p-6">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-condensed text-5xl leading-none tracking-wide text-gradient-marca sm:text-6xl">{s.value}</span>
                <span className="mt-2 block text-[13px] leading-snug text-cream-muted">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        {/* Móvil: lista normal (legible con el pulgar). Escritorio: dos columnas en marquee. */}
        <div className="mt-10 md:hidden">
          {REVIEWS.slice(0, 4).map((r) => (
            <div key={r.id} data-reveal>
              <ReviewCard r={r} />
            </div>
          ))}
        </div>
        <div
          data-reveal="fade"
          className="group relative mt-12 hidden h-[560px] grid-cols-2 gap-4 overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_12%,#000_88%,transparent)] md:grid lg:grid-cols-[1fr_1fr_0.9fr]"
        >
          {cols.map((col, ci) => (
            <div key={ci} className={ci === 0 ? "animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none" : "animate-marquee-rev group-hover:[animation-play-state:paused] motion-reduce:animate-none"}>
              {[...col, ...col].map((r, i) => (
                <div key={`${r.id}-${i}`} aria-hidden={i >= col.length ? true : undefined}>
                  <ReviewCard r={r} />
                </div>
              ))}
            </div>
          ))}
          <div className="hidden flex-col justify-center gap-4 lg:flex">
            <a
              href={BUSINESS.social.tripadvisor}
              target="_blank"
              rel="noopener noreferrer"
              className="capa-alta flex items-center justify-between gap-4 rounded-3xl p-6 hover:border-oro/30"
            >
              <span>
                <span className="block font-condensed text-6xl leading-none text-oro-light">
                  {BUSINESS.ratings.tripadvisor.valueForMoney.toLocaleString("es-ES")}
                </span>
                <span className="mt-2 block text-sm text-cream">{t.ratingLabel}</span>
                <span className="block text-xs text-cream-faint">{format(t.ratingCount, { count: BUSINESS.ratings.tripadvisor.count })}</span>
              </span>
              <ExternalLink aria-hidden className="size-5 text-cream-muted" />
            </a>
          </div>
        </div>

        <a
          href={BUSINESS.social.tripadvisor}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-oro-a11y underline-offset-4 hover:underline"
        >
          {t.readOn}
          <ExternalLink aria-hidden className="size-4" />
        </a>
      </div>
    </section>
  );
}
