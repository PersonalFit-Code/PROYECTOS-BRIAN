"use client";

import Image from "next/image";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * CartaHero — cabecera editorial de la página /carta.
 *
 * Kicker en Cinzel, h1 "La Carta *de Tixola*" en Cormorant Garamond con acento en cursiva
 * degradada, descripción y, a la derecha, dos polaroids pequeñas con las fotos reales de la pizarra
 * del día y de la carta física. En escritorio las polaroids flotan suavemente (desactivado con
 * `animate=false`: tier "low" / reduced motion). Sin animación de entrada: el HTML estático ya las
 * pinta (mejor LCP) y el cambio fallback → cliente no parpadea.
 */

export interface CartaHeroProps {
  /** animación de flotación de las polaroids */
  animate?: boolean;
  className?: string;
}

interface Polaroid {
  src: string;
  alt: string;
  caption: string;
  rotate: string;
  offset: string;
}

export default function CartaHero({ animate = true, className }: CartaHeroProps) {
  const m = useMessages();

  const polaroids: Polaroid[] = [
    { src: "/images/carta-pizarra.png", alt: m.carta.dailyBoardAlt, caption: m.carta.dailyBoard, rotate: "-rotate-6", offset: "lg:-translate-y-2" },
    { src: "/images/carta-fisica.png", alt: m.carta.physicalMenuAlt, caption: m.carta.physicalMenu, rotate: "rotate-3", offset: "lg:translate-y-6" },
  ];

  return (
    <div className={cn("relative grid gap-8 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-16", className)}>
      {/* Brasa de fondo tras el titular */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 -z-10 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(178,30,39,0.35),rgba(178,30,39,0.08)_55%,transparent_100%)] blur-2xl"
      />

      <div className="max-w-3xl">
        <p className="inline-flex items-center gap-3 font-caps text-xs uppercase tracking-[0.3em] text-pimenton-a11y">
          <span aria-hidden className="h-px w-8 bg-pimenton-light/70" />
          {m.carta.kicker}
        </p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cream text-balance md:text-6xl lg:text-7xl">
          {m.carta.title} <em className="text-gradient-ember font-light italic">{m.carta.accent}</em>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-muted text-pretty md:text-lg">{m.carta.description}</p>
      </div>

      {/* Polaroids */}
      <ul className="flex items-start justify-start gap-5 lg:justify-end lg:pr-6" aria-label={m.carta.polaroidsAria}>
        {polaroids.map((p, i) => (
          <li key={p.src} className={cn("list-none", p.offset)}>
            <figure
              className={cn(
                "group w-[124px] rounded-sm bg-cream p-2 pb-3 text-iron shadow-card transition-transform duration-500 ease-[var(--ease-out-expo)] hover:z-10 hover:rotate-0 hover:scale-105 md:w-[140px]",
                p.rotate,
                animate && "motion-safe:animate-float",
              )}
              style={animate ? { animationDelay: `${i * 1.6}s`, animationDuration: "7s" } : undefined}
            >
              <span className="relative block aspect-square overflow-hidden rounded-[2px] bg-iron-800">
                <Image src={p.src} alt={p.alt} width={336} height={336} sizes="140px" className="h-full w-full object-cover" priority={i === 0} />
                {/* Cinta adhesiva */}
                <span
                  aria-hidden
                  className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 -rotate-3 bg-cream-200/70 shadow-sm [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
                />
              </span>
              <figcaption className="mt-2 text-center font-display text-[13px] italic leading-none text-iron-800">{p.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
