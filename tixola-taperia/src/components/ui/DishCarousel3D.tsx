"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, Sparkles } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import DishVisual, { DISH_LAYOUT_TRANSITION, dishVisualLayoutId, type DishSlide } from "@/components/ui/DishVisual";
import { formatPrice } from "@/data/menu";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * DishCarousel3D — los platos estrella montados sobre un cilindro que gira.
 *
 * Cada plato ocupa una cara del cilindro: se arrastra con el dedo o el ratón para hacerlo girar, se
 * suelta y encaja en la cara más cercana, y al pulsar la de delante se abre el detalle del plato
 * (ingredientes, alérgenos y maridaje) igual que en el carrusel plano.
 *
 * Geometría: las caras se reparten el cilindro a partes iguales, así que el radio sale del ancho de
 * la tarjeta y del número de platos — `r = (ancho/2) / tan(π/n)`. Esa es la distancia exacta a la que
 * las caras encajan borde con borde: con el radio "de circunferencia" (perímetro/2π) que se ve en
 * muchos ejemplos las tarjetas se solapan en cuanto hay pocas, y aquí son ocho.
 *
 * Accesibilidad y respeto por el usuario:
 *  · Cada cara es un botón con el nombre del plato; el tabulador recorre los ocho y la cara enfocada
 *    gira hasta el frente, de modo que quien navega con teclado siempre ve lo que tiene enfocado.
 *  · ←/→ giran, Inicio/Fin van al primero y al último, Intro abre el detalle.
 *  · La rotación automática se para al pasar el ratón, al enfocar, al arrastrar, fuera de pantalla y
 *    con el botón de pausa (WCAG 2.2.2). La región `aria-live` solo habla cuando está en pausa.
 *  · Con `prefers-reduced-motion` o en gama baja esta pieza no se monta: StarDishes usa el carrusel
 *    plano, que no tiene ni perspectiva ni giro continuo.
 */

export interface DishCarousel3DProps {
  slides: DishSlide[];
  /** abre el detalle de la tarjeta pulsada */
  onOpen: (slide: DishSlide) => void;
  /** volutas de vapor en los visuales compuestos */
  steam?: boolean;
  /** giro automático */
  autoplay?: boolean;
  /** pausa externa: p. ej. mientras el detalle está abierto */
  paused?: boolean;
  className?: string;
}

const AUTOPLAY_DELAY_MS = 5200;
/** Ancho de la cara respecto al del contenedor, y sus topes en píxeles. */
const FACE_RATIO = 0.5;
const FACE_MIN = 176;
const FACE_MAX = 340;
/*
 * DOS MUELLES, porque no es lo mismo girar solo que girar porque te lo han pedido.
 *  · AMBIENT (ζ≈1,23, sobreamortiguado): el giro automático. Asienta en ~430 ms sin rebote, que es lo
 *    que hace que el cilindro parezca pesado, de hierro. Aquí nadie está esperando.
 *  · RESPONSE (ζ≈0,95): flecha, punto, cara lateral, teclado y el encaje del arrastre. Asienta en
 *    ~230 ms con un puntito de rebote, y ese rebote es justo lo que se lee como "vivo" al pulsar.
 */
const AMBIENT_SPRING = { type: "spring", stiffness: 110, damping: 20, mass: 0.6 } as const;
const RESPONSE_SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.6 } as const;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Ancho de cada cara (y del cilindro) a partir del ancho disponible. */
function useFaceWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(FACE_MIN);
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const available = el.clientWidth || window.innerWidth;
      setWidth(Math.round(Math.min(FACE_MAX, Math.max(FACE_MIN, available * FACE_RATIO))));
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

export default function DishCarousel3D({
  slides,
  onOpen,
  steam = true,
  autoplay = true,
  paused = false,
  className,
}: DishCarousel3DProps) {
  const m = useMessages();
  const t = useFormat();
  const hintId = useId();
  const total = slides.length;
  const step = total > 0 ? 360 / total : 360;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const faceButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const faceWidth = useFaceWidth(stageRef);
  const radius = Math.round(faceWidth / 2 / Math.tan(Math.PI / Math.max(total, 3)));

  const rotation = useMotionValue(0);
  const rotateY = useTransform(rotation, (deg) => `rotateY(${deg}deg)`);

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [hovered, setHovered] = useState(false);
  const dragging = useRef(false);

  /** Cara que queda al frente para un ángulo dado. */
  const indexAt = useCallback(
    (deg: number) => (total === 0 ? 0 : (((Math.round(-deg / step) % total) + total) % total)),
    [step, total],
  );

  /* El índice activo solo se publica al cambiar de cara: durante el arrastre el ángulo cambia en cada
     fotograma y un setState por fotograma repintaría las ocho tarjetas sin necesidad. */
  useMotionValueEvent(rotation, "change", (deg) => {
    const i = indexAt(deg);
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActive(i);
    }
  });

  /** Gira hasta dejar `index` al frente por el camino más corto. `spring` distingue giro ambiental de
      respuesta a una interacción (por defecto, respuesta: es el caso de casi todas las llamadas). */
  const goTo = useCallback(
    (index: number, spring: typeof AMBIENT_SPRING | typeof RESPONSE_SPRING = RESPONSE_SPRING) => {
      const from = rotation.get();
      const raw = -index * step;
      const delta = (((raw - from + 180) % 360) + 360) % 360 - 180;
      animate(rotation, from + delta, spring);
    },
    [rotation, step],
  );

  const goBy = useCallback(
    (offset: number, spring?: typeof AMBIENT_SPRING | typeof RESPONSE_SPRING) =>
      goTo((((activeRef.current + offset) % total) + total) % total, spring),
    [goTo, total],
  );

  /* Fuera de pantalla no hay motivo para girar nada. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  /* Giro automático. */
  const spinning = autoplay && !paused && !userPaused && inView && !hovered;
  useEffect(() => {
    if (!spinning || total < 2) return;
    const id = window.setInterval(() => {
      if (!dragging.current) goBy(1, AMBIENT_SPRING);
    }, AUTOPLAY_DELAY_MS);
    return () => window.clearInterval(id);
  }, [spinning, goBy, total]);

  /* Arrastre: el gesto gira el cilindro sin mover el elemento (por eso `onPan`, no `drag`).
     `touch-action: pan-y` deja el scroll vertical del documento al navegador. */
  const degPerPx = step / Math.max(faceWidth, 1);

  const onPanStart = useCallback(() => {
    dragging.current = true;
  }, []);

  const onPan = useCallback(
    (_: unknown, info: PanInfo) => {
      rotation.set(rotation.get() + info.delta.x * degPerPx);
    },
    [degPerPx, rotation],
  );

  const onPanEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      dragging.current = false;
      /* La inercia se proyecta un instante hacia delante y se encaja en la cara que toque. */
      const projected = rotation.get() + info.velocity.x * degPerPx * 0.12;
      goTo(indexAt(projected));
    },
    [degPerPx, goTo, indexAt, rotation],
  );

  /** Pulsar una cara: si no está al frente, primero gira hasta ella. */
  const handleFace = useCallback(
    (index: number) => {
      if (index !== activeRef.current) {
        goTo(index);
        return;
      }
      onOpen(slides[index]);
    },
    [goTo, onOpen, slides],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (total === 0) return;
      let target: number | null = null;
      if (e.key === "ArrowLeft") target = (activeRef.current - 1 + total) % total;
      else if (e.key === "ArrowRight") target = (activeRef.current + 1) % total;
      else if (e.key === "Home") target = 0;
      else if (e.key === "End") target = total - 1;
      if (target === null) return;
      e.preventDefault();
      goTo(target);
      if (e.target instanceof HTMLElement && e.target.closest("[data-dish-face]")) {
        faceButtons.current[target]?.focus({ preventScroll: true });
      }
    },
    [goTo, total],
  );

  const current = slides[active] ?? slides[0];
  const liveMode = !autoplay || userPaused || paused ? "polite" : "off";
  const stageHeight = Math.round(faceWidth * (4 / 3));

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={m.dishes.carousel.label}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovered(false);
      }}
      className={cn("relative", className)}
    >
      <p className="sr-only" aria-live={liveMode} aria-atomic="true">
        {current ? t(m.dishes.carousel.status, { name: current.dish.name, index: active + 1, total }) : ""}
      </p>
      <p id={hintId} className="sr-only">
        {m.dishes.carousel.hint}
      </p>

      <div className="relative">
        {/* Escenario: la perspectiva vive aquí para que el cilindro gire dentro de ella */}
        <div
          ref={stageRef}
          className="relative mx-auto flex items-center justify-center overflow-hidden"
          style={{ height: stageHeight + 56, perspective: 1100, perspectiveOrigin: "50% 48%" }}
        >
          {/* Sombra de apoyo: ancla el cilindro al suelo de hierro */}
          <div
            aria-hidden
            /* Sin `blur-md`: el degradado radial ya cae suave y el filtro solo obligaba a rasterizar
               aparte una capa de `faceWidth*1.4` dentro del escenario en perspectiva. Dos paradas más
               reparten la caída igual de blanda. */
            className="pointer-events-none absolute left-1/2 top-[76%] h-10 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.6),rgba(0,0,0,0.3)_45%,rgba(0,0,0,0.1)_72%,transparent_100%)]"
            style={{ width: faceWidth * 1.4 }}
          />

          {/* Retroceso del cilindro: con `translateZ(-radio)` la cara de delante aterriza en z = 0 y se
              dibuja a su tamaño real. Sin él la perspectiva la acerca y la agranda cerca de un 40 %,
              desbordando el escenario y descuadrando su tipografía respecto al resto de la página.
              Va en un envoltorio aparte —CSS normal, no un motion value— para que el radio se aplique
              siempre desde el mismo render que el de las caras. */}
          <div style={{ transform: `translateZ(${-radius}px)`, transformStyle: "preserve-3d" }}>
            <motion.div
              onPanStart={onPanStart}
              onPan={onPan}
              onPanEnd={onPanEnd}
              style={{
                transform: rotateY,
                transformStyle: "preserve-3d",
                width: faceWidth,
                height: stageHeight,
                touchAction: "pan-y",
              }}
              className="relative cursor-grab active:cursor-grabbing"
            >
              {slides.map((slide, i) => (
                <DishFace
                  key={slide.dish.id}
                  slide={slide}
                  index={i}
                  total={total}
                  active={i === active}
                  steam={steam}
                  hintId={hintId}
                  angle={i * step}
                  radius={radius}
                  onSelect={handleFace}
                  onReveal={goTo}
                  buttonRef={(el) => {
                    faceButtons.current[i] = el;
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Desvanecido lateral: las caras de los extremos se funden con el hierro */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-iron to-transparent md:w-28 lg:w-48" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-iron to-transparent md:w-28 lg:w-48" />

        <ArrowButton dir="prev" label={m.dishes.carousel.prev} onClick={() => goBy(-1)} className="absolute left-3 top-1/2 z-20 -translate-y-1/2 max-md:hidden lg:left-10" />
        <ArrowButton dir="next" label={m.dishes.carousel.next} onClick={() => goBy(1)} className="absolute right-3 top-1/2 z-20 -translate-y-1/2 max-md:hidden lg:right-10" />
      </div>

      {/* Controles: flechas (móvil) + puntos + pausa */}
      <div className="mt-2 flex items-center justify-center gap-1">
        <ArrowButton dir="prev" label={m.dishes.carousel.prev} onClick={() => goBy(-1)} className="md:hidden" />
        <div role="group" aria-label={m.dishes.carousel.label} className="flex items-center">
          {slides.map((slide, i) => {
            const isActive = i === active;
            return (
              <button
                key={slide.dish.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${t(m.dishes.carousel.goTo, { name: slide.dish.name })}${isActive ? ` (${m.dishes.carousel.current})` : ""}`}
                aria-current={isActive ? "true" : undefined}
                className="flex h-11 w-5 items-center justify-center sm:w-7"
              >
                <span
                  aria-hidden
                  className={cn(
                    /* `transition-all` animaba también la sombra neón; solo ancho y color, y en 200 ms:
                       el punto confirma el toque, no ambienta. */
                    "block h-1.5 rounded-full transition-[width,background-color] duration-200 ease-[var(--ease-out-expo)]",
                    isActive ? "w-6 bg-pimenton-light shadow-[0_0_12px_rgba(216,50,60,0.8)]" : "w-1.5 bg-cream/30",
                  )}
                />
              </button>
            );
          })}
        </div>
        <ArrowButton dir="next" label={m.dishes.carousel.next} onClick={() => goBy(1)} className="md:hidden" />
        {autoplay && (
          <button
            type="button"
            onClick={() => setUserPaused((v) => !v)}
            aria-pressed={userPaused}
            aria-label={userPaused ? m.dishes.carousel.play : m.dishes.carousel.pause}
            className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 text-cream-muted transition-colors duration-300 hover:bg-cream/10 hover:text-cream"
          >
            {userPaused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-cream-faint" aria-hidden>
        <span className="md:hidden">{m.dishes.carousel.swipe}</span>
        <span className="hidden md:inline">{m.dishes.carousel.hint}</span>
      </p>
    </div>
  );
}

/* ───────────────────────── Cara del cilindro ───────────────────────── */

interface DishFaceProps {
  slide: DishSlide;
  index: number;
  total: number;
  active: boolean;
  steam: boolean;
  hintId: string;
  /** posición de la cara en el cilindro, en grados */
  angle: number;
  radius: number;
  onSelect: (index: number) => void;
  /** trae esta cara al frente (al recibir el foco por tabulador) */
  onReveal: (index: number) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

const FACE_SIZES = "(max-width:640px) 50vw, (max-width:1024px) 34vw, 300px";

/**
 * Una cara = tarjeta 3:4 girada `angle` grados y empujada `radius` hacia fuera. La de delante va a
 * plena luz; las demás se atenúan con un velo (no con `filter`, que obligaría a repintar la capa 3D
 * en cada fotograma del giro).
 */
function DishFace({ slide, index, total, active, steam, hintId, angle, radius, onSelect, onReveal, buttonRef }: DishFaceProps) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const { dish, photo } = slide;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={t(m.dishes.slide, { index: index + 1, total })}
      data-dish-face=""
      className="absolute inset-0"
      style={{
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
        backfaceVisibility: "hidden",
      }}
    >
      <article
        className={cn(
          /* `shadow-card` son DOS sombras (una de 60 px de difuminado) y aquí se pintan por cada cara
             del cilindro: se queda en una sola, más corta. El borde reacciona a un cambio de cara, así
             que baja a 200 ms con la curva expo en vez de heredar los 500 ms lentos de Tailwind. */
          "group relative h-full w-full overflow-hidden rounded-[1.5rem] border shadow-[0_18px_40px_-18px_rgba(0,0,0,0.85)] transition-[border-color] duration-200 ease-[var(--ease-out-expo)]",
          active ? "border-cream/20" : "border-cream/8",
        )}
      >
        {/* El elemento compartido SOLO lo declara la cara de delante, que es la única que se puede abrir.
            Con `layoutId` en las nueve, framer media cada nodo con getBoundingClientRect dentro de un
            contenedor `preserve-3d` rotado: medidas caras (fuerzan layout) y además poco fiables, porque
            el rectángulo de una cara girada no es el que la proyección espera. Ocho nodos de proyección
            menos y la transición compartida al abrir el plato es exactamente la misma. */}
        <motion.div
          layoutId={active ? dishVisualLayoutId(dish.id) : undefined}
          transition={DISH_LAYOUT_TRANSITION}
          className="absolute inset-0"
        >
          <DishVisual dish={dish} photo={photo} sizes={FACE_SIZES} steam={steam && active} variant="slide" />
        </motion.div>

        {/* Degradado inferior para que se lea el nombre */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-iron-900 via-iron-900/75 to-transparent" />
        {/* Velo de las caras laterales: la de delante manda */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] bg-iron-900 transition-opacity duration-500 ease-[var(--ease-out-expo)]",
            active ? "opacity-0" : "opacity-45",
          )}
        />
        {/* Brillo rojo al pasar el ratón o enfocar */}
        <div
          aria-hidden
          /* Respuesta a hover/foco: 160 ms. A 500 ms el brillo llegaba después de que el usuario ya
             hubiera decidido, y la afordancia dejaba de leerse como consecuencia del gesto. */
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[inset_0_0_0_1px_rgba(216,50,60,0.5),0_0_60px_-10px_rgba(178,30,39,0.7)] transition-opacity duration-160 group-focus-within:opacity-100 group-hover:opacity-100"
        />

        {dish.badge && (
          /* Sin `backdrop-blur-sm`: un backdrop-filter dentro de un contenedor `preserve-3d` que gira
             obliga al compositor a leer el fondo YA proyectado, y esto se pintaba en las nueve caras a
             la vez. Con el hierro al 90 % la insignia se lee igual (mejor contraste, de hecho). */
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-pimenton-light/45 bg-iron-900/90 px-2.5 py-1 font-caps text-[9px] uppercase tracking-[0.16em] text-cream shadow-[0_0_20px_rgba(178,30,39,0.4)]">
            <Sparkles size={11} aria-hidden className="text-gold" />
            {dish.badge}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <p className="font-caps text-[9px] uppercase tracking-[0.26em] text-pimenton-a11y">{dish.kicker}</p>
          <h3 className="mt-1.5 font-display text-xl leading-[1.05] text-cream text-balance">{dish.name}</h3>
          <p className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-condensed text-[1.75rem] leading-none tracking-wide text-cream">{formatPrice(dish.price, locale)}</span>
            <span className="text-[11px] text-cream-muted">{t(m.dishes.spotlight.perUnit, { unit: dish.unit })}</span>
          </p>
          {/* La pista de "toca para ver detalles" solo tiene sentido en la cara que se puede abrir */}
          <span
            className={cn(
              /* Es LA señal de "esto se puede abrir": tiene que estar antes de que el usuario decida. */
              "mt-2 inline-flex items-center gap-1.5 text-[10px] text-cream-faint transition-opacity duration-180",
              active ? "opacity-100" : "opacity-0",
            )}
          >
            <Maximize2 size={12} aria-hidden />
            {m.dishes.hint}
          </span>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => onSelect(index)}
          /* Quien navega con el tabulador tiene que ver lo que acaba de enfocar, no una cara de canto. */
          onFocus={() => onReveal(index)}
          aria-label={dish.name}
          aria-describedby={hintId}
          aria-haspopup={active ? "dialog" : undefined}
          className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pimenton-light"
        />
      </article>
    </div>
  );
}

/* ───────────────────────── Flecha ───────────────────────── */

function ArrowButton({ dir, label, onClick, className }: { dir: "prev" | "next"; label: string; onClick: () => void; className?: string }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        /* 44×44 px: el cristal ahí no se ve, y estas flechas viven sobre el escenario en perspectiva.
           Hierro horneado al 90 % con el mismo filo de luz que daba `glass-smoke`. */
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/10 bg-iron-900/90 text-cream shadow-glass transition-[background-color,scale] duration-160 hover:scale-105 hover:bg-cream/10 active:scale-95",
        className,
      )}
    >
      <Icon size={20} aria-hidden />
    </button>
  );
}
