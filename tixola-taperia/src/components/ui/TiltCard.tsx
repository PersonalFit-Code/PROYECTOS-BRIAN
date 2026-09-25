"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import { clamp, cn } from "@/lib/utils";

/**
 * TiltCard — tarjeta 3D que se inclina siguiendo el puntero.
 *
 *  - rotateX / rotateY (hasta `maxTilt` grados) + scale sobre un contexto `perspective`.
 *  - Capa "glare": destello radial que sigue al cursor sobre la superficie.
 *  - Capa de sombra difuminada, independiente, que se desplaza en sentido contrario
 *    a la inclinación para simular profundidad real.
 *
 * Rendimiento: el movimiento se escribe en variables CSS a través de refs dentro de un
 * requestAnimationFrame — ningún re‑render de React por `pointermove`.
 * Se desactiva solo en dispositivos táctiles, con `prefers-reduced-motion` o vía `disabled`.
 */

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

export interface TiltCardProps {
  children: ReactNode;
  /** inclinación máxima en grados (por defecto 12) */
  maxTilt?: number;
  /** escala al pasar el puntero (por defecto 1.02) */
  hoverScale?: number;
  /** destello que sigue al puntero */
  glare?: boolean;
  /** sombra de profundidad desplazada */
  shadow?: boolean;
  /** tinte de la sombra / glow proyectado (hex) */
  glowColor?: string;
  /** fuerza la desactivación (p. ej. tier "low") */
  disabled?: boolean;
  /** clases del contenedor exterior (perspectiva) */
  className?: string;
  /** clases del elemento que rota (debe llevar el mismo radio que la tarjeta hija) */
  innerClassName?: string;
}

/** Desplazamiento máximo de la sombra en px (sentido contrario al puntero) */
const SHADOW_SHIFT = 22;

export default function TiltCard({
  children,
  maxTilt = 12,
  hoverScale = 1.02,
  glare = true,
  shadow = true,
  glowColor = "#B21E27",
  disabled = false,
  className,
  innerClassName,
}: TiltCardProps) {
  const { isTouch, reducedMotion } = usePerformanceTier();
  const enabled = !disabled && !isTouch && !reducedMotion;

  const rootRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  /** Escribe las variables CSS calculadas a partir de la última posición del puntero. */
  const paint = useCallback(() => {
    rafRef.current = null;
    const root = rootRef.current;
    const rect = rectRef.current;
    const p = pointerRef.current;
    if (!root || !rect || !p) return;

    const px = clamp((p.x - rect.left) / rect.width, 0, 1);
    const py = clamp((p.y - rect.top) / rect.height, 0, 1);
    const nx = (px - 0.5) * 2; // -1 … 1
    const ny = (py - 0.5) * 2;

    root.style.setProperty("--tilt-ry", `${(nx * maxTilt).toFixed(2)}deg`);
    root.style.setProperty("--tilt-rx", `${(-ny * maxTilt).toFixed(2)}deg`);
    root.style.setProperty("--tilt-s", String(hoverScale));
    root.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
    root.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    root.style.setProperty("--shadow-x", `${(-nx * SHADOW_SHIFT).toFixed(1)}px`);
    root.style.setProperty("--shadow-y", `${(-ny * SHADOW_SHIFT).toFixed(1)}px`);
  }, [hoverScale, maxTilt]);

  const reset = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    root.dataset.active = "false";
    root.style.setProperty("--tilt-ry", "0deg");
    root.style.setProperty("--tilt-rx", "0deg");
    root.style.setProperty("--tilt-s", "1");
    root.style.setProperty("--shadow-x", "0px");
    root.style.setProperty("--shadow-y", "0px");
    rectRef.current = null;
    pointerRef.current = null;
  }, []);

  const onPointerEnter = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || e.pointerType === "touch") return;
      const root = rootRef.current;
      if (!root) return;
      rectRef.current = root.getBoundingClientRect();
      root.dataset.active = "true";
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || e.pointerType === "touch") return;
      if (!rectRef.current && rootRef.current) rectRef.current = rootRef.current.getBoundingClientRect();
      pointerRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(paint);
    },
    [enabled, paint],
  );

  // Si el efecto se desactiva en caliente (cambio de media query) dejamos la tarjeta en reposo.
  useEffect(() => {
    if (!enabled) reset();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, reset]);

  const rootVars: CSSVars = {
    perspective: "1200px",
    "--tilt-rx": "0deg",
    "--tilt-ry": "0deg",
    "--tilt-s": 1,
    "--glare-x": "50%",
    "--glare-y": "50%",
    "--shadow-x": "0px",
    "--shadow-y": "0px",
  };
  // tinte de la sombra: acento del plato con alpha (hex #RRGGBBAA) fundido a negro
  const shadowTint = /^#[0-9a-f]{6}$/i.test(glowColor) ? `${glowColor}73` : "rgba(178,30,39,0.45)";

  return (
    <div
      ref={rootRef}
      data-active="false"
      className={cn("group/tilt relative", className)}
      style={rootVars}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {/* Sombra de profundidad: se mueve en sentido contrario a la inclinación */}
      {shadow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 -bottom-3 top-10 -z-10 rounded-[inherit] opacity-60 blur-2xl transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-data-[active=true]/tilt:opacity-95 group-data-[active=true]/tilt:duration-150"
          style={{
            background: `radial-gradient(ellipse at 50% 35%, ${shadowTint}, rgba(0,0,0,0.85) 70%)`,
            transform: "translate3d(var(--shadow-x), var(--shadow-y), 0) scale(0.96)",
          }}
        />
      )}

      {/* Elemento que rota. Sus hijos pueden abrir su propio contexto 3D (flip). */}
      <div
        className={cn(
          "relative h-full w-full preserve-3d will-change-transform transition-transform duration-700 ease-[var(--ease-out-expo)] group-data-[active=true]/tilt:duration-100 group-data-[active=true]/tilt:ease-linear",
          innerClassName,
        )}
        style={{ transform: "rotateX(var(--tilt-rx)) rotateY(var(--tilt-ry)) scale(var(--tilt-s))" }}
      >
        {children}

        {/* Destello que sigue al puntero, ligeramente por delante de la superficie */}
        {glare && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-500 group-data-[active=true]/tilt:opacity-100"
            style={{
              transform: "translateZ(2px)",
              background:
                "radial-gradient(circle at var(--glare-x) var(--glare-y), rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 22%, rgba(255,255,255,0) 58%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
