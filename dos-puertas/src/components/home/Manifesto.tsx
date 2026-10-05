"use client";

import { useRef } from "react";
import { Ban, Footprints, Coins } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";

const ICONS = [Ban, Footprints, Coins];

export default function Manifesto() {
  const m = useMessages();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = m.manifesto;
  return (
    <section ref={ref} aria-labelledby="manifesto-title" className="container-page py-20 sm:py-28">
      <SectionHeading id="manifesto-title" kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} after={t.titleAfter} lead={t.lead} />
      <ul className="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {t.rules.map((rule, i) => {
          const Icon = ICONS[i];
          return (
            <li key={rule.title} data-reveal className="capa flex gap-4 rounded-3xl p-5 sm:flex-col sm:p-6">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-oro/12 text-oro-light ring-1 ring-oro/25">
                <Icon aria-hidden className="size-5" />
              </span>
              <span>
                <span className="block font-display text-xl font-medium">{rule.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-cream-muted">{rule.text}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
