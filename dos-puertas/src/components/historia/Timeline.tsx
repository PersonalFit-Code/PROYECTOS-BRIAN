"use client";

import { useRef } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/cn";

/** Línea de tiempo completa. Móvil: una columna con el hilo a la izquierda. Escritorio: alterna lados. */
export default function Timeline() {
  const m = useMessages();
  const ref = useRef<HTMLOListElement>(null);
  useReveal(ref, 60);
  return (
    <ol ref={ref} className="container-page relative">
      <span aria-hidden className="absolute top-2 bottom-2 left-[calc(1rem+5px)] w-px bg-gradient-to-b from-oro/0 via-oro/40 to-oro/0 sm:left-[calc(1.5rem+5px)] lg:left-1/2" />
      {m.historia.timeline.map((h, i) => (
        <li key={h.title} data-reveal className={cn("relative pb-12 pl-8 lg:w-1/2 lg:pl-0", i % 2 ? "lg:ml-auto lg:pl-12" : "lg:pr-12 lg:text-right")}>
          <span
            aria-hidden
            className={cn("absolute top-2 left-0 size-[11px] rounded-full bg-oro ring-4 ring-botella", i % 2 ? "lg:-left-[5px]" : "lg:right-[-6px] lg:left-auto")}
          />
          <p className="font-condensed text-4xl leading-none tracking-wide text-gradient-marca">{h.year}</p>
          <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">{h.title}</h2>
          <p className={cn("mt-2 max-w-md text-[15px] leading-relaxed text-cream-muted", i % 2 ? "" : "lg:ml-auto")}>{h.text}</p>
        </li>
      ))}
    </ol>
  );
}
