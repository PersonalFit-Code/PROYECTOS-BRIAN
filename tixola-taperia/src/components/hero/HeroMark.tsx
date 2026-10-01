"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * LA SARTÉN DE LA MARCA, sola — el isotipo de Tixola sin el texto "Tixola · vinoteca - tapería".
 *
 * El cliente pidió exactamente esto: la sartén con los grelos, sin la parte escrita, enganchada a la
 * "o" de "Tapeo" del titular. Sin el texto el dibujo deja de competir con el H1 (eran crema sobre
 * crema) y puede solaparse con la última letra sin estorbar: lo que pisa son trazos finos y aire.
 *
 * VA VECTORIZADO. El archivo de marca es un PNG de 464×276 y aquí se pinta a 350-460 px en pantallas
 * de densidad doble; ampliado al doble los trazos del dibujo a mano se deshacen. El SVG está trazado
 * desde el canal alfa de ese mismo PNG, forma por forma, y pesa 31 KB comprimido frente a 71 KB.
 *
 * Se monta en DOS SITIOS, cada uno con su composición (ver `HeroCanvas` y `Hero`):
 *  · móvil — en una banda propia bajo la cabecera, centrada;
 *  · escritorio — colgando del final de la primera línea del titular.
 * Por eso no decide su tamaño: lo hereda del contenedor (`w-full`).
 */

export const HERO_MARK = { src: "/brand/tixola-mark.svg", width: 456, height: 267.4 } as const;

/** Proporción alto/ancho del dibujo, para reservar su hueco sin medir nada. */
export const HERO_MARK_RATIO = HERO_MARK.height / HERO_MARK.width;

/**
 * Dónde cae el DISCO de la sartén dentro del dibujo, medido sobre el canal alfa del PNG original
 * (no a ojo). Son los dos números que permiten engancharlo a la "o":
 *  · el disco empieza en el borde izquierdo del dibujo (el `viewBox` va ajustado a la tinta) y ocupa
 *    el 41,6 % del ancho;
 *  · su centro vertical está al 32,3 % del alto, no en la mitad, porque por encima solo está el
 *    mango y por debajo no hay nada.
 */
export const PAN_DISC = { widthPct: 41.6, centerYPct: 32.3 } as const;

/**
 * Animaciones. Las dos van dentro de `@media (prefers-reduced-motion: no-preference)` y NO se apoyan
 * en la regla global de `globals.css`: esa regla deja la duración en 0,001 ms pero no toca el retardo
 * ni el `fill-mode`, así que una entrada con `backwards` y retardo dejaría el dibujo invisible ese
 * rato y luego aparecería de golpe. Declarándolas solo cuando hay permiso para moverse, quien pide
 * menos movimiento ve la sartén quieta y entera desde el primer fotograma.
 *
 * El BRILLO se consigue enmascarando con el propio SVG una franja de luz que cruza: así la luz solo
 * se ve sobre la tinta del dibujo, nunca como un rectángulo. Si el navegador no soporta máscaras CSS
 * la franja no se monta siquiera (`display:none` de base + `@supports`), porque sin máscara sería una
 * banda clara barriendo la portada.
 */
const MARK_CSS = `
@keyframes tixola-marca-entra {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes tixola-brillo {
  0%, 12%   { transform: translateX(-130%); }
  48%, 100% { transform: translateX(330%); }
}
.tixola-brillo-caja { display: none; }
@supports (mask-image: url("${HERO_MARK.src}")) or (-webkit-mask-image: url("${HERO_MARK.src}")) {
  .tixola-brillo-caja {
    display: block;
    overflow: hidden;
    -webkit-mask-image: url("${HERO_MARK.src}");
    mask-image: url("${HERO_MARK.src}");
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }
}
.tixola-brillo {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 42%;
  background: linear-gradient(104deg, transparent 0%, rgba(255,228,186,0.85) 50%, transparent 100%);
  mix-blend-mode: screen;
  transform: translateX(-130%);
}
@media (prefers-reduced-motion: no-preference) {
  .tixola-marca-entra { animation: tixola-marca-entra 1.15s var(--ease-out-expo) 0.6s backwards; }
  .tixola-brillo { animation: tixola-brillo 9s ease-in-out 2.6s infinite; }
}
`;

export interface HeroMarkProps {
  /** `paused` cuando nadie mira la portada: pausar es más barato que desmontar. */
  play?: CSSProperties["animationPlayState"];
  /** Flotación lenta del tema (`animate-float`). Se apaga en la composición de escritorio. */
  float?: boolean;
  className?: string;
}

export default function HeroMark({ play = "running", float = false, className }: HeroMarkProps) {
  return (
    <span className={cn("relative block", className)}>
      <style href="tixola-marca" precedence="default">
        {MARK_CSS}
      </style>

      {/* Calor detrás del disco, no del dibujo entero: el centro del resplandor es el centro de la
          sartén, que es lo que mira el ojo. Posicionado con las mismas cifras que usan las dos
          composiciones para engancharla, así nunca se descuelga del hierro. */}
      <span
        aria-hidden
        className="absolute aspect-square rounded-full bg-[radial-gradient(closest-side,rgba(255,146,80,0.34)_0%,rgba(172,32,34,0.22)_46%,transparent_76%)]"
        style={{
          width: `${PAN_DISC.widthPct * 2.1}%`,
          left: `${PAN_DISC.widthPct / 2}%`,
          top: `${PAN_DISC.centerYPct}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      <span className={cn("block", float && "animate-float")} style={float ? { animationPlayState: play } : undefined}>
        <span className="tixola-marca-entra relative block">
          <Image
            src={HERO_MARK.src}
            width={HERO_MARK.width}
            height={HERO_MARK.height}
            alt=""
            /* Está en el primer viewport: se precarga y no se difiere. `unoptimized` porque un SVG no
               tiene nada que optimizar y sin esa marca Next lo rechaza salvo que se abra
               `dangerouslyAllowSVG`, que es una puerta que no hace falta abrir. */
            priority
            unoptimized
            draggable={false}
            className="h-auto w-full select-none"
          />
          <span aria-hidden className="tixola-brillo-caja absolute inset-0">
            <span className="tixola-brillo" style={{ animationPlayState: play }} />
          </span>
        </span>
      </span>
    </span>
  );
}
