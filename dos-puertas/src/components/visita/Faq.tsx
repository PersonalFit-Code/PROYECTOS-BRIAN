"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

/** Acordeón: contenido siempre en el HTML; el "+" se convierte en "−" (un palo gira y se encoge). */
function Item({ q, a }: { q: string; a: string }) {
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
          {q}
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
      <AnimatePresence initial={false}>
        <motion.div
          id={id}
          key="panel"
          initial={false}
          animate={{ height: open ? "auto" : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
          style={{ visibility: open ? "visible" : "hidden" }}
        >
          <motion.p
            animate={{ opacity: open ? 1 : 0, y: open ? 0 : -4 }}
            transition={{ delay: open ? 0.08 : 0, duration: 0.25 }}
            className="px-5 pb-5 text-[15px] leading-relaxed text-cream-muted"
          >
            {a}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </li>
  );
}

export default function Faq() {
  const m = useMessages();
  return (
    <section aria-labelledby="faq-title" className="container-page py-10">
      <h2 id="faq-title" className="font-display text-3xl font-medium">
        {m.visita.faqTitle}
      </h2>
      <ul className="mt-6 grid gap-3 lg:grid-cols-2">
        {m.visita.faq.map((f) => (
          <Item key={f.q} q={f.q} a={f.a} />
        ))}
      </ul>
    </section>
  );
}
