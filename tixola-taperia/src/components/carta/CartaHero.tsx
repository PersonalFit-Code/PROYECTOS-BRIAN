"use client";

import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * CartaHero — cabecera editorial de la página /carta.
 *
 * Kicker en Cinzel, h1 "La Carta *de Tixola*" con la palabra acentuada en la manuscrita del
 * logotipo sobre el degradado de brasa, y la descripción debajo.
 *
 * AQUÍ HABÍA DOS POLAROIDS —la pizarra del día y la carta de papel fotografiadas— y las quitó el
 * cliente. Tenía razón: eran fotos de un papel, pequeñas y borrosas, justo encima de la carta de
 * verdad, que está completa, traducida y se lee. Con ellas la primera impresión de la página era
 * "mira, aquí hay una foto de una carta"; sin ellas, la primera impresión es la carta.
 *
 * Los archivos (`/images/carta-pizarra.png`, `/images/carta-fisica.png`) se quedan en `public`: no
 * los pinta nadie, pero son el documento de origen de los precios y de los alérgenos, y hacen falta
 * para cotejar cuando la casa cambie algo.
 */

export interface CartaHeroProps {
  className?: string;
}

export default function CartaHero({ className }: CartaHeroProps) {
  const m = useMessages();

  return (
    <div className={cn("relative py-10 md:py-14 lg:py-16", className)}>
      {/* Brasa de fondo tras el titular. Horneada: 420² px con `blur-2xl` era lo primero que tenía que
          rasterizar el navegador al abrir /carta, justo cuando llega el titular. */}
      <div
        aria-hidden
        className="ember-glow absolute -left-24 top-1/2 -z-10 h-[420px] w-[420px] -translate-y-1/2 rounded-full [--ember-a1:0.35]"
      />

      <div className="max-w-3xl">
        <p className="inline-flex items-center gap-3 font-caps text-xs uppercase tracking-[0.3em] text-pimenton-a11y">
          <span aria-hidden className="h-px w-8 bg-pimenton-light/70" />
          {m.carta.kicker}
        </p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cream text-balance md:text-6xl lg:text-7xl">
          {m.carta.title} <em className="text-gradient-ember font-script text-[1.26em] font-normal not-italic leading-[0.74]">{m.carta.accent}</em>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-muted text-pretty md:text-lg">{m.carta.description}</p>
      </div>
    </div>
  );
}
