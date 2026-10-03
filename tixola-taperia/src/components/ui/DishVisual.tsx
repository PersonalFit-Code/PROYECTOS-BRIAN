"use client";

import type { Transition } from "framer-motion";
import Image from "next/image";
import type { CSSProperties } from "react";
import { DishIcon } from "@/components/icons/DishIcons";
import type { StarDish } from "@/data/dishes";
import type { Photo } from "@/data/photos";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useCanAfford } from "@/hooks/usePerformanceTier";
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
export type DishPhoto = Pick<Photo, "src" | "alt" | "focus" | "srcTall">;

/** Plato + su foto ya resuelta (`null` → visual compuesto). Lo comparten carrusel y detalle. */
export interface DishSlide {
  dish: StarDish;
  photo: DishPhoto | null;
}

/** `layoutId` (framer-motion) del elemento compartido entre la tarjeta del carrusel y el detalle. */
export const dishVisualLayoutId = (dishId: string) => `dish-visual-${dishId}`;

/**
 * Transición del elemento compartido (la foto viaja de la tarjeta al detalle y vuelve).
 * 0,34 s en vez de 0,55: la proyección de framer mide y reescribe transform en cada fotograma del
 * viaje, así que este número es tiempo de hilo principal, no solo estética. Con el cuerpo de la ficha
 * entrando a 0,24 s el detalle queda legible a ~0,3 s del clic en vez de a ~0,67 s.
 */
export const DISH_LAYOUT_TRANSITION: Transition = { layout: { duration: 0.34, ease: [0.16, 1, 0.3, 1] } };

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

export interface DishVisualProps {
  dish: Pick<StarDish, "id" | "name" | "emoji" | "accent">;
  /** foto real; `null` pinta la tixola compuesta */
  photo: DishPhoto | null;
  /** atributo `sizes` de next/image (obligatorio con `fill`) */
  sizes: string;
  /**
   * Ambiente del visual compuesto: flotación del icono y volutas de vapor. Quien llama sigue pudiendo
   * apagarlo (p. ej. las caras que no están al frente del cilindro), pero las volutas llevan además su
   * propia puerta de gama dentro del componente: son bucles infinitos.
   */
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
  background: "radial-gradient(circle at 50% 42%, #2b1b18 0%, #161313 48%, #220c0a 100%)",
  boxShadow: "inset 0 14px 28px rgba(0,0,0,0.9), inset 0 -3px 8px rgba(255,255,255,0.05), 0 1px 0 rgba(255,255,255,0.09)",
};
const IRON_HANDLE: CSSProperties = {
  background: "linear-gradient(180deg, #3a3a3a 0%, #1c1c1c 55%, #220c0a 100%)",
  boxShadow: "0 8px 14px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.14)",
};
/*
 * Halo del icono: DOS drop-shadow, no tres ni uno. Cada `drop-shadow()` es una pasada de desenfoque sobre
 * la silueta del SVG, y había tres encadenadas por cara (hasta nueve caras a la vez en el cilindro), así
 * que la tercera —el bloom rojo ancho de 28 px— se va: ese calor ya lo pone la brasa horneada del fondo.
 * Pero la sombra negra de apoyo VUELVE: sin ella el icono dorado dejaba de apoyarse en el pozo de la
 * sartén y flotaba pegado, y eso pasaba en TODAS las gamas en la pieza que se enseña al pulsar "Platos
 * estrella". Dos pasadas es un tercio menos que el original, no dos tercios menos de icono.
 * Va en un envoltorio QUIETO — la flotación (`tx-dish-float`) se aplica a un hijo sin filtro.
 */
const ICON_GLOW: CSSProperties = {
  filter: "drop-shadow(0 0 16px rgba(232,86,90,0.8)) drop-shadow(0 4px 9px rgba(0,0,0,0.7))",
};

export default function DishVisual({ dish, photo, sizes, steam = true, variant = "slide", priority = false, className }: DishVisualProps) {
  const m = useMessages();
  const t = useFormat();
  /* Las volutas de vapor eran tres capas con `blur-[6px]` ANIMADAS —cada fotograma volvía a rasterizar un
     desenfoque por voluta, y en el cilindro hay varias caras compuestas a la vez—, así que se habían
     reservado a la gama alta. El efecto era que las tixolas del carrusel no humeaban en NINGÚN móvil (que
     arranca en "mid") ni en ningún portátil que la sonda no promocionara, y el vapor es media lectura de
     "recién hecho".
     La solución no es la gama, es el filtro: las volutas pasan a ser degradados radiales, suaves en los
     dos ejes por sí solos, sin `blur`. Sin filtro que rasterizar solo queda lo que ya había —tres capas
     moviendo `transform` y `opacity`, que resuelve el compositor—, así que basta con exigir movimiento
     ambiental (gama media y sin `prefers-reduced-motion`). */
  const canSteam = useCanAfford("ambientMotion");

  /* LA COLUMNA DE LA FICHA ES VERTICAL (375 × 758 px en escritorio, o sea 1:2) y la foto va a
     sangre. Con la versión apaisada ahí dentro, `object-cover` la agranda hasta cubrir el alto y de
     un plato de 4:3 se ve una franja del centro, ampliada: es el "al hacer zoom se ve mal". Con el
     recorte vertical (`srcTall`) el plato entra entero y a su tamaño.

     En móvil NO: allí el hueco es 4:3 apaisado y la buena es la ancha.

     `useIsMobile` devuelve `false` hasta montar, así que el primer fotograma de escritorio pinta la
     ancha. No es un parpadeo ni una descarga de más: es EXACTAMENTE la foto que el navegador acaba
     de bajar para la tarjeta sobre la que se ha pulsado —viaja con `layoutId` desde ella—, así que
     está en caché y se ve al instante mientras llega la vertical. */
  const esMovil = useIsMobile();
  const fuente = variant === "sheet" && !esMovil && photo?.srcTall ? photo.srcTall : photo?.src;

  /* ── Foto real ── */
  if (photo && fuente) {
    return (
      <div className={cn("absolute inset-0 overflow-hidden bg-granate-800", className)}>
        <Image
          src={fuente}
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
  const float = steam;
  const wisps = steam && canSteam;
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
      className={cn("absolute inset-0 overflow-hidden bg-granate-900 [container-type:size]", className)}
    >
      <style href="tixola-dish-visual" precedence="default">
        {STEAM_CSS}
      </style>

      {/* 1 · Pizarra de fondo + viñeta oscura */}
      <div aria-hidden className="absolute inset-0 bg-[url('/textures/slate.webp')] bg-cover bg-center opacity-60" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_30%,rgba(42,15,13,0.92)_100%)]" />

      {/* 2 · Brasa horneada: UNA capa con el halo rojo y el reflejo del acento fundidos en el mismo
             degradado. Antes eran dos divs con `blur-2xl` y `blur-3xl`, es decir dos superficies extra
             que el compositor rasterizaba y ampliaba por el radio del desenfoque… en cada una de las
             caras del cilindro. Desenfocar un radial es trabajo tirado: el degradado ya es suave, así
             que basta con repartir bien las paradas (el acento del plato entra como parada intermedia). */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[52%] h-[74%] w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-85 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: `radial-gradient(closest-side, rgba(232,86,90,0.5) 0%, ${dish.accent}4d 30%, rgba(158,22,24,0.18) 56%, rgba(158,22,24,0.06) 76%, transparent 100%)`,
        }}
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
        {/* icono del plato: dorado con halo rojo de brasa. El filtro se queda en el envoltorio quieto
            y la flotación viaja al hijo: un filtro sobre algo que se mueve se vuelve a resolver en
            cada fotograma, y aquí eso se multiplicaba por las caras visibles del cilindro. */}
        <div className="absolute inset-0 grid place-items-center">
          <span className="block text-gold" style={ICON_GLOW}>
            <span className={cn("block", float && "tx-dish-float")}>
              <DishIcon iconKey={dish.emoji} size={iconSize} strokeWidth={1.35} />
            </span>
          </span>
        </div>
      </div>

      {/* 4 · Vapor (gama media en adelante: ya no hay desenfoque, solo transform y opacidad) */}
      {wisps && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[6%] h-[44%] overflow-visible">
          {WISPS.map((w) => (
            <span
              key={w.left}
              className="tx-steam-wisp absolute bottom-0 h-24 rounded-full bg-[radial-gradient(closest-side,rgba(246,244,231,0.3),rgba(246,244,231,0.14)_46%,rgba(246,244,231,0.04)_72%,transparent_100%)]"
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
