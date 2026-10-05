"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ShowcasePanel from "./ShowcasePanel";
import PinchoArt from "@/components/ui/PinchoArt";
import PinchoSheet from "@/components/ui/PinchoSheet";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { STAR_PINCHOS, type Pincho } from "@/data/menu";
import { cn } from "@/lib/cn";

/**
 * Contenido del panel de la portada: los cuatro pinchos de la casa, a elegir.
 * Pensado para sustituirse por un componente de 21st.dev sin tocar `ShowcasePanel`.
 */
export default function HeroShowcase({ className }: { className?: string }) {
  const m = useMessages();
  const lp = useLocalePath();
  const t = m.hero.showcase;
  const [selected, setSelected] = useState<Pincho>(STAR_PINCHOS[1]);
  const [open, setOpen] = useState<Pincho | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const item = m.barra.items[selected.id];

  return (
    <ShowcasePanel label={t.label} actions={<span className="pr-3 text-[12px] text-cream-faint">{t.boardPrices}</span>} className={className}>
      <div className="flex flex-col gap-3 p-3 sm:grid sm:min-h-[400px] sm:grid-cols-[0.9fr_1.1fr] sm:gap-4 sm:p-4 lg:min-h-[440px]">
        <ul aria-label={t.label} className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto sm:flex-col sm:justify-center sm:overflow-visible">
          {STAR_PINCHOS.map((p) => {
            const it = m.barra.items[p.id];
            const active = p.id === selected.id;
            return (
              <li key={p.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={active}
                  aria-controls="hero-pincho"
                  onClick={() => setSelected(p)}
                  className={cn(
                    "pulsable flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ring-1 transition-colors",
                    active ? "bg-oro/12 text-cream ring-oro/40" : "text-cream-muted ring-transparent hover:bg-cream/5 hover:text-cream",
                  )}
                >
                  <PinchoArt kind={p.illustration} className="hidden w-11 shrink-0 sm:block" />
                  <span>
                    <span className="block text-sm leading-tight font-medium whitespace-nowrap sm:whitespace-normal">{it.name}</span>
                    <span className="mt-0.5 hidden text-[11px] text-oro-a11y sm:block">{it.tag}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div id="hero-pincho" aria-live="polite" className="relative flex min-h-[330px] flex-1 flex-col overflow-hidden rounded-2xl bg-cream/[0.04] p-5 ring-1 ring-cream/[0.08]">
          <div aria-hidden className="glow absolute -top-16 left-1/2 size-72 -translate-x-1/2 [--glow-a:0.16]" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.id}
              className="relative flex flex-1 flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div layoutId={`hero-art-${selected.id}`} className="mx-auto w-32 sm:w-40">
                <PinchoArt kind={selected.illustration} className="w-full" />
              </motion.div>
              <p className="mt-3 font-caps text-[10px] font-semibold tracking-[0.22em] text-oro-a11y uppercase">{item.tag}</p>
              <p className="mt-1 font-display text-2xl leading-tight font-medium">{item.name}</p>
              <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-cream-muted">{item.text}</p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3 text-[13px] font-semibold">
                <button type="button" onClick={() => setOpen(selected)} className="inline-flex min-h-9 items-center gap-1.5 text-oro-a11y hover:text-oro-light">
                  {m.barra.storyLabel}
                  <ArrowRight aria-hidden className="size-4" />
                </button>
                <Link href={lp("/carta")} className="inline-flex min-h-9 items-center text-cream-muted hover:text-cream">
                  {t.seeCarta}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <PinchoSheet pincho={open} onClose={close} layoutPrefix="hero-art" />
    </ShowcasePanel>
  );
}
