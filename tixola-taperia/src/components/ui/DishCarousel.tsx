"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, Sparkles } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import DishVisual, { DISH_LAYOUT_TRANSITION, dishVisualLayoutId, type DishSlide } from "@/components/ui/DishVisual";
import { formatPrice } from "@/data/menu";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * DishCarousel — carrusel de fotos reales de los platos estrella (Embla).
 *
 *  · Slides altos 3:4 (~70vw móvil · ~34vw md · ~26vw lg, separación 20 px), centrados y en bucle.
 *    La tarjeta activa va a escala 1 y opacidad plena; las vecinas a 0.92 / 0.6 (transición CSS).
 *  · Autoplay cada 5 s que se detiene al pasar el ratón, al enfocar una tarjeta, fuera de pantalla,
 *    con el detalle abierto o si el usuario lo pausa (botón pausa/reanudar, WCAG 2.2.2).
 *  · Arrastre táctil/ratón, flechas (44 px), puntos, teclado (←/→, Inicio/Fin) y región `aria-live`
 *    que solo anuncia el plato actual cuando el carrusel está en pausa.
 *  · Cada tarjeta es un botón (nombre accesible = nombre del plato) que abre el detalle; la foto lleva
 *    el `layoutId` compartido con DishSpotlight para viajar como elemento compartido.
 */

type EmblaApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;

export interface DishCarouselProps {
  slides: DishSlide[];
  /** abre el detalle de la tarjeta pulsada */
  onOpen: (slide: DishSlide) => void;
  /** volutas de vapor en los visuales compuestos (desactivar en tier "low") */
  steam?: boolean;
  /** autoplay (desactívalo con `prefers-reduced-motion`) */
  autoplay?: boolean;
  /** pausa externa: p. ej. mientras el detalle está abierto */
  paused?: boolean;
  className?: string;
}

const AUTOPLAY_DELAY_MS = 5000;
const SLIDE_SIZES = "(max-width:768px) 70vw, (max-width:1024px) 34vw, 26vw";

const EMBLA_OPTIONS = { loop: true, align: "center", skipSnaps: false, dragThreshold: 6 } as const;

export default function DishCarousel({ slides, onOpen, steam = true, autoplay = true, paused = false, className }: DishCarouselProps) {
  const m = useMessages();
  const t = useFormat();
  const hintId = useId();
  const total = slides.length;

  /* Plugin de autoplay: solo se instancia cuando procede (Embla reinicia al cambiar los plugins). */
  const plugins = useMemo(
    () =>
      autoplay
        ? [Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true })]
        : [],
    [autoplay],
  );
  const [viewportRef, emblaApi] = useEmblaCarousel(EMBLA_OPTIONS, plugins);

  const rootRef = useRef<HTMLDivElement>(null);
  const slideButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [selected, setSelected] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(true);

  /* Índice activo (Embla emite `select` al cambiar de snap y `reInit` al reconfigurarse). */
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (api: EmblaApi) => setSelected(api.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  /* Fuera de pantalla no hay motivo para mover nada. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  /* Autoplay efectivo. El plugin reanuda solo al salir el ratón / perder el foco / soltar el arrastre,
     así que además de parar reafirmamos la pausa cada vez que emite `autoplay:play` (en microtarea,
     porque el evento se emite antes de que el plugin marque su estado interno como activo). */
  useEffect(() => {
    if (!emblaApi) return;
    const ap = emblaApi.plugins().autoplay;
    if (!ap) return;
    const shouldPlay = !paused && !userPaused && inView;
    if (shouldPlay) ap.play();
    else ap.stop();
    const guard = () => {
      if (!shouldPlay) queueMicrotask(() => ap.stop());
    };
    emblaApi.on("autoplay:play", guard);
    return () => {
      emblaApi.off("autoplay:play", guard);
    };
  }, [emblaApi, paused, userPaused, inView]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const togglePause = useCallback(() => setUserPaused((v) => !v), []);

  /* Abrir el detalle. Si la tarjeta pulsada era una vecina, la centramos: así el elemento compartido
     vuelve exactamente a su sitio (escala 1) al cerrar. */
  const handleOpen = useCallback(
    (index: number) => {
      if (emblaApi && emblaApi.selectedScrollSnap() !== index) emblaApi.scrollTo(index);
      onOpen(slides[index]);
    },
    [emblaApi, onOpen, slides],
  );

  /* Teclado: ←/→ plato anterior/siguiente, Inicio/Fin primero/último. Si el foco estaba en una tarjeta,
     lo movemos a la nueva (Embla solo recoloca por Tab, así que la animación la hace `scrollTo`). */
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!emblaApi || total === 0) return;
      let target: number | null = null;
      if (e.key === "ArrowLeft") target = (emblaApi.selectedScrollSnap() - 1 + total) % total;
      else if (e.key === "ArrowRight") target = (emblaApi.selectedScrollSnap() + 1) % total;
      else if (e.key === "Home") target = 0;
      else if (e.key === "End") target = total - 1;
      if (target === null) return;
      e.preventDefault();
      emblaApi.scrollTo(target);
      const focusInSlide = e.target instanceof HTMLElement && e.target.closest("[data-dish-slide]") !== null;
      if (focusInSlide) slideButtonRefs.current[target]?.focus({ preventScroll: true });
    },
    [emblaApi, total],
  );

  const current = slides[selected] ?? slides[0];
  /* Con el carrusel girando solo, anunciar cada cambio sería ruido: la región live solo habla en pausa. */
  const liveMode = !autoplay || userPaused || paused ? "polite" : "off";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={m.dishes.carousel.label}
      onKeyDown={onKeyDown}
      className={cn("relative", className)}
    >
      <p className="sr-only" aria-live={liveMode} aria-atomic="true">
        {current ? t(m.dishes.carousel.status, { name: current.dish.name, index: selected + 1, total }) : ""}
      </p>
      <p id={hintId} className="sr-only">
        {m.dishes.carousel.hint}
      </p>

      <div className="relative">
        {/* Viewport de Embla: el contenedor se desplaza con transform; `touch-pan-y` deja el scroll vertical al navegador */}
        <div ref={viewportRef} className="cursor-grab overflow-hidden py-4 active:cursor-grabbing">
          <div className="flex touch-pan-y gap-5">
            {slides.map((slide, i) => (
              <DishSlideCard
                key={slide.dish.id}
                slide={slide}
                index={i}
                total={total}
                active={i === selected}
                steam={steam}
                hintId={hintId}
                onOpen={handleOpen}
                buttonRef={(el) => {
                  slideButtonRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>

        {/* Desvanecido en los bordes: las tarjetas vecinas se funden con el hierro */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-iron/90 to-transparent md:w-24 lg:w-40" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-iron/90 to-transparent md:w-24 lg:w-40" />

        {/* Flechas laterales (tablet/escritorio) */}
        <ArrowButton dir="prev" label={m.dishes.carousel.prev} onClick={scrollPrev} className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 md:inline-flex lg:left-8" />
        <ArrowButton dir="next" label={m.dishes.carousel.next} onClick={scrollNext} className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 md:inline-flex lg:right-8" />
      </div>

      {/* Controles: flechas (móvil) + puntos + pausa */}
      <div className="mt-3 flex items-center justify-center gap-1 md:mt-4">
        <ArrowButton dir="prev" label={m.dishes.carousel.prev} onClick={scrollPrev} className="md:hidden" />
        <div role="group" aria-label={m.dishes.carousel.label} className="flex items-center">
          {slides.map((slide, i) => {
            const isActive = i === selected;
            return (
              <button
                key={slide.dish.id}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`${t(m.dishes.carousel.goTo, { name: slide.dish.name })}${isActive ? ` (${m.dishes.carousel.current})` : ""}`}
                aria-current={isActive ? "true" : undefined}
                className="flex h-11 w-7 items-center justify-center"
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
        <ArrowButton dir="next" label={m.dishes.carousel.next} onClick={scrollNext} className="md:hidden" />
        {autoplay && (
          <button
            type="button"
            onClick={togglePause}
            aria-pressed={userPaused}
            aria-label={userPaused ? m.dishes.carousel.play : m.dishes.carousel.pause}
            className="ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 text-cream-muted transition-colors duration-300 hover:bg-cream/10 hover:text-cream"
          >
            {userPaused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
          </button>
        )}
      </div>

      {/* Pista de uso */}
      <p className="mt-3 text-center text-xs text-cream-faint" aria-hidden>
        <span className="md:hidden">{m.dishes.carousel.swipe}</span>
        <span className="hidden md:inline">{m.dishes.carousel.hint}</span>
      </p>
    </div>
  );
}

/* ───────────────────────── Tarjeta ───────────────────────── */

interface DishSlideCardProps {
  slide: DishSlide;
  index: number;
  total: number;
  active: boolean;
  steam: boolean;
  /** id del texto de ayuda (aria-describedby del botón) */
  hintId: string;
  onOpen: (index: number) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

/**
 * Slide = <article> con foto, nombre (h3), kicker, precio y badge, cubierto por un único botón
 * (`absolute inset-0`) cuyo nombre accesible es el del plato. Así el HTML es válido (nada de
 * encabezados dentro de un botón) y toda la tarjeta es el control.
 */
function DishSlideCard({ slide, index, total, active, steam, hintId, onOpen, buttonRef }: DishSlideCardProps) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const { dish, photo } = slide;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={t(m.dishes.slide, { index: index + 1, total })}
      data-dish-slide=""
      className="min-w-0 shrink-0 grow-0 basis-[70vw] md:basis-[34vw] lg:basis-[26vw]"
    >
      {/* La tarjeta activa a escala 1; las vecinas encogidas y atenuadas (transición de `scale` + opacidad) */}
      <div
        className={cn(
          "transition-[scale,opacity] duration-500 ease-[var(--ease-out-expo)] will-change-transform",
          active ? "scale-100 opacity-100" : "scale-[0.92] opacity-60",
        )}
      >
        <article className="group relative aspect-[3/4] overflow-hidden rounded-[1.75rem] border border-cream/10 bg-iron-800 shadow-card">
          {/* Foto (o tixola compuesta): elemento compartido con el detalle */}
          <motion.div layoutId={dishVisualLayoutId(dish.id)} transition={DISH_LAYOUT_TRANSITION} className="absolute inset-0">
            <DishVisual dish={dish} photo={photo} sizes={SLIDE_SIZES} steam={steam && active} variant="slide" />
          </motion.div>

          {/* Degradado inferior para la legibilidad del texto */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-iron-900 via-iron-900/75 to-transparent" />
          {/* Brillo rojo al pasar el ratón o enfocar */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[inset_0_0_0_1px_rgba(216,50,60,0.45),0_0_60px_-10px_rgba(178,30,39,0.6)] transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
          />

          {dish.badge && (
            <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-pimenton-light/45 bg-iron-900/70 px-3 py-1.5 font-caps text-[10px] uppercase tracking-[0.18em] text-cream shadow-[0_0_20px_rgba(178,30,39,0.4)] backdrop-blur-sm">
              <Sparkles size={12} aria-hidden className="text-gold" />
              {dish.badge}
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
            <p className="font-caps text-[10px] uppercase tracking-[0.3em] text-pimenton-a11y">{dish.kicker}</p>
            <h3 className="mt-2 font-display text-2xl leading-[1.05] text-cream md:text-[1.75rem]">{dish.name}</h3>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="font-condensed text-[2.25rem] leading-none tracking-wide text-cream">{formatPrice(dish.price, locale)}</span>
              <span className="text-xs text-cream-muted">{t(m.dishes.spotlight.perUnit, { unit: dish.unit })}</span>
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-cream-faint transition-colors duration-500 group-hover:text-cream-muted">
              <Maximize2 size={13} aria-hidden />
              {m.dishes.hint}
            </span>
          </div>

          {/* El control: cubre toda la tarjeta. Embla anula el click si hubo arrastre. */}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => onOpen(index)}
            aria-label={dish.name}
            aria-describedby={hintId}
            aria-haspopup="dialog"
            className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pimenton-light"
          />
        </article>
      </div>
    </div>
  );
}

/* ───────────────────────── Flecha ───────────────────────── */

interface ArrowButtonProps {
  dir: "prev" | "next";
  label: string;
  onClick: () => void;
  className?: string;
}

function ArrowButton({ dir, label, onClick, className }: ArrowButtonProps) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "glass-smoke inline-flex h-11 w-11 items-center justify-center rounded-full text-cream transition-[background-color,scale] duration-300 hover:scale-105 hover:bg-cream/10 active:scale-95",
        className,
      )}
    >
      <Icon size={20} aria-hidden />
    </button>
  );
}
