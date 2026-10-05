"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ShowcasePanel from "./ShowcasePanel";
import PinchoArt from "@/components/ui/PinchoArt";
import PinchoSheet from "@/components/ui/PinchoSheet";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { STAR_PINCHOS, type Pincho } from "@/data/menu";
import { cn } from "@/lib/cn";
import photo from "../../../../public/images/barra-dos-puertas.webp";

const TABS = ["barra", "pinchos"] as const;
type Tab = (typeof TABS)[number];

/**
 * Contenido de muestra del panel de la portada: pestañas «La barra» (foto) y «Pinchos» (los cuatro
 * de la casa). Está pensado para sustituirse por un componente de 21st.dev sin tocar `ShowcasePanel`.
 */
export default function HeroShowcase({ className }: { className?: string }) {
  const m = useMessages();
  const lp = useLocalePath();
  const t = m.hero.showcase;
  const [tab, setTab] = useState<Tab>("barra");
  const [selected, setSelected] = useState<Pincho>(STAR_PINCHOS[1]);
  const [open, setOpen] = useState<Pincho | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ barra: null, pinchos: null });

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = TABS[(TABS.indexOf(tab) + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const tabs = (
    <div role="tablist" aria-label={t.tablistLabel} className="flex rounded-full bg-cream/[0.06] p-1 ring-1 ring-cream/10">
      {TABS.map((id) => (
        <button
          key={id}
          ref={(el) => {
            tabRefs.current[id] = el;
          }}
          id={`hero-tab-${id}`}
          role="tab"
          type="button"
          aria-selected={tab === id}
          aria-controls={`hero-panel-${id}`}
          tabIndex={tab === id ? 0 : -1}
          onClick={() => setTab(id)}
          onKeyDown={onTabKey}
          className={cn(
            "pulsable relative min-h-9 rounded-full px-4 text-[13px] font-medium",
            tab === id ? "text-botella" : "text-cream-muted hover:text-cream",
          )}
        >
          {tab === id ? (
            <motion.span layoutId="hero-tab-pill" className="absolute inset-0 rounded-full bg-oro" transition={{ type: "spring", damping: 30, stiffness: 380 }} />
          ) : null}
          <span className="relative">{t.tabs[id]}</span>
        </button>
      ))}
    </div>
  );

  const item = m.barra.items[selected.id];

  return (
    <ShowcasePanel label={t.label} actions={tabs} className={className}>
      <div className="relative h-[380px] sm:h-[420px] lg:h-[460px]">
        <AnimatePresence mode="wait" initial={false}>
          {tab === "barra" ? (
            <motion.div
              key="barra"
              id="hero-panel-barra"
              role="tabpanel"
              aria-labelledby="hero-tab-barra"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={photo}
                alt={m.hero.photoAlt}
                fill
                priority
                placeholder="blur"
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover object-[50%_42%]"
              />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(10,21,16,0.85))]" />
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
                <div className="rounded-2xl bg-botella-900/80 px-4 py-3 ring-1 ring-cream/10">
                  <span className="block font-caps text-[9px] font-semibold tracking-[0.26em] text-oro-a11y uppercase">{t.boardLabel}</span>
                  <span className="mt-1 block font-condensed text-2xl leading-none tracking-wide text-cream sm:text-[26px]">{t.boardPrices}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTab("pinchos")}
                  className="pulsable inline-flex min-h-10 items-center gap-1.5 rounded-full bg-cream/10 px-4 text-[13px] font-medium text-cream ring-1 ring-cream/15 hover:bg-cream/15"
                >
                  {t.seePinchos}
                  <ArrowRight aria-hidden className="size-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pinchos"
              id="hero-panel-pinchos"
              role="tabpanel"
              aria-labelledby="hero-tab-pinchos"
              className="absolute inset-0 flex flex-col gap-3 p-3 sm:grid sm:grid-cols-[0.9fr_1.1fr] sm:gap-4 sm:p-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <ul className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
                {STAR_PINCHOS.map((p) => {
                  const it = m.barra.items[p.id];
                  const active = p.id === selected.id;
                  return (
                    <li key={p.id} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelected(p)}
                        className={cn(
                          "pulsable flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ring-1 transition-colors",
                          active ? "bg-oro/12 text-cream ring-oro/40" : "text-cream-muted ring-transparent hover:bg-cream/5 hover:text-cream",
                        )}
                      >
                        <PinchoArt kind={p.illustration} className="hidden w-10 shrink-0 sm:block" />
                        <span className="text-sm leading-tight font-medium whitespace-nowrap sm:whitespace-normal">{it.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-cream/[0.04] p-4 ring-1 ring-cream/[0.08]">
                <motion.div key={selected.id} layoutId={`hero-art-${selected.id}`} className="mx-auto w-28 sm:w-36">
                  <PinchoArt kind={selected.illustration} className="w-full" />
                </motion.div>
                <p className="mt-2 font-caps text-[10px] font-semibold tracking-[0.22em] text-oro-a11y uppercase">{item.tag}</p>
                <p className="mt-1 font-display text-xl leading-tight font-medium sm:text-2xl">{item.name}</p>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <PinchoSheet pincho={open} onClose={close} layoutPrefix="hero-art" />
    </ShowcasePanel>
  );
}
