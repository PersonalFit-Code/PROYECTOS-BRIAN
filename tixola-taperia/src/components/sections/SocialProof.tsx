"use client";

import { ArrowUpRight, BadgeCheck, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useRef, type CSSProperties } from "react";
import Counter from "@/components/ui/Counter";
import Faq from "@/components/sections/Faq";
import { PlatformGlyph, Stars, type ReviewSource } from "@/components/ui/ReviewCard";
import ReviewMarquee from "@/components/ui/ReviewMarquee";
import SectionHeading from "@/components/ui/SectionHeading";
import { BUSINESS } from "@/data/business";
import { formatNumber } from "@/lib/format";
import { SOCIAL_STATS } from "@/data/reviews";
import { format } from "@/i18n/getMessages";
import { useInView, useInViewOnce } from "@/hooks/useInViewOnce";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/types";
import { cn } from "@/lib/utils";

/**
 * SocialProof (#opiniones) — prueba social de Tixola.
 *  1. Cabecera (m.social.*) con el resumen de valoración de Google.
 *  2. Banda editorial "en cifras": cuatro contadores a pelo sobre el hierro, separados por filos
 *     (SOCIAL_STATS; etiquetas de m.social.stats). Sin tarjetas: el cliente no quería "cuadrados".
 *  3. Columnas de reseñas reales de 5★ en marquee vertical (ReviewMarquee).
 *  4. Enlaces a Google / TripAdvisor con su nota.
 *  5. Galería de fotos del local (PhotoGallery) con visor.
 *  6. Preguntas frecuentes (Faq): la cara visible del FAQPage que emite HomeJsonLd.
 * Fondo: textura de brasas anclada abajo + brasas CSS con posiciones deterministas (sin Canvas).
 * Reveals con `data-reveal` (CSS + observador; sin Framer Motion en esta sección). Todo el texto sale de
 * m.social / m.common.
 */

/* ──────────────────────────────────────────────────────────────
   Datos derivados
   ────────────────────────────────────────────────────────────── */

/**
 * La galería se lleva Embla + Autoplay (~25-30 KB gz) a un chunk aparte y NO se descarga hasta que el
 * visitante se acerca: está en la mitad baja de la sección de opiniones, muy por debajo del pliegue, y
 * hasta ahora entraba en el arranque de la portada compitiendo con ella.
 */
const PhotoGallery = dynamic(() => import("@/components/ui/PhotoGallery"), { ssr: false });

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

/**
 * Brasas CSS del fondo. Se paran cuando la sección no está en pantalla (igual que la marquesina de
 * Experiencia, las columnas de reseñas o las escenas R3F): si no, mantendrían 14 capas de
 * composición vivas y al compositor trabajando mientras el usuario está en la portada o en el pie.
 */
function EmberField({ count, paused }: { count: number; paused: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]">
      {Array.from({ length: count }, (_, i) => {
        const e = emberAt(i);
        return (
          <span
            key={i}
            className={cn(
              "animate-ember-rise absolute block rounded-full",
              /* `will-change` atado a la pausa: antes quedaban catorce brasas promovidas a capa GPU
                 durante TODA la sesión, también mientras el visitante estaba en la portada o en el pie
                 con la animación parada. Promocionar una capa que no se mueve solo gasta memoria. */
              !paused && "will-change-transform",
              e.gold ? "bg-gold shadow-[0_0_10px_2px_rgba(232,194,122,0.7)]" : "bg-ember shadow-[0_0_10px_2px_rgba(255,106,61,0.75)]",
              paused && "[animation-play-state:paused]",
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
   Cifra de la banda editorial
   ────────────────────────────────────────────────────────────── */

/**
 * Una cifra de la banda "en cifras". Sin caja: ni fondo, ni borde redondeado, ni sombra, ni cristal.
 * Solo el kicker con la fuente en versalitas, el número enorme en Bebas Neue y la etiqueta debajo,
 * como la doble página "en cifras" de una revista de gastronomía. Lo único que separa una cifra de la
 * siguiente son filos de un píxel en `cream/10`.
 *
 * Los filos van como bordes del propio <li> y dependen de la posición en la rejilla:
 *  - Móvil (2 × 2): la segunda columna lleva filo izquierdo y la segunda fila filo superior.
 *  - Escritorio (1 × 4): todas menos la primera llevan filo izquierdo; el superior desaparece.
 */
function StatFigure({ stat, index }: { stat: StatItem; index: number }) {
  const secondColumn = index % 2 === 1;
  const secondRow = index >= 2;
  return (
    /* Entrada escalonada en CSS (`--reveal-delay`) en vez de `whileInView`: Framer escribía opacidad y
       transform en las cuatro cifras durante el scroll, con los cuatro contadores animando a la vez. */
    <li
      data-reveal
      className={cn(
        "flex flex-col items-center px-3 py-7 text-center sm:px-5 md:py-9 lg:px-6",
        /* Solo el color: el lado que se pinta lo decide la posición en la rejilla */
        "border-cream/10",
        secondColumn && "border-l",
        secondRow && "max-lg:border-t",
        /* En una fila de cuatro, la tercera cifra también necesita filo a su izquierda */
        index === 2 && "lg:border-l",
      )}
      style={{ "--reveal-delay": `${index * 80}ms` } as CSSProperties}
    >
      {/* Kicker: la fuente del dato (Google, TripAdvisor…) en versalitas pequeñas */}
      <span className="font-caps text-[10px] uppercase tracking-[0.24em] text-cream-faint">{stat.sub}</span>
      <div className="mt-4">
        <Counter
          value={stat.value}
          decimals={stat.decimals}
          prefix={stat.prefix}
          suffix={stat.suffix}
          delay={index * 0.12}
          /* Tamaños medidos para que "4,4 / 5" quepa en media pantalla de 390 px y en un cuarto de 1024 */
          className="text-5xl sm:text-6xl xl:text-7xl"
        />
      </div>
      <p className="mt-3 max-w-[16ch] font-sans text-sm font-semibold leading-snug text-cream text-balance md:text-[15px]">
        {stat.label}
      </p>
    </li>
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
  const galleryRef = useRef<HTMLDivElement>(null);
  const { tier } = usePerformanceTier();
  const inView = useInView(sectionRef, { amount: 0 });
  /* La galería se monta (y por tanto se descarga) al acercarse, con un margen generoso para que el
     chunk llegue antes de que el hueco esté en pantalla. */
  const galleryNear = useInViewOnce(galleryRef, { rootMargin: "600px 0px" });
  useScrollReveal(sectionRef, { cinematic: true });

  const emberCount = tier === "high" ? 14 : tier === "mid" ? 10 : 6;
  const fmtRating = (v: number) => formatNumber(v, locale, { decimals: 1 });
  const fmtInt = (v: number) => formatNumber(v, locale);

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
    <section ref={sectionRef} id="opiniones" className="noise after:noise-after relative isolate overflow-hidden bg-granate">
      {/* Textura de brasas anclada abajo (con profundidad de capítulo) */}
      <div
        aria-hidden
        data-depth="0.25"
        className="absolute inset-x-0 -bottom-12 -z-20 h-[75%] bg-[url('/textures/embers.webp')] bg-cover bg-bottom bg-no-repeat"
      />
      {/* Velo oscuro: opaco arriba (continúa la sección anterior), deja respirar las brasas abajo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-granate)_0%,rgba(59,22,19,0.96)_22%,rgba(59,22,19,0.86)_60%,rgba(59,22,19,0.72)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(158,22,24,0.35),transparent_70%)]"
      />
      <EmberField count={emberCount} paused={!inView} />
      <div aria-hidden className="divider-granate absolute inset-x-0 top-0" />

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
          {/* Resumen de valoración: la cifra grande, las estrellas y la fuente, sueltos sobre el hierro.
              Aquí hubo una caja `glass-red` redondeada, y el cliente fue literal: "un cuadrado con la
              información dentro no me convence". Las cuatro cifras de la banda de abajo ya perdieron sus
              tarjetas por lo mismo; este resumen era el último cuadrado de la sección. Mismo lenguaje que
              esa banda: cifra en condensada con relieve, texto pequeño en mayúsculas, ninguna superficie. */}
          <div data-reveal="fade" className="flex shrink-0 items-center gap-4 self-start lg:self-end">
            <div className="font-condensed text-6xl leading-none text-cream text-3d">{fmtRating(google.value)}</div>
            <div className="flex flex-col gap-1.5">
              <Stars rating={google.value} size="sm" />
              <span className="font-caps text-[10px] uppercase tracking-[0.22em] text-cream-muted">
                {t(s.ratingSummary, { count: fmtInt(google.count) })}
              </span>
            </div>
          </div>
        </div>

        {/* 2 · Banda editorial "en cifras": regla fina arriba (con la palabra centrada) y abajo, y las
            cuatro cifras entre medias, directamente sobre el hierro. Sin cajas ni cristal. */}
        <div className="mt-12 md:mt-16">
          <div data-reveal="fade" className="flex items-center gap-4">
            <span aria-hidden className="h-px flex-1 bg-cream/15" />
            {/* La palabra es puro adorno de maqueta: la lista ya se anuncia con `statsAria` */}
            <span aria-hidden className="font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">
              {s.statsTitle}
            </span>
            <span aria-hidden className="h-px flex-1 bg-cream/15" />
          </div>
          <ul className="grid grid-cols-2 lg:grid-cols-4" aria-label={s.statsAria}>
            {stats.map((stat, i) => (
              <StatFigure key={stat.id} stat={stat} index={i} />
            ))}
          </ul>
          <div data-reveal="fade" aria-hidden className="h-px bg-cream/15" />
        </div>

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
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cream/15 bg-granate-900/60 px-3 font-caps text-[10px] uppercase tracking-[0.22em] text-cream-200">
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
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-granate/70 ring-1 ring-cream/10">
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

        {/* 5 · Galería de fotos. El hueco se reserva por CSS para que el montaje diferido no desplace las
            preguntas frecuentes ni invalide los disparadores de scroll de más abajo. */}
        <div aria-hidden className="divider-granate mt-16 md:mt-24" />
        <div ref={galleryRef} className="mt-12 min-h-[400px] md:mt-16 md:min-h-[500px] lg:min-h-[580px]">
          {galleryNear && <PhotoGallery />}
        </div>

        {/* 6 · Preguntas frecuentes (mismo texto que el FAQPage de HomeJsonLd) */}
        <div aria-hidden className="divider-granate mt-16 md:mt-24" />
        <Faq className="mt-12 md:mt-16" />
      </div>
    </section>
  );
}
