"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { type Photo, type PhotoTag } from "@/data/photos";
import { useInertBackground } from "@/hooks/useInertBackground";
import { localizePhotos } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { lockScroll } from "@/lib/scrollLock";
import { cn } from "@/lib/utils";

/**
 * PhotoGallery — EL MURAL de fotos reales del local, con filtro por tema y visor a pantalla completa.
 *
 * AQUÍ HABÍA UN CARRUSEL (Embla, autoplay de 4 s, flechas, puntos y barra de avance). Funcionaba, y
 * con cuatro fotos estaba bien. Con TREINTA dejó de estarlo, y el cliente lo dijo mirándolo: "esta
 * galería de imágenes podríamos prepararlo de otra manera mejor". Tenía razón, y por cosas medibles:
 *
 *  · VER LAS TREINTA COSTABA TREINTA PASADAS. Un carrusel enseña entre una y tres fotos a la vez; el
 *    resto está detrás de un gesto que casi nadie repite treinta veces. Las fotos de plato son el
 *    argumento de venta de esta casa y veintisiete de ellas no se veían nunca.
 *  · LOS CONTROLES YA NO CABÍAN. Los puntos se desbordaban a partir de ocho fotos y hubo que
 *    cambiarlos por una barra de avance sin función de salto: un control que ya solo informaba.
 *  · EL AUTOPLAY ERA MOVIMIENTO QUE NADIE PIDIÓ, con su botón de pausa obligatorio (WCAG 2.2.2)
 *    ocupando sitio en la fila de controles.
 *
 * LO QUE HAY AHORA. Un mural de albañil (masonry) con TODAS las fotos a la vista, el filtro por tema
 * que ya existía en los datos (`tags`) y el mismo visor de siempre al pulsar una.
 *
 *  · MASONRY CON `columns` DE CSS, sin una línea de JavaScript de medición y sin recortar ni una
 *    foto: cada una entra con su proporción real, que es la diferencia entre un mural y una rejilla
 *    de sellos. Veintitrés de las treinta son apaisadas 4:3, así que el mural se lee ordenado y las
 *    cuatro verticales le dan el ritmo.
 *  · EL FILTRO SALE DE LOS DATOS, no de una lista escrita a mano: las chapas son los `PhotoTag` que
 *    de verdad tienen fotos, con su recuento calculado. Mismo lenguaje visual que las chapas de la
 *    carta y de los vinos —el que el cliente aprobó—, con el fondo pimentón deslizándose (`layoutId`).
 *  · DOCE AL PRINCIPIO, y un botón para las demás. El mural entero son dos o tres pantallas de
 *    scroll, y por debajo están las preguntas frecuentes, que es contenido que interesa que se
 *    encuentre. Doce llenan la vista sin empujar el resto de la página hasta el sótano.
 *  · ENTRADA ESCALONADA al asomar, con el sistema de revelados compartido (`data-reveal`): ni un
 *    observador más ni un fotograma de coste, y las fotos nuevas que aparecen al pulsar "ver todas"
 *    se dan de alta solas (el hook vigila el DOM de la sección).
 *  · EL VISOR SE QUEDA TAL CUAL: Escape / fondo / botón cierran, ←/→ cambian de foto, foco inicial
 *    en "cerrar" y devuelto al cerrar, fondo `inert` y scroll bloqueado. Se monta en `document.body`
 *    por portal para escapar del `transform` del capítulo.
 */

/** Fotos visibles antes de pulsar "ver todas". */
const LIMITE_INICIAL = 12;

/**
 * Los temas del filtro, en este orden. No están todos los `PhotoTag`: falta `catedral`, que es UNA
 * foto y además es la misma que ya sale en "terraza" — una chapa para una foto no es un filtro, es
 * un botón que no sirve. Los que se queden a cero no se pintan.
 */
const TEMAS = ["plato", "local", "vinos", "terraza"] as const satisfies readonly PhotoTag[];

/**
 * El tipo sale de la constante y no de `PhotoTag` a propósito: así `m.social.gallery.themes` solo
 * tiene que traducir los cuatro temas que de verdad se pintan, y si mañana se añade una etiqueta
 * nueva a `photos.ts` el compilador no pide una traducción para una chapa que nadie va a ver.
 */
type Tema = (typeof TEMAS)[number] | "all";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 } as const;

/**
 * Anchos reales de una columna del mural: dos columnas por debajo de 768 px, tres hasta 1024 y
 * cuatro por encima dentro de `container-page` (máx. 1.280 px menos 2 × 40 px de margen → 290 px).
 */
const SIZES = "(max-width: 767px) 47vw, (max-width: 1023px) 31vw, 290px";

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
  const isClient = useIsClient();
  const hintId = useId();
  const locale = useLocale();

  /* `alt` y pies de foto en el idioma de la página: los datos de photos.ts están en español y se
     leen tal cual en los `alt` (SEO por idioma) y en los pies del visor. */
  const photos = useMemo(() => localizePhotos(locale), [locale]);

  const [tema, setTema] = useState<Tema>("all");
  const [todas, setTodas] = useState(false);
  const [visor, setVisor] = useState<number | null>(null);
  const visorAbierto = visor !== null;

  /* Recuento por tema sobre el manifiesto completo: las chapas dicen cuántas fotos hay de cada cosa,
     y ese número no depende de lo que esté filtrado ahora mismo. */
  const temas = useMemo(() => {
    const cuenta = new Map<PhotoTag, number>();
    for (const photo of photos) {
      for (const tag of photo.tags) cuenta.set(tag, (cuenta.get(tag) ?? 0) + 1);
    }
    return TEMAS.filter((tag) => (cuenta.get(tag) ?? 0) > 0).map((tag) => ({ tag, count: cuenta.get(tag) ?? 0 }));
  }, [photos]);

  const visibles = useMemo(
    () => (tema === "all" ? photos : photos.filter((photo) => photo.tags.includes(tema))),
    [photos, tema],
  );
  const total = visibles.length;
  const mostradas = todas ? visibles : visibles.slice(0, LIMITE_INICIAL);
  const sobran = total - mostradas.length;

  const hostRef = useRef<HTMLDivElement>(null);

  /* Visor. Los índices son los de la lista FILTRADA: pasar a la siguiente foto desde "Vinos" lleva al
     siguiente vino, no a la siguiente del manifiesto, que es lo que uno espera al estar filtrando. */
  const abrirVisor = useCallback((index: number) => setVisor(index), []);
  const cerrarVisor = useCallback(() => setVisor(null), []);
  const anterior = useCallback(() => setVisor((i) => (i === null ? null : (i - 1 + total) % total)), [total]);
  const siguiente = useCallback(() => setVisor((i) => (i === null ? null : (i + 1) % total)), [total]);

  /* Fondo inert + scroll bloqueado (SmoothScrollProvider detecta el bloqueo y para Lenis) + devolución del foco. */
  useInertBackground(visorAbierto, [hostRef]);
  useEffect(() => {
    if (!visorAbierto) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    /* Bloqueo CONTADO y compartido (`src/lib/scrollLock.ts`): ver la nota de ese fichero. */
    const releaseScroll = lockScroll();
    return () => {
      releaseScroll();
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [visorAbierto]);

  /* Teclado del visor: Escape cierra, ←/→ cambian de foto. */
  useEffect(() => {
    if (!visorAbierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        cerrarVisor();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        anterior();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        siguiente();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visorAbierto, cerrarVisor, anterior, siguiente]);

  const fotoEnVisor = visor !== null ? visibles[visor] : undefined;

  return (
    <div className={cn("relative", className)}>
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

      {/* Filtro por tema */}
      <nav data-reveal="fade" aria-label={g.themesAria} className="relative mt-7 min-w-0 md:mt-9">
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-granate-900/90 to-transparent lg:hidden" />
        <div className="no-scrollbar -ml-4 flex snap-x gap-2 overflow-x-auto py-1 pl-4 pr-8 sm:-ml-6 sm:pl-6 lg:ml-0 lg:flex-wrap lg:overflow-visible lg:pl-0 lg:pr-0">
          <Chapa label={g.themes.all} count={photos.length} activa={tema === "all"} onClick={() => setTema("all")} />
          {temas.map(({ tag, count }) => (
            <Chapa key={tag} label={g.themes[tag]} count={count} activa={tema === tag} onClick={() => setTema(tag)} />
          ))}
        </div>
      </nav>

      <p id={hintId} className="sr-only">
        {g.hint}
      </p>

      {/*
        EL MURAL. `columns` reparte las fotos en columnas de altura equilibrada y `break-inside-avoid`
        impide que una foto se parta entre dos. El hueco entre columnas lo pone `gap`; el vertical, el
        margen inferior de cada pieza — `columns` no tiene `row-gap`.
      */}
      <ul
        role="list"
        aria-label={g.label}
        className="mt-6 columns-2 gap-3 md:mt-8 md:columns-3 md:gap-4 lg:columns-4"
      >
        {mostradas.map((photo, i) => (
          <Pieza key={photo.id} photo={photo} index={i} hintId={hintId} onAbrir={abrirVisor} />
        ))}
      </ul>

      {/* Las que faltan. Es un interruptor y no un botón de un solo uso: así el foco sigue estando en
          algo que existe después de pulsarlo, y se puede volver al mural corto. */}
      {(sobran > 0 || todas) && total > LIMITE_INICIAL && (
        <div className="mt-6 flex justify-center md:mt-8">
          <button
            type="button"
            onClick={() => setTodas((v) => !v)}
            aria-expanded={todas}
            className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/15 px-5 font-caps text-[11px] uppercase tracking-[0.25em] text-cream-200 transition-colors duration-300 hover:border-pimenton-light/60 hover:text-cream"
          >
            {todas ? g.showLess : t(g.showAll, { count: total })}
            <ChevronRight
              aria-hidden
              className={cn("h-4 w-4 transition-transform duration-300 ease-[var(--ease-out-expo)]", todas ? "-rotate-90" : "rotate-90")}
            />
          </button>
        </div>
      )}

      {/* Pista de uso */}
      <p className="mt-4 text-center text-xs text-cream-faint" aria-hidden>
        {g.hint}
      </p>

      {/* Visor (portal en body: fuera del transform del capítulo) */}
      {isClient &&
        createPortal(
          <div ref={hostRef} data-photo-lightbox="">
            <MotionConfig reducedMotion="user">
              <AnimatePresence>
                {fotoEnVisor && visor !== null && (
                  <Visor
                    key="visor"
                    photo={fotoEnVisor}
                    index={visor}
                    total={total}
                    onClose={cerrarVisor}
                    onPrev={anterior}
                    onNext={siguiente}
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

/* ───────────────────────── Chapa del filtro ───────────────────────── */

interface ChapaProps {
  label: string;
  count: number;
  activa: boolean;
  onClick: () => void;
}

/** Misma chapa que la carta y los vinos: `aria-pressed`, fondo pimentón que se desliza, recuento. */
function Chapa({ label, count, activa, onClick }: ChapaProps) {
  const m = useMessages();
  const t = useFormat();

  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 transition-colors duration-150 ease-[var(--ease-out-expo)] focus-visible:outline-offset-2",
        activa ? "border-transparent text-cream" : "border-cream/15 text-cream-muted hover:border-cream/40 hover:text-cream",
      )}
    >
      {activa && (
        <motion.span
          layoutId="galeria-chapa-activa"
          aria-hidden
          transition={SPRING}
          className="absolute inset-0 rounded-full border border-pimenton-light/70 bg-pimenton shadow-[0_0_22px_rgba(232,86,90,0.45)]"
        />
      )}
      <span className="relative font-condensed text-lg uppercase leading-none tracking-wide">{label}</span>
      {/* ARIA 1.2 no permite nombrar un <span> genérico: el número queda decorativo y el texto
          completo viaja en un `sr-only` dentro del propio botón. */}
      <span
        aria-hidden
        className={cn(
          "relative min-w-[1.4rem] rounded-full px-1.5 py-px text-center font-sans text-[11px] font-semibold tabular-nums leading-4",
          activa ? "bg-cream/20 text-cream" : "bg-cream/[0.06] text-cream-faint",
        )}
      >
        {count}
      </span>
      <span className="sr-only">{t(m.social.gallery.count, { count })}</span>
    </button>
  );
}

/* ───────────────────────── Una pieza del mural ───────────────────────── */

interface PiezaProps {
  photo: Photo;
  index: number;
  /** id del texto de ayuda (aria-describedby del botón) */
  hintId: string;
  onAbrir: (index: number) => void;
}

/**
 * Pieza = `<figure>` con la foto a su proporción real, un botón que cubre toda la tarjeta (nombre
 * accesible = "Ampliar la foto: …") y el pie, que aparece al pasar por encima o al llegar con el
 * teclado. En reposo el mural son solo fotos: treinta pies de foto encima de treinta fotos pequeñas
 * es ruido, y la leyenda está donde se va a leer de verdad, que es el visor.
 */
function Pieza({ photo, index, hintId, onAbrir }: PiezaProps) {
  const m = useMessages();
  const t = useFormat();
  const caption = photo.caption ?? photo.alt;

  return (
    <li data-reveal="fade" className="mb-3 break-inside-avoid md:mb-4">
      <figure className="group relative m-0 overflow-hidden rounded-2xl border border-cream/10 bg-granate-800 shadow-card">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={SIZES}
          quality={78}
          /* Las primeras llenan la vista en cuanto la sección asoma; las demás, cuando les toque. */
          loading={index < 4 ? "eager" : "lazy"}
          className="h-auto w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05] group-focus-within:scale-[1.05]"
          style={{ objectPosition: photo.focus ?? "50% 50%" }}
        />
        {/* Velo inferior permanente: le da fondo al mural y evita que dos fotos claras contiguas se
            fundan en una sola mancha. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-granate-900/80 via-granate-900/20 to-transparent" />
        {/* Brillo rojo al pasar el ratón o enfocar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[inset_0_0_0_1px_rgba(232,86,90,0.45),0_0_50px_-10px_rgba(158,22,24,0.6)] transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
        />
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-3 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] translate-y-1.5 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:p-4">
          <span className="font-display text-sm italic leading-snug text-cream text-balance md:text-base">{caption}</span>
          <Maximize2 aria-hidden className="h-4 w-4 shrink-0 text-cream-200" />
        </figcaption>
        {/* El control: cubre toda la tarjeta. */}
        <button
          type="button"
          onClick={() => onAbrir(index)}
          aria-label={t(m.social.gallery.open, { caption })}
          aria-describedby={hintId}
          aria-haspopup="dialog"
          className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pimenton-light"
        />
      </figure>
    </li>
  );
}

/* ───────────────────────── Visor ───────────────────────── */

interface VisorProps {
  photo: Photo;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Visor a pantalla completa: fondo oscuro (pulsar fuera cierra), foto a tamaño real (máx. 90vw / 78vh,
 * conservando la proporción), pie con leyenda y contador, flechas y botón de cierre (44 px).
 */
function Visor({ photo, index, total, onClose, onPrev, onNext }: VisorProps) {
  const m = useMessages();
  const t = useFormat();
  const lb = m.social.gallery.lightbox;
  const closeRef = useRef<HTMLButtonElement>(null);
  const caption = photo.caption ?? photo.alt;
  const ratio = photo.width / photo.height;

  /* Foco inicial en "cerrar", en el primer fotograma pintado. */
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
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
      /* 0,18 s: esta opacidad es lo que confirma el toque sobre la foto. */
      transition={{ duration: 0.18 }}
      /* Sin `backdrop-blur-sm`: era un backdrop-filter a PANTALLA COMPLETA con la opacidad del
         contenedor animada 0→1 y 1→0, así que durante ~300 ms el navegador componía un desenfoque de
         todo el viewport fotograma a fotograma… sobre un fondo que al 95 % ya no dejaba ver nada
         detrás. Sube al 97 % y el coste visual del recorte es literalmente cero. */
      className="fixed inset-0 z-[120] flex items-center justify-center bg-granate-900/97 p-4 md:p-10"
    >
      <motion.figure
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.2, ease: "easeIn" } }}
        /* 0,28 s: la foto es el motivo del clic, no un ambiente. La salida se queda en 0,2 s. */
        transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
        className="relative m-0 flex max-w-full flex-col"
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-cream/10 bg-granate-800 shadow-card"
          style={{ aspectRatio: `${photo.width} / ${photo.height}`, width: `min(90vw, calc(78vh * ${ratio}))` }}
        >
          {/* Cambio de foto con las flechas: 0,22 s, que es respuesta a una pulsación. */}
          <motion.div key={photo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }} className="absolute inset-0">
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
        className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/12 bg-granate-900/85 text-cream shadow-glass transition-colors duration-160 hover:border-pimenton-light/60 hover:text-pimenton-light md:right-6 md:top-6"
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
            className="absolute bottom-4 left-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/12 bg-granate-900/85 text-cream shadow-glass transition-colors duration-160 hover:border-pimenton-light/60 hover:text-pimenton-light md:bottom-auto md:left-6 md:top-1/2 md:-translate-y-1/2"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>
          <button
            type="button"
            onClick={stop(onNext)}
            aria-label={lb.next}
            className="absolute bottom-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/12 bg-granate-900/85 text-cream shadow-glass transition-colors duration-160 hover:border-pimenton-light/60 hover:text-pimenton-light md:bottom-auto md:right-6 md:top-1/2 md:-translate-y-1/2"
          >
            <ChevronRight size={22} aria-hidden />
          </button>
        </>
      )}
    </motion.div>
  );
}
