"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment, useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { FAQ } from "@/data/faq";
import { faqVars, FAQ_BOLD_PATTERN } from "@/lib/faq";
import { cn } from "@/lib/utils";

/**
 * Preguntas frecuentes de la portada. Es la cara VISIBLE del `FAQPage` que emite `<HomeJsonLd />`:
 * ambos leen `data/faq.ts` e interpolan las mismas variables (`faqVars`), así que el texto marcado y
 * el que lee el visitante son idénticos — requisito de las directrices de datos estructurados de Google.
 *
 * Desplegable animado con framer (altura `auto`) en vez de `<details>` nativo, que abre de golpe.
 * Lo que no se pierde en el cambio: la respuesta sigue SIEMPRE en el HTML (la leen los rastreadores
 * y la encuentra el Ctrl+F), `visibility: hidden` al cerrar saca el panel del orden de tabulación,
 * `button[aria-expanded][aria-controls]` + `role="region"` es el patrón de divulgación de la WAI, y
 * con `prefers-reduced-motion` abre y cierra sin transición. Se pueden abrir varias a la vez.
 */
export default function Faq({ className }: { className?: string }) {
  const m = useMessages();
  const t = useFormat();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const vars = useMemo(() => faqVars(m), [m]);
  const f = m.home.faq;

  const [abiertas, setAbiertas] = useState<ReadonlySet<string>>(() => new Set());
  const alternar = useCallback((clave: string) => {
    setAbiertas((previas) => {
      const siguiente = new Set(previas);
      if (!siguiente.delete(clave)) siguiente.add(clave);
      return siguiente;
    });
  }, []);

  return (
    <section ref={ref} id="preguntas" aria-labelledby="faq-title" className={cn("scroll-mt-24 bg-white", className)}>
      {/* Editorial: el titular a la izquierda (fijo al bajar en escritorio) y las preguntas en una
          sola columna separada por filetes, como el índice de una revista. */}
      <div className="container-page grid gap-10 py-20 sm:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="faq-title" kicker={f.kicker} title={f.title} accent={f.accent} />
        </div>
        <ul className="border-t border-nude">
          {FAQ.map((item) => (
            <Pregunta key={item.id} question={t(item.q, vars)} answer={t(item.a, vars)} abierta={abiertas.has(item.id)} onAlternar={() => alternar(item.id)} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Pinta las `**negritas**` de la respuesta en `<strong>`. */
function conNegritas(texto: string): ReactNode[] {
  return texto.split(FAQ_BOLD_PATTERN).map((tramo, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-tinta">
        {tramo}
      </strong>
    ) : (
      <Fragment key={i}>{tramo}</Fragment>
    ),
  );
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function Pregunta({ question, answer, abierta, onAlternar }: { question: string; answer: string; abierta: boolean; onAlternar: () => void }) {
  const reducido = useReducedMotion();
  const idPanel = useId();
  const idPregunta = useId();

  return (
    /* El `data-reveal` se queda en el `<li>` y NO en la tarjeta: la regla de revelado va sin `@layer`
       y su `transition` abreviada pisaría la de la tarjeta al abrir. */
    <li data-reveal="fade">
      <div
        className="group/faq relative border-b border-nude"
      >
        <h3 className="m-0">
          <button
            id={idPregunta}
            type="button"
            onClick={onAlternar}
            aria-expanded={abierta}
            aria-controls={idPanel}
            className="flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left font-display text-lg leading-snug text-tinta sm:text-xl"
          >
            <span className="text-pretty">{question}</span>
            <Aspa abierta={abierta} />
          </button>
        </h3>
        <motion.div
          id={idPanel}
          role="region"
          aria-labelledby={idPregunta}
          initial={false}
          animate={abierta ? "abierta" : "cerrada"}
          variants={{
            abierta: { height: "auto", visibility: "visible" },
            cerrada: { height: 0, transitionEnd: { visibility: "hidden" } },
          }}
          transition={reducido ? { duration: 0 } : { duration: 0.44, ease: EASE_OUT_EXPO }}
          className="overflow-hidden"
        >
          <motion.div
            variants={{
              abierta: { opacity: 1, y: 0, transition: { duration: 0.36, delay: 0.08, ease: EASE_OUT_EXPO } },
              cerrada: { opacity: 0, y: -10, transition: { duration: 0.16 } },
            }}
            className="pb-7 pr-12"
          >
            <p className="text-[15px] leading-relaxed text-gris text-pretty">{conNegritas(answer)}</p>
          </motion.div>
        </motion.div>
      </div>
    </li>
  );
}

/** El signo de abrir: un «+» que se desatornilla en un «−» (no una ×, que es cerrar). */
function Aspa({ abierta }: { abierta: boolean }) {
  const palo = "absolute h-px w-4 bg-carmin transition-transform duration-[520ms] ease-[var(--ease-out-expo)]";
  return (
    <span aria-hidden className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center">
      <span className={palo} />
      <span className={cn(palo, abierta ? "rotate-180 scale-x-0" : "rotate-90")} />
    </span>
  );
}
