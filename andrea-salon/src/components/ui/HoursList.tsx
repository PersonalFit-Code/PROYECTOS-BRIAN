"use client";

import { BUSINESS, DAY_ORDER_WEEK } from "@/data/business";
import { useMessages } from "@/i18n/LocaleProvider";
import { useOpenStatus } from "@/hooks/useOpenStatus";
import { cn } from "@/lib/utils";

/**
 * Horario de la semana con el día de hoy resaltado (en hora de Ourense). Mientras
 * `BUSINESS.hoursPending` sea true, debajo va el aviso de «pendiente de confirmar»: un horario que
 * Andrea no ha validado se enseña, pero se enseña diciendo lo que es.
 */
export default function HoursList({ className }: { className?: string }) {
  const m = useMessages();
  const status = useOpenStatus();
  return (
    <div className={className}>
      <ul className="space-y-1 text-sm">
        {DAY_ORDER_WEEK.map((day) => {
          const ranges = BUSINESS.hours[day];
          const today = status?.todayKey === day;
          return (
            <li
              key={day}
              className={cn(
                "flex items-center justify-between gap-4 rounded-lg px-3 py-1.5",
                today ? "bg-rosa/60 text-tinta ring-1 ring-carmin/15" : "text-gris",
              )}
            >
              <span className={cn(today && "font-semibold")}>
                {m.common.days[day]}
                {today ? <span className="ml-2 font-sans text-[10px] font-semibold tracking-[0.2em] text-carmin-suave uppercase">{m.common.misc.today}</span> : null}
              </span>
              <span className={cn("tabular-nums", ranges.length === 0 && "text-gris/70")}>
                {ranges.length ? ranges.map((r) => `${r.open} – ${r.close}`).join(", ") : m.common.status.closedDay}
              </span>
            </li>
          );
        })}
      </ul>
      {BUSINESS.hoursPending ? (
        <p className="mt-3 flex items-start gap-2 px-3 text-xs leading-relaxed text-gris">
          <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-carmin-suave" />
          {m.common.status.hoursPending}
        </p>
      ) : null}
    </div>
  );
}
