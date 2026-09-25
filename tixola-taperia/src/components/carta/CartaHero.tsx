"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * CartaHero — cabecera de la página /carta.
 *
 * Kicker "Carta digital", h1 "La Carta de Tixola", descripción y dos polaroids inclinadas con
 * las fotos reales de la pizarra del día y de la carta física. En escritorio las polaroids
 * flotan suavemente (desactivado con `animate=false`: tier "low" / reduced motion).
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
  delay: number;
}

const POLAROIDS: Polaroid[] = [
  {
    src: "/images/carta-pizarra.png",
    alt: "Pizarra del día de Tixola Tapería escrita con tiza",
    caption: "Pizarra del día",
    rotate: "-rotate-6",
    offset: "lg:-translate-y-2",
    delay: 0,
  },
  {
    src: "/images/carta-fisica.png",
    alt: "Carta física impresa de Tixola Tapería",
    caption: "Carta física",
    rotate: "rotate-3",
    offset: "lg:translate-y-6",
    delay: 0.15,
  },
];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function CartaHero({ animate = true, className }: CartaHeroProps) {
  return (
    <div className={cn("relative grid gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-20", className)}>
      {/* Brasa de fondo tras el titular */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 -z-10 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(178,30,39,0.35),rgba(178,30,39,0.08)_55%,transparent_100%)] blur-2xl"
      />

      <SectionHeading
        as="h1"
        kicker="Carta digital"
        title="La Carta"
        accent="de Tixola"
        description="Filtra por categoría, alérgenos y opciones veganas o sin gluten. Precios orientativos, IVA incluido."
      />

      {/* Polaroids */}
      <ul className="carta-no-print flex items-start justify-start gap-5 lg:justify-end lg:pr-6" aria-label="Fotos de la carta">
        {POLAROIDS.map((p, i) => (
          <motion.li
            key={p.src}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 + p.delay, ease: EASE_OUT_EXPO }}
            className={cn("list-none", p.offset)}
          >
            <figure
              className={cn(
                "group w-[132px] rounded-sm bg-cream p-2 pb-3 text-iron shadow-card transition-transform duration-500 ease-[var(--ease-out-expo)] hover:z-10 hover:scale-105 hover:rotate-0 md:w-[150px]",
                p.rotate,
                animate && "motion-safe:animate-float",
              )}
              style={animate ? { animationDelay: `${i * 1.6}s`, animationDuration: "7s" } : undefined}
            >
              <span className="relative block aspect-square overflow-hidden rounded-[2px] bg-iron-800">
                <Image src={p.src} alt={p.alt} width={336} height={336} sizes="150px" className="h-full w-full object-cover" priority={i === 0} />
                {/* Cinta adhesiva */}
                <span
                  aria-hidden
                  className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 -rotate-3 bg-cream-200/70 shadow-sm [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
                />
              </span>
              <figcaption className="mt-2 text-center font-display text-[13px] italic leading-none text-iron-800">{p.caption}</figcaption>
            </figure>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
