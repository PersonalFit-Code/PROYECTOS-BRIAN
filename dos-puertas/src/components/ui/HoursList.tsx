"use client";

import { BUSINESS, DAY_ORDER_WEEK } from "@/data/business";
import { useMessages } from "@/i18n/LocaleProvider";
import { useOpenStatus } from "@/hooks/useOpenStatus";
import { cn } from "@/lib/cn";

/** Horario de la semana con el día de hoy resaltado (en hora de Ourense). */
export default function HoursList({ className }: { className?: string }) {
  const m = useMessages();
  const status = useOpenStatus();
  return (
    <ul className={cn("space-y-1 text-sm", className)}>
      {DAY_ORDER_WEEK.map((day) => {
        const ranges = BUSINESS.hours[day];
        const today = status?.todayKey === day;
        return (
          <li
            key={day}
            className={cn(
              "flex items-center justify-between gap-4 rounded-lg px-3 py-1.5",
              today ? "bg-oro/12 text-cream ring-1 ring-oro/30" : "text-cream-muted",
            )}
          >
            <span className={cn(today && "font-semibold")}>
              {m.common.days[day]}
              {today ? <span className="ml-2 font-caps text-[10px] tracking-[0.2em] text-oro-a11y uppercase">{m.common.today}</span> : null}
            </span>
            <span className={cn("tabular-nums", ranges.length === 0 && "text-cream-faint")}>
              {ranges.length ? ranges.map((r) => `${r.open} – ${r.close}`).join(", ") : m.common.closedDay}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
