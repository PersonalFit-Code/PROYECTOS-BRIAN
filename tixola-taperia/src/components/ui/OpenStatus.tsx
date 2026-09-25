"use client";

import { CalendarCheck, Moon, Phone, Sun, Wine, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import NeonButton from "@/components/ui/NeonButton";
import { useReservation } from "@/components/ui/ReservationProvider";
import { BUSINESS, type DayKey, type TimeRange } from "@/data/business";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/types";
import {
  formatRanges,
  getOpenStatus,
  OPENS_SOON_MINUTES,
  type OpenStatus as OpenStatusData,
  type OpenStatusMood,
} from "@/lib/openStatus";
import { cn } from "@/lib/utils";

/**
 * OpenStatus — tarjeta "Ahora mismo": estado en vivo, franja sugerida, horario semanal y CTAs.
 *
 *  · El estado se calcula ÚNICAMENTE en `useEffect` (nunca durante el render) para que el HTML
 *    del servidor y el primer render del cliente coincidan; hasta entonces muestra un esqueleto.
 *  · `getOpenStatus()` devuelve datos estructurados (`kind`, `closeTime`, `openTime`, `nextDayKey`,
 *    `mood`…) y aquí se traducen con `m.common.status.*` y `m.common.days.*` (idioma activo).
 *  · Se recalcula cada 60 s y al volver a la pestaña.
 *  · Punto verde pulsante si está abierto, ámbar si cierra en ≤ 30 min, rojo si está cerrado.
 *  · Tabla semanal siempre visible con el día de hoy resaltado y los días de descanso atenuados.
 */

type Tone = "open" | "closing" | "closed";
type Formatter = (template: string, vars?: Record<string, string | number>) => string;

const WEEK: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const HOURS = BUSINESS.hours as Record<DayKey, TimeRange[]>;

const TONE: Record<Tone, { dot: string; halo: string; text: string; glow: string }> = {
  open: {
    dot: "bg-emerald-400",
    halo: "bg-emerald-400/70",
    text: "text-emerald-300",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.8)]",
  },
  closing: {
    dot: "bg-amber-400",
    halo: "bg-amber-400/70",
    text: "text-amber-300",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.8)]",
  },
  closed: {
    dot: "bg-pimenton-light",
    halo: "bg-pimenton-light/60",
    text: "text-pimenton-a11y",
    glow: "shadow-[0_0_12px_rgba(216,50,60,0.8)]",
  },
};

const MOOD_ICON: Record<OpenStatusMood, LucideIcon> = { lunch: Sun, dinner: Moon, wine: Wine };

function toneFor(status: OpenStatusData): Tone {
  if (!status.isOpen) return "closed";
  return status.kind === "closingSoon" ? "closing" : "open";
}

/** Traduce el estado estructurado a la etiqueta principal y el detalle en el idioma activo. */
function localize(status: OpenStatusData, c: Messages["common"], t: Formatter): { label: string; detail: string } {
  switch (status.kind) {
    case "open":
      return { label: c.status.openNow, detail: t(c.status.closesAt, { time: status.closeTime ?? "" }) };
    case "closingSoon":
      return { label: c.status.closingSoon, detail: t(c.status.closesAt, { time: status.closeTime ?? "" }) };
    case "opensIn": {
      const wait = status.minutesToChange ?? 0;
      return {
        label: wait <= OPENS_SOON_MINUTES ? t(c.status.opensIn, { minutes: wait }) : c.status.closedNow,
        detail: t(c.status.opensTodayAt, { time: status.openTime ?? "" }),
      };
    }
    case "closedToday":
    case "closedUntil": {
      if (!status.nextDayKey || !status.openTime) return { label: c.status.closed, detail: c.status.checkHours };
      const time = status.openTime;
      const detail =
        status.nextDayOffset === 1
          ? t(c.status.opensTomorrowAt, { time })
          : t(c.status.opensOnAt, { day: c.days[status.nextDayKey].toLocaleLowerCase(), time });
      return { label: c.status.closedNow, detail };
    }
  }
}

function moodLabel(mood: OpenStatusMood, c: Messages["common"]): string {
  if (mood === "lunch") return c.status.moodLunch;
  if (mood === "dinner") return c.status.moodDinner;
  return c.status.moodWine;
}

export interface OpenStatusProps {
  className?: string;
}

export default function OpenStatus({ className }: OpenStatusProps) {
  const m = useMessages();
  const t = useFormat();
  const { open: openReservation } = useReservation();
  const [status, setStatus] = useState<OpenStatusData | null>(null);

  useEffect(() => {
    const tick = () => setStatus(getOpenStatus());
    tick();
    const interval = window.setInterval(tick, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const c = m.common;
  const x = m.experience.status;
  const tone = status ? toneFor(status) : null;
  const styles = tone ? TONE[tone] : null;
  const texts = status ? localize(status, c, t) : null;
  const headline = texts?.label ?? c.status.checking;
  const detail = status?.kind === "closedToday" && texts ? `${x.restDay} · ${texts.detail}` : (texts?.detail ?? m.experience.map.subtitle);
  const MoodIcon = status ? MOOD_ICON[status.mood] : null;

  return (
    <div className={cn("glass-smoke flex h-full flex-col rounded-[28px] p-5 md:p-7", className)}>
      {/* Kicker + punto en vivo */}
      <p className="flex items-center gap-3 font-caps text-[10px] uppercase tracking-[0.3em] text-cream-muted">
        <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
          {tone && tone !== "closed" && (
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", styles?.halo)} />
          )}
          <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", styles ? cn(styles.dot, styles.glow) : "bg-cream/30")} />
        </span>
        {x.kicker}
      </p>

      {/* Titular de estado */}
      <div className="mt-4" aria-live="polite" aria-label={x.liveAria}>
        <p className={cn("font-display text-3xl leading-none md:text-4xl", styles ? styles.text : "text-cream-muted")}>{headline}</p>
        <p className="mt-2 font-sans text-sm text-cream-muted md:text-base">{detail}</p>
        {status && MoodIcon && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-caps text-[10px] uppercase tracking-[0.22em] text-gold">
            <MoodIcon className="h-3.5 w-3.5" aria-hidden />
            {moodLabel(status.mood, c)}
          </p>
        )}
      </div>

      {/* Horario semanal */}
      <div className="mt-6 border-t border-cream/10 pt-5">
        <h3 className="font-caps text-[10px] uppercase tracking-[0.3em] text-cream-muted">{x.hoursTitle}</h3>
        <table className="mt-3 w-full border-separate border-spacing-y-0.5 font-sans text-sm">
          <caption className="sr-only">{t(x.hoursCaption, { brand: BUSINESS.name })}</caption>
          <tbody>
            {WEEK.map((key) => {
              const isToday = status?.todayKey === key;
              const ranges = HOURS[key];
              const closed = ranges.length === 0;
              return (
                <tr key={key} className={cn(isToday && "font-semibold")}>
                  <th
                    scope="row"
                    className={cn(
                      "rounded-l-xl py-1.5 pl-3 pr-2 text-left font-medium",
                      isToday ? "bg-pimenton/15 text-cream" : closed ? "text-cream-faint" : "text-cream-muted",
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      {c.days[key]}
                      {isToday && (
                        <span className="rounded-full bg-pimenton px-1.5 py-0.5 font-caps text-[9px] uppercase tracking-[0.18em] text-cream">
                          {x.today}
                        </span>
                      )}
                    </span>
                  </th>
                  <td
                    className={cn(
                      "rounded-r-xl py-1.5 pl-2 pr-3 text-right tabular-nums",
                      isToday ? "bg-pimenton/15 text-cream" : closed ? "text-cream-faint" : "text-cream-200",
                    )}
                  >
                    {formatRanges(ranges, x.closed)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 px-3 text-xs text-cream-faint">{x.note}</p>
      </div>

      {/* CTAs */}
      <div className="mt-auto border-t border-cream/10 pt-5">
        <p className="font-display text-xl italic text-cream-200">{x.reserveHint}</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <NeonButton variant="primary" onClick={openReservation} icon={<CalendarCheck aria-hidden />} className="w-full sm:flex-1">
            {c.cta.reserve}
          </NeonButton>
          <NeonButton variant="outline" href={BUSINESS.phone.tel} icon={<Phone aria-hidden />} className="w-full sm:flex-1">
            {t(c.cta.callNumber, { phone: BUSINESS.phone.display })}
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
