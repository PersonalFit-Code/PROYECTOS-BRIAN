"use client";

import { useRef, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CalendarCheck, Star } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import { useReservation } from "@/components/ui/ReservationProvider";
import HeroCanvas, { HERO_PAN_HEIGHT, HERO_PAN_WIDTH } from "@/components/hero/HeroCanvas";
import { useHeroStillVisible } from "@/components/scroll/HeroTransition";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { useInView } from "@/hooks/useInViewOnce";
import { BUSINESS } from "@/data/business";
import { formatNumber } from "@/lib/format";
import { useFormat, useLocale, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Tiempos de la coreografía de entrada
   ────────────────────────────────────────────────────────────── */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** Retardo antes de la primera línea del titular (deja respirar al fondo de la portada). */
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
          {/* Sin `will-change-transform`: la entrada dura 1,4 s al cargar y el navegador ya promueve la
              capa por sí solo mientras hay un `transform` animado. Dejarlo declarado mantenía las tres
              líneas del H1 en su propia capa de GPU durante TODA la sesión. */}
          {/*
            Con movimiento reducido el titular SOLO se funde, pero la `y` tiene que aparecer igualmente en
            los dos objetos. El servidor no conoce la preferencia del usuario —`useReducedMotion()` no
            existe ahí—, así que el HTML sale siempre con la variante en movimiento y su
            `transform: translateY(110%)` en línea. Si al hidratar el objetivo pasa a ser solo
            `{ opacity: 1 }`, nadie toca ese transform y las tres líneas se quedan empujadas fuera de su
            máscara `overflow-hidden`: el H1 desaparece de la pantalla para quien pide menos movimiento
            (el texto sigue en el DOM y el `aria-label` también, así que ni el lector de pantalla ni el
            rastreador lo notan; solo desaparece de la vista, que es la peor forma de fallar).
            Declarando `y` también en la rama reducida, framer la devuelve a 0 con duración 0: sin
            deslizamiento y sin línea perdida.
          */}
          <motion.span
            className="block"
            initial={reduced ? { opacity: 0, y: "110%" } : { y: "110%" }}
            animate={reduced ? { opacity: 1, y: "0%" } : { y: "0%" }}
            transition={
              reduced
                ? { duration: 0.5, delay: LINE_DELAY + i * 0.08, y: { duration: 0 } }
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
 * scroll ni se escriben estilos por fotograma durante el tramo más caro de la página (portada
 * anclada + Lenis + scrub).
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
 * no cambia al hidratar y ni el fondo ni la coreografía del titular se vuelven a montar.
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

/**
 * `ambient`: `false` cuando la portada ya no se ve (anclada y tapada por el capítulo de platos, o
 * fuera de pantalla). El bucle `repeat: Infinity` de la línea no lo paraba NADIE: seguía escribiendo
 * transform y opacidad cada fotograma detrás del capítulo siguiente, oscurecida al 72 %.
 */
function ScrollCue({
  href,
  label,
  aria,
  reduced,
  ambient,
}: {
  href: string;
  label: string;
  aria: string;
  reduced: boolean;
  ambient: boolean;
}) {
  const still = reduced || !ambient;
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
          animate={still ? { scaleY: 1, opacity: 0.9, y: "0%" } : { scaleY: [0, 1, 1], opacity: [0.9, 0.9, 0], y: ["0%", "0%", "100%"] }}
          transition={still ? { duration: 0 } : { duration: 2.2, times: [0, 0.55, 1], repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
        />
      </span>
    </motion.a>
  );
}

/* ──────────────────────────────────────────────────────────────
   Hero
   ────────────────────────────────────────────────────────────── */

/**
 * Medidas de la foto de la tixola en la composición apilada (móvil), como variables CSS de la sección.
 * Las define `HeroCanvas` (que es quien conoce la foto) y aquí se publican en `<section>` para que las
 * lean las dos partes: la caja de la foto (`w-[var(--pan-w)]`) y el padding superior del copy
 * (`var(--pan-h)`), que reserva la banda. Un solo origen: si mañana la foto cambia de proporción o de
 * tamaño, el copy se aparta solo.
 */
const PAN_VARS = { "--pan-w": HERO_PAN_WIDTH, "--pan-h": HERO_PAN_HEIGHT } as CSSProperties;

/**
 * Los dos CTA de la portada, HOMBRO CON HOMBRO también en el móvil.
 *
 * Lo pidió el cliente viendo su propio iPhone: apilados, "Reservar Mesa" e "Ir a la Carta" se comían
 * dos filas enteras y empujaban la valoración de Google fuera de la primera pantalla; en fila, la
 * portada entra completa y las dos decisiones (reservar ya / mirar antes qué hay) se ven a la vez, sin
 * que una parezca el paso siguiente de la otra.
 *
 * `flex-1 basis-0` y no `w-1/2`: las dos píldoras miden LO MISMO pase lo que pase con la etiqueta, que
 * es lo que hace que el par se lea como un bloque y no como dos botones sueltos. `min-w-0` es lo que
 * autoriza a encogerse por debajo de su ancho de contenido; sin él, la caja flexible se planta en el
 * ancho del texto y el par desborda el carril del copy (en portugués, "Ir para a Ementa").
 *
 * Por debajo de `sm` la talla `lg` se aprieta: menos aire lateral, hueco más corto entre icono y texto
 * y cuerpo de letra elástico (`clamp`) en vez de fijo, porque el presupuesto por botón es medio
 * contenedor — unos 175 px en un iPhone de 390 y 140 px en uno de 320. El `min-h-14` de la talla sigue
 * mandando, así que el objetivo táctil no baja de 56 px ni cuando la letra encoge; y si en el móvil más
 * estrecho aun así no cabe en una línea, la píldora crece a dos y las dos crecen igual
 * (`items-stretch`), que es mejor que texto desbordado. De `sm` en adelante nada cambia: cada botón
 * vuelve a medir lo que pide su etiqueta.
 */
const HERO_CTA = cn(
  "min-w-0 flex-1 basis-0 sm:flex-none sm:basis-auto",
  "max-sm:gap-1.5 max-sm:px-3 max-sm:text-[clamp(0.78rem,3.2vw,1rem)]",
);

/**
 * Portada a pantalla completa con criterio editorial (portada de revista):
 *  - Fondo (`HeroCanvas`): la FOTO real de una tixola del local levitando sobre hierro y brasas,
 *    con vaho y chispas. En escritorio la sartén ocupa la mitad derecha y su mango asoma detrás del
 *    titular; en móvil ocupa una banda propia bajo la cabecera (`--pan-h`) y el copy empieza debajo,
 *    alineado a la izquierda: si no cabe todo en 100svh, la portada crece y se hace scroll (mejor una
 *    sartén grande que una moneda). Las dos composiciones las resuelve el propio fondo con el
 *    breakpoint `lg`.
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
  const { open } = useReservation();

  /**
   * En tier mid/high es `<HeroTransition />` (GSAP: pin + scrub) quien anima `[data-hero-canvas]` y
   * `[data-hero-copy]`. El parallax propio es solo el plan B para tier "low", donde no hay pin.
   * Se exige `hydrated` porque el perfil del servidor es siempre "low": así el HTML sale sin
   * parallax y en los dispositivos donde manda GSAP el árbol no cambia al hidratar.
   */
  const hydrated = useIsClient();
  const parallax = hydrated && !reduced && profile.tier === "low";

  /**
   * ¿Merece la pena seguir animando la portada? Dos señales que se complementan y no cuestan nada por
   * fotograma: el almacén del pin (`HeroTransition`) sabe si el capítulo de platos ya la ha tapado, y
   * el observador compartido del repo sabe si la sección está en pantalla (el caso sin pin: gama baja
   * o `prefers-reduced-motion`, donde la portada se va con el scroll normal).
   */
  const heroVisible = useHeroStillVisible();
  const onScreen = useInView(sectionRef);
  const ambient = heroVisible && onScreen;

  const ratingValue = formatNumber(BUSINESS.ratings.google.value, locale, { decimals: 1 });
  const ratingCount = formatNumber(BUSINESS.ratings.google.count, locale);
  const ratingAria = t(m.common.misc.ratingLabel, { value: ratingValue, count: ratingCount });

  /* Subtítulo y CTAs entran tras la última línea del titular. */
  const afterHeadline = LINE_DELAY + LINE_STAGGER * 2 + 0.35;
  /* La rama reducida declara `y` igual que la otra (y la lleva a 0 con duración 0) por el mismo motivo
     que el titular: el HTML del servidor sale siempre con la variante en movimiento y su
     `transform: translateY(22px)` en línea, porque en el servidor no se conoce la preferencia. Si el
     objetivo de después de hidratar no menciona `y`, nadie deshace ese desplazamiento y kicker,
     subtítulo, CTAs y valoración se quedan 22 px más abajo de donde deben para siempre. */
  const fadeUp = (delay: number) =>
    reduced
      ? { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, y: { duration: 0 } } }
      : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: EASE_OUT_EXPO, delay } };

  return (
    <section ref={sectionRef} id="hero" style={PAN_VARS} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-iron">
      {/* Fondo de la portada (foto de la tixola sobre la brasa). El contenedor data-hero-canvas lo
          anima el módulo de scroll: `HeroTransition` lo busca por ese atributo para el alejamiento. */}
      <div data-hero-canvas className="absolute inset-0 -z-10">
        <HeroLayer parallax={parallax} target={sectionRef} variant="canvas" className="absolute inset-0">
          <HeroCanvas />
        </HeroLayer>
      </div>

      {/* Degradados de legibilidad: cabecera, pie (fundido con la siguiente sección) y lado del copy */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-[5]",
          "bg-[linear-gradient(180deg,rgba(18,18,18,0.55)_0%,rgba(18,18,18,0)_18%,rgba(18,18,18,0)_30%,rgba(18,18,18,0.55)_42%,rgba(18,18,18,0.85)_62%,#121212_100%)]",
          "lg:bg-[linear-gradient(180deg,rgba(18,18,18,0.5)_0%,rgba(18,18,18,0)_22%,rgba(18,18,18,0)_70%,#121212_100%)]",
        )}
      />
      {/* Velo lateral: SOLO escritorio, donde el copy manda en la mitad izquierda y la tixola en la
          derecha. Por debajo de lg no sirve de nada (la composición es apilada, no a dos columnas) y
          el velo que hace falta ahí es el del propio copy, más abajo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] hidden bg-[linear-gradient(90deg,rgba(12,12,12,0.82)_0%,rgba(12,12,12,0.5)_34%,rgba(12,12,12,0.12)_52%,transparent_64%)] lg:block"
      />

      {/* Copy: anclado abajo a la izquierda (portada). El contenedor data-hero-copy lo anima el módulo de scroll.
          Por debajo de `lg` el padding superior reserva la banda de la foto (cabecera + `--pan-h` + un
          respiro): el copy nunca se cruza con la sartén, mida lo que mida en cada idioma. En pantallas
          altas `justify-end` deja el aire entre la foto y el texto; en las bajas la sección crece.
          El respiro sobre la barra móvil fija es de 1,75 rem (eran 3,25): cada píxel que se ahorra
          aquí es un píxel menos de scroll antes de ver los CTAs en un teléfono bajo. */}
      <div
        data-hero-copy
        className={cn(
          "container-page relative z-10 flex flex-1 flex-col justify-end",
          "pt-[calc(var(--header-h)+var(--pan-h)+0.75rem)] pb-[calc(var(--mobile-bar-h)+1.75rem)] md:pb-24 lg:pb-[clamp(3rem,7vh,5.5rem)] lg:pt-[calc(var(--header-h)+2rem)]",
        )}
      >
        <HeroLayer parallax={parallax} target={sectionRef} variant="copy" className="relative w-full lg:max-w-[58rem]">
          {/*
            VELO DEL COPY (solo por debajo de lg). Desde que la foto tiene su banda propia (`--pan-h`) el
            texto ya no se pinta encima de la sartén, pero el velo se queda: detrás del copy siguen los
            focos rojos de la parrilla y la línea de brasa del pie, y su arranque suave es lo que funde el
            borde inferior de la sartén con la sombra en vez de dejarla recortada. La historia de abajo
            explica por qué es un degradado vertical medido en píxeles y no un radial.
            En la composición apilada anterior el titular subía hasta el 24 % de la pantalla y se pintaba
            encima del aceite. Medido con estilo calculado a 360×640: el fondo bajo «El Arte del Tapeo»
            llegaba a luminancia 245 (los reflejos del aceite y las zamburiñas) contra un titular crema
            de ~246, es decir contraste local 1:1 — ilegible. El degradado vertical de arriba no lo cubría
            porque entre el 18 % y el 30 % es transparente a propósito (para que la tixola respire) y el
            velo lateral es `lg:block`.

            Va DENTRO de la capa del copy y no en la sección, y con inset negativo, para que su extensión la
            defina el propio bloque de texto: así tapa exactamente lo que hay detrás de las letras a
            cualquier altura de viewport, sin depender de porcentajes de pantalla que solo valen para un
            móvil concreto. Al viajar dentro de `HeroLayer` acompaña al copy en el anclaje de scroll, que es
            lo que debe hacer un velo de legibilidad: moverse con lo que hace legible.

            Es un degradado VERTICAL que arranca en transparente y tarda 58 px —medidos en píxeles y no en
            porcentaje, para que el arranque termine SIEMPRE justo encima del kicker, mida lo que mida el
            bloque de texto— en llegar a su opacidad de trabajo (0,74): ese arranque hace que la tixola se
            funda con el velo en vez de quedar cortada por una línea recta, que es como se veía con un
            radial (el borde superior de la caja recortaba el degradado a media opacidad y dejaba un canto
            visible cruzando la sartén). Arriba de ese arranque la tixola sigue encendida; debajo, el aceite
            se ve atenuado detrás de las letras, que es el aire cinematográfico que pedía el diseño. La
            opacidad está calibrada midiendo: el píxel de fondo más claro bajo el titular baja de 245 a 68,
            es decir contraste ≥ 5:1 con el crema del texto (antes, 1:1).
            Cuesta lo que una capa que el compositor mezcla: ni filtro ni `backdrop-filter`.
          */}
          <div
            aria-hidden
            data-hero-veil
            className="pointer-events-none absolute -inset-x-6 -bottom-10 -top-8 -z-10 bg-[linear-gradient(180deg,transparent_0px,rgba(10,10,10,0.42)_28px,rgba(10,10,10,0.72)_64px,rgba(10,10,10,0.8)_40%,rgba(10,10,10,0.86)_100%)] lg:hidden"
          />

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
          <motion.div {...fadeUp(afterHeadline + 0.12)} className="mt-6 flex items-stretch gap-2 sm:items-center sm:gap-3 lg:mt-9">
            {/* `pulse={ambient}`: la animación del halo neón es `animate-neon-pulse`, un bucle CSS infinito sobre
                una sombra difusa. Se apaga cuando la portada deja de verse. */}
            <NeonButton variant="primary" size="lg" pulse={ambient} onClick={open} icon={<CalendarCheck aria-hidden />} className={HERO_CTA}>
              {m.hero.ctaPrimary}
            </NeonButton>
            <NeonButton variant="outline" size="lg" href={lp("/carta")} iconRight={<ArrowRight aria-hidden />} className={HERO_CTA}>
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
            className="mt-5 inline-flex items-center gap-2 font-caps text-[11px] uppercase tracking-[0.25em] text-cream-faint transition-colors duration-300 hover:text-cream lg:mt-7"
          >
            <Star className="h-3 w-3 shrink-0 fill-gold text-gold" aria-hidden />
            <span aria-hidden>
              {ratingValue} · {ratingCount} {m.common.misc.reviews} {m.common.misc.onGoogle}
            </span>
          </motion.a>
        </HeroLayer>
      </div>

      {/* Aquí estaba el chip "Activar 3D": pedía el permiso de giroscopio que iOS exige para mover la
          cámara de la escena WebGL con el móvil. Sin escena no hay cámara que mover, así que se retira
          junto con ella, y con él sus textos (`hero.enable3d*`) en los cuatro idiomas: una cadena que
          nadie pinta es una cadena que alguien acaba reutilizando donde no debe. */}

      {/* Indicador de scroll vertical (md+, oculto en pantallas bajas) */}
      <ScrollCue href={lp("/#platos")} label={m.hero.scrollCue} aria={m.hero.scrollCueAria} reduced={reduced} ambient={ambient} />
    </section>
  );
}
