"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { faqVars } from "@/lib/faq";
import { cn } from "@/lib/utils";

/**
 * Preguntas frecuentes de la portada (horario, reservas, celíacos/alérgenos, vegano, cómo llegar y
 * terraza): las long-tail locales del punto 11 del brief, en los cuatro idiomas.
 *
 * Es la cara VISIBLE del `FAQPage` que emite `<HomeJsonLd />`. Ambos leen `m.legal.faq.items` e
 * interpolan las mismas variables (`faqVars`), así que el texto marcado y el que lee el visitante
 * son idénticos — requisito de las directrices de datos estructurados de Google.
 *
 * `<details>/<summary>` nativos: plegable sin JavaScript, accesible por teclado y con el contenido
 * presente en el HTML (los rastreadores lo leen aunque esté cerrado).
 */
export default function Faq({ className }: { className?: string }) {
  const m = useMessages();
  const t = useFormat();
  const vars = useMemo(() => faqVars(m), [m]);
  const faq = m.legal.faq;

  return (
    <section aria-labelledby="faq-title" className={cn("relative", className)}>
      <h3 id="faq-title" data-reveal className="font-display text-3xl leading-none text-cream md:text-4xl">
        {faq.title}
      </h3>

      <ul className="mt-8 grid gap-3 md:mt-10 md:grid-cols-2 md:gap-4">
        {faq.items.map((item) => {
          const question = t(item.q, vars);
          return (
            <li key={question} data-reveal="fade">
              <details className="group rounded-2xl border border-cream/10 bg-iron-900/70 px-5 py-4 transition-colors duration-300 open:border-cream/20 hover:border-cream/25">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-sans text-[15px] font-semibold text-cream marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="text-pretty">{question}</span>
                  <Plus
                    aria-hidden
                    className="mt-0.5 h-5 w-5 shrink-0 text-pimenton-a11y transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45"
                    strokeWidth={2}
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-cream-muted text-pretty">{t(item.a, vars)}</p>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
