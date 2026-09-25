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
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
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
   * superior redondeado y sombra) mientras HeroTransition encoge y oscurece la escena 3D.
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
 *  (b) entrada "de película": la sección aterriza con una escala 0.98 → 1 mientras un telón oscuro
 *      se levanta (ScrollTrigger scrub) y, al ceder el paso al siguiente capítulo, se vuelve a
 *      oscurecer suavemente;
 *  (c) profundidad: los hijos con `data-depth="0.4"` se desplazan a distinta velocidad que el
 *      contenido (positivo = más lejos/lento hacia arriba, negativo = sentido contrario).
 *
 * Todo vive en un `gsap.context` que se revierte al desmontar. Con `prefers-reduced-motion` o
 * tier "low" el capítulo se renderiza plano (solo el registro para la navegación).
 *
 * Nota: durante la entrada el wrapper lleva un `transform`; cualquier elemento `position: fixed`
 * dentro de la sección debe montarse por portal (los modales del proyecto ya lo hacen).
 */
export default function Chapter({ id, title, overlapsHero = false, cinematic = true, className, children }: ChapterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const register = useContext(ChapterRegistryContext)?.register;
  const { tier, reducedMotion } = usePerformanceTier();
  const effects = cinematic && !reducedMotion && tier !== "low";

  /* (a) Registro en la navegación lateral. */
  useEffect(() => register?.({ id, title }), [register, id, title]);

  /* (b) + (c) Efectos de scroll. */
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const curtain = curtainRef.current;
    if (!root || !curtain || !effects) return;

    const { gsap, ScrollTrigger } = getGsap();

    const ctx = gsap.context(() => {
      /* Entrada: el bloque aterriza (escala + opacidad) con el scroll como línea de tiempo. */
      gsap.fromTo(
        root,
        { scale: 0.98, opacity: overlapsHero ? 1 : 0.85, transformOrigin: "50% 0%" },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: overlapsHero ? "top bottom" : "top 92%",
            end: overlapsHero ? "top 12%" : "top 42%",
            scrub: true,
            invalidateOnRefresh: true,
            /* Con la entrada completada retiramos el transform inline: hover/sticky del interior intactos. */
            onLeave: () => gsap.set(root, { clearProps: "transform" }),
          },
        },
      );

      /* Telón: un solo escritor de opacidad alimentado por dos triggers (entrada y salida), así un
         refresh de ScrollTrigger nunca deja el telón en un estado incoherente. */
      const paintCurtain = gsap.quickSetter(curtain, "opacity");
      const curtainState = { enter: 0, exit: 0 };
      const enterMax = overlapsHero ? CURTAIN_ENTER_OVERLAP : CURTAIN_ENTER;
      const paint = () => paintCurtain(Math.max(enterMax * (1 - curtainState.enter), CURTAIN_EXIT * curtainState.exit));

      ScrollTrigger.create({
        trigger: root,
        start: overlapsHero ? "top bottom" : "top 95%",
        end: overlapsHero ? "top 15%" : "top 45%",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          curtainState.enter = self.progress;
          paint();
        },
        onRefresh: (self) => {
          curtainState.enter = self.progress;
          paint();
        },
      });
      ScrollTrigger.create({
        trigger: root,
        start: "bottom 58%",
        end: "bottom 8%",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          curtainState.exit = self.progress;
          paint();
        },
        onRefresh: (self) => {
          curtainState.exit = self.progress;
          paint();
        },
      });

      /* Profundidad: cada capa `data-depth` recorre ±(depth × DEPTH_TRAVEL) px mientras el capítulo
         va de asomar por abajo a desaparecer por arriba. */
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
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, [effects, overlapsHero]);

  return (
    <div
      ref={rootRef}
      data-chapter={id}
      data-chapter-title={title}
      className={cn(
        "relative",
        overlapsHero &&
          "z-10 overflow-hidden rounded-t-[1.25rem] shadow-[0_-30px_70px_-10px_rgba(0,0,0,0.75)] md:rounded-t-[2rem]",
        className,
      )}
    >
      {children}
      {/* Telón oscuro: opacidad controlada por GSAP (0 en SSR / sin efectos). */}
      <div ref={curtainRef} aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-iron-900 opacity-0" />
    </div>
  );
}
