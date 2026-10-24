"use client";

import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { FAQ, HOME } from "@/content";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * Acordeón accesible (patrón WAI-ARIA): cada pregunta es un botón con aria-expanded que controla su
 * región. La altura se anima con grid-template-rows 0fr→1fr (sin medir en JS).
 */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section aria-labelledby="faq-title" className="bg-bg-alt py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading id="faq-title" kicker="FAQ" title={HOME.faq.title} />
        <div className="mt-10 grid gap-3">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            const btn = `${base}-q${i}`;
            const panel = `${base}-a${i}`;
            return (
              <div key={f.q} className="card reveal overflow-hidden" style={{ ["--i" as string]: i }}>
                <h3>
                  <button
                    id={btn}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-lg font-bold"
                  >
                    {f.q}
                    <Plus className={`h-5 w-5 shrink-0 text-brand-text transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} aria-hidden />
                  </button>
                </h3>
                <div
                  id={panel}
                  role="region"
                  aria-labelledby={btn}
                  className="grid transition-[grid-template-rows] duration-[250ms] ease-[var(--ease-out)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  inert={!isOpen}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 leading-relaxed text-fg-muted">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
