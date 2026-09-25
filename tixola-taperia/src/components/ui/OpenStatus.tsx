"use client";

import { ChevronDown, Clock3 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { BUSINESS, DAY_LABELS, type DayKey, type TimeRange } from "@/data/business";
import { formatRanges, getOpenStatus, type OpenStatus as OpenStatusData } from "@/lib/openStatus";
import { cn } from "@/lib/utils";

/**
 * OpenStatus — indicador en vivo "Abierto ahora · Ideal para cenar".
 *
 *  · Se calcula ÚNICAMENTE en `useEffect` (nunca durante el render) para que el HTML del servidor
 *    y el primer render del cliente coincidan; hasta entonces muestra un esqueleto neutro.
 *  · Se recalcula cada 60 s y al volver a la pestaña.
 *  · Punto verde pulsante si está abierto, ámbar si cierra en ≤ 30 min, rojo si está cerrado.
 *  · Tabla semanal desplegable (BUSINESS.hours) con el día de hoy resaltado.
 */

type Tone = "open" | "closing" | "closed";

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
    text: "text-pimenton-light",
    glow: "shadow-[0_0_12px_rgba(216,50,60,0.8)]",
  },
};

function toneFor(status: OpenStatusData): Tone {
  if (!status.isOpen) return "closed";
  if (status.minutesToChange !== null && status.minutesToChange <= 30) return "closing";
  return "open";
}

export interface OpenStatusProps {
  className?: string;
}

export default function OpenStatus({ className }: OpenStatusProps) {
  const [status, setStatus] = useState<OpenStatusData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

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

  const tone = status ? toneFor(status) : null;
  const styles = tone ? TONE[tone] : null;
  const headline = status ? (status.isOpen && status.mood ? `${status.label} · ${status.mood}` : status.label) : "Consultando horario…";
  const detail = status ? status.detail : BUSINESS.address.landmark;

  return (
    <div className={cn("glass-smoke rounded-3xl p-5 md:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {/* Punto de estado */}
          <span className="relative mt-1.5 flex h-3 w-3 shrink-0" aria-hidden>
            {tone && tone !== "closed" && (
              <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", styles?.halo)} />
            )}
            <span className={cn("relative inline-flex h-3 w-3 rounded-full", styles ? cn(styles.dot, styles.glow) : "bg-cream/30")} />
          </span>

          <div className="min-w-0" aria-live="polite">
            <p className={cn("font-sans text-base font-bold leading-tight md:text-lg", styles ? styles.text : "text-cream-muted")}>{headline}</p>
            <p className="mt-1 text-sm text-cream-muted">{detail}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-cream/15 px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream-200 transition-colors hover:border-cream/40 hover:bg-cream/5"
        >
          <Clock3 className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Horario</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", expanded && "rotate-180")} aria-hidden />
        </button>
      </div>

      {/* Tabla semanal desplegable (truco grid 0fr → 1fr, sin librerías) */}
      <div
        id={panelId}
        aria-hidden={!expanded}
        className="grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <table className="mt-5 w-full border-separate border-spacing-y-1 text-sm">
            <caption className="sr-only">Horario semanal de {BUSINESS.name}</caption>
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
                        "rounded-l-xl px-3 py-2 text-left font-medium",
                        isToday ? "bg-pimenton/20 text-cream" : "text-cream-muted",
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        {DAY_LABELS[key]}
                        {isToday && (
                          <span className="rounded-full bg-pimenton px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cream">Hoy</span>
                        )}
                      </span>
                    </th>
                    <td
                      className={cn(
                        "rounded-r-xl px-3 py-2 text-right tabular-nums",
                        isToday ? "bg-pimenton/20 text-cream" : closed ? "text-pimenton-light/90" : "text-cream-200",
                      )}
                    >
                      {formatRanges(ranges)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 px-3 text-xs text-cream-faint">Horario según nuestra ficha de Google · Domingos cerrado · Festivos: consúltanos</p>
        </div>
      </div>
    </div>
  );
}
