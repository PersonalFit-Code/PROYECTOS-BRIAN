"use client";

import { useRef, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, UtensilsCrossed } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import HeroCanvas from "@/components/hero/HeroCanvas";
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

/** Tipografía del titular, en una constante para no repetirla entre el `<h1>` y sus líneas. */
/** Caja de una línea del titular. La máscara (`overflow-hidden`) la añade solo el h1 de verdad. */
const CAJA_LINEA = "-mx-[0.08em] -mb-[0.1em] block px-[0.08em] pb-[0.1em]";

const TIPO_TITULAR = cn(
  "font-display font-medium text-cream lg:font-normal",
  "text-[clamp(2.6rem,11vw,3.6rem)] leading-[0.92] tracking-[-0.01em] lg:text-[clamp(3.2rem,8vw,7.5rem)]",
);

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
      className={cn(TIPO_TITULAR)}
    >
      {visible.map((line, i) => (
        <span
          key={line}
          aria-hidden
          /* La máscara deja un pequeño margen inferior/lateral para no recortar descendentes ni la cursiva */
          className={cn(CAJA_LINEA, "overflow-hidden")}
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
 * Los dos CTA de la portada, HOMBRO CON HOMBRO también en el móvil.
 *
 * Lo pidió el cliente viendo su propio iPhone: apilados, "Reservar Mesa" e "Ir a la Carta" se comían
 * dos filas enteras y empujaban la valoración de Google fuera de la primera pantalla; en fila, la
 * portada entra completa y las dos decisiones (reservar ya / mirar antes qué hay) se ven a la vez, sin
 * que una parezca el paso siguiente de la otra.
 *
 * `flex-1` y no `w-1/2`: las dos píldoras miden LO MISMO pase lo que pase con la etiqueta, que es lo
 * que hace que el par se lea como un bloque y no como dos botones sueltos (`flex: 1` ya deja la base en
 * 0, así que no hace falta acompañarlo de `basis-0`). `min-w-0` es lo que autoriza a encogerse por
 * debajo del ancho de la palabra más larga; sin él, con la letra del sistema agrandada las dos cajas se
 * plantan en su mínimo de contenido y el par desborda el carril del copy.
 *
 * Por debajo de `sm` la talla `lg` se aprieta: menos aire lateral, hueco más corto entre icono y texto
 * y la letra atada al ancho de pantalla, porque el presupuesto por botón es medio contenedor — unos
 * 175 px en un iPhone de 390 y 140 px en uno de 320. El `clamp` pasa la mayor parte del catálogo de
 * móviles pegado a su suelo (0,78 rem hasta unos 390 px de ancho) y solo crece en los teléfonos grandes;
 * ese suelo es deliberado: por debajo la etiqueta dejaría de leerse de un vistazo, y lo que cede
 * entonces es el número de líneas, no el cuerpo. El `min-h-14` de la talla sigue mandando, así que el
 * objetivo táctil no baja de 56 px; y si en el móvil más estrecho no cabe en una línea, la píldora
 * reparte en dos y las dos crecen igual (`items-stretch`), que es mejor que texto desbordado. De `sm`
 * en adelante nada cambia: cada botón vuelve a medir lo que pide su etiqueta.
 *
 * El `clamp` está en `rem` a propósito: quien lleva la letra del sistema agrandada tiene que ver la
 * etiqueta agrandada también. Lo que eso destapa es que una PALABRA suelta no tiene por dónde partirse:
 * medido a 390 px con la raíz al 200 %, "Reservar" llegaba al borde con 0 px de margen, y con el zoom de
 * página de Safari (viewport de ~195 px) se salía 1 px y lo recortaba el `overflow-hidden` de la
 * sección. Por eso `hyphens-auto` —que con el `lang` de cada idioma corta por sílaba, "Reser-var", y no
 * por donde caiga— y `[overflow-wrap:anywhere]` como último recurso si el idioma no trae diccionario de
 * guionado. A tamaño normal no se nota ninguna de las dos: solo actúan cuando la palabra ya no cabe.
 */
const HERO_CTA = cn(
  "min-w-0 flex-1 sm:flex-none",
  "max-sm:gap-1.5 max-sm:px-3 max-sm:text-[clamp(0.78rem,3.2vw,1rem)]",
  "max-sm:hyphens-auto max-sm:[overflow-wrap:anywhere]",
);

/**
 * Portada a pantalla completa con criterio editorial (portada de revista):
 *  - Fondo (`HeroCanvas`): el LOGOTIPO de la casa, grande, sobre hierro y brasas, con chispas y un
 *    brillo lento que le recorre los trazos. En escritorio ocupa la mitad derecha sin llegar a pisar
 *    el titular; en móvil la foto llena la pantalla y el copy se pinta encima, y empieza
 *    debajo, alineado a la izquierda: si no cabe todo en 100svh, la portada crece y se hace scroll
 *    (mejor una marca grande que un sello). Las dos composiciones las resuelve el propio fondo con el
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
    <section ref={sectionRef} id="hero" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-granate">
      {/* Fondo de la portada (el logotipo sobre la brasa). El contenedor data-hero-canvas lo
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
          "bg-[linear-gradient(180deg,rgba(59,22,19,0.55)_0%,rgba(59,22,19,0)_18%,rgba(59,22,19,0)_30%,rgba(59,22,19,0.55)_42%,rgba(59,22,19,0.85)_62%,#3b1613_100%)]",
          "lg:bg-[linear-gradient(180deg,rgba(59,22,19,0.5)_0%,rgba(59,22,19,0)_22%,rgba(59,22,19,0)_70%,#3b1613_100%)]",
        )}
      />
      {/* Velo lateral: SOLO escritorio, donde el copy manda en la mitad izquierda y la tixola en la
          derecha. Por debajo de lg no sirve de nada (la composición es apilada, no a dos columnas) y
          el velo que hace falta ahí es el del propio copy, más abajo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] hidden bg-[linear-gradient(90deg,rgba(42,15,13,0.82)_0%,rgba(42,15,13,0.5)_34%,rgba(42,15,13,0.12)_52%,transparent_64%)] lg:block"
      />

      {/* Copy: anclado abajo a la izquierda (portada). El contenedor data-hero-copy lo anima el módulo de scroll.
          Por debajo de `lg` ya no se reserva banda ninguna: la foto va a sangre por detrás y el copy
          se pinta encima, con su propio velo de legibilidad. En pantallas altas `justify-end` deja el
          aire entre la imagen y el texto; en las bajas la sección crece.
          El respiro sobre la barra móvil fija es de 1,75 rem (eran 3,25): cada píxel que se ahorra
          aquí es un píxel menos de scroll antes de ver los CTAs en un teléfono bajo. */}
      <div
        data-hero-copy
        className={cn(
          /*
            En el teléfono el bloque se CENTRA en el hueco que deja la foto, y de `sm` en adelante
            sigue anclado abajo como hasta ahora. Sin el párrafo, el copy ocupa 120 px menos y en un
            móvil alto (844 px) todo ese aire se acumulaba de golpe entre la imagen y el kicker: un
            agujero negro de 145 px en mitad de la primera pantalla. Centrando, ese hueco se parte en
            dos de ~83 px —uno sobre el kicker y otro bajo la valoración— y el segundo es justo el
            respiro que pedía el cliente antes de entrar en los platos. En las pantallas cortas, que son
            las que motivaron el recorte, no cambia nada: ahí no sobra ni un píxel y centrar es lo mismo
            que anclar abajo.
          */
          "container-page relative z-10 flex flex-1 flex-col justify-center sm:justify-end",
          "pt-[calc(var(--header-h)+0.75rem)] pb-[calc(var(--mobile-bar-h)+1.75rem)] md:pb-24 lg:pb-[clamp(3rem,7vh,5.5rem)] lg:pt-[calc(var(--header-h)+2rem)]",
        )}
      >
        <HeroLayer parallax={parallax} target={sectionRef} variant="copy" className="relative w-full lg:max-w-[58rem]">
          {/*
            VELO DEL COPY (solo por debajo de lg). En el teléfono el texto se pinta directamente encima de
            la foto, así que aquí el velo no es un adorno: es lo que hace legible el titular. Su arranque
            suave es además lo que funde la imagen con la sombra en vez de dejar un canto recto. La historia de abajo
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
            visible cruzando la imagen). Arriba de ese arranque la foto sigue encendida; debajo, se ve
            atenuada detrás de las letras, que es el aire cinematográfico que pedía el diseño. La
            opacidad está calibrada midiendo: el píxel de fondo más claro bajo el titular baja de 245 a 68,
            es decir contraste ≥ 5:1 con el crema del texto (antes, 1:1).
            Cuesta lo que una capa que el compositor mezcla: ni filtro ni `backdrop-filter`.
          */}
          <div
            aria-hidden
            data-hero-veil
            className="pointer-events-none absolute -inset-x-6 -bottom-10 -top-8 -z-10 bg-[linear-gradient(180deg,transparent_0px,rgba(34,12,10,0.42)_28px,rgba(34,12,10,0.72)_64px,rgba(34,12,10,0.8)_40%,rgba(34,12,10,0.86)_100%)] lg:hidden"
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

          {/*
            SUBTÍTULO — se ve de `sm` en adelante y se oculta en el teléfono.

            No es un recorte de texto sino de ALTURA. Medido a 390 px: el párrafo ocupa 104 px más sus
            16 px de separación, y con él la portada no bajaba de 801 px hiciera lo que hiciera el
            viewport. En un navegador incrustado (el de WhatsApp o Instagram, que es por donde va a
            llegar la mitad de la gente) el hueco útil ronda los 620-700 px, así que la barra fija se
            comía media píldora de "Reservar Mesa" y la valoración de Google entera: el cliente lo vio
            en su propio teléfono. Sin el párrafo la portada baja a ~680 px y las dos píldoras y la
            valoración caben enteras, que es lo que tiene que pasar en la primera pantalla.

            Se oculta, no se borra: el texto sigue en el HTML para quien lo rastrea y para `sm` en
            adelante, donde sobra sitio y el párrafo hace su trabajo de venta. Lo que cuenta lo repiten
            además la banda de cifras y el pie, así que el teléfono no se queda sin ese argumento, solo
            lo recibe más abajo.
          */}
          <motion.p
            {...fadeUp(afterHeadline)}
            className="mt-5 hidden max-w-xl font-sans text-base leading-relaxed text-cream-muted text-pretty sm:block lg:mt-7 lg:text-lg"
          >
            {m.hero.subtitle}
          </motion.p>

          {/* CTAs. En el teléfono cuelgan del titular (el párrafo de arriba no está), así que necesitan
              su propio aire: 32 px, que es lo que separaba al titular del párrafo más lo que el párrafo
              dejaba antes de las píldoras, para que el salto del titular a la acción no quede pegado. */}
          <motion.div {...fadeUp(afterHeadline + 0.12)} className="mt-8 flex items-stretch gap-2 sm:mt-6 sm:items-center sm:gap-3 lg:mt-9">
            {/* El primario abría el formulario de reservas. Tixola no coge reservas, así que la
                acción más valiosa que queda es la que despierta el hambre: la carta. El secundario
                deja de duplicarla y pasa a resolver la otra pregunta de quien ya se ha decidido,
                que es dónde está.
                `pulse={ambient}`: la animación del halo neón es `animate-neon-pulse`, un bucle CSS
                infinito sobre una sombra difusa. Se apaga cuando la portada deja de verse. */}
            <NeonButton variant="primary" size="lg" pulse={ambient} href={lp("/carta")} icon={<UtensilsCrossed aria-hidden />} className={HERO_CTA}>
              {m.hero.ctaPrimary}
            </NeonButton>
            <NeonButton
              variant="outline"
              size="lg"
              href={BUSINESS.social.directions}
              target="_blank"
              aria-label={m.common.cta.directionsAria}
              iconRight={<ArrowRight aria-hidden />}
              className={HERO_CTA}
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
