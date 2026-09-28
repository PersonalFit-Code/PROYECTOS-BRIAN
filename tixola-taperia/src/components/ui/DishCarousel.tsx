"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import DishVisual, { DISH_LAYOUT_TRANSITION, dishVisualLayoutId, type DishSlide } from "@/components/ui/DishVisual";
import { formatPrice } from "@/data/menu";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * DishCarousel — carrusel de fotos reales de los platos estrella (Embla).
 *
 * ES EL CARRUSEL DEL TELÉFONO. Antes era solo el plan B de gama baja y `prefers-reduced-motion`;
 * ahora StarDishes lo sirve a todo lo que se toca con el dedo (ver allí el porqué medido). El
 * cilindro en 3D se queda para el ratón.
 *
 *  · Slides altos 3:4 (~70vw móvil · ~34vw md · ~26vw lg, separación 20 px), centrados y en bucle.
 *    La tarjeta activa va a escala 1 y opacidad plena; las vecinas a 0.92 / 0.6 (transición CSS).
 *  · Autoplay cada 5 s que se detiene al pasar el ratón, al enfocar una tarjeta, fuera de pantalla,
 *    con el detalle abierto y —esto es nuevo— PARA SIEMPRE en cuanto el usuario toca el carrusel.
 *  · Arrastre táctil/ratón, flechas (44 px), puntos, teclado (←/→, Inicio/Fin) y región `aria-live`
 *    que solo anuncia el plato actual cuando el carrusel ya no se mueve solo.
 *  · Cada tarjeta es un botón (nombre accesible = nombre del plato) que abre el detalle; la foto lleva
 *    el `layoutId` compartido con DishSpotlight para viajar como elemento compartido.
 *
 * POR QUÉ YA NO HAY BOTÓN DE PAUSA (lo pidió el cliente: "yo quitaría eso de pausar o continuar").
 * Ese botón era el mecanismo de parada que exige la WCAG 2.2.2 para contenido que se mueve solo más
 * de 5 s. El movimiento SIGUE siendo detenible: el autoplay es una cortesía de bienvenida que se
 * apaga DEFINITIVAMENTE con el primer gesto —arrastre, flecha, punto, tecla o abrir un plato—, sin
 * volver nunca, así que no hay movimiento imparable.
 *
 * Pero conviene decirlo sin maquillar: quitar el botón es una REBAJA DE CONFORMIDAD, no una mejora de
 * accesibilidad. La norma pide "un mecanismo para pausar, detener u ocultar", y un efecto colateral no
 * anunciado de los botones "anterior" y "siguiente" no es un mecanismo declarado; un auditor no va a
 * aceptar que "el gesto ES la parada". Lo que se puede hacer sin devolver el icono —y es lo que se
 * hace— es DECLARARLO donde ya hay sitio: `dishes.carousel.autoStop` sale en la pista de texto visible
 * y en la descripción para lectores de pantalla mientras el carrusel se mueve solo, de modo que el
 * mecanismo está anunciado y a la vista aunque no sea un botón nuevo.
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
  const [inView, setInView] = useState(true);
  /* Interruptor de UN SOLO SENTIDO: una vez que el visitante toca el carrusel, deja de moverse solo
     para el resto de la visita. Es state y no ref porque el efecto del autoplay tiene que re-correr. */
  const [handedOver, setHandedOver] = useState(false);
  const handOver = useCallback(() => setHandedOver(true), []);

  /* Índice activo (Embla emite `select` al cambiar de snap y `reInit` al reconfigurarse).
     `pointerDown` es el primer contacto del dedo o del ratón con el viewport, ANTES de saber si habrá
     arrastre o solo un toque: es el instante exacto en el que el usuario toma el mando, y por eso es
     el que apaga el autoplay. Escucharlo aquí cubre el gesto en cualquier punto del carrusel; los
     controles (flechas, puntos, teclado) lo hacen por su cuenta porque no pasan por el viewport. */
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (api: EmblaApi) => setSelected(api.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect).on("pointerDown", handOver);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect).off("pointerDown", handOver);
    };
  }, [emblaApi, handOver]);

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
     porque el evento se emite antes de que el plugin marque su estado interno como activo). Ese
     reafirmar es justo lo que hace irreversible el `handedOver`: el plugin trae `stopOnInteraction:
     false` y reanudaría al soltar el dedo, y aquí se le vuelve a parar en cuanto lo intenta. */
  useEffect(() => {
    if (!emblaApi) return;
    const ap = emblaApi.plugins().autoplay;
    if (!ap) return;
    const shouldPlay = !paused && !handedOver && inView;
    if (shouldPlay) ap.play();
    else ap.stop();
    const guard = () => {
      if (!shouldPlay) queueMicrotask(() => ap.stop());
    };
    emblaApi.on("autoplay:play", guard);
    return () => {
      emblaApi.off("autoplay:play", guard);
    };
  }, [emblaApi, paused, handedOver, inView]);

  const scrollPrev = useCallback(() => {
    handOver();
    emblaApi?.scrollPrev();
  }, [emblaApi, handOver]);
  const scrollNext = useCallback(() => {
    handOver();
    emblaApi?.scrollNext();
  }, [emblaApi, handOver]);
  const scrollTo = useCallback(
    (index: number) => {
      handOver();
      emblaApi?.scrollTo(index);
    },
    [emblaApi, handOver],
  );

  /* Abrir el detalle. Si la tarjeta pulsada era una vecina, la centramos: así el elemento compartido
     vuelve exactamente a su sitio (escala 1) al cerrar. */
  const handleOpen = useCallback(
    (index: number) => {
      handOver();
      if (emblaApi && emblaApi.selectedScrollSnap() !== index) emblaApi.scrollTo(index);
      onOpen(slides[index]);
    },
    [emblaApi, handOver, onOpen, slides],
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
      handOver();
      emblaApi.scrollTo(target);
      const focusInSlide = e.target instanceof HTMLElement && e.target.closest("[data-dish-slide]") !== null;
      if (focusInSlide) slideButtonRefs.current[target]?.focus({ preventScroll: true });
    },
    [emblaApi, handOver, total],
  );

  const current = slides[selected] ?? slides[0];
  /* Con el carrusel avanzando solo, anunciar cada cambio sería ruido: la región live solo habla cuando
     ya no se mueve por su cuenta. Con el autoplay apagado al primer gesto, eso significa que empieza a
     hablar justo cuando el usuario toma el mando, que es cuando el anuncio le sirve de algo.
     Lo que se calla es el CONTENIDO, no el atributo. Antes se conmutaba `aria-live` de "off" a
     "polite", y varios lectores de pantalla registran la región viva —y su cortesía— en el momento en
     que el nodo se crea y no vuelven a leer el atributo: el encendido coincidía EN EL MISMO RENDER con
     el cambio de plato que se quería anunciar, así que el primer anuncio era justo el que más
     papeletas tenía de perderse. Con el atributo fijo la región está registrada desde el principio y
     lo único que cambia es si hay texto dentro. */
  const announce = !autoplay || handedOver || paused;
  /* `true` mientras el carrusel todavía puede avanzar por su cuenta: es cuando hay que enseñar el
     mecanismo de parada (ver la cabecera del fichero). */
  const selfMoving = autoplay && !handedOver && !paused;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={m.dishes.carousel.label}
      onKeyDown={onKeyDown}
      /* El foco entrando en el carrusel también es "tomo yo el mando", y aquí hace falta decirlo a
         mano: el `stopOnFocusIn` del plugin cuelga del evento `slideFocusStart` de Embla, que solo se
         emite cuando el foco llega con el tabulador Y Embla decide recolocar. Con el foco puesto de
         cualquier otra forma (al volver del detalle, desde un lector de pantalla) seguía avanzando
         solo, que es justo lo que no puede pasar sin botón de pausa. */
      onFocusCapture={handOver}
      className={cn("relative", className)}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announce && current ? t(m.dishes.carousel.status, { name: current.dish.name, index: selected + 1, total }) : ""}
      </p>
      <p id={hintId} className="sr-only">
        {m.dishes.carousel.hint} {m.dishes.carousel.autoStop}
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
        <ArrowButton dir="prev" label={m.dishes.carousel.prev} onClick={scrollPrev} className="absolute left-3 top-1/2 z-20 -translate-y-1/2 max-md:hidden lg:left-8" />
        <ArrowButton dir="next" label={m.dishes.carousel.next} onClick={scrollNext} className="absolute right-3 top-1/2 z-20 -translate-y-1/2 max-md:hidden lg:right-8" />
      </div>

      {/* Controles: flechas (móvil) + puntos */}
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
                    /* Mismo criterio que el carrusel 3D: el punto confirma el toque, así que solo ancho
                       y color (no la sombra neón de `transition-all`) y en 200 ms. */
                    "block h-1.5 rounded-full transition-[width,background-color] duration-200 ease-[var(--ease-out-expo)]",
                    isActive ? "w-7 bg-pimenton-light shadow-[0_0_12px_rgba(216,50,60,0.8)]" : "w-1.5 bg-cream/30",
                  )}
                />
              </button>
            );
          })}
        </div>
        <ArrowButton dir="next" label={m.dishes.carousel.next} onClick={scrollNext} className="md:hidden" />
      </div>

      {/* Pista de uso. La segunda línea es el mecanismo de parada de la WCAG 2.2.2, declarado por
          escrito y solo mientras el carrusel puede moverse por su cuenta (ver la cabecera). */}
      {/* `px-5`: el carrusel va a sangre (fuera de `container-page`), así que este párrafo es el único
          de la sección sin margen lateral propio. Con las pistas cortas de antes no se notaba; la frase
          del mecanismo de parada llega al borde del teléfono si no se le pone el mismo respiro. */}
      <p className="mt-3 px-5 text-center text-xs text-cream-faint" aria-hidden>
        <span className="md:hidden">{m.dishes.carousel.swipe}</span>
        <span className="hidden md:inline">{m.dishes.carousel.hint}</span>
        {selfMoving && <span className="mx-auto mt-1 block max-w-[46ch] text-balance text-cream-faint/80">{m.dishes.carousel.autoStop}</span>}
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
          /* El encaje de la tarjeta acompaña al gesto: a 500 ms el dedo ya se ha levantado y la
             diapositiva sigue colocándose. 240 ms con la curva expo va con el arrastre, no detrás. */
          "transition-[scale,opacity] duration-240 ease-[var(--ease-out-expo)] will-change-transform",
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
            /* Respuesta a hover/foco: 160 ms (ver DishCarousel3D). */
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[inset_0_0_0_1px_rgba(216,50,60,0.45),0_0_60px_-10px_rgba(178,30,39,0.6)] transition-opacity duration-160 group-focus-within:opacity-100 group-hover:opacity-100"
          />

          {dish.badge && (
            /* Sin `backdrop-blur-sm`: la insignia se pinta sobre la foto del plato, que ya tapa; el
               hierro al 90 % da el mismo cuerpo y el contraste del texto sube. */
            <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-pimenton-light/45 bg-iron-900/90 px-3 py-1.5 font-caps text-[10px] uppercase tracking-[0.18em] text-cream shadow-[0_0_20px_rgba(178,30,39,0.4)]">
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
            {/* Pista de afordancia: llega en 180 ms, antes de que el usuario decida. */}
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-cream-faint transition-colors duration-180 group-hover:text-cream-muted">
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
        /* Hierro horneado en vez de cristal: son 44×44 px sobre las tarjetas, nadie ve el desenfoque. */
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/10 bg-iron-900/90 text-cream shadow-glass transition-[background-color,scale] duration-160 hover:scale-105 hover:bg-cream/10 active:scale-95",
        className,
      )}
    >
      <Icon size={20} aria-hidden />
    </button>
  );
}
