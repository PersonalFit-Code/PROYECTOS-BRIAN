"use client";

import { useRef } from "react";
import { ExternalLink, Quote } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { useMessages } from "@/i18n/LocaleProvider";
import { BUSINESS } from "@/data/business";

/** La anécdota de prensa: recorte de periódico sobre la barra. */
export default function FamousCard() {
  const m = useMessages();
  const t = m.historia;
  const press = BUSINESS.press.vozGalicia;
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <div ref={ref} data-reveal className="relative self-start">
      <div aria-hidden className="glow absolute inset-x-0 -inset-y-16 -z-10 [--glow-a:0.16]" />
      <article className="capa-alta grano overflow-hidden rounded-[32px] p-6 sm:p-8">
        <p className="font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{t.famousKicker}</p>
        <h3 className="mt-3 font-display text-4xl leading-[1] font-medium text-balance sm:text-5xl">
          {t.famousTitle.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="palabra-rotulo text-gradient-marca">{t.famousTitle.split(" ").slice(-1)}</span>
        </h3>
        <p className="mt-4 text-[15px] leading-relaxed text-cream-muted">{t.famousText}</p>

        <figure className="mt-6 border-l-2 border-oro/50 pl-4">
          <Quote aria-hidden className="size-5 text-oro-light" />
          <blockquote className="mt-2 font-display text-xl leading-snug italic">«{t.quote}»</blockquote>
          <figcaption className="mt-2 text-xs text-cream-faint">— {t.quoteAuthor}</figcaption>
        </figure>

        <a
          href={press.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 flex items-start gap-3 rounded-2xl bg-cream/[0.06] p-4 text-sm ring-1 ring-cream/10 hover:bg-cream/10"
        >
          <span className="flex-1">
            <span className="block font-caps text-[10px] tracking-[0.2em] text-oro-a11y uppercase">
              {press.outlet} · 02/03/2024
            </span>
            <span className="mt-1 block leading-snug text-cream">{press.title}</span>
          </span>
          <ExternalLink aria-hidden className="mt-1 size-4 shrink-0 text-cream-muted" />
          <span className="sr-only">{t.pressLink}</span>
        </a>
      </article>
    </div>
  );
}
