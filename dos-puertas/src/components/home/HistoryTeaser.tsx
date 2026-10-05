"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import FamousCard from "@/components/historia/FamousCard";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";

/** Tres hitos + la anécdota de Amancio Ortega, con enlace a /historia. */
export default function HistoryTeaser() {
  const m = useMessages();
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = m.historia;
  const hitos = [t.timeline[1], t.timeline[3], t.timeline[5]];

  return (
    <section ref={ref} id="historia" aria-labelledby="historia-title" className="scroll-mt-24">
      <div aria-hidden className="filete container-page" />
      <div className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <SectionHeading id="historia-title" kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} after={t.titleAfter} lead={t.lead} />
          <ol className="relative mt-10 space-y-7 border-l border-oro/25 pl-6">
            {hitos.map((h) => (
              <li key={h.title} data-reveal className="relative">
                <span aria-hidden className="absolute top-1.5 -left-[31px] size-3 rounded-full bg-oro ring-4 ring-tinta" />
                <p className="font-condensed text-2xl leading-none tracking-wide text-oro-light">{h.year}</p>
                <p className="mt-1 font-display text-xl font-medium">{h.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-cream-muted">{h.text}</p>
              </li>
            ))}
          </ol>
          <Link
            href={lp("/historia")}
            data-reveal
            className="pulsable mt-10 inline-flex min-h-12 items-center gap-2 rounded-full border border-oro/40 px-6 text-[15px] font-semibold text-oro-light hover:bg-oro/10"
          >
            {t.cta}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <FamousCard />
      </div>
    </section>
  );
}
