"use client";

import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

/**
 * Marquee — carril infinito genérico (horizontal o vertical), portado de la utilidad de 21st.dev /
 * magicui a Tailwind v4 sin shadcn.
 *
 *  · Renderiza `repeat` copias de `children` en un flex; cada copia se desplaza `-100% - gap` en
 *    bucle, así el final de una copia enlaza sin costura con el inicio de la siguiente.
 *  · Variables CSS configurables desde `className`: `[--duration:40s]` (velocidad) y `[--gap:1rem]`.
 *  · `reverse` invierte el sentido, `pauseOnHover` detiene el carril al pasar el ratón o al recibir
 *    foco (teclado), `paused` lo detiene desde fuera (p. ej. fuera del viewport).
 *  · `fade` aplica una máscara degradada en los bordes (contenedor `overflow-hidden`).
 *  · Con `prefers-reduced-motion` pinta UNA sola copia estática, sin animación.
 *  · Accesibilidad: solo la primera copia está en el árbol de accesibilidad; las demás son
 *    decorativas (`aria-hidden`), para que un lector de pantalla no repita el contenido.
 *
 * Los keyframes se declaran una sola vez gracias al `<style href precedence>` de React 19 (se
 * eleva a <head> y se deduplica entre instancias), sin tocar globals.css.
 */
export interface MarqueeProps {
  /** Sentido inverso (abajo → arriba pasa a arriba → abajo, etc.). */
  reverse?: boolean;
  /** Pausa al pasar el ratón por encima o al enfocar un elemento del carril. */
  pauseOnHover?: boolean;
  /** Carril vertical (columna) en vez de horizontal (fila). */
  vertical?: boolean;
  /** Nº de copias del contenido (≥ 2 para que el bucle sea continuo). */
  repeat?: number;
  /** Pausa externa (p. ej. cuando el carril está fuera de pantalla). */
  paused?: boolean;
  /** Máscara degradada en los bordes del carril. Por defecto true. */
  fade?: boolean;
  className?: string;
  /** Clases extra para cada copia del carril. */
  trackClassName?: string;
  children: ReactNode;
}

/** Keyframes propios (los de globals.css desplazan -50 % y sirven para 2 copias; aquí son N copias). */
const MARQUEE_KEYFRAMES = `@keyframes tx-marquee-x{from{transform:translateX(0)}to{transform:translateX(calc(-100% - var(--gap)))}}@keyframes tx-marquee-y{from{transform:translateY(0)}to{transform:translateY(calc(-100% - var(--gap)))}}`;

export default function Marquee({
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  paused = false,
  fade = true,
  className,
  trackClassName,
  children,
}: MarqueeProps) {
  const reducedMotion = usePrefersReducedMotion();
  const copies = reducedMotion ? 1 : Math.max(1, Math.floor(repeat));

  return (
    <div
      className={cn(
        "group/marquee flex overflow-hidden [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        fade &&
          (vertical
            ? "[mask-image:linear-gradient(180deg,transparent,#000_10%,#000_90%,transparent)]"
            : "[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"),
        className,
      )}
    >
      <style href="tx-marquee-keyframes" precedence="default">
        {MARQUEE_KEYFRAMES}
      </style>

      {Array.from({ length: copies }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 ? true : undefined}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)]",
            vertical ? "flex-col" : "flex-row",
            !reducedMotion && "will-change-transform",
            !reducedMotion &&
              (vertical
                ? "[animation:tx-marquee-y_var(--duration)_linear_infinite]"
                : "[animation:tx-marquee-x_var(--duration)_linear_infinite]"),
            reverse && "[animation-direction:reverse]",
            pauseOnHover && "group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]",
            paused && "[animation-play-state:paused]",
            trackClassName,
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
