"use client";

import { ArrowUpRight, Newspaper } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/cn";

/** La mención de prensa como píldora enlazada con un micro-marquee de titulares. */
export default function PressMarquee({ className }: { className?: string }) {
  const m = useMessages();
  const t = m.hero.press;
  const items = [...t.items, ...t.items];
  return (
    <a
      href={BUSINESS.press.vozGalicia.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.aria}
      className={cn(
        "group flex w-full max-w-md items-center gap-2.5 rounded-full border border-cream/12 bg-cream/[0.04] py-1.5 pr-3 pl-1.5 transition-colors hover:border-oro/40 hover:bg-cream/[0.07]",
        className,
      )}
    >
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-oro/15 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap text-oro-a11y ring-1 ring-oro/25">
        <Newspaper aria-hidden className="size-3.5" />
        {t.outlet}
      </span>
      <span aria-hidden className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_14px,#000_calc(100%-14px),transparent)]">
        <span className="marquee-x flex w-max gap-8 text-[13px] whitespace-nowrap text-cream-muted group-hover:[animation-play-state:paused]">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              {item}
              <span className="text-oro/50">✦</span>
            </span>
          ))}
        </span>
      </span>
      <ArrowUpRight aria-hidden className="size-4 shrink-0 text-cream-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-oro-light" />
    </a>
  );
}
