"use client";

import { useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ParedDelBar from "@/components/interior/ParedDelBar";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";

/** Así es por dentro: la pared blanca con las copas colgadas, los carteles y las baldas de vino con su LED. */
export default function Interior() {
  const m = useMessages();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const t = m.interior;

  return (
    <section ref={ref} id="por-dentro" aria-labelledby="por-dentro-title" className="scroll-mt-24 pb-20 sm:pb-28">
      <div className="container-page">
        <SectionHeading id="por-dentro-title" kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} lead={t.lead} />
        <div data-reveal className="mt-10">
          <ParedDelBar signsLabel={t.signsLabel} className="rounded-[32px] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] ring-1 ring-cream/10" />
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-cream-faint">{t.note}</p>
      </div>
    </section>
  );
}
