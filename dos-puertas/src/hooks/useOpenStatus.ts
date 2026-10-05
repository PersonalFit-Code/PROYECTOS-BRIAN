"use client";

import { useEffect, useState } from "react";
import { getOpenStatus, type OpenStatus } from "@/lib/openStatus";
import { useMessages } from "@/i18n/LocaleProvider";
import { format } from "@/i18n/getMessages";

/** Estado en vivo (se recalcula cada minuto). `null` hasta montar: el servidor no sabe la hora del visitante. */
export function useOpenStatus(): OpenStatus | null {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const tick = () => setStatus(getOpenStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return status;
}

/** Texto localizado del estado: { label, detail }. */
export function useOpenStatusText(status: OpenStatus | null) {
  const m = useMessages();
  if (!status) return null;
  const s = m.common.status;
  switch (status.kind) {
    case "open":
      return { label: s.open, detail: format(s.closesAt, { time: status.closeTime ?? "" }) };
    case "closingSoon":
      return { label: s.closingSoon, detail: format(s.closesAt, { time: status.closeTime ?? "" }) };
    case "opensToday":
      return { label: s.closed, detail: format(s.opensToday, { time: status.openTime ?? "" }) };
    default: {
      const time = status.openTime ?? "";
      const detail =
        status.nextDayOffset === 1
          ? format(s.opensTomorrow, { time })
          : status.nextDayKey
            ? format(s.opensOn, { day: m.common.days[status.nextDayKey].toLowerCase(), time })
            : "";
      return { label: status.kind === "closedToday" ? s.closedToday : s.closed, detail };
    }
  }
}
