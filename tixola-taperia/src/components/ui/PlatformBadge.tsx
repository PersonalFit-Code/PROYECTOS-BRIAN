"use client";

import { Star } from "lucide-react";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { formatNumber } from "@/lib/format";
import { clamp, cn } from "@/lib/utils";

/**
 * Distintivos de plataforma: el glifo de Google o de TripAdvisor y la fila de estrellas de una nota.
 *
 * ESTE FICHERO SE LLAMABA `ReviewCard.tsx` y pintaba, además, la tarjeta de una reseña con su texto,
 * su autor y su ciudad. Esa tarjeta se retiró el 13-10-2026 junto con las cuarenta reseñas copiadas
 * que alimentaba (el porqué, en el bloque 3 de `SocialProof.tsx`). Lo que queda son las dos piezas
 * que sí se siguen usando —en los enlaces a las fichas de la portada y en el pie— y que no reproducen
 * nada de nadie: un logotipo y una nota propia.
 */

/** Las dos plataformas donde está la ficha del local. */
export type ReviewSource = "TripAdvisor" | "Google";

/** Glifo de plataforma (G de Google / búho de TripAdvisor) como SVG inline. */
export function PlatformGlyph({ source, className }: { source: ReviewSource; className?: string }) {
  if (source === "Google") {
    return (
      <svg viewBox="0 0 24 24" className={cn("h-4 w-4 shrink-0", className)} aria-hidden>
        <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" fill="#4285F4" />
        <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.8 19.8 8.1 22 12 22z" fill="#34A853" />
        <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.6L6.4 14z" fill="#FBBC05" />
        <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" fill="#EA4335" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4 shrink-0", className)} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#34E0A1" />
      <path d="M4.2 10c2.2-2 4.9-2.7 7.8-2.7s5.6.7 7.8 2.7" fill="none" stroke="#0b1f18" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 7.6 13.5 9.9h-3z" fill="#0b1f18" />
      <circle cx="8.2" cy="13.4" r="3.1" fill="none" stroke="#0b1f18" strokeWidth="1.5" />
      <circle cx="15.8" cy="13.4" r="3.1" fill="none" stroke="#0b1f18" strokeWidth="1.5" />
      <circle cx="8.2" cy="13.4" r="1.25" fill="#0b1f18" />
      <circle cx="15.8" cy="13.4" r="1.25" fill="#0b1f18" />
    </svg>
  );
}

/**
 * Fila de 5 estrellas doradas (lucide Star rellena) con relleno parcial para medias (4,4 → cuatro y
 * media larga). La etiqueta accesible sale de m.social.card.stars en el idioma activo.
 */
export function Stars({ rating, size = "md", className }: { rating: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const pct = `${clamp((rating / 5) * 100, 0, 100)}%`;
  const dim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4.5 w-4.5";
  const label = t(m.social.card.stars, {
    rating: formatNumber(rating, locale, { decimals: Number.isInteger(rating) ? 0 : 1 }),
  });
  const row = (filled: boolean) => (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        /* Sin `drop-shadow`: a 14 px el halo no se distingue y eran hasta 180 filtros desplazándose por el
           carril de reseñas. El dorado se queda en el TOKEN de marca (`--color-gold`, #e8c27a) y no en un
           hexadecimal escrito a mano: el elemento más repetido de la sección de opiniones no es el sitio
           donde introducir un dorado que no existe en la paleta. */
        <Star
          key={i}
          className={cn(dim, filled ? "fill-gold text-gold" : "fill-transparent text-cream/25")}
          strokeWidth={1.6}
          aria-hidden
        />
      ))}
    </span>
  );
  return (
    <span className={cn("relative inline-flex", className)} role="img" aria-label={label}>
      {row(false)}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: pct }} aria-hidden>
        {row(true)}
      </span>
    </span>
  );
}
