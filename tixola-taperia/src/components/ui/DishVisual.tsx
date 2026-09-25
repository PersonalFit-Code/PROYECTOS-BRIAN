"use client";

import type { Transition } from "framer-motion";
import Image from "next/image";
import type { CSSProperties } from "react";
import { DishIcon } from "@/components/icons/DishIcons";
import type { StarDish } from "@/data/dishes";
import type { Photo } from "@/data/photos";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * DishVisual — la imagen de cada plato estrella, compartida por el carrusel y el detalle.
 *
 *  · Con foto real → `next/image` a sangre (object-cover) con el foco de encuadre del manifiesto de
 *    fotos (`photo.focus` → object-position) y un viñeteado suave que la funde con el hierro.
 *  · Sin foto → visual compuesto y cinematográfico, SIN emojis: tixola de hierro fundido dibujada con
 *    degradados radiales + sombras internas, el icono de línea del plato (`DishIcon`) en dorado con halo
 *    rojo de brasa y volutas de vapor en CSS puro.
 *
 * Rellena por completo a su contenedor (`absolute inset-0`): quien lo usa decide la proporción (3:4 en la
 * tarjeta del carrusel, 4:3 o columna completa en el detalle). Las micro‑interacciones se resuelven con
 * `group-hover` en el ancestro y `prefers-reduced-motion` a nivel global (globals.css).
 */

/** Foto mínima que necesita el visual (subconjunto de `Photo` del manifiesto o `StarDish.image`). */
export type DishPhoto = Pick<Photo, "src" | "alt" | "focus">;

/** Plato + su foto ya resuelta (`null` → visual compuesto). Lo comparten carrusel y detalle. */
export interface DishSlide {
  dish: StarDish;
  photo: DishPhoto | null;
}

/** `layoutId` (framer-motion) del elemento compartido entre la tarjeta del carrusel y el detalle. */
export const dishVisualLayoutId = (dishId: string) => `dish-visual-${dishId}`;

/** Transición del elemento compartido (la foto viaja de la tarjeta al detalle y vuelve). */
export const DISH_LAYOUT_TRANSITION: Transition = { layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } };

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

export interface DishVisualProps {
  dish: Pick<StarDish, "id" | "name" | "emoji" | "accent">;
  /** foto real; `null` pinta la tixola compuesta */
  photo: DishPhoto | null;
  /** atributo `sizes` de next/image (obligatorio con `fill`) */
  sizes: string;
  /** volutas de vapor + flotación del icono (desactívalas en tier "low" / reduced motion) */
  steam?: boolean;
  /** "slide": tarjeta del carrusel · "sheet": detalle (tixola e icono algo mayores) */
  variant?: "slide" | "sheet";
  /** prioridad de carga de la foto (solo para la tarjeta visible al entrar) */
  priority?: boolean;
  className?: string;
}

/** Keyframes propios del componente. React 19 los eleva al <head> y los deduplica por `href`. */
const STEAM_CSS = `
@keyframes tx-steam {
  0%   { transform: translate3d(0, 12px, 0) scale(0.55, 0.6); opacity: 0; }
  25%  { opacity: 0.7; }
  100% { transform: translate3d(var(--drift, 0px), -92px, 0) scale(1.4, 1.3); opacity: 0; }
}
@keyframes tx-dish-float {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50%      { transform: translate3d(0, -6px, 0); }
}
.tx-steam-wisp {
  animation: tx-steam var(--dur, 3.4s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
  will-change: transform, opacity;
}
.tx-dish-float {
  animation: tx-dish-float 5.5s ease-in-out infinite;
}
`;

const WISPS: ReadonlyArray<{ left: string; drift: string; dur: string; delay: string; width: string }> = [
  { left: "40%", drift: "-14px", dur: "3.6s", delay: "0s", width: "12px" },
  { left: "51%", drift: "6px", dur: "4.1s", delay: "1.2s", width: "16px" },
  { left: "61%", drift: "16px", dur: "3.2s", delay: "2.3s", width: "10px" },
];

/* Superficies de hierro fundido (degradados + sombras). Se declaran una vez, fuera del render. */
const IRON_BODY: CSSProperties = {
  background: "radial-gradient(circle at 36% 28%, #474747 0%, #262626 34%, #111111 72%, #050505 100%)",
  boxShadow:
    "0 36px 60px -14px rgba(0,0,0,0.92), 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 2px rgba(255,255,255,0.16), inset 0 -10px 22px rgba(0,0,0,0.65)",
};
const IRON_WELL: CSSProperties = {
  background: "radial-gradient(circle at 50% 42%, #2b1b18 0%, #161313 48%, #0a0a0a 100%)",
  boxShadow: "inset 0 14px 28px rgba(0,0,0,0.9), inset 0 -3px 8px rgba(255,255,255,0.05), 0 1px 0 rgba(255,255,255,0.09)",
};
const IRON_HANDLE: CSSProperties = {
  background: "linear-gradient(180deg, #3a3a3a 0%, #1c1c1c 55%, #0a0a0a 100%)",
  boxShadow: "0 8px 14px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14)",
};
const ICON_GLOW: CSSProperties = {
  filter:
    "drop-shadow(0 0 10px rgba(216,50,60,0.9)) drop-shadow(0 0 28px rgba(178,30,39,0.55)) drop-shadow(0 12px 12px rgba(0,0,0,0.6))",
};

export default function DishVisual({ dish, photo, sizes, steam = true, variant = "slide", priority = false, className }: DishVisualProps) {
  const m = useMessages();
  const t = useFormat();

  /* ── Foto real ── */
  if (photo) {
    return (
      <div className={cn("absolute inset-0 overflow-hidden bg-iron-800", className)}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          draggable={false}
          className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          style={{ objectPosition: photo.focus ?? "50% 50%" }}
        />
        {/* viñeta: funde los bordes de la foto con el hierro de la tarjeta */}
        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.55)]" />
      </div>
    );
  }

  /* ── Visual compuesto: tixola de hierro + icono del plato ── */
  const iconSize = variant === "sheet" ? 96 : 72;
  /* Ancho de la tixola relativo al contenedor (unidades de container query; el `w-[62%]` es el
     respaldo si el navegador no las soporta: el estilo inline inválido se ignora y manda la clase). */
  const plateWidth = variant === "sheet" ? "min(56cqw, 66cqh)" : "min(64cqw, 70cqh)";
  const vars: CSSVars = { "--accent": dish.accent };

  return (
    <div
      role="img"
      aria-label={t(m.dishes.visual.label, { name: dish.name })}
      style={vars}
      className={cn("absolute inset-0 overflow-hidden bg-iron-900 [container-type:size]", className)}
    >
      <style href="tixola-dish-visual" precedence="default">
        {STEAM_CSS}
      </style>

      {/* 1 · Pizarra de fondo + viñeta oscura */}
      <div aria-hidden className="absolute inset-0 bg-[url('/textures/slate.webp')] bg-cover bg-center opacity-60" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_30%,rgba(12,12,12,0.92)_100%)]" />

      {/* 2 · Brasa: halo rojo pimentón bajo la tixola (se aviva con hover) + reflejo del color de acento */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[52%] h-[70%] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(216,50,60,0.5),rgba(178,30,39,0.16)_50%,transparent_100%)] opacity-80 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[48%] h-[46%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-3xl"
        style={{ background: `radial-gradient(circle, ${dish.accent}66, transparent 70%)` }}
      />

      {/* 3 · Tixola de hierro fundido */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 transition-[scale] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
        style={{ width: plateWidth }}
      >
        {/* orejas laterales (detrás del cuerpo) */}
        <span className="absolute -left-[9%] top-1/2 h-[13%] w-[18%] -translate-y-1/2 rounded-full" style={IRON_HANDLE} />
        <span className="absolute -right-[9%] top-1/2 h-[13%] w-[18%] -translate-y-1/2 rounded-full" style={IRON_HANDLE} />
        {/* cuerpo exterior con luz de borde arriba‑izquierda */}
        <div className="absolute inset-0 rounded-full" style={IRON_BODY} />
        {/* aro brillante del bisel */}
        <div className="absolute inset-[8%] rounded-full border border-white/[0.07] shadow-[inset_2px_3px_4px_rgba(255,255,255,0.1)]" />
        {/* interior curado, con ese calor rojizo en el centro */}
        <div className="absolute inset-[11%] rounded-full" style={IRON_WELL} />
        {/* reflejo del aceite sobre el hierro */}
        <div className="absolute left-[24%] top-[22%] h-[13%] w-[34%] -rotate-[24deg] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.2),transparent)] blur-[2px]" />
        {/* icono del plato: dorado con halo rojo de brasa */}
        <div className="absolute inset-0 grid place-items-center">
          <span className={cn("block text-gold", steam && "tx-dish-float")} style={ICON_GLOW}>
            <DishIcon iconKey={dish.emoji} size={iconSize} strokeWidth={1.35} />
          </span>
        </div>
      </div>

      {/* 4 · Vapor */}
      {steam && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[6%] h-[44%] overflow-visible">
          {WISPS.map((w) => (
            <span
              key={w.left}
              className="tx-steam-wisp absolute bottom-0 h-24 rounded-full bg-gradient-to-t from-transparent via-cream/25 to-transparent blur-[6px]"
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
