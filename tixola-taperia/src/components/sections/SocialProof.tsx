"use client";

import { motion, MotionConfig } from "framer-motion";
import { ArrowUpRight, Award, BadgeCheck, Flame, Star } from "lucide-react";
import { useMemo, useRef } from "react";
import Counter from "@/components/ui/Counter";
import PhotoGallery from "@/components/ui/PhotoGallery";
import { PlatformGlyph, Stars, type ReviewSource } from "@/components/ui/ReviewCard";
import ReviewMarquee from "@/components/ui/ReviewMarquee";
import SectionHeading from "@/components/ui/SectionHeading";
import { BUSINESS } from "@/data/business";
import { SOCIAL_STATS } from "@/data/reviews";
import { format } from "@/i18n/getMessages";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { LOCALE_META } from "@/i18n/config";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/types";
import { cn } from "@/lib/utils";

/**
 * SocialProof (#opiniones) — prueba social de Tixola.
 *  1. Cabecera (m.social.*) con el resumen de valoración de Google.
 *  2. Cuatro contadores en cristal (SOCIAL_STATS; etiquetas de m.social.stats).
 *  3. Columnas de reseñas reales de 5★ en marquee vertical (ReviewMarquee).
 *  4. Enlaces a Google / TripAdvisor con su nota.
 *  5. Galería de fotos del local (PhotoGallery) con visor.
 * Fondo: textura de brasas anclada abajo + brasas CSS con posiciones deterministas (sin Canvas).
 * Reveals con `data-reveal` (useScrollReveal, modo cinematográfico). Todo el texto sale de m.social / m.common.
 */

/* ──────────────────────────────────────────────────────────────
   Datos derivados
   ────────────────────────────────────────────────────────────── */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Forma normalizada de un indicador (SOCIAL_STATS es una unión de literales con campos opcionales). */
interface StatItem {
  id: string;
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
  /** Etiqueta y subtítulo localizados (con las etiquetas del fichero de datos como respaldo). */
  label: string;
  sub: string;
}

/** Etiquetas localizadas por id de indicador; un id desconocido cae a las etiquetas del fichero de datos. */
function statLabels(id: string, s: Messages["social"]["stats"]): { label: string; sub: string } | null {
  switch (id) {
    case "reviews":
      return { label: s.reviews, sub: s.reviewsSub };
    case "rating":
      return { label: s.rating, sub: s.ratingSub };
    case "rank":
      return { label: s.rank, sub: s.rankSub };
    case "years":
      return { label: s.position, sub: s.positionSub };
    default:
      return null;
  }
}

/** Icono decorativo por indicador. */
function StatIcon({ id }: { id: string }) {
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
      return <BadgeCheck className={cn(cls, "text-gold")} aria-hidden />;
  }
}

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

/** Generador determinista (LCG sencillo sobre el índice): nunca Math.random en render (SSR = cliente). */
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

function StatTile({ stat, index }: { stat: StatItem; index: number }) {
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
      <div className="relative flex items-center gap-2 font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">
        <StatIcon id={stat.id} />
        <span>{stat.sub}</span>
      </div>
      <div className="relative mt-3">
        <Counter
          value={stat.value}
          decimals={stat.decimals}
          prefix={stat.prefix}
          suffix={stat.suffix}
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

interface Platform {
  id: string;
  source: ReviewSource;
  href: string;
  cta: string;
  rating: number;
  meta: string;
}

export default function SocialProof() {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const { tier } = usePerformanceTier();
  useScrollReveal(sectionRef, { cinematic: true });

  const emberCount = tier === "high" ? 14 : tier === "mid" ? 10 : 6;
  const intl = LOCALE_META[locale].intl;
  const fmtRating = (v: number) => v.toLocaleString(intl, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmtInt = (v: number) => v.toLocaleString(intl);

  const google = BUSINESS.ratings.google;
  const trip = BUSINESS.ratings.tripadvisor;
  const s = m.social;
  const reviewCount = fmtInt(google.count);

  /* Indicadores normalizados con etiquetas localizadas. */
  const stats = useMemo<StatItem[]>(
    () =>
      SOCIAL_STATS.map((stat) => {
        const labels = statLabels(stat.id, s.stats);
        return {
          id: stat.id,
          value: stat.value,
          prefix: "prefix" in stat ? stat.prefix : "",
          suffix: stat.suffix,
          decimals: "decimals" in stat ? stat.decimals : 0,
          label: labels?.label ?? stat.label,
          /* `stats.ratingSub` lleva {count}: el número sale de BUSINESS.ratings, no del copy. */
          sub: format(labels?.sub ?? stat.sub, { count: reviewCount }),
        };
      }),
    [s.stats, reviewCount],
  );

  const platforms: Platform[] = [
    {
      id: "google",
      source: "Google",
      href: BUSINESS.social.googleReviews,
      cta: s.seeGoogle,
      rating: google.value,
      meta: t(s.platforms.reviews, { count: fmtInt(google.count) }),
    },
    {
      id: "tripadvisor",
      source: "TripAdvisor",
      href: BUSINESS.social.tripadvisor,
      cta: s.seeTripadvisor,
      rating: trip.value,
      meta: `${trip.award} · ${t(s.platforms.rank, { rank: trip.rank, total: trip.total })}`,
    },
  ];

  return (
    <section ref={sectionRef} id="opiniones" className="noise after:noise-after relative isolate overflow-hidden bg-iron">
      {/* Textura de brasas anclada abajo (con profundidad de capítulo) */}
      <div
        aria-hidden
        data-depth="0.25"
        className="absolute inset-x-0 -bottom-12 -z-20 h-[75%] bg-[url('/textures/embers.webp')] bg-cover bg-bottom bg-no-repeat"
      />
      {/* Velo oscuro: opaco arriba (continúa la sección anterior), deja respirar las brasas abajo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-iron)_0%,rgba(18,18,18,0.96)_22%,rgba(18,18,18,0.86)_60%,rgba(18,18,18,0.72)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(178,30,39,0.35),transparent_70%)]"
      />
      <EmberField count={emberCount} />
      <div aria-hidden className="divider-iron absolute inset-x-0 top-0" />

      <div className="container-page relative py-20 md:py-28 lg:py-32">
        {/* 1 · Cabecera */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker={s.kicker}
            /* "Lo dicen más de 850": el umbral se deriva del recuento real, redondeado a la baja. */
            title={t(s.title, { count: fmtInt(Math.floor(google.count / 50) * 50) })}
            accent={s.accent}
            description={t(s.description, { rating: fmtRating(google.value), count: fmtInt(google.count) })}
          />
          {/* Resumen de valoración */}
          <div data-reveal="fade" className="glass-red flex shrink-0 items-center gap-4 self-start rounded-2xl px-5 py-4 lg:self-end">
            <div className="font-condensed text-5xl leading-none text-cream text-3d">{fmtRating(google.value)}</div>
            <div className="flex flex-col gap-1">
              <Stars rating={google.value} size="sm" />
              <span className="text-xs text-cream-muted">{t(s.ratingSummary, { count: fmtInt(google.count) })}</span>
            </div>
          </div>
        </div>

        {/* 2 · Contadores */}
        <MotionConfig reducedMotion="user">
          <ul className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:gap-5 lg:grid-cols-4" aria-label={s.statsAria}>
            {stats.map((stat, i) => (
              <StatTile key={stat.id} stat={stat} index={i} />
            ))}
          </ul>
        </MotionConfig>

        {/* 3 · Columnas de reseñas */}
        <div className="mt-16 md:mt-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h3 data-reveal className="font-display text-3xl leading-none text-cream md:text-4xl">
                {s.reviewsTitle} <em className="text-gradient-ember italic">{s.reviewsAccent}</em>
              </h3>
              <p data-reveal="fade" className="mt-3 text-sm leading-relaxed text-cream-muted text-pretty">
                {s.reviewsNote}
              </p>
            </div>
            <div data-reveal="fade" className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cream/15 bg-iron-900/60 px-3 font-caps text-[10px] uppercase tracking-[0.22em] text-cream-200">
                <BadgeCheck className="h-3.5 w-3.5 text-gold" aria-hidden />
                {s.realReviews}
              </span>
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 font-caps text-[10px] uppercase tracking-[0.22em] text-gold">
                <Star className="h-3.5 w-3.5 fill-gold" aria-hidden />
                {s.fiveStars}
              </span>
              {/* Solo tiene sentido con ratón: md+ y puntero fino */}
              <span className="hidden font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint md:pointer-fine:inline">
                {s.pauseHint}
              </span>
            </div>
          </div>
          <ReviewMarquee className="mt-8 md:mt-10" />
        </div>

        {/* 4 · Enlaces a plataformas */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14" aria-label={s.platforms.aria}>
          {platforms.map((p) => (
            <li key={p.id} data-reveal>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${p.cta} · ${p.source} ${fmtRating(p.rating)} · ${p.meta} · ${m.common.misc.newTab}`}
                className="glass-smoke group flex min-h-[72px] items-center gap-4 rounded-2xl p-4 transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-cream/25 hover:shadow-card md:p-5"
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
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-cream-200 transition-colors group-hover:text-pimenton-a11y">
                  <span className="hidden sm:inline">{p.cta}</span>
                  <span className="sm:hidden">{s.platforms.see}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* 5 · Galería de fotos */}
        <div aria-hidden className="divider-iron mt-16 md:mt-24" />
        <PhotoGallery className="mt-12 md:mt-16" />
      </div>
    </section>
  );
}
