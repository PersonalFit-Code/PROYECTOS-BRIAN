"use client";

import { Quote, Star } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { Review } from "@/data/reviews";
import { LOCALE_META, type Locale } from "@/i18n/config";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { clamp, cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Utilidades (exportadas: las reutilizan SocialProof, Footer y ReviewMarquee)
   ────────────────────────────────────────────────────────────── */

export type ReviewSource = Review["source"];

/**
 * "2026-07" → "jul 2026" (es-ES) · "Jul 2026" (en-GB) · "2026" → "2026".
 * Usa el Intl del idioma activo; la fecha se construye en UTC para que el mes no baile por zona horaria.
 */
export function formatReviewDate(date: string, locale: Locale): string {
  const intl = LOCALE_META[locale].intl;
  const ym = /^(\d{4})-(\d{2})$/.exec(date);
  if (ym) {
    const d = new Date(Date.UTC(Number(ym[1]), Number(ym[2]) - 1, 1));
    return new Intl.DateTimeFormat(intl, { month: "short", year: "numeric", timeZone: "UTC" }).format(d);
  }
  /* "2026" (solo año) u otro formato: se muestra tal cual. */
  return date;
}

/**
 * Los textos se reproducen tal cual los escribió el cliente, pero la web no pinta emojis:
 * se retiran los pictogramas (y sus selectores de variante / uniones) y se normalizan los espacios.
 */
export function sanitizeReviewText(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Iniciales del autor: "Fernando R." → "FR" · "PacoSarria" → "PS" · "Nana" → "N" · "Al_peLi" → "AP". */
export function initialsOf(name: string): string {
  const words = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) {
    const capitals = words[0].match(/\p{Lu}/gu);
    const pair = capitals && capitals.length >= 2 ? capitals[0] + capitals[1] : words[0].slice(0, 1);
    return pair.toLocaleUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toLocaleUpperCase();
}

/** Tono determinista (0–359) a partir del nombre: el mismo autor siempre recibe el mismo color. */
export function hueOf(name: string): number {
  let h = 7;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Colores del avatar: fondo oscuro desaturado + iniciales claras (contraste > 4,5:1 en cualquier tono). */
function avatarStyle(name: string): CSSProperties {
  const h = hueOf(name);
  return {
    backgroundColor: `hsl(${h} 40% 24%)`,
    color: `hsl(${h} 70% 86%)`,
    boxShadow: `inset 0 0 0 1px hsl(${h} 55% 42% / 0.55)`,
  };
}

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
    rating: rating.toLocaleString(LOCALE_META[locale].intl, { maximumFractionDigits: 1 }),
  });
  const row = (filled: boolean) => (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(dim, filled ? "fill-gold text-gold drop-shadow-[0_0_6px_rgba(232,194,122,0.5)]" : "fill-transparent text-cream/25")}
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

/** Envuelve la primera aparición de `highlight` dentro de `text` con un <mark> pimentón. */
function HighlightedText({ text, highlight }: { text: string; highlight?: string }): ReactNode {
  if (!highlight) return text;
  const idx = text.toLocaleLowerCase("es").indexOf(highlight.toLocaleLowerCase("es"));
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-pimenton/25 px-1 text-cream">{text.slice(idx, idx + highlight.length)}</mark>
      {text.slice(idx + highlight.length)}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   Tarjeta
   ────────────────────────────────────────────────────────────── */

export interface ReviewCardProps {
  review: Review;
  /**
   * Cristal ahumado (backdrop-filter). Desactívalo en dispositivos modestos: docenas de tarjetas
   * con blur en movimiento son caras; sin él la tarjeta usa un fondo hierro semiopaco.
   */
  glass?: boolean;
  /** Líneas visibles del texto antes de recortarlo (las reseñas largas se cortan con elipsis). */
  maxLines?: 5 | 6 | 7 | 8;
  className?: string;
}

const CLAMP: Record<NonNullable<ReviewCardProps["maxLines"]>, string> = {
  5: "line-clamp-5",
  6: "line-clamp-6",
  7: "line-clamp-7",
  8: "line-clamp-8",
};

/**
 * ReviewCard — tarjeta de reseña real para las columnas del marquee.
 *  · Avatar de iniciales con tono determinista (sin imágenes externas), autor y ciudad.
 *  · 5 estrellas doradas según la puntuación, título en Cormorant cursiva y texto con el plato o
 *    detalle destacado (`review.highlight`) resaltado en pimentón.
 *  · Pie con la plataforma (Google / TripAdvisor) y la fecha localizada ("jul 2026").
 *  · Sin emojis: el texto pasa por `sanitizeReviewText`.
 */
export default function ReviewCard({ review, glass = true, maxLines = 7, className }: ReviewCardProps) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();

  const text = sanitizeReviewText(review.text);
  const title = review.title ? sanitizeReviewText(review.title) : undefined;

  return (
    <article
      aria-label={t(m.social.card.by, { author: review.author })}
      className={cn(
        "relative flex shrink-0 flex-col gap-4 overflow-hidden rounded-2xl border border-cream/10 p-5 text-left",
        glass ? "glass-smoke" : "bg-iron-800/90 shadow-card",
        className,
      )}
    >
      {/* Brillo superior + comillas decorativas */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cream/25 to-transparent" />
      <Quote aria-hidden className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 rotate-180 fill-pimenton/10 text-pimenton/20" strokeWidth={0.8} />

      {/* Autor */}
      <header className="relative flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-caps text-sm font-semibold tracking-wide"
          style={avatarStyle(review.author)}
        >
          {initialsOf(review.author)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-semibold text-cream">{review.author}</p>
          <p className="truncate text-xs text-cream-faint">{review.location ?? m.social.card.verified}</p>
        </div>
        <Stars rating={review.rating} size="sm" className="shrink-0" />
      </header>

      {/* Título + texto */}
      {title && <p className="relative font-display text-lg italic leading-snug text-cream text-balance">{title}</p>}
      <blockquote className={cn("relative text-sm leading-relaxed text-cream-muted text-pretty", CLAMP[maxLines])}>
        <p>
          «<HighlightedText text={text} highlight={review.highlight} />»
        </p>
      </blockquote>

      {/* Pie: plataforma + fecha */}
      <footer className="relative mt-auto flex items-center justify-between gap-3 border-t border-cream/10 pt-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-cream/10 bg-iron/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-cream-200"
          aria-label={t(m.social.card.on, { source: review.source })}
        >
          <PlatformGlyph source={review.source} className="h-3.5 w-3.5" />
          {review.source}
        </span>
        <time dateTime={review.date} className="text-[11px] text-cream-faint">
          {formatReviewDate(review.date, locale)}
        </time>
      </footer>
    </article>
  );
}
