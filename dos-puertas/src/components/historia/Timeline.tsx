"use client";

import Image from "next/image";
import { useRef } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { PHOTOS, type PhotoId } from "@/data/photos";
import { cn } from "@/lib/cn";

function Foto({ id, alignEnd }: { id: PhotoId; alignEnd: boolean }) {
  const m = useMessages();
  const t = m.historia.photos[id];
  const photo = PHOTOS[id];
  return (
    <figure className={cn("mt-5 max-w-md", alignEnd && "lg:ml-auto")}>
      <div className="overflow-hidden rounded-2xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] ring-1 ring-cream/10">
        <Image
          src={photo.src}
          alt={t.alt}
          placeholder="blur"
          sizes="(min-width: 1024px) 448px, 100vw"
          className={cn("h-auto w-full", id === "anos70" && "[filter:sepia(0.35)_contrast(1.05)_brightness(0.95)]")}
        />
      </div>
      <figcaption className="mt-2.5 text-[13px] leading-snug text-cream-muted">
        {t.caption}{" "}
        {photo.href ? (
          <a href={photo.href} target="_blank" rel="noopener noreferrer" className="text-cream-faint underline underline-offset-2 hover:text-cream">
            {t.credit}
          </a>
        ) : (
          <span className="text-cream-faint">{t.credit}</span>
        )}
      </figcaption>
    </figure>
  );
}

/** Línea de tiempo completa. Móvil: una columna con el hilo a la izquierda. Escritorio: alterna lados. */
export default function Timeline() {
  const m = useMessages();
  const ref = useRef<HTMLOListElement>(null);
  useReveal(ref, 60);
  return (
    <ol ref={ref} className="container-page relative">
      <span aria-hidden className="absolute top-2 bottom-2 left-[calc(1rem+5px)] w-px bg-gradient-to-b from-oro/0 via-oro/40 to-oro/0 sm:left-[calc(1.5rem+5px)] lg:left-1/2" />
      {m.historia.timeline.map((h, i) => {
        const left = i % 2 === 0;
        return (
          <li key={h.title} data-reveal className={cn("relative pb-12 pl-8 lg:w-1/2 lg:pl-0", left ? "lg:pr-12 lg:text-right" : "lg:ml-auto lg:pl-12")}>
            <span
              aria-hidden
              className={cn("absolute top-2 left-0 size-[11px] rounded-full bg-oro ring-4 ring-botella", left ? "lg:right-[-6px] lg:left-auto" : "lg:-left-[5px]")}
            />
            <p className="font-condensed text-4xl leading-none tracking-wide text-gradient-marca">{h.year}</p>
            <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">{h.title}</h2>
            <p className={cn("mt-2 max-w-md text-[15px] leading-relaxed text-cream-muted", left && "lg:ml-auto")}>{h.text}</p>
            {"photo" in h && h.photo ? <Foto id={h.photo} alignEnd={left} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
