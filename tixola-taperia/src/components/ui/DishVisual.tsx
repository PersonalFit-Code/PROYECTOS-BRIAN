"use client";

import Image from "next/image";
import { useId, type CSSProperties } from "react";
import type { StarDish } from "@/data/dishes";
import { cn } from "@/lib/utils";

/**
 * DishVisual — el "hero visual" de cada tarjeta de plato estrella.
 *
 * Composición (de atrás hacia delante):
 *  1. Glow radial con el color de acento del plato (se intensifica con `group-hover`).
 *  2. Tixola de hierro fundido dibujada en SVG: borde con brillo de luz, superficie
 *     curada con textura procedural, orejas laterales y reflejo especular.
 *  3. El emoji del plato en grande con sombra proyectada (o `next/image` si el plato
 *     tiene foto real), que se eleva y escala con `group-hover`.
 *  4. Volutas de vapor en CSS puro que suben desde el plato.
 *
 * No tiene estado: todas las micro‑interacciones se resuelven con `group-hover`
 * en el ancestro y con `prefers-reduced-motion` a nivel global (globals.css).
 */

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

interface DishVisualProps {
  dish: Pick<StarDish, "name" | "emoji" | "accent" | "image">;
  /** volutas de vapor animadas (desactívalas en tier "low") */
  steam?: boolean;
  /** tamaño del emoji / imagen respecto al contenedor */
  size?: "card" | "sheet";
  className?: string;
}

/** Keyframes propios del componente. React 19 los eleva al <head> y los deduplica por `href`. */
const STEAM_CSS = `
@keyframes tx-steam {
  0%   { transform: translate3d(0, 14px, 0) scale(0.55, 0.6); opacity: 0; }
  25%  { opacity: 0.75; }
  100% { transform: translate3d(var(--drift, 0px), -78px, 0) scale(1.35, 1.25); opacity: 0; }
}
@keyframes tx-hover-dish {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); }
  50%      { transform: translate3d(0, -6px, 0) rotate(2deg); }
}
.tx-steam-wisp {
  animation: tx-steam var(--dur, 3.2s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
  will-change: transform, opacity;
}
.tx-dish-float {
  animation: tx-hover-dish 5.5s ease-in-out infinite;
}
`;

const WISPS: ReadonlyArray<{ left: string; drift: string; dur: string; delay: string; width: string }> = [
  { left: "38%", drift: "-12px", dur: "3.4s", delay: "0s", width: "12px" },
  { left: "50%", drift: "6px", dur: "3.9s", delay: "1.1s", width: "16px" },
  { left: "61%", drift: "14px", dur: "3.1s", delay: "2.2s", width: "10px" },
];

export default function DishVisual({ dish, steam = true, size = "card", className }: DishVisualProps) {
  // ids únicos para los <defs> del SVG: evita colisiones con otras instancias en la misma página
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;

  const vars: CSSVars = { "--accent": dish.accent };
  const emojiSize = size === "sheet" ? "text-[6.5rem] sm:text-[7.5rem]" : "text-[4.75rem] md:text-[5.25rem]";

  return (
    <div className={cn("relative aspect-square w-full select-none", className)} style={vars} aria-hidden>
      <style href="tixola-dish-visual" precedence="default">
        {STEAM_CSS}
      </style>

      {/* 1 · Glow de acento (se intensifica al hacer hover en el ancestro .group) */}
      <div
        className="absolute inset-[-12%] rounded-full opacity-60 blur-2xl transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${dish.accent}8c 0%, ${dish.accent}33 38%, transparent 66%)`,
        }}
      />
      {/* halo rojo pimentón: la brasa bajo la tixola */}
      <div className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle_at_50%_70%,rgba(216,50,60,0.45),transparent_60%)] opacity-70 blur-xl transition-opacity duration-700 group-hover:opacity-100" />

      {/* 2 · Tixola de hierro fundido */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full drop-shadow-[0_24px_28px_rgba(0,0,0,0.65)]" role="presentation">
        <defs>
          {/* superficie del hierro: metal oscuro con reflejo frío arriba a la izquierda */}
          <radialGradient id={id("iron")} cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#3b3b3b" />
            <stop offset="45%" stopColor="#1f1f1f" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          {/* interior curado: más negro, con un leve calor rojizo en el centro */}
          <radialGradient id={id("pan")} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#2a1a18" />
            <stop offset="55%" stopColor="#141212" />
            <stop offset="100%" stopColor="#0b0b0b" />
          </radialGradient>
          {/* brillo del borde: luz que barre el aro superior‑izquierdo */}
          <linearGradient id={id("rim")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor={dish.accent} stopOpacity="0.35" />
          </linearGradient>
          {/* reflejo especular */}
          <radialGradient id={id("spec")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          {/* grano del hierro fundido */}
          <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.18" />
            </feComponentTransfer>
          </filter>
        </defs>

        {/* orejas laterales de la tixola */}
        <g fill={`url(#${id("iron")})`} stroke="rgba(255,255,255,0.08)" strokeWidth="1">
          <path d="M18 92 Q4 100 18 108 L34 106 L34 94 Z" />
          <path d="M182 92 Q196 100 182 108 L166 106 L166 94 Z" />
        </g>

        {/* cuerpo exterior */}
        <circle cx="100" cy="100" r="88" fill={`url(#${id("iron")})`} />
        {/* grano */}
        <circle cx="100" cy="100" r="88" filter={`url(#${id("grain")})`} fill="#ffffff" opacity="0.5" />
        {/* aro de luz en el borde */}
        <circle cx="100" cy="100" r="85" fill="none" stroke={`url(#${id("rim")})`} strokeWidth="3.5" />
        {/* bisel interior (sombra) */}
        <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(0,0,0,0.65)" strokeWidth="6" />
        {/* superficie curada */}
        <circle cx="100" cy="100" r="72" fill={`url(#${id("pan")})`} />
        {/* aceite brillante sobre el hierro */}
        <ellipse cx="80" cy="74" rx="26" ry="12" fill={`url(#${id("spec")})`} transform="rotate(-25 80 74)" />
        {/* brillo fino del borde interior */}
        <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
      </svg>

      {/* 3 · Foto real del plato sobre la superficie del hierro (r = 72/200 → inset 14 %) … */}
      {dish.image ? (
        <div className="absolute inset-[14%] overflow-hidden rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
          <Image src={dish.image} alt={dish.name} fill sizes="(min-width: 1024px) 220px, 60vw" className="object-cover" />
          {/* viñeta para fundir la foto con el hierro */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_26px_12px_rgba(10,10,10,0.75)]" />
        </div>
      ) : (
        /* … o el emoji del plato en grande, flotando sobre la tixola */
        <div className="absolute inset-0 grid place-items-center">
          <span
            className={cn(
              "tx-dish-float block leading-none drop-shadow-[0_22px_22px_rgba(0,0,0,0.7)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:-translate-y-1.5",
              emojiSize,
            )}
          >
            {dish.emoji}
          </span>
        </div>
      )}

      {/* 4 · Vapor */}
      {steam && (
        <div className="pointer-events-none absolute inset-x-0 top-[8%] h-[46%] overflow-visible">
          {WISPS.map((w, i) => (
            <span
              key={i}
              className="tx-steam-wisp absolute bottom-0 h-20 rounded-full bg-gradient-to-t from-transparent via-cream/25 to-transparent blur-[6px]"
              style={
                {
                  left: w.left,
                  width: w.width,
                  "--drift": w.drift,
                  "--dur": w.dur,
                  "--delay": w.delay,
                } as CSSVars
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
