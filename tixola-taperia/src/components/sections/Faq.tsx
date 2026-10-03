"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useId, useMemo, useState } from "react";
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
 * AQUÍ HABÍA `<details>/<summary>` NATIVOS. Funcionaban y no costaban un byte de JavaScript, pero
 * `<details>` abre de golpe: el navegador pasa el contenido de `display:none` a visible en un
 * fotograma y no hay forma de animar eso. El cliente pidió que el desplegado se animara "mucho más
 * bonito", así que la apertura pasa a ser estado de React y la altura la mide framer
 * (`height: "auto"`) — el mismo patrón ya probado en las fichas de denominación de /vinos.
 *
 * LO QUE NO SE PIERDE EN EL CAMBIO, que es la razón por la que estaba en `<details>`:
 *  · La respuesta sigue SIEMPRE en el HTML del servidor, plegada a altura cero y nunca desmontada.
 *    La leen los rastreadores (que es media razón de ser de este bloque) y la encuentra el Ctrl+F.
 *  · `visibility: hidden` al cerrar saca el panel plegado del orden de tabulación y de los lectores
 *    de pantalla; la altura cero por sí sola dejaría enlaces enfocables dentro de una caja invisible.
 *  · `button[aria-expanded][aria-controls]` + panel con `role="region"` es el patrón de divulgación
 *    de la WAI: mismo teclado (Intro/Espacio) y mismo anuncio que el `<summary>` que sustituye.
 *  · Con `prefers-reduced-motion` no hay recorrido ninguno: abre y cierra sin transición.
 *
 * Se pueden abrir VARIAS a la vez (un `Set`, no un índice). En dos columnas, abrir una pregunta y
 * ver cómo se cierra sola la de al lado es desconcertante; y a nadie le estorba tener dos abiertas.
 */
export default function Faq({ className }: { className?: string }) {
  const m = useMessages();
  const t = useFormat();
  const vars = useMemo(() => faqVars(m), [m]);
  const faq = m.legal.faq;

  const [abiertas, setAbiertas] = useState<ReadonlySet<string>>(() => new Set());
  const alternar = useCallback((clave: string) => {
    setAbiertas((previas) => {
      const siguiente = new Set(previas);
      if (!siguiente.delete(clave)) siguiente.add(clave);
      return siguiente;
    });
  }, []);

  return (
    <section aria-labelledby="faq-title" className={cn("relative", className)}>
      <h3 id="faq-title" data-reveal className="font-display text-3xl leading-none text-cream md:text-4xl">
        {faq.title}
      </h3>

      {/* `items-start`: sin él, la fila de la rejilla crece con la pregunta abierta y la tarjeta de al
          lado se estira hasta igualarla — un marco vacío de medio palmo junto a una respuesta corta. */}
      <ul className="mt-8 grid gap-3 md:mt-10 md:grid-cols-2 md:items-start md:gap-4">
        {faq.items.map((item) => {
          const question = t(item.q, vars);
          return (
            <Pregunta
              key={question}
              question={question}
              answer={t(item.a, vars)}
              abierta={abiertas.has(question)}
              onAlternar={() => alternar(question)}
            />
          );
        })}
      </ul>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   Una pregunta
   ────────────────────────────────────────────────────────────── */

interface PreguntaProps {
  question: string;
  answer: string;
  abierta: boolean;
  onAlternar: () => void;
}

/** Curva de la casa (`--ease-out-expo`), escrita también aquí porque framer no lee variables CSS. */
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function Pregunta({ question, answer, abierta, onAlternar }: PreguntaProps) {
  const reducido = useReducedMotion();
  const idPanel = useId();
  const idPregunta = useId();

  return (
    /* El `data-reveal` se queda en el `<li>` y NO en la tarjeta de dentro, y eso es a propósito: la
       regla de revelado de `globals.css` va sin `@layer`, así que su `transition` abreviada (opacidad,
       transform, clip-path) le gana en la cascada a cualquier `transition-*` de Tailwind puesta en el
       MISMO elemento. Con el atributo en la tarjeta, el cambio de borde y de fondo al abrir dejaba de
       transicionar y daba un salto. Separados, cada uno anima lo suyo. */
    <li data-reveal="fade">
      <div
        className={cn(
          "group/faq relative overflow-hidden rounded-2xl border transition-[border-color,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)]",
          abierta
            ? "border-cream/20 bg-granate-800/70 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)]"
            : "border-cream/10 bg-granate-900/70 hover:border-cream/25",
        )}
      >
        {/* Filo de brasa en el canto izquierdo: crece de arriba abajo al abrir. Es el único adorno de
            la animación, y va en un pseudo-elemento propio para que no herede el `overflow` del texto. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-px origin-top bg-gradient-to-b from-transparent via-pimenton-light/70 to-transparent transition-transform duration-[600ms] ease-[var(--ease-out-expo)]",
            abierta ? "scale-y-100" : "scale-y-0",
          )}
        />

        <h4 className="m-0">
          <button
            id={idPregunta}
            type="button"
            onClick={onAlternar}
            aria-expanded={abierta}
            aria-controls={idPanel}
            className="flex w-full cursor-pointer items-start justify-between gap-4 px-5 py-4 text-left font-sans text-[15px] font-semibold text-cream"
          >
            <span className="text-pretty">{question}</span>
            <Aspa abierta={abierta} />
          </button>
        </h4>

        {/*
          EL DESPLIEGUE, en dos tiempos a propósito: la altura abre la caja (0,44 s) y el texto entra
          un pelín después (0,08 s de retardo) deslizándose y aclarándose. Si el texto apareciera de
          golpe al terminar la altura se verían dos animaciones seguidas en vez de una sola.
        */}
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
            <span aria-hidden className="mb-3 block h-px bg-gradient-to-r from-cream/20 via-cream/5 to-transparent" />
            <p className="text-sm leading-relaxed text-cream-muted text-pretty">{answer}</p>
          </motion.div>
        </motion.div>
      </div>
    </li>
  );
}

/**
 * El signo de abrir: dos palos cruzados dentro de un disco. Al abrir, el palo vertical gira hasta
 * tumbarse sobre el horizontal y se encoge a cero — el "+" se desatornilla en un "−" en vez de
 * girar 45° y convertirse en una ×, que es el icono de CERRAR y no el de PLEGAR.
 *
 * Dos `<span>` y no un icono de lucide porque los dos palos tienen que animarse por separado.
 */
function Aspa({ abierta }: { abierta: boolean }) {
  const palo = "absolute h-[1.5px] w-3 rounded-full bg-pimenton-a11y transition-transform duration-[520ms] ease-[var(--ease-out-expo)]";
  return (
    <span
      aria-hidden
      className={cn(
        "relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-500",
        abierta ? "border-pimenton-light/60 bg-pimenton/20" : "border-cream/15 bg-cream/[0.04] group-hover/faq:border-cream/30",
      )}
    >
      <span className={palo} />
      <span className={cn(palo, abierta ? "rotate-180 scale-x-0" : "rotate-90")} />
    </span>
  );
}
