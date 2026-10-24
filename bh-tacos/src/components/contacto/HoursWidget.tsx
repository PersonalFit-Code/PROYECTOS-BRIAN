"use client";

import { DAY_NAMES, HOURS, type DayKey } from "@/content";
import { cn } from "@/lib/format";
import useOpenStatus from "@/hooks/useOpenStatus";
import OpenBadge from "@/components/layout/OpenBadge";

const ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function HoursWidget() {
  const status = useOpenStatus();
  return (
    <div className="card p-6">
      <OpenBadge variant="until" />
      <table className="mt-6 w-full text-left">
        <caption className="sr-only">Horario semanal</caption>
        <tbody>
          {ORDER.map((d) => {
            const today = status?.today === d;
            return (
              <tr key={d} className={cn("border-b border-line last:border-0", today && "bg-brand/10")} aria-current={today ? "date" : undefined}>
                <th scope="row" className={cn("py-3 pl-3 font-semibold", today && "text-brand-text")}>
                  {DAY_NAMES[d]} {today && <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs text-white">Hoy</span>}
                </th>
                <td className="py-3 pr-3 text-right text-fg-muted">
                  {HOURS[d].length ? HOURS[d].map((r) => `${r.open}–${r.close}`).join(" · ") : "Cerrado"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
