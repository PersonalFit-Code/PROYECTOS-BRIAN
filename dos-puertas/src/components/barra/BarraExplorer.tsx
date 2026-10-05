"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import PinchoArt from "@/components/ui/PinchoArt";
import PinchoSheet from "@/components/ui/PinchoSheet";
import { useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";
import { useReveal } from "@/hooks/useReveal";
import { CATEGORIES, MENU, type CategoryId, type Pincho } from "@/data/menu";
import { cn } from "@/lib/cn";

type Filter = "all" | CategoryId;

export default function BarraExplorer() {
  const m = useMessages();
  const t = m.barra;
  const ref = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Pincho | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useReveal(ref);

  /* Solo categorías que tienen algo: calculado de los datos. */
  const filters = useMemo<Filter[]>(() => ["all", ...CATEGORIES.filter((c) => MENU.some((p) => p.category === c))], []);
  const visible = filter === "all" ? MENU : MENU.filter((p) => p.category === filter);
  const groups = (filter === "all" ? CATEGORIES : [filter]).map((c) => ({ c, items: visible.filter((p) => p.category === c) })).filter((g) => g.items.length);

  return (
    <div ref={ref}>
      <div className="sticky top-[78px] z-30 sm:top-[88px]">
        <div className="container-page">
          <div
            role="toolbar"
            aria-label={t.filterLabel}
            className="liquid-glass liquid-glass-strong cristal-ancho no-scrollbar flex gap-1 overflow-x-auto rounded-full p-1.5 [mask-image:linear-gradient(90deg,#000_calc(100%-24px),transparent)] sm:inline-flex sm:[mask-image:none]"
          >
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "pulsable min-h-10 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap",
                  filter === f ? "bg-oro text-botella" : "text-cream-muted hover:text-cream",
                )}
              >
                {f === "all" ? t.all : t.categories[f]}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="mt-3 px-2 text-xs text-cream-faint">
            {format(t.results, { count: visible.length })}
          </p>
        </div>
      </div>

      <div className="container-page mt-6 space-y-12">
        {groups.map(({ c, items }) => (
          <section key={c} aria-labelledby={`cat-${c}`}>
            <h2 id={`cat-${c}`} data-reveal="fade" className="flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">
              <span aria-hidden className="h-px w-8 bg-oro-light/70" />
              {t.categories[c]}
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => {
                const item = t.items[p.id];
                return (
                  <li key={p.id} data-reveal>
                    <button
                      type="button"
                      onClick={() => setOpen(p)}
                      aria-label={format(t.openDetail, { name: item.name })}
                      className="pulsable group capa flex w-full items-center gap-4 rounded-3xl p-3 pr-5 text-left hover:border-oro/30"
                    >
                      <motion.span layoutId={`art-${p.id}`} className="block w-20 shrink-0 sm:w-24">
                        <PinchoArt kind={p.illustration} className="w-full" />
                      </motion.span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-caps text-[10px] font-semibold tracking-[0.2em] text-oro-a11y uppercase">{item.tag}</span>
                        <span className="mt-1 block font-display text-xl leading-tight font-medium">{item.name}</span>
                        <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-cream-muted">{item.text}</span>
                      </span>
                      <ArrowRight aria-hidden className="size-4 shrink-0 text-cream-faint transition-transform group-hover:translate-x-1 group-hover:text-oro-light" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <p className="capa rounded-2xl p-4 text-sm leading-relaxed text-cream-muted">
          {t.priceNote} {t.allergensNote}
        </p>
      </div>

      <PinchoSheet pincho={open} onClose={close} />
    </div>
  );
}
