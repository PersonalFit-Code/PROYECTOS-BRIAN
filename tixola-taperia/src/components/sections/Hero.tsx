"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowRight, CalendarCheck, ChevronDown, Euro, MapPin, Smartphone, Star } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import { useReservation } from "@/components/ui/ReservationProvider";
import HeroCanvas from "@/components/three/HeroCanvas";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { useIsMobile } from "@/hooks/useIsMobile";
import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Copy
   ────────────────────────────────────────────────────────────── */

const KICKER = "Tapería · Vinoteca · Ourense";
const ACCENT_WORD = "Corazón";
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** "10 € – 20 €" → "10‑20 €" (guion no separable). */
function formatPriceRange(range: string): string {
  const nums = range.match(/\d+/g);
  return nums && nums.length >= 2 ? `${nums[0]}‑${nums[1]} €` : range;
}

/* ──────────────────────────────────────────────────────────────
   Variantes Framer Motion
   ────────────────────────────────────────────────────────────── */

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

function itemVariants(reduced: boolean): Variants {
  if (reduced) return { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } };
  return {
    hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE_OUT_EXPO } },
  };
}

function wordVariants(reduced: boolean): Variants {
  if (reduced) return { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } };
  return {
    hidden: { opacity: 0, y: "0.6em", rotateX: -60 },
    show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
  };
}

/* ──────────────────────────────────────────────────────────────
   Titular palabra a palabra
   ────────────────────────────────────────────────────────────── */

function Headline({ text, reduced }: { text: string; reduced: boolean }) {
  const words = text.split(" ");
  const variants = wordVariants(reduced);
  return (
    <motion.h1
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }}
      className="font-display text-3d text-5xl leading-[1.02] tracking-tight text-cream text-balance sm:text-6xl lg:text-7xl [perspective:800px]"
    >
      {words.map((word, i) => {
        const accent = word === ACCENT_WORD;
        return (
          <motion.span
            key={`${word}-${i}`}
            variants={variants}
            className={cn(
              "inline-block origin-bottom [transform-style:preserve-3d] will-change-transform",
              accent && "text-gradient-ember italic [text-shadow:none] drop-shadow-[0_0_24px_rgba(255,106,61,0.35)] pr-[0.06em]",
            )}
          >
            {word}
            {i < words.length - 1 && <span aria-hidden>&nbsp;</span>}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}

/* ──────────────────────────────────────────────────────────────
   Hero
   ────────────────────────────────────────────────────────────── */

/**
 * Hero a pantalla completa: escena 3D de fondo (tixola, zamburiñas, brasas) + copy superpuesto.
 * - Parallax por ratón (escritorio) o giroscopio (móvil; en iOS con chip "Activar 3D").
 * - Entrada escalonada con Framer Motion y ligero parallax de scroll al salir.
 * - Layout "split" (copy izquierda / sartén derecha) a partir de lg; "stacked" en móvil.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const profile = usePerformanceTier();
  const framerReduced = useReducedMotion();
  const reduced = Boolean(framerReduced) || profile.reducedMotion;
  const stacked = useIsMobile(1024);
  const { open } = useReservation();
  const { pointer, needsGyroPermission, requestGyroPermission } = usePointerParallax({ enabled: !reduced });

  /* Parallax de scroll: el copy sube y se desvanece; el fondo se queda atrás. */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  const rating = BUSINESS.ratings.google.value.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const reviews = BUSINESS.ratings.google.count.toLocaleString("es-ES");
  const price = formatPriceRange(BUSINESS.priceRange);

  const pills = [
    { id: "rating", icon: <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />, label: `${rating} · ${reviews} reseñas en Google` },
    { id: "price", icon: <Euro className="h-3.5 w-3.5 text-cream-muted" aria-hidden />, label: `${price}/persona` },
    { id: "place", icon: <MapPin className="h-3.5 w-3.5 text-pimenton-light" aria-hidden />, label: "A 1 min de la Catedral", title: BUSINESS.address.landmark },
  ];

  const item = itemVariants(reduced);

  return (
    <section ref={sectionRef} id="hero" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-iron">
      {/* Fondo 3D (o fallback estático). aria-hidden dentro de HeroCanvas. */}
      <motion.div className="absolute inset-0 -z-10" style={reduced ? undefined : { y: canvasY, scale: canvasScale }}>
        <HeroCanvas profile={profile} pointer={pointer} layout={stacked ? "stacked" : "split"} />
      </motion.div>

      {/* Degradados de legibilidad: cabecera, pie (fundido con la siguiente sección) y lado del copy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(180deg,rgba(18,18,18,0.6)_0%,rgba(18,18,18,0)_28%,rgba(18,18,18,0)_55%,rgba(18,18,18,0.85)_82%,#121212_100%)] lg:bg-[linear-gradient(180deg,rgba(18,18,18,0.55)_0%,rgba(18,18,18,0)_25%,rgba(18,18,18,0)_75%,#121212_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] hidden bg-[linear-gradient(90deg,rgba(12,12,12,0.7)_0%,rgba(12,12,12,0.3)_42%,transparent_62%)] lg:block"
      />

      {/* Copy */}
      <motion.div
        className="container-page relative z-10 flex flex-1 flex-col justify-end pt-[calc(var(--header-h)+1.5rem)] pb-[calc(var(--mobile-bar-h)+4.5rem)] md:pb-28 lg:justify-center lg:py-[calc(var(--header-h)+2rem)]"
        style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto w-full max-w-[42rem] text-center lg:mx-0 lg:max-w-[46rem] lg:rounded-[2rem] lg:p-10 lg:text-left lg:glass-smoke xl:p-12"
        >
          <motion.p
            variants={item}
            className="mb-5 inline-flex items-center justify-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[0.32em] text-pimenton-a11y sm:text-xs lg:justify-start"
          >
            <span aria-hidden className="h-px w-8 bg-pimenton-light/70" />
            {KICKER}
            <span aria-hidden className="h-px w-8 bg-pimenton-light/70 lg:hidden" />
          </motion.p>

          <Headline text={BUSINESS.tagline} reduced={reduced} />

          <motion.p variants={item} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cream-muted text-pretty sm:text-lg lg:mx-0 lg:text-xl">
            {BUSINESS.subtitle}
          </motion.p>

          {/* Fila de confianza */}
          <motion.ul variants={item} aria-label="Datos destacados" className="mt-7 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {pills.map((p) => (
              <li
                key={p.id}
                title={p.title}
                className="glass inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 font-sans text-[13px] font-medium text-cream-200"
              >
                {p.icon}
                <span>{p.label}</span>
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div variants={item} className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <NeonButton variant="primary" size="lg" pulse onClick={open} icon={<CalendarCheck aria-hidden />} className="w-full sm:w-auto">
              Reservar Mesa
            </NeonButton>
            <NeonButton
              variant="outline"
              size="lg"
              href="/carta"
              iconRight={<ArrowRight aria-hidden />}
              className="w-full animate-neon-pulse sm:w-auto"
            >
              Ir a la Carta
            </NeonButton>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Chip "Activar 3D": solo en iOS 13+ (el giroscopio requiere un gesto) */}
      {needsGyroPermission && (
        <button
          type="button"
          onClick={() => void requestGyroPermission()}
          aria-label="Activar el efecto 3D con el giroscopio del móvil"
          className="glass absolute right-4 bottom-[calc(var(--mobile-bar-h)+1rem)] z-20 inline-flex h-11 items-center gap-2 rounded-full px-4 font-sans text-xs font-semibold text-cream-200 transition-colors hover:text-cream md:bottom-6"
        >
          <Smartphone className="h-4 w-4 text-pimenton-light" aria-hidden />
          Activar 3D
        </button>
      )}

      {/* Indicador de scroll (oculto en pantallas bajas) */}
      <motion.a
        href="#platos"
        aria-label="Desliza para ver los platos estrella"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute left-1/2 bottom-[calc(var(--mobile-bar-h)+1rem)] z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-cream-faint transition-colors hover:text-cream max-sm:hidden md:bottom-7 [@media(max-height:640px)]:hidden"
      >
        <span>Desliza</span>
        <motion.span
          aria-hidden
          animate={reduced ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-9 w-6 items-start justify-center rounded-full border border-cream/25 pt-1.5"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.a>
    </section>
  );
}
