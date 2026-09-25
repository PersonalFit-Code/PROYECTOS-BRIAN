"use client";

import { MotionConfig, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { STAR_DISHES, type StarDish } from "@/data/dishes";
import DishFlipCard from "@/components/ui/DishFlipCard";
import DishSpotlight, { dishSpotlightLayoutId } from "@/components/ui/DishSpotlight";
import NeonButton from "@/components/ui/NeonButton";
import { useReservation } from "@/components/ui/ReservationProvider";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { cn } from "@/lib/utils";

/**
 * StarDishes — módulo interactivo de platos estrella (#platos).
 *
 *  · Escritorio / tablet: rejilla de 4 tarjetas TiltCard + DishFlipCard con entrada
 *    escalonada (framer‑motion `whileInView`, una sola vez). Solo una tarjeta volteada a la vez.
 *  · Móvil: carrusel horizontal con scroll‑snap, indicadores de punto y desvanecido en los
 *    bordes; el toque abre DishSpotlight (bottom‑sheet con elemento compartido).
 *
 * Los efectos se escalan con usePerformanceTier(): en tier "low" no hay tilt ni vapor.
 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function StarDishes() {
  const { tier, reducedMotion } = usePerformanceTier();
  const { open: openReservation } = useReservation();

  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState<StarDish | null>(null);

  const steam = tier !== "low" && !reducedMotion;
  const tiltEnabled = tier !== "low";

  const toggleFlip = useCallback((id: string) => setFlippedId((prev) => (prev === id ? null : id)), []);
  const closeSpotlight = useCallback(() => setSpotlight(null), []);

  return (
    <section
      id="platos"
      className="noise after:noise-after relative overflow-hidden bg-iron bg-[url('/textures/iron.webp')] bg-cover bg-center"
    >
      {/* Capas de fondo: velo oscuro para legibilidad + brasa roja tras la rejilla */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-iron)_0%,rgba(18,18,18,0.88)_18%,rgba(18,18,18,0.86)_82%,var(--color-iron)_100%)]"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[56%] h-[80vw] max-h-[760px] w-[120vw] max-w-[1280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(178,30,39,0.34),rgba(178,30,39,0.1)_48%,transparent_100%)] blur-3xl"
      />
      <div aria-hidden className="divider-iron absolute inset-x-0 top-0" />
      <div aria-hidden className="divider-iron absolute inset-x-0 bottom-0" />

      <div className="container-page relative py-20 md:py-28 lg:py-32">
        <SectionHeading
          align="center"
          kicker="Platos estrella"
          title="Lo que nadie se va sin probar"
          accent="de Tixola"
          description="Producto gallego de la ría y del rural, marcado en nuestras tixolas de hierro hasta ese punto de brasa que solo da el hierro caliente. Cuatro platos que explican por qué la gente vuelve."
        />
        <MotionConfig reducedMotion="user">
          {/* Ambos layouts se renderizan siempre; el breakpoint CSS decide cuál se ve, así el
              SSR y la primera pintura en móvil ya coinciden con el layout final (sin DOM swap). */}
          <div className="hidden md:block">
            <DesktopGrid flippedId={flippedId} onToggle={toggleFlip} onReserve={openReservation} steam={steam} tilt={tiltEnabled} />
          </div>
          <div className="md:hidden">
            <MobileCarousel onOpen={setSpotlight} onReserve={openReservation} steam={steam} />
          </div>
        </MotionConfig>

        {/* CTA inferior, con las polaroids de la pizarra y la carta física como prueba tangible */}
        <div className="mt-12 flex flex-col items-center gap-6 md:mt-16">
          <MenuPolaroids />
          <div className="flex flex-col items-center gap-4 text-center">
            <NeonButton href="/carta" variant="cream" size="lg" iconRight={<ArrowRight aria-hidden />}>
              Ver carta completa con alérgenos
            </NeonButton>
            <p className="max-w-md text-xs leading-relaxed text-cream-faint">
              Más de 80 tapas, raciones y vinos gallegos, con los 14 alérgenos de la UE señalados plato a plato.
            </p>
          </div>
        </div>
      </div>

      {/* Zoom focal (móvil). Se monta en <body> por portal. */}
      <DishSpotlight dish={spotlight} onClose={closeSpotlight} onReserve={openReservation} steam={steam} />
    </section>
  );
}

/* ───────────────────────── Escritorio / tablet: rejilla ───────────────────────── */

interface DesktopGridProps {
  flippedId: string | null;
  onToggle: (id: string) => void;
  onReserve: () => void;
  steam: boolean;
  tilt: boolean;
}

function DesktopGrid({ flippedId, onToggle, onReserve, steam, tilt }: DesktopGridProps) {
  return (
    <ul className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-5" aria-label="Platos estrella">
      {STAR_DISHES.map((dish, i) => (
        <motion.li
          key={dish.id}
          initial={{ opacity: 0, y: 56, rotateX: 12 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, delay: i * 0.12, ease: EASE_OUT_EXPO }}
          style={{ transformPerspective: 1200 }}
          className={cn("list-none", flippedId === dish.id && "relative z-10")}
        >
          <TiltCard glowColor={dish.accent} disabled={!tilt} className="rounded-3xl" innerClassName="rounded-3xl">
            <DishFlipCard dish={dish} flipped={flippedId === dish.id} onToggle={() => onToggle(dish.id)} onReserve={onReserve} steam={steam} />
          </TiltCard>
        </motion.li>
      ))}
    </ul>
  );
}

/* ───────────────────────── Móvil: carrusel con snap ───────────────────────── */

interface MobileCarouselProps {
  onOpen: (dish: StarDish) => void;
  onReserve: () => void;
  steam: boolean;
}

function MobileCarousel({ onOpen, onReserve, steam }: MobileCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  // Índice activo a partir de qué tarjeta ocupa el centro del carril (IntersectionObserver, sin scroll listener)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = Array.from(track.children);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.index ?? 0);
          setActive(idx);
        }
      },
      { root: track, threshold: 0.6 },
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const scrollTo = useCallback((idx: number) => {
    const slide = trackRef.current?.children.item(idx);
    slide?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  return (
    <div className="relative mt-10">
      {/* desvanecido en los bordes del carril */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 -left-4 z-10 w-8 bg-gradient-to-r from-iron to-transparent sm:-left-6" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 -right-4 z-10 w-8 bg-gradient-to-l from-iron to-transparent sm:-right-6" />

      <ul
        ref={trackRef}
        aria-label="Platos estrella"
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-3 pt-2 sm:-mx-6 sm:scroll-px-6 sm:px-6"
      >
        {STAR_DISHES.map((dish, i) => (
          <motion.li
            key={dish.id}
            data-index={i}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: Math.min(i, 1) * 0.1, ease: EASE_OUT_EXPO }}
            className="w-[85vw] max-w-[380px] shrink-0 snap-center list-none"
          >
            <DishFlipCard
              mode="spotlight"
              layoutId={dishSpotlightLayoutId(dish.id)}
              dish={dish}
              flipped={false}
              onToggle={() => onOpen(dish)}
              onReserve={onReserve}
              steam={steam}
            />
          </motion.li>
        ))}
      </ul>

      {/* indicadores */}
      <div className="mt-3 flex items-center justify-center gap-2" role="group" aria-label="Ir a un plato">
        {STAR_DISHES.map((dish, i) => {
          const isActive = i === active;
          return (
            <button
              key={dish.id}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`${dish.name}${isActive ? " (actual)" : ""}`}
              aria-current={isActive ? "true" : undefined}
              className="flex h-11 w-8 items-center justify-center"
            >
              <span
                aria-hidden
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]",
                  isActive ? "w-7 bg-pimenton-light shadow-[0_0_12px_rgba(216,50,60,0.8)]" : "w-1.5 bg-cream/30",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── Polaroids: pizarra + carta física ───────────────────────── */

interface PolaroidSpec {
  src: string;
  alt: string;
  caption: string;
  rotate: string;
}

const MENU_POLAROIDS: PolaroidSpec[] = [
  { src: "/images/carta-pizarra.png", alt: "Pizarra del día de Tixola Tapería escrita con tiza", caption: "Pizarra del día", rotate: "-rotate-6" },
  { src: "/images/carta-fisica.png", alt: "Carta física impresa de Tixola Tapería", caption: "Carta física", rotate: "rotate-3" },
];

/** Par de polaroids decorativas (fotos reales de la carta) junto al CTA "Ver carta completa". */
function MenuPolaroids() {
  return (
    <ul className="flex items-start justify-center gap-4" aria-label="Fotos de la carta: pizarra del día y carta física">
      {MENU_POLAROIDS.map((p) => (
        <li key={p.src} className={cn("list-none", p.rotate)}>
          <figure className="group w-20 rounded-sm bg-cream p-1.5 pb-2 text-iron shadow-card transition-transform duration-500 ease-[var(--ease-out-expo)] hover:z-10 hover:scale-105 hover:rotate-0 sm:w-24">
            <span className="relative block aspect-square overflow-hidden rounded-[2px] bg-iron-800">
              <Image src={p.src} alt={p.alt} width={192} height={192} sizes="96px" className="h-full w-full object-cover" />
              <span
                aria-hidden
                className="absolute -top-1.5 left-1/2 h-3 w-10 -translate-x-1/2 -rotate-3 bg-cream-200/70 shadow-sm [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
              />
            </span>
            <figcaption className="mt-1.5 text-center font-display text-[10px] italic leading-none text-iron-800">{p.caption}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
