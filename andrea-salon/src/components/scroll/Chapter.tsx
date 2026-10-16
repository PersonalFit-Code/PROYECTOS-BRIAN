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
import { useCanAfford } from "@/hooks/usePerformanceTier";
import { cn } from "@/lib/utils";

/** `useLayoutEffect` en cliente (sin parpadeo antes del primer pintado), `useEffect` en SSR. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ──────────────────────────────────────────────────────────────
   Registro de capítulos (lo consume ChapterNav)
   ────────────────────────────────────────────────────────────── */

export interface ChapterEntry {
  /** id de la sección que envuelve (servicios, bonos, resenas…) */
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
   * Primer capítulo tras la portada: se desliza POR ENCIMA del hero (z-index, borde superior
   * redondeado y sombra rosada).
   */
  overlapsHero?: boolean;
  /** Desactiva telón y profundidad (se mantiene el registro). Por defecto true. */
  cinematic?: boolean;
  className?: string;
  children: ReactNode;
}

/** Recorrido (px) de una capa `data-depth="1"` durante todo el paso del capítulo por el viewport. */
const DEPTH_TRAVEL = 140;
/**
 * Opacidad máxima del telón al entrar / al salir. Más baja que en tixola (0,7 / 0,45): aquí el
 * telón es CREMA sobre crema, un velo de luz y no de sombra, y a 0,7 la sección entraba lavada.
 */
const CURTAIN_ENTER = 0.55;
const CURTAIN_ENTER_OVERLAP = 0.4;
const CURTAIN_EXIT = 0.35;
/**
 * Retardo del `scrub` del capítulo que se superpone a la portada. En tixola este número vivía en
 * `HeroTransition` (que aquí no existe: la portada del salón no se ancla) y se exportaba para que el
 * fondo de la portada y las capas del capítulo fueran a la vez. Se conserva el valor por si la
 * portada gana un pin más adelante: el solape con un scrub inmediato se lee como dos planos sueltos.
 */
const OVERLAP_SCRUB = 0.6;

/**
 * Envoltorio cinematográfico de una sección de la home:
 *  (a) se registra en la navegación por capítulos (ChapterNav);
 *  (b) entrada "de película": un velo crema se levanta mientras la sección aterriza y, al ceder el
 *      paso al siguiente capítulo, se vuelve a velar suavemente;
 *  (c) profundidad: los hijos con `data-depth="0.4"` se desplazan a distinta velocidad que el
 *      contenido (positivo = más lejos/lento hacia arriba, negativo = sentido contrario).
 *
 * SIN ESCALA NI OPACIDAD EN EL ROOT: escalar un ancestro invalida la caché de rasterizado de todo su
 * interior en cada fotograma del scrub. El aterrizaje se lee igual con el telón, que es UN solo
 * escritor de opacidad sobre una capa plana.
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
      /* Telón: UN solo escritor de opacidad alimentado por UN SOLO ScrollTrigger, del que se derivan
         las dos rampas (entrada y salida) como fracciones del recorrido total. */
      const paintCurtain = gsap.quickSetter(curtain, "opacity");
      const enterMax = overlapsHero ? CURTAIN_ENTER_OVERLAP : CURTAIN_ENTER;
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
          const vh = window.innerHeight;
          const span = self.end - self.start;
          const elTop = self.start + vh;
          const elBottom = self.end + vh * 0.08;
          const at = (scroll: number) => (span > 0 ? (scroll - self.start) / span : 0);
          ramp.enterFrom = at(overlapsHero ? elTop - vh : elTop - vh * 0.95);
          ramp.enterTo = at(overlapsHero ? elTop : elTop - vh * 0.45);
          ramp.exitFrom = at(elBottom - vh * 0.58);
          ramp.exitTo = 1;
          paint(self.progress);
        },
        onUpdate: (self) => paint(self.progress),
      });

      /* Profundidad: cada capa `data-depth` recorre ±(depth × DEPTH_TRAVEL) px mientras el capítulo
         va de asomar por abajo a desaparecer por arriba. */
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
         deshace. Y esta limpieza no es hipotética: `effects` puede pasar de true a false EN CALIENTE
         cuando la sonda degrada a "low"; sin esto el telón se quedaba clavado y la home entera bajo un
         velo permanente. Se borra la propiedad antes de revertir: sin estilo en línea manda `opacity-0`. */
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
        overlapsHero && "z-10 overflow-hidden rounded-t-[1.25rem] bg-crema shadow-[0_-16px_32px_-12px_rgba(43,42,45,0.18)] md:rounded-t-[2rem]",
        className,
      )}
    >
      {children}
      {/* Telón crema: opacidad controlada por GSAP (0 en SSR / sin efectos). */}
      <div ref={curtainRef} aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-crema opacity-0" />
    </div>
  );
}
