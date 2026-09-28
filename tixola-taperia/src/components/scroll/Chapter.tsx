"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getGsap } from "@/lib/gsap";
import { OVERLAP_SCRUB } from "@/components/scroll/HeroTransition";
import { useCanAfford } from "@/hooks/usePerformanceTier";
import { cn } from "@/lib/utils";

/** `useLayoutEffect` en cliente (sin parpadeo antes del primer pintado), `useEffect` en SSR. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ──────────────────────────────────────────────────────────────
   Registro de capítulos (lo consume ChapterNav)
   ────────────────────────────────────────────────────────────── */

export interface ChapterEntry {
  /** id de la sección que envuelve (platos, experiencia, opiniones…) */
  id: string;
  /** Etiqueta visible en la navegación lateral */
  title: string;
}

interface ChapterRegistryValue {
  chapters: ChapterEntry[];
  register: (entry: ChapterEntry) => () => void;
}

const EMPTY: ChapterEntry[] = [];
const ChapterRegistryContext = createContext<ChapterRegistryValue | null>(null);

/**
 * Mantiene la lista ordenada de capítulos montados. Los `<Chapter>` se registran en orden de
 * árbol (= orden del documento) al montar y se dan de baja al desmontar.
 */
export function ChapterRegistryProvider({ children }: { children: ReactNode }) {
  const [chapters, setChapters] = useState<ChapterEntry[]>(EMPTY);

  const register = useCallback((entry: ChapterEntry) => {
    setChapters((prev) => {
      const index = prev.findIndex((c) => c.id === entry.id);
      if (index === -1) return [...prev, entry];
      if (prev[index].title === entry.title) return prev;
      const next = prev.slice();
      next[index] = entry;
      return next;
    });
    return () => setChapters((prev) => (prev.some((c) => c.id === entry.id) ? prev.filter((c) => c.id !== entry.id) : prev));
  }, []);

  const value = useMemo(() => ({ chapters, register }), [chapters, register]);
  return <ChapterRegistryContext.Provider value={value}>{children}</ChapterRegistryContext.Provider>;
}

/** Capítulos registrados, en orden de documento (vacío fuera del provider). */
export function useChapters(): ChapterEntry[] {
  return useContext(ChapterRegistryContext)?.chapters ?? EMPTY;
}

/* ──────────────────────────────────────────────────────────────
   Chapter
   ────────────────────────────────────────────────────────────── */

export interface ChapterProps {
  /** id de la sección hija (la sección conserva su `id`; el wrapper usa `data-chapter`). */
  id: string;
  /** Título para la navegación lateral. */
  title: string;
  /**
   * Primer capítulo tras la portada: se desliza POR ENCIMA del hero anclado (z-index, borde
   * superior redondeado y sombra) mientras HeroTransition encoge y oscurece el dibujo de la portada.
   */
  overlapsHero?: boolean;
  /** Desactiva telón y escala de entrada (se mantienen registro y profundidad). Por defecto true. */
  cinematic?: boolean;
  className?: string;
  children: ReactNode;
}

/** Recorrido (px) de una capa `data-depth="1"` durante todo el paso del capítulo por el viewport. */
const DEPTH_TRAVEL = 140;
/** Opacidad máxima del telón al entrar / al salir. */
const CURTAIN_ENTER = 0.7;
const CURTAIN_ENTER_OVERLAP = 0.5;
const CURTAIN_EXIT = 0.45;

/**
 * Envoltorio cinematográfico de una sección de la home:
 *  (a) se registra en la navegación por capítulos (ChapterNav);
 *  (b) entrada "de película": un telón oscuro se levanta mientras la sección aterriza y, al ceder el
 *      paso al siguiente capítulo, se vuelve a oscurecer suavemente;
 *  (c) profundidad: los hijos con `data-depth="0.4"` se desplazan a distinta velocidad que el
 *      contenido (positivo = más lejos/lento hacia arriba, negativo = sentido contrario).
 *
 * SIN ESCALA NI OPACIDAD EN EL ROOT. La entrada llevaba un `scale: 0.98 → 1` y un `opacity: 0.85 → 1`
 * sobre el contenedor de la sección entera. Escalar un ancestro invalida la caché de rasterizado de
 * todo su interior (fondo con textura, brasas, grano, el glow de los platos) en cada fotograma del
 * scrub, y la opacidad añadía un segundo escritor sobre los mismos píxeles que ya pinta el telón. El
 * aterrizaje se lee igual con el telón, que es UN solo escritor de opacidad sobre una capa plana: es
 * exactamente lo que se veía ya en gama media, donde la escala nunca se aplicó.
 *
 * Todo vive en un `gsap.context` que se revierte al desmontar. Sin efectos con
 * `prefers-reduced-motion` o en gama baja (`can("scrollCinema")` contempla ambas cosas): el capítulo
 * se renderiza plano y solo queda el registro para la navegación.
 */
export default function Chapter({ id, title, overlapsHero = false, cinematic = true, className, children }: ChapterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const register = useContext(ChapterRegistryContext)?.register;
  /* El hook se llama SIEMPRE (no puede ir tras el `&&` de `cinematic`: sería una llamada condicional). */
  const cinemaOk = useCanAfford("scrollCinema");
  const effects = cinematic && cinemaOk;

  /* (a) Registro en la navegación lateral. */
  useEffect(() => register?.({ id, title }), [register, id, title]);

  /* (b) + (c) Efectos de scroll. */
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const curtain = curtainRef.current;
    if (!root || !curtain || !effects) return;

    const { gsap, ScrollTrigger } = getGsap();

    const ctx = gsap.context(() => {
      /* Telón: UN solo escritor de opacidad (`paint`) alimentado por UN SOLO ScrollTrigger. Antes eran
         dos (entrada y salida), 6 triggers en la home para una sola propiedad; ahora un único rango
         "top bottom" → "bottom 8%" del que se derivan las dos rampas. Los valores de opacidad no
         cambian: los tramos se recalculan en cada `refresh` a partir de los mismos puntos de antes
         ("top 95%"/"top 45%" o "top bottom"/"top 15%" al entrar, "bottom 58%"/"bottom 8%" al salir),
         expresados como fracción del recorrido total. */
      const paintCurtain = gsap.quickSetter(curtain, "opacity");
      const enterMax = overlapsHero ? CURTAIN_ENTER_OVERLAP : CURTAIN_ENTER;
      /* Fracciones del recorrido en las que empieza y acaba cada rampa (se rellenan en `onRefresh`). */
      const ramp = { enterFrom: 0, enterTo: 1, exitFrom: 1, exitTo: 1 };

      const ratio = (from: number, to: number, progress: number) =>
        to <= from ? (progress >= to ? 1 : 0) : Math.min(1, Math.max(0, (progress - from) / (to - from)));

      const paint = (progress: number) => {
        const enter = ratio(ramp.enterFrom, ramp.enterTo, progress);
        const exit = ratio(ramp.exitFrom, ramp.exitTo, progress);
        paintCurtain(Math.max(enterMax * (1 - enter), CURTAIN_EXIT * exit));
      };

      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom 8%",
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          /* `self.start` es el scroll en el que el borde superior toca el borde inferior del viewport y
             `self.end` el scroll en el que el borde inferior llega al 8 % de alto: de ahí salen las
             posiciones del elemento sin volver a medir el DOM. */
          const vh = window.innerHeight;
          const span = self.end - self.start;
          const elTop = self.start + vh;
          const elBottom = self.end + vh * 0.08;
          const at = (scroll: number) => (span > 0 ? (scroll - self.start) / span : 0);
          ramp.enterFrom = at(overlapsHero ? elTop - vh : elTop - vh * 0.95);
          /* Con `overlapsHero` el telón acaba de levantarse cuando el borde superior del capítulo llega
             al borde de arriba de la pantalla (`elTop`), que es exactamente donde el pin de la portada
             la suelta: los dos gestos rematan en el mismo scroll. Antes acababa en `elTop - 0,15 vh`,
             o sea 100 px antes en un 390 × 664 (scroll 769 frente al 869 del suelte), y eso dejaba un
             segundo tiempo suelto pegado al corte: primero se aclaraba el capítulo y después, un poco
             más abajo, se movía la portada. Lo que NO era cierto de la sospecha inicial: la rampa no es
             corta —mide 664 px de scroll, casi un viewport entero—, solo terminaba desalineada. */
          ramp.enterTo = at(overlapsHero ? elTop : elTop - vh * 0.45);
          ramp.exitFrom = at(elBottom - vh * 0.58);
          ramp.exitTo = 1;
          paint(self.progress);
        },
        onUpdate: (self) => paint(self.progress),
      });

      /* Profundidad: cada capa `data-depth` recorre ±(depth × DEPTH_TRAVEL) px mientras el capítulo
         va de asomar por abajo a desaparecer por arriba. Este sí necesita progreso continuo.

         El capítulo que se superpone a la portada arrastra el MISMO retardo de scrub que ella
         (`OVERLAP_SCRUB`). Durante todo el anclaje las dos capas se ven a la vez —el fondo de la
         portada asomando por encima del borde del capítulo—, y con `scrub: true` la brasa del capítulo
         seguía al pulgar al instante mientras el fondo de la portada llegaba 0,6 s más tarde: en un
         golpe de pulgar, que en un teléfono es el gesto normal, se leía como dos planos despegados.
         Fuera de ese solape no hay nada con lo que sincronizarse, así que allí se queda el scrub
         inmediato, que responde mejor. */
      const depthScrub = overlapsHero ? OVERLAP_SCRUB : true;
      const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]"));
      for (const layer of layers) {
        const depth = Number.parseFloat(layer.dataset.depth ?? "");
        if (!Number.isFinite(depth) || depth === 0) continue;
        const travel = depth * DEPTH_TRAVEL;
        gsap.fromTo(
          layer,
          { y: travel },
          {
            y: -travel,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: depthScrub, invalidateOnRefresh: true },
          },
        );
      }
    }, root);

    return () => {
      /* `quickSetter` escribe el estilo EN LÍNEA sin crear ningún tween, así que `ctx.revert()` no lo
         deshace: es el propio contexto de GSAP el que no sabe que ese estilo existe. Y esta limpieza no
         es hipotética — `effects` depende de `can("scrollCinema")`, que puede pasar de true a false EN
         CALIENTE cuando la sonda de la portada degrada a "low" a los 2-4 s. En ese instante el telón se
         quedaba clavado en el valor que tuviera (con el scroll a cero, el `enterMax`: 0,7, o 0,5 en el
         que solapa la portada) y la home entera se veía bajo un velo negro permanente, sin error de
         build ni de consola. Se borra la propiedad antes de revertir: sin estilo en línea manda la clase
         `opacity-0` del propio nodo. */
      curtain.style.removeProperty("opacity");
      ctx.revert();
    };
  }, [effects, overlapsHero]);

  return (
    <div
      ref={rootRef}
      data-chapter={id}
      data-chapter-title={title}
      className={cn(
        "relative",
        overlapsHero &&
          "z-10 overflow-hidden rounded-t-[1.25rem] shadow-[0_-16px_32px_-12px_rgba(0,0,0,0.75)] md:rounded-t-[2rem]",
        className,
      )}
    >
      {children}
      {/* Telón oscuro: opacidad controlada por GSAP (0 en SSR / sin efectos). */}
      <div ref={curtainRef} aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-iron-900 opacity-0" />
    </div>
  );
}
