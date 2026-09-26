"use client";

import { useRef, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CalendarCheck, Smartphone, Star } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import { useReservation } from "@/components/ui/ReservationProvider";
import HeroCanvas from "@/components/three/HeroCanvas";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { useIsMobile } from "@/hooks/useIsMobile";
import { BUSINESS } from "@/data/business";
import { formatNumber } from "@/lib/format";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Tiempos de la coreografía de entrada
   ────────────────────────────────────────────────────────────── */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** Retardo antes de la primera línea del titular (deja respirar al lienzo 3D). */
const LINE_DELAY = 0.25;
/** Escalonado entre líneas del titular. */
const LINE_STAGGER = 0.12;
/** Duración del reveal de cada línea. */
const LINE_DURATION = 0.9;

/* ──────────────────────────────────────────────────────────────
   Titular editorial: reveal línea a línea con máscara
   ────────────────────────────────────────────────────────────── */

interface HeadlineProps {
  lines: readonly string[];
  /** Palabra que se resalta en cursiva con degradado de brasa. */
  accent: string;
  /** Titular completo para tecnologías de asistencia (las líneas visuales van aria-hidden). */
  fullTitle: string;
  reduced: boolean;
}

/** Palabra a palabra: la palabra acentuada va en cursiva con `text-gradient-ember`. */
function LineWords({ text, accent }: { text: string; accent: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => {
        const isAccent = word.localeCompare(accent, undefined, { sensitivity: "base" }) === 0;
        return (
          <span key={`${word}-${i}`}>
            {isAccent ? (
              <em className="text-gradient-ember pr-[0.05em] font-normal italic">{word}</em>
            ) : (
              word
            )}
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </>
  );
}

/**
 * H1 de portada: cada línea vive dentro de una máscara (`overflow-hidden`) y entra deslizándose
 * desde abajo (y: 110% → 0) con easing expo y escalonado de 0,12 s. Con `prefers-reduced-motion`
 * solo se funde. Máximo 3 líneas, definidas en `m.hero.titleLines` para controlar la composición.
 */
function Headline({ lines, accent, fullTitle, reduced }: HeadlineProps) {
  const visible = lines.slice(0, 3);
  return (
    <h1
      aria-label={fullTitle}
      className={cn(
        "font-display font-medium text-cream lg:font-normal",
        "text-[clamp(2.6rem,11vw,3.6rem)] leading-[0.92] tracking-[-0.01em] lg:text-[clamp(3.2rem,8vw,7.5rem)]",
      )}
    >
      {visible.map((line, i) => (
        <span
          key={line}
          aria-hidden
          /* La máscara deja un pequeño margen inferior/lateral para no recortar descendentes ni la cursiva */
          className="-mx-[0.08em] -mb-[0.1em] block overflow-hidden px-[0.08em] pb-[0.1em]"
        >
          <motion.span
            className="block will-change-transform"
            initial={reduced ? { opacity: 0 } : { y: "110%" }}
            animate={reduced ? { opacity: 1 } : { y: "0%" }}
            transition={
              reduced
                ? { duration: 0.5, delay: LINE_DELAY + i * 0.08 }
                : { duration: LINE_DURATION, ease: EASE_OUT_EXPO, delay: LINE_DELAY + i * LINE_STAGGER }
            }
          >
            <LineWords text={line} accent={accent} />
            {/* Espacio final: el `textContent` del h1 que leen los rastreadores queda como una frase
                ("El Arte del Tapeo en el Corazón de Ourense"), no como líneas pegadas. Al ser un
                espacio al final de la línea, el navegador lo colapsa y no altera la composición. */}
            {i < visible.length - 1 ? " " : null}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/* ──────────────────────────────────────────────────────────────
   Parallax de scroll (SOLO como alternativa a la transición GSAP)
   ────────────────────────────────────────────────────────────── */

interface HeroParallaxProps {
  target: RefObject<HTMLElement | null>;
  variant: "copy" | "canvas";
  className?: string;
  children: ReactNode;
}

/**
 * Parallax propio de la portada. Vive en un componente aparte porque `HeroTransition` (tier mid/high)
 * ancla `#hero` y anima los MISMOS contenedores con GSAP en sentido contrario: si ambos actuaran a la
 * vez, el copy se movería −160 px (GSAP) y +120 px (framer) y su opacidad se multiplicaría por dos
 * fundidos. Montándolo solo cuando GSAP no se hace cargo, tampoco se registra un segundo listener de
 * scroll ni se escriben estilos por fotograma durante el tramo más caro de la página (lienzo
 * anclado + Lenis + scrub).
 */
function HeroScrollParallax({ target, variant, className, children }: HeroParallaxProps) {
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <motion.div className={className} style={variant === "copy" ? { y: copyY, opacity: copyOpacity } : { y: canvasY, scale: canvasScale }}>
      {children}
    </motion.div>
  );
}

/**
 * Capa interior del hero: con parallax propio o, si GSAP manda, un simple contenedor estático.
 * El caso estático es el que sale del servidor, así que en tier mid/high (donde manda GSAP) el árbol
 * no cambia al hidratar y ni el lienzo ni la coreografía del titular se vuelven a montar.
 */
function HeroLayer({ parallax, ...props }: HeroParallaxProps & { parallax: boolean }) {
  if (parallax) return <HeroScrollParallax {...props} />;
  return <div className={props.className}>{props.children}</div>;
}

/** `true` solo tras la hidratación; `false` en el servidor (donde el perfil siempre es "low"). */
const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

/* ──────────────────────────────────────────────────────────────
   Indicador de scroll (vertical, esquina inferior derecha)
   ────────────────────────────────────────────────────────────── */

function ScrollCue({ href, label, aria, reduced }: { href: string; label: string; aria: string; reduced: boolean }) {
  return (
    <motion.a
      href={href}
      aria-label={aria}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.8 }}
      className={cn(
        /* Solo en el tramo md→lg: a partir de lg el carril derecho lo ocupa <ChapterNav /> (puntos
           + etiqueta activa), que se pintaría justo encima de esta etiqueta vertical. */
        "group absolute bottom-8 right-5 z-20 hidden flex-col items-center gap-4 md:flex lg:hidden",
        "[@media(max-height:640px)]:hidden",
      )}
    >
      <span className="font-caps text-[10px] uppercase tracking-[0.3em] text-cream-faint transition-colors duration-300 [writing-mode:vertical-rl] group-hover:text-cream">
        {label}
      </span>
      {/* Línea de 1 px que se rellena de arriba abajo en bucle */}
      <span aria-hidden className="relative h-16 w-px overflow-hidden bg-cream/15">
        <motion.span
          className="absolute inset-x-0 top-0 h-full origin-top bg-cream"
          animate={reduced ? { scaleY: 1 } : { scaleY: [0, 1, 1], opacity: [0.9, 0.9, 0], y: ["0%", "0%", "100%"] }}
          transition={reduced ? undefined : { duration: 2.2, times: [0, 0.55, 1], repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
        />
      </span>
    </motion.a>
  );
}

/* ──────────────────────────────────────────────────────────────
   Hero
   ────────────────────────────────────────────────────────────── */

/**
 * Portada a pantalla completa con criterio editorial (portada de revista):
 *  - Escena 3D de fondo (tixola, zamburiñas, brasas) con parallax por ratón / giroscopio.
 *    En escritorio la sartén ocupa la mitad derecha y asoma ligeramente detrás del titular;
 *    en móvil ocupa el 45 % superior y el copy va abajo, alineado a la izquierda.
 *  - Kicker en Cinzel, H1 enorme en Cormorant anclado abajo a la izquierda, con la palabra
 *    acentuada en cursiva y degradado de brasa; subtítulo, CTAs neón y valoración discreta.
 *  - Reveal por líneas con máscara (Framer Motion) y ligero parallax de scroll en el interior de
 *    los contenedores `data-hero-canvas` / `data-hero-copy`, que el módulo de scroll cinematográfico
 *    anima por fuera con GSAP (por eso el parallax propio vive en un hijo y no en el contenedor).
 */
export default function Hero() {
  const m = useMessages();
  const t = useFormat();
  const lp = useLocalePath();
  const locale = useLocale();

  const sectionRef = useRef<HTMLElement>(null);
  const profile = usePerformanceTier();
  const framerReduced = useReducedMotion();
  const reduced = Boolean(framerReduced) || profile.reducedMotion;
  const stacked = useIsMobile(1024);
  const { open } = useReservation();
  const { pointer, needsGyroPermission, requestGyroPermission } = usePointerParallax({ enabled: !reduced });

  /**
   * En tier mid/high es `<HeroTransition />` (GSAP: pin + scrub) quien anima `[data-hero-canvas]` y
   * `[data-hero-copy]`. El parallax propio es solo el plan B para tier "low", donde no hay pin.
   * Se exige `hydrated` porque el perfil del servidor es siempre "low": así el HTML sale sin
   * parallax y en los dispositivos donde manda GSAP el árbol no cambia al hidratar.
   */
  const hydrated = useIsClient();
  const parallax = hydrated && !reduced && profile.tier === "low";

  const ratingValue = formatNumber(BUSINESS.ratings.google.value, locale, { decimals: 1 });
  const ratingCount = formatNumber(BUSINESS.ratings.google.count, locale);
  const ratingAria = t(m.common.misc.ratingLabel, { value: ratingValue, count: ratingCount });

  /* Subtítulo y CTAs entran tras la última línea del titular. */
  const afterHeadline = LINE_DELAY + LINE_STAGGER * 2 + 0.35;
  const fadeUp = (delay: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay } }
      : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: EASE_OUT_EXPO, delay } };

  return (
    <section ref={sectionRef} id="hero" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-iron">
      {/* Escena 3D (o fallback estático). El contenedor data-hero-canvas lo anima el módulo de scroll. */}
      <div data-hero-canvas className="absolute inset-0 -z-10">
        <HeroLayer parallax={parallax} target={sectionRef} variant="canvas" className="absolute inset-0">
          <HeroCanvas profile={profile} pointer={pointer} layout={stacked ? "stacked" : "split"} />
        </HeroLayer>
      </div>

      {/* Degradados de legibilidad: cabecera, pie (fundido con la siguiente sección) y lado del copy */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-[5]",
          "bg-[linear-gradient(180deg,rgba(18,18,18,0.55)_0%,rgba(18,18,18,0)_22%,rgba(18,18,18,0)_46%,rgba(18,18,18,0.82)_72%,#121212_100%)]",
          "lg:bg-[linear-gradient(180deg,rgba(18,18,18,0.5)_0%,rgba(18,18,18,0)_22%,rgba(18,18,18,0)_70%,#121212_100%)]",
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] hidden bg-[linear-gradient(90deg,rgba(12,12,12,0.82)_0%,rgba(12,12,12,0.5)_34%,rgba(12,12,12,0.12)_52%,transparent_64%)] lg:block"
      />

      {/* Copy: anclado abajo a la izquierda (portada). El contenedor data-hero-copy lo anima el módulo de scroll. */}
      <div
        data-hero-copy
        className={cn(
          "container-page relative z-10 flex flex-1 flex-col justify-end",
          "pt-[calc(var(--header-h)+1rem)] pb-[calc(var(--mobile-bar-h)+3.25rem)] md:pb-24 lg:pb-[clamp(3rem,7vh,5.5rem)] lg:pt-[calc(var(--header-h)+2rem)]",
        )}
      >
        <HeroLayer parallax={parallax} target={sectionRef} variant="copy" className="w-full lg:max-w-[58rem]">
          {/* Kicker */}
          <motion.p
            {...fadeUp(0.05)}
            className="mb-4 flex items-center gap-4 font-caps text-[10px] uppercase tracking-[0.35em] text-cream-muted sm:text-[11px] lg:mb-6"
          >
            <span aria-hidden className="h-px w-10 shrink-0 bg-cream/40" />
            <span>{m.hero.kicker}</span>
          </motion.p>

          <Headline lines={m.hero.titleLines} accent={m.hero.accent} fullTitle={m.hero.title} reduced={reduced} />

          {/* Subtítulo */}
          <motion.p
            {...fadeUp(afterHeadline)}
            className="mt-5 max-w-xl font-sans text-base leading-relaxed text-cream-muted text-pretty lg:mt-7 lg:text-lg"
          >
            {m.hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(afterHeadline + 0.12)} className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:mt-9">
            <NeonButton variant="primary" size="lg" pulse onClick={open} icon={<CalendarCheck aria-hidden />} className="w-full sm:w-auto">
              {m.hero.ctaPrimary}
            </NeonButton>
            <NeonButton
              variant="outline"
              size="lg"
              href={lp("/carta")}
              iconRight={<ArrowRight aria-hidden />}
              className="w-full sm:w-auto"
            >
              {m.hero.ctaSecondary}
            </NeonButton>
          </motion.div>

          {/* Valoración discreta (no es una píldora) */}
          <motion.a
            {...fadeUp(afterHeadline + 0.28)}
            href={BUSINESS.social.googleReviews}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${ratingAria} · ${m.hero.reviewsLink}`}
            className="mt-6 inline-flex items-center gap-2 font-caps text-[11px] uppercase tracking-[0.25em] text-cream-faint transition-colors duration-300 hover:text-cream lg:mt-7"
          >
            <Star className="h-3 w-3 shrink-0 fill-gold text-gold" aria-hidden />
            <span aria-hidden>
              {ratingValue} · {ratingCount} {m.common.misc.reviews} {m.common.misc.onGoogle}
            </span>
          </motion.a>
        </HeroLayer>
      </div>

      {/* Chip "Activar 3D": solo en iOS 13+ (el giroscopio requiere un gesto) */}
      {needsGyroPermission && (
        <button
          type="button"
          onClick={() => void requestGyroPermission()}
          aria-label={m.hero.enable3dAria}
          className="glass absolute right-4 bottom-[calc(var(--mobile-bar-h)+1rem)] z-20 inline-flex h-11 items-center gap-2 rounded-full px-4 font-sans text-xs font-semibold text-cream-200 transition-colors hover:text-cream md:bottom-6"
        >
          <Smartphone className="h-4 w-4 text-pimenton-light" aria-hidden />
          {m.hero.enable3d}
        </button>
      )}

      {/* Indicador de scroll vertical (md+, oculto en pantallas bajas) */}
      <ScrollCue href={lp("/#platos")} label={m.hero.scrollCue} aria={m.hero.scrollCueAria} reduced={reduced} />
    </section>
  );
}
