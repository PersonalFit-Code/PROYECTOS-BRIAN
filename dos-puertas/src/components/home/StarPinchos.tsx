"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import PinchoArt from "@/components/ui/PinchoArt";
import PinchoSheet from "@/components/ui/PinchoSheet";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";
import { useReveal } from "@/hooks/useReveal";
import { STAR_PINCHOS, type Pincho } from "@/data/menu";

export default function StarPinchos() {
  const m = useMessages();
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Pincho | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useReveal(ref);
  const t = m.barra;

  return (
    <section ref={ref} id="barra" aria-labelledby="barra-title" className="relative scroll-mt-24 py-20 sm:py-28">
      <div aria-hidden className="glow absolute top-20 right-0 -z-10 h-[520px] w-[520px] [--glow-a:0.12]" />
      <div className="container-page">
        <SectionHeading id="barra-title" kicker={t.kicker} before={t.titleBefore} accent={t.titleAccent} lead={t.lead} />
      </div>

      <ul
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%-16px),transparent)] sm:px-6 lg:container-page lg:grid lg:grid-cols-4 lg:overflow-visible lg:[mask-image:none]"
      >
        {STAR_PINCHOS.map((p, i) => {
          const item = t.items[p.id];
          return (
            <li key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }} className="w-[76vw] max-w-[300px] shrink-0 snap-center lg:w-auto lg:max-w-none">
              <button
                type="button"
                onClick={() => setOpen(p)}
                aria-label={format(t.openDetail, { name: item.name })}
                className="pulsable group capa flex h-full w-full flex-col rounded-[28px] p-5 text-left hover:border-oro/30"
              >
                <span className="font-caps self-start rounded-full bg-oro/12 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-oro-a11y uppercase ring-1 ring-oro/25">
                  {item.tag}
                </span>
                <motion.span layoutId={`art-${p.id}`} className="mx-auto mt-3 block w-40 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105">
                  <PinchoArt kind={p.illustration} className="w-full" />
                </motion.span>
                <span className="mt-3 font-display text-2xl leading-tight font-medium">{item.name}</span>
                <span className="mt-2 text-sm leading-relaxed text-cream-muted">{item.text}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-oro-a11y">
                  {m.barra.storyLabel}
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="container-page mt-8">
        <Link
          href={lp("/carta")}
          className="pulsable inline-flex min-h-12 items-center gap-2 rounded-full border border-oro/40 px-6 text-[15px] font-semibold text-oro-light hover:bg-oro/10"
        >
          {t.seeAll}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      <PinchoSheet pincho={open} onClose={close} />
    </section>
  );
}
