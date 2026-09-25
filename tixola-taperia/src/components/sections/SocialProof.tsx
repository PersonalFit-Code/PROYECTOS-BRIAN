"use client";

import { useEffect, useRef } from "react";
import { motion, MotionConfig } from "framer-motion";
import { ArrowUpRight, Award, Flame, Star } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { REVIEWS, SOCIAL_STATS } from "@/data/reviews";
import Counter from "@/components/ui/Counter";
import ReviewCarousel, { PlatformGlyph, Stars } from "@/components/ui/ReviewCarousel";
import SectionHeading from "@/components/ui/SectionHeading";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { getGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Datos derivados
   ────────────────────────────────────────────────────────────── */

type SocialStat = (typeof SOCIAL_STATS)[number];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** SOCIAL_STATS es una unión de literales: normalizamos los campos opcionales. */
function statAffixes(stat: SocialStat) {
  return {
    prefix: "prefix" in stat ? stat.prefix : "",
    suffix: stat.suffix,
    decimals: "decimals" in stat ? stat.decimals : 0,
  };
}

/** Icono decorativo por indicador. */
function StatIcon({ id }: { id: SocialStat["id"] }) {
  const cls = "h-4 w-4";
  switch (id) {
    case "reviews":
      return <PlatformGlyph source="Google" className={cls} />;
    case "rating":
      return <Star className={cn(cls, "fill-gold text-gold")} aria-hidden />;
    case "rank":
      return <Flame className={cn(cls, "text-ember")} aria-hidden />;
    case "years":
      return <Award className={cn(cls, "text-[#34E0A1]")} aria-hidden />;
    default:
      return null;
  }
}

const fmtRating = (v: number) => v.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* ──────────────────────────────────────────────────────────────
   Brasas CSS (sin Canvas): posiciones pseudo-aleatorias deterministas
   ────────────────────────────────────────────────────────────── */

interface Ember {
  left: number;
  bottom: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  gold: boolean;
}

/** Generador determinista (LCG sencillo sobre el índice): nunca Math.random en render. */
function emberAt(i: number): Ember {
  const seed = (i * 9301 + 49297) % 233280;
  const r1 = seed / 233280;
  const r2 = ((seed * 7 + 13) % 233280) / 233280;
  const r3 = ((seed * 11 + 101) % 233280) / 233280;
  return {
    left: 4 + ((i * 37 + 11) % 92),
    bottom: 2 + Math.round(r1 * 26),
    size: 3 + Math.round(r2 * 4),
    delay: Number((r3 * 4).toFixed(2)),
    duration: Number((3.6 + r1 * 2.4).toFixed(2)),
    drift: Math.round((r2 - 0.5) * 60),
    gold: i % 3 === 0,
  };
}

function EmberField({ count }: { count: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]">
      {Array.from({ length: count }, (_, i) => {
        const e = emberAt(i);
        return (
          <span
            key={i}
            className={cn(
              "animate-ember-rise absolute block rounded-full will-change-transform",
              e.gold ? "bg-gold shadow-[0_0_10px_2px_rgba(232,194,122,0.7)]" : "bg-ember shadow-[0_0_10px_2px_rgba(255,106,61,0.75)]",
            )}
            style={{
              left: `${e.left}%`,
              bottom: `${e.bottom}%`,
              width: e.size,
              height: e.size,
              marginLeft: e.drift,
              animationDelay: `${e.delay}s`,
              animationDuration: `${e.duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Tarjeta de indicador
   ────────────────────────────────────────────────────────────── */

function StatTile({ stat, index }: { stat: SocialStat; index: number }) {
  const { prefix, suffix, decimals } = statAffixes(stat);
  return (
    <motion.li
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: EASE_OUT_EXPO }}
      className="glass group relative overflow-hidden rounded-3xl p-5 md:p-6"
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pimenton-light/60 to-transparent" />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-pimenton/30 blur-3xl transition-opacity duration-700 group-hover:opacity-100 md:opacity-60"
      />
      <div className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cream-faint">
        <StatIcon id={stat.id} />
        <span>{stat.sub}</span>
      </div>
      <div className="relative mt-3">
        <Counter
          value={stat.value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          delay={index * 0.12}
          className="text-5xl sm:text-6xl lg:text-7xl"
        />
      </div>
      <p className="relative mt-2 font-sans text-sm font-semibold text-cream md:text-[15px]">{stat.label}</p>
    </motion.li>
  );
}

/* ──────────────────────────────────────────────────────────────
   Sección
   ────────────────────────────────────────────────────────────── */

/**
 * SocialProof (#opiniones): cabecera, rejilla de 4 contadores en cristal, carrusel de opiniones
 * y enlaces a Google / TripAdvisor. Fondo de brasas (textura + puntos CSS animados).
 * Los elementos `data-reveal` de la cabecera se animan con GSAP ScrollTrigger una sola vez.
 */
export default function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const { tier } = usePerformanceTier();
  const emberCount = tier === "high" ? 14 : tier === "mid" ? 10 : 6;

  const google = BUSINESS.ratings.google;
  const trip = BUSINESS.ratings.tripadvisor;

  /* Reveal de la cabecera (GSAP). Se lee prefers-reduced-motion directamente para no depender de estado. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.from("[data-reveal]", {
        y: 28,
        opacity: 0,
        filter: "blur(6px)",
        duration: 1,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  const platforms = [
    {
      id: "google",
      source: "Google" as const,
      href: BUSINESS.social.googleReviews,
      cta: "Ver reseñas en Google",
      rating: google.value,
      meta: `${google.count.toLocaleString("es-ES")} reseñas`,
    },
    {
      id: "tripadvisor",
      source: "TripAdvisor" as const,
      href: BUSINESS.social.tripadvisor,
      cta: "Ver en TripAdvisor",
      rating: trip.value,
      meta: `${trip.award} · nº ${trip.rank} de ${trip.total}`,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="opiniones"
      className="noise after:noise-after relative isolate overflow-hidden bg-iron bg-[url('/textures/embers.webp')] bg-cover bg-bottom bg-no-repeat"
    >
      {/* Velo oscuro: opaco arriba (continúa la sección anterior), deja respirar las brasas abajo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-iron)_0%,rgba(18,18,18,0.96)_22%,rgba(18,18,18,0.86)_60%,rgba(18,18,18,0.7)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(178,30,39,0.35),transparent_70%)]"
      />
      <EmberField count={emberCount} />
      <div aria-hidden className="divider-iron absolute inset-x-0 top-0" />

      <div className="container-page relative py-20 md:py-28 lg:py-32">
        {/* Cabecera */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker="Prueba social"
            title="Lo dicen más de 850"
            accent="clientes"
            description={`${fmtRating(google.value)} ★ en Google con ${google.count.toLocaleString("es-ES")} reseñas y Travellers' Choice en TripAdvisor. Lo que se repite en todas: producto de la ría, tixolas de hierro que llegan chisporroteando y una terraza con la Catedral de fondo.`}
          />
          {/* Resumen de valoración */}
          <div data-reveal className="glass-red flex shrink-0 items-center gap-4 self-start rounded-2xl px-5 py-4 lg:self-end">
            <div className="font-condensed text-5xl leading-none text-cream text-3d">{fmtRating(google.value)}</div>
            <div className="flex flex-col gap-1">
              <Stars rating={google.value} size="sm" />
              <span className="text-xs text-cream-muted">
                Google · {google.count.toLocaleString("es-ES")} opiniones
              </span>
            </div>
          </div>
        </div>

        {/* Contadores */}
        <MotionConfig reducedMotion="user">
          <ul className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:gap-5 lg:grid-cols-4" aria-label="Cifras de Tixola">
            {SOCIAL_STATS.map((stat, i) => (
              <StatTile key={stat.id} stat={stat} index={i} />
            ))}
          </ul>
        </MotionConfig>

        {/* Carrusel */}
        <div className="mt-14 md:mt-20">
          <div className="mb-2 flex items-center justify-between px-1 md:mb-4">
            <h3 className="font-display text-2xl text-cream md:text-3xl">
              Palabra de <em className="text-gradient-ember italic">quien ya ha venido</em>
            </h3>
            <span className="hidden text-xs uppercase tracking-[0.22em] text-cream-faint md:inline">Desliza o usa las flechas</span>
          </div>
          <ReviewCarousel reviews={REVIEWS} />
        </div>

        {/* Enlaces a plataformas */}
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16" aria-label="Ver más opiniones">
          {platforms.map((p) => (
            <li key={p.id}>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-smoke group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-cream/25 hover:shadow-card md:p-5"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-iron/70 ring-1 ring-cream/10">
                  <PlatformGlyph source={p.source} className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-condensed text-2xl leading-none text-cream">{fmtRating(p.rating)}</span>
                    <Stars rating={p.rating} size="sm" />
                  </span>
                  <span className="mt-1 block truncate text-xs text-cream-faint">
                    {p.source} · {p.meta}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-cream-200 transition-colors group-hover:text-pimenton-light">
                  <span className="hidden sm:inline">{p.cta}</span>
                  <span className="sm:hidden">Ver</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
