"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, MotionConfig, motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, X } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { type Photo } from "@/data/photos";
import { useInertBackground } from "@/hooks/useInertBackground";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { localizePhotos } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * PhotoGallery — galería de fotos reales del local (Embla) + visor a pantalla completa.
 *
 *  · Carrusel en bucle con autoplay (4 s) que se detiene al pasar el ratón, al enfocar, fuera de
 *    pantalla, con el visor abierto o si el usuario lo pausa (botón pausa/reanudar, WCAG 2.2.2).
 *  · Slides de anchos mixtos: todas comparten altura (`--slide-h`, responsive) y el ancho sale de la
 *    proporción de la foto: apaisada 3:2 (×1,5), vertical 3:4 (×0,75), cuadrada (×1).
 *  · Pie con `photo.caption`, flechas (44 px), puntos, teclado (←/→, Inicio/Fin) y región `aria-live`
 *    que solo anuncia la foto actual con la galería en pausa.
 *  · Al pulsar una foto se abre el visor (framer-motion): Escape / fondo / botón cierran, ←/→ cambian
 *    de foto, foco inicial en "cerrar" y devolución del foco al cerrar, fondo `inert` y scroll bloqueado.
 *    Se monta en `document.body` por portal para escapar del `transform` del capítulo y de Embla.
 */

type EmblaApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;

const AUTOPLAY_DELAY_MS = 4000;
const EMBLA_OPTIONS = { loop: true, align: "start", skipSnaps: false, dragThreshold: 6 } as const;
/** Con pocas fotos el bucle de Embla no puede llenar el viewport: se repite la lista hasta este mínimo. */
const MIN_SLIDES = 6;
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Shape = "landscape" | "portrait" | "square";

interface Slide {
  photo: Photo;
  /** índice de la foto en PHOTOS (compartido por las copias) */
  index: number;
  /** nº de copia (0 = original; las copias son decorativas para la accesibilidad) */
  copy: number;
  shape: Shape;
  /** ancho = alto × ratio */
  ratio: number;
  key: string;
}

/** Proporción del slide según la orientación de la foto. */
function shapeOf(photo: Photo): { shape: Shape; ratio: number } {
  const r = photo.width / photo.height;
  if (r > 1.15) return { shape: "landscape", ratio: 1.5 };
  if (r < 0.87) return { shape: "portrait", ratio: 0.75 };
  return { shape: "square", ratio: 1 };
}

/** Anchos reales del slide por breakpoint (alto 240 / 340 / 420 px × ratio) para `sizes` de next/image. */
const SIZES: Record<Shape, string> = {
  landscape: "(max-width: 768px) 360px, (max-width: 1024px) 510px, 630px",
  portrait: "(max-width: 768px) 180px, (max-width: 1024px) 255px, 315px",
  square: "(max-width: 768px) 240px, (max-width: 1024px) 340px, 420px",
};

/** `true` solo tras la hidratación (el portal necesita `document.body`); `false` en el servidor. */
const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

export interface PhotoGalleryProps {
  className?: string;
}

export default function PhotoGallery({ className }: PhotoGalleryProps) {
  const m = useMessages();
  const t = useFormat();
  const g = m.social.gallery;
  const { reducedMotion } = usePerformanceTier();
  const isClient = useIsClient();
  const hintId = useId();
  const locale = useLocale();

  /* `alt` y pies de foto en el idioma de la página: los datos de photos.ts están en español y se
     leen tal cual en los `alt` (SEO por idioma) y en los pies visibles de cada tarjeta. */
  const photos = useMemo(() => localizePhotos(locale), [locale]);
  const total = photos.length;

  /* Slides: la lista de fotos repetida hasta MIN_SLIDES para que el bucle sea continuo. */
  const slides = useMemo<Slide[]>(() => {
    const base = photos.map((photo, index) => ({ photo, index, ...shapeOf(photo) }));
    const copies = base.length > 0 && base.length < MIN_SLIDES ? Math.ceil(MIN_SLIDES / base.length) : 1;
    return Array.from({ length: copies }, (_, copy) => base.map((s) => ({ ...s, copy, key: `${s.photo.id}-${copy}` }))).flat();
  }, [photos]);

  /* Autoplay solo si el usuario no prefiere menos movimiento (Embla reinicia al cambiar los plugins). */
  const autoplay = !reducedMotion;
  const plugins = useMemo(
    () =>
      autoplay
        ? [Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true })]
        : [],
    [autoplay],
  );
  const [viewportRef, emblaApi] = useEmblaCarousel(EMBLA_OPTIONS, plugins);

  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.15 });
  const [selected, setSelected] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const lightboxOpen = lightbox !== null;

  /* Índice activo (Embla emite `select` al cambiar de snap y `reInit` al reconfigurarse). */
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (api: EmblaApi) => setSelected(api.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  /* Autoplay efectivo. El plugin reanuda solo al salir el ratón / perder el foco, así que además de
     parar reafirmamos la pausa cada vez que emite `autoplay:play` (en microtarea: el evento se emite
     antes de que el plugin marque su estado interno como activo). */
  useEffect(() => {
    if (!emblaApi) return;
    const ap = emblaApi.plugins().autoplay;
    if (!ap) return;
    const shouldPlay = !userPaused && inView && !lightboxOpen;
    if (shouldPlay) ap.play();
    else ap.stop();
    const guard = () => {
      if (!shouldPlay) queueMicrotask(() => ap.stop());
    };
    emblaApi.on("autoplay:play", guard);
    return () => {
      emblaApi.off("autoplay:play", guard);
    };
  }, [emblaApi, userPaused, inView, lightboxOpen]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const togglePause = useCallback(() => setUserPaused((v) => !v), []);

  /* Visor */
  const openLightbox = useCallback((index: number) => setLightbox(index), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const lightboxPrev = useCallback(() => setLightbox((i) => (i === null ? null : (i - 1 + total) % total)), [total]);
  const lightboxNext = useCallback(() => setLightbox((i) => (i === null ? null : (i + 1) % total)), [total]);

  /* Fondo inert + scroll bloqueado (SmoothScrollProvider detecta el bloqueo y para Lenis) + devolución del foco. */
  useInertBackground(lightboxOpen, [hostRef]);
  useEffect(() => {
    if (!lightboxOpen) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [lightboxOpen]);

  /* Teclado del visor: Escape cierra, ←/→ cambian de foto. */
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        lightboxPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        lightboxNext();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext]);

  /* Teclado del carrusel: ←/→ foto anterior/siguiente, Inicio/Fin primera/última. */
  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!emblaApi || slides.length === 0) return;
      let target: number | null = null;
      if (e.key === "ArrowLeft") target = (emblaApi.selectedScrollSnap() - 1 + slides.length) % slides.length;
      else if (e.key === "ArrowRight") target = (emblaApi.selectedScrollSnap() + 1) % slides.length;
      else if (e.key === "Home") target = 0;
      else if (e.key === "End") target = total - 1;
      if (target === null) return;
      e.preventDefault();
      emblaApi.scrollTo(target);
    },
    [emblaApi, slides.length, total],
  );

  const currentPhotoIndex = slides[selected]?.index ?? 0;
  const current = photos[currentPhotoIndex];
  const currentCaption = current?.caption ?? current?.alt ?? "";
  /* Con la galería girando sola, anunciar cada cambio sería ruido: la región live solo habla en pausa. */
  const liveMode = !autoplay || userPaused ? "polite" : "off";
  const lightboxPhoto = lightbox !== null ? photos[lightbox] : undefined;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={g.label}
      onKeyDown={onKeyDown}
      className={cn("relative", className)}
    >
      {/* Cabecera */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p data-reveal="fade" className="inline-flex items-center gap-3 font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">
            <span aria-hidden className="h-px w-8 bg-pimenton-light/70" />
            {g.kicker}
          </p>
          <h3 data-reveal className="mt-3 font-display text-3xl leading-none text-cream md:text-4xl">
            {g.title} <em className="text-gradient-ember italic">{g.accent}</em>
          </h3>
        </div>
        <p data-reveal="fade" className="max-w-md text-sm leading-relaxed text-cream-muted text-pretty md:text-right">
          {g.description}
        </p>
      </div>

      <p className="sr-only" aria-live={liveMode} aria-atomic="true">
        {t(g.status, { index: currentPhotoIndex + 1, total, caption: currentCaption })}
      </p>
      <p id={hintId} className="sr-only">
        {g.hint}
      </p>

      {/* Carrusel */}
      <div className="relative mt-8 md:mt-10">
        <div
          ref={viewportRef}
          className="cursor-grab overflow-hidden py-2 [--slide-h:240px] active:cursor-grabbing md:[--slide-h:340px] lg:[--slide-h:420px]"
        >
          <div className="flex touch-pan-y gap-3 md:gap-4">
            {slides.map((slide, i) => (
              <GallerySlide
                key={slide.key}
                slide={slide}
                total={total}
                active={i === selected}
                hintId={hintId}
                onOpen={openLightbox}
              />
            ))}
          </div>
        </div>

        {/* Desvanecido en los bordes: las fotos se funden con el hierro */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-iron/90 to-transparent md:w-16" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-iron/90 to-transparent md:w-16" />

        {/* Flechas laterales (tablet/escritorio) */}
        <ArrowButton dir="prev" label={g.prev} onClick={scrollPrev} className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 md:inline-flex" />
        <ArrowButton dir="next" label={g.next} onClick={scrollNext} className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 md:inline-flex" />
      </div>

      {/* Controles: flechas (móvil) + puntos + pausa */}
      <div className="mt-3 flex items-center justify-center gap-1 md:mt-4">
        <ArrowButton dir="prev" label={g.prev} onClick={scrollPrev} className="md:hidden" />
        <div role="group" aria-label={g.label} className="flex items-center">
          {photos.map((photo, i) => {
            const isActive = i === currentPhotoIndex;
            const caption = photo.caption ?? photo.alt;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`${t(g.goTo, { index: i + 1, caption })}${isActive ? ` (${g.current})` : ""}`}
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
        <ArrowButton dir="next" label={g.next} onClick={scrollNext} className="md:hidden" />
        {autoplay && (
          <button
            type="button"
            onClick={togglePause}
            aria-pressed={userPaused}
            aria-label={userPaused ? g.play : g.pause}
            className="ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 text-cream-muted transition-colors duration-300 hover:bg-cream/10 hover:text-cream"
          >
            {userPaused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
          </button>
        )}
      </div>

      {/* Pista de uso */}
      <p className="mt-3 text-center text-xs text-cream-faint" aria-hidden>
        <span className="md:hidden">{g.swipe}</span>
        <span className="hidden md:inline">{g.hint}</span>
      </p>

      {/* Visor (portal en body: fuera del transform del capítulo y del overflow de Embla) */}
      {isClient &&
        createPortal(
          <div ref={hostRef} data-photo-lightbox="">
            <MotionConfig reducedMotion="user">
              <AnimatePresence>
                {lightboxPhoto && lightbox !== null && (
                  <Lightbox
                    key="lightbox"
                    photo={lightboxPhoto}
                    index={lightbox}
                    total={total}
                    onClose={closeLightbox}
                    onPrev={lightboxPrev}
                    onNext={lightboxNext}
                  />
                )}
              </AnimatePresence>
            </MotionConfig>
          </div>,
          document.body,
        )}
    </div>
  );
}

/* ───────────────────────── Slide ───────────────────────── */

interface GallerySlideProps {
  slide: Slide;
  /** nº de FOTOS distintas (no de slides: la pista repite el juego para que el bucle sea continuo) */
  total: number;
  active: boolean;
  /** id del texto de ayuda (aria-describedby del botón) */
  hintId: string;
  onOpen: (photoIndex: number) => void;
}

/**
 * Slide = <figure> con la foto (object-cover + foco), pie y un único botón que cubre toda la tarjeta
 * (nombre accesible = "Ampliar la foto: …"). Las copias repetidas para el bucle son decorativas
 * (`aria-hidden`, sin tabulación) para no duplicar el contenido a los lectores de pantalla.
 */
function GallerySlide({ slide, total, active, hintId, onOpen }: GallerySlideProps) {
  const m = useMessages();
  const t = useFormat();
  const { photo, ratio, shape, index, copy } = slide;
  const caption = photo.caption ?? photo.alt;
  const decorative = copy > 0;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      /* `slide.index` + `total` son los de la FOTO (4), no los de la pista: `slides` repite el juego
         hasta MIN_SLIDES y anunciar "foto 5 de 8" contradecía al contador y a los puntos ("1 de 4"). */
      aria-label={t(m.social.gallery.slide, { index: index + 1, total })}
      aria-hidden={decorative ? true : undefined}
      className="relative shrink-0 grow-0"
      style={{ width: `calc(var(--slide-h) * ${ratio})`, height: "var(--slide-h)" }}
    >
      <figure
        className={cn(
          "group relative m-0 h-full w-full overflow-hidden rounded-2xl border border-cream/10 bg-iron-800 shadow-card transition-opacity duration-500",
          active ? "opacity-100" : "opacity-85",
        )}
      >
        <Image
          src={photo.src}
          alt={decorative ? "" : photo.alt}
          fill
          sizes={SIZES[shape]}
          quality={80}
          className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-focus-within:scale-[1.04]"
          style={{ objectPosition: photo.focus ?? "50% 50%" }}
        />
        {/* Degradado inferior para la legibilidad del pie */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-iron-900/90 via-iron-900/40 to-transparent" />
        {/* Brillo rojo al pasar el ratón o enfocar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[inset_0_0_0_1px_rgba(216,50,60,0.45),0_0_50px_-10px_rgba(178,30,39,0.6)] transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
        />
        <figcaption className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4">
          <span className="font-display text-base italic leading-snug text-cream text-balance md:text-lg">{caption}</span>
          <Maximize2
            aria-hidden
            className="h-4 w-4 shrink-0 text-cream-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
          />
        </figcaption>
        {/* El control: cubre toda la tarjeta. Embla anula el click si hubo arrastre. */}
        <button
          type="button"
          onClick={() => onOpen(index)}
          tabIndex={decorative ? -1 : undefined}
          aria-label={t(m.social.gallery.open, { caption })}
          aria-describedby={hintId}
          aria-haspopup="dialog"
          className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pimenton-light"
        />
      </figure>
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

/* ───────────────────────── Visor ───────────────────────── */

interface LightboxProps {
  photo: Photo;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Visor a pantalla completa: fondo oscuro (pulsar fuera cierra), foto a tamaño real (máx. 90vw / 80vh,
 * conservando la proporción), pie con leyenda y contador, flechas y botón de cierre (44 px).
 */
function Lightbox({ photo, index, total, onClose, onPrev, onNext }: LightboxProps) {
  const m = useMessages();
  const t = useFormat();
  const lb = m.social.gallery.lightbox;
  const closeRef = useRef<HTMLButtonElement>(null);
  const caption = photo.caption ?? photo.alt;
  const ratio = photo.width / photo.height;

  /* Foco inicial en "cerrar" (tras la primera pintura del visor). */
  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(timer);
  }, []);

  /* Los controles viven sobre el fondo (que cierra al pulsar): frenamos la propagación. */
  const stop = (fn: () => void) => (e: ReactMouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t(lb.label, { caption })}
      data-lenis-prevent=""
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-iron-900/95 p-4 backdrop-blur-sm md:p-10"
    >
      <motion.figure
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.2, ease: "easeIn" } }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="relative m-0 flex max-w-full flex-col"
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-cream/10 bg-iron-800 shadow-card"
          style={{ aspectRatio: `${photo.width} / ${photo.height}`, width: `min(90vw, calc(78vh * ${ratio}))` }}
        >
          {/* Al cambiar de foto la nueva entra con un fundido breve */}
          <motion.div key={photo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="absolute inset-0">
            <Image src={photo.src} alt={photo.alt} fill sizes="90vw" quality={88} loading="eager" className="object-contain" />
          </motion.div>
        </div>
        <figcaption className="mt-3 flex items-baseline justify-between gap-4">
          <span className="font-display text-lg italic leading-snug text-cream md:text-xl">{caption}</span>
          <span className="shrink-0 font-caps text-[11px] uppercase tracking-[0.3em] text-cream-faint">{t(lb.counter, { index: index + 1, total })}</span>
        </figcaption>
        <p className="sr-only">{lb.hint}</p>
      </motion.figure>

      {/* Cerrar */}
      <button
        ref={closeRef}
        type="button"
        onClick={stop(onClose)}
        aria-label={lb.close}
        className="glass absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-cream transition-colors duration-300 hover:border-pimenton-light/60 hover:text-pimenton-light md:right-6 md:top-6"
      >
        <X size={20} aria-hidden />
      </button>

      {/* Anterior / siguiente */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={stop(onPrev)}
            aria-label={lb.prev}
            className="glass absolute bottom-4 left-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-cream transition-colors duration-300 hover:border-pimenton-light/60 hover:text-pimenton-light md:bottom-auto md:left-6 md:top-1/2 md:-translate-y-1/2"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>
          <button
            type="button"
            onClick={stop(onNext)}
            aria-label={lb.next}
            className="glass absolute bottom-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-cream transition-colors duration-300 hover:border-pimenton-light/60 hover:text-pimenton-light md:bottom-auto md:right-6 md:top-1/2 md:-translate-y-1/2"
          >
            <ChevronRight size={22} aria-hidden />
          </button>
        </>
      )}
    </motion.div>
  );
}
