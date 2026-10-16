"use client";

import { useRef } from "react";
import { ExternalLink, Star } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { REVIEWS_SHOWN, type Review } from "@/data/reviews";
import { BUSINESS } from "@/data/business";
import { formatNumber } from "@/lib/format";

/** Una reseña como cita de revista: estrellas finas, el texto entre comillas y la firma en versalitas. */
export function ReviewCard({ r }: { r: Review }) {
  const m = useMessages();
  const t = useFormat();
  return (
    <figure className="border-t border-nude pt-6 pb-8">
      <div className="flex items-center gap-0.5 text-carmin-suave" role="img" aria-label={t(m.resenas.stars, { n: r.rating })}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} aria-hidden className="size-3" fill={i < r.rating ? "currentColor" : "none"} strokeWidth={1.25} />
        ))}
      </div>
      <blockquote className="mt-4 text-[15px] leading-relaxed text-tinta">«{r.text}»</blockquote>
      <figcaption className="etiqueta mt-5 text-gris">
        {r.author}
        <span className="text-carmin-suave">
          {" · "}
          <span className="sr-only">{t(m.resenas.platform, { platform: r.platform })}</span>
          <span aria-hidden>{r.platform}</span>, {r.when}
        </span>
      </figcaption>
    </figure>
  );
}

/** La destacada de la portada (completa, sin recortar) y las tres que la acompañan. */
const DESTACADA = "noelia-garcia";
const ACOMPANAN = ["soraya-rodriguez", "susana-iglesias", "sabela"];

/**
 * Reseñas en formato revista: una cita grande en Bodoni itálica con comillas tipográficas enormes en
 * nude, y debajo tres más a columnas. Solo las `shown`; el enlace lleva a Google, donde están todas.
 * La nota media solo sale cuando esté confirmada (`BUSINESS.ratings.google.value`); nunca va al
 * JSON-LD.
 */
export default function SocialProof({ titleAs = "h2" }: { titleAs?: "h1" | "h2" }) {
  const m = useMessages();
  const t = useFormat();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const r = m.resenas;
  const google = BUSINESS.ratings.google;
  const destacada = REVIEWS_SHOWN.find((x) => x.id === DESTACADA) ?? REVIEWS_SHOWN[0];
  const otras = ACOMPANAN.map((id) => REVIEWS_SHOWN.find((x) => x.id === id)).filter((x): x is Review => Boolean(x));

  return (
    <section ref={ref} id="resenas" aria-labelledby="resenas-title" className="scroll-mt-24 bg-nude-claro">
      <div className="container-page py-20 sm:py-28">
        <SectionHeading as={titleAs} id="resenas-title" kicker={r.kicker} title={r.title} accent={r.accent} description={t(r.description, { count: REVIEWS_SHOWN.length })} align="center" className="mx-auto" />

        {destacada && (
          <figure data-reveal className="relative mx-auto mt-14 max-w-4xl text-center sm:mt-20">
            <span aria-hidden className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 font-display text-[7rem] leading-none text-nude select-none sm:-top-28 sm:text-[10rem]">
              «
            </span>
            <blockquote className="relative font-display text-[1.35rem] leading-[1.4] tracking-[0.01em] text-tinta uppercase italic text-balance sm:text-[1.9rem] sm:leading-[1.35]">
              {destacada.text}
            </blockquote>
            <figcaption className="etiqueta mt-8 text-carmin-suave">
              {destacada.author} · {destacada.platform}
            </figcaption>
          </figure>
        )}

        <ul className="mt-16 grid gap-x-10 sm:mt-24 md:grid-cols-3">
          {otras.map((x) => (
            <li key={x.id} data-reveal>
              <ReviewCard r={x} />
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <a
            href={BUSINESS.googleReviews}
            target="_blank"
            rel="noopener noreferrer"
            className="etiqueta inline-flex min-h-11 items-center gap-2 text-tinta underline decoration-nude underline-offset-[6px] hover:decoration-grafito"
          >
            {r.readOnGoogle}
            <ExternalLink aria-hidden className="size-3.5" />
            <span className="sr-only"> ({m.common.misc.newTab})</span>
          </a>
          {google.value !== null && google.count !== null ? (
            <span className="text-sm text-gris">{t(r.ratingLabel, { value: formatNumber(google.value, { decimals: 1 }), count: google.count })}</span>
          ) : null}
          <span className="max-w-md text-xs text-gris">{r.truncatedNote}</span>
        </div>
      </div>
    </section>
  );
}
