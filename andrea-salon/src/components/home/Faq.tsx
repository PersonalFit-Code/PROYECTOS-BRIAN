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
    <section ref={ref} id="preguntas" aria-labelledby="faq-title" className={cn("scroll-mt-24", className)}>
      <div aria-hidden className="filete container-page" />
      <div className="container-page py-20 sm:py-28">
        <SectionHeading id="faq-title" kicker={f.kicker} title={f.title} accent={f.accent} />
        {/* `items-start`: sin él, la fila de la rejilla crece con la pregunta abierta y la tarjeta
            de al lado se estira hasta igualarla. */}
        <ul className="mt-10 grid gap-3 md:grid-cols-2 md:items-start md:gap-4">
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
        className={cn(
          "group/faq relative overflow-hidden rounded-2xl border transition-[border-color,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
          abierta ? "border-carmin/25 bg-white shadow-[var(--shadow-soft)]" : "border-carmin/10 bg-white/60 hover:border-carmin/25",
        )}
      >
        <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-0 w-px origin-top bg-gradient-to-b from-transparent via-carmin/70 to-transparent transition-transform duration-[600ms] ease-[var(--ease-out-expo)]", abierta ? "scale-y-100" : "scale-y-0")} />
        <h3 className="m-0">
          <button
            id={idPregunta}
            type="button"
            onClick={onAlternar}
            aria-expanded={abierta}
            aria-controls={idPanel}
            className="flex w-full cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left font-sans text-[15px] font-semibold text-tinta"
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
            className="px-5 pb-4"
          >
            <span aria-hidden className="mb-3 block h-px bg-gradient-to-r from-carmin/20 via-carmin/5 to-transparent" />
            <p className="text-sm leading-relaxed text-gris text-pretty">{conNegritas(answer)}</p>
          </motion.div>
        </motion.div>
      </div>
    </li>
  );
}

/** El signo de abrir: un «+» que se desatornilla en un «−» (no una ×, que es cerrar). */
function Aspa({ abierta }: { abierta: boolean }) {
  const palo = "absolute h-[1.5px] w-3 rounded-full bg-carmin transition-transform duration-[520ms] ease-[var(--ease-out-expo)]";
  return (
    <span aria-hidden className={cn("relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-500", abierta ? "border-carmin/40 bg-rosa" : "border-carmin/15 bg-white group-hover/faq:border-carmin/30")}>
      <span className={palo} />
      <span className={cn(palo, abierta ? "rotate-180 scale-x-0" : "rotate-90")} />
    </span>
  );
}
