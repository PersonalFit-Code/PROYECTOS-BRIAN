"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/getMessages";
import { cn } from "@/lib/cn";

type FaqItem = Messages["faq"]["groups"][number]["items"][number];

/** Acordeón: contenido siempre en el HTML; el "+" se convierte en "−" (un palo gira y se encoge). */
function Item({ item }: { item: FaqItem }) {
  const m = useMessages();
  const lp = useLocalePath();
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li className="capa rounded-2xl">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-3 text-left font-display text-lg"
        >
          {item.q}
          <span aria-hidden className="relative size-4 shrink-0 text-oro-light">
            <span className="absolute top-1/2 left-0 h-0.5 w-4 -translate-y-1/2 rounded bg-current" />
            <span
              className={cn(
                "absolute top-1/2 left-0 h-0.5 w-4 -translate-y-1/2 rounded bg-current transition-transform duration-300 [transition-timing-function:var(--ease-muelle)]",
                open ? "scale-x-0 rotate-0" : "rotate-90",
              )}
            />
          </span>
        </button>
      </h3>
      <motion.div
        id={id}
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
        style={{ visibility: open ? "visible" : "hidden" }}
      >
        <motion.div
          animate={{ opacity: open ? 1 : 0, y: open ? 0 : -4 }}
          transition={{ delay: open ? 0.08 : 0, duration: 0.25 }}
          className="px-5 pb-5 text-[15px] leading-relaxed text-cream-muted"
        >
          <p>{item.a}</p>
          {"pending" in item && item.pending ? (
            <span className="mt-3 inline-flex rounded-full bg-oro/10 px-2.5 py-1 text-[11px] text-oro-a11y ring-1 ring-oro/25">{m.faq.pendingBadge}</span>
          ) : null}
          {"link" in item && item.link ? (
            <Link href={lp(item.link.path)} className="mt-3 flex min-h-9 w-fit items-center gap-1.5 text-sm font-semibold text-oro-a11y hover:text-oro-light">
              {item.link.label}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          ) : null}
        </motion.div>
      </motion.div>
    </li>
  );
}

export default function Faq() {
  const m = useMessages();
  return (
    <div className="container-page space-y-12 pb-10">
      {m.faq.groups.map((g) => (
        <section key={g.title} aria-labelledby={`faq-${g.title}`}>
          <h2 id={`faq-${g.title}`} className="flex items-center gap-3 font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">
            <span aria-hidden className="h-px w-8 bg-oro-light/70" />
            {g.title}
          </h2>
          <ul className="mt-5 grid gap-3 lg:grid-cols-2 lg:items-start">
            {g.items.map((it) => (
              <Item key={it.q} item={it} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
