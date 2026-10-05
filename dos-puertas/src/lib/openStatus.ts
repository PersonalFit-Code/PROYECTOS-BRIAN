import { BUSINESS, type DayKey, type TimeRange } from "@/data/business";

export type OpenStatusKind = "open" | "closingSoon" | "opensToday" | "closedToday" | "closedUntil";

export interface OpenStatus {
  kind: OpenStatusKind;
  isOpen: boolean;
  closeTime: string | null;
  openTime: string | null;
  /** Día de la próxima apertura cuando no es hoy. */
  nextDayKey: DayKey | null;
  nextDayOffset: number | null;
  todayKey: DayKey;
}

const CLOSING_SOON_MINUTES = 30;
const DAY_ORDER: readonly DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const HOURS: Record<DayKey, readonly TimeRange[]> = BUSINESS.hours;

/** "00:00" como cierre es medianoche (24:00). */
function toMinutes(hhmm: string, isClose = false) {
  const [h, m] = hhmm.split(":").map(Number);
  const v = h * 60 + m;
  return isClose && v === 0 ? 24 * 60 : v;
}

export function getLocalParts(date: Date, timeZone: string = BUSINESS.timezone) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    weekday: get("weekday").toLowerCase().slice(0, 3) as DayKey,
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { weekday, minutes } = getLocalParts(now);
  const today = HOURS[weekday];
  const base = { todayKey: weekday, nextDayKey: null, nextDayOffset: null, openTime: null, closeTime: null };

  for (const r of today) {
    const o = toMinutes(r.open);
    const c = toMinutes(r.close, true);
    if (minutes >= o && minutes < c) {
      return { ...base, kind: c - minutes <= CLOSING_SOON_MINUTES ? "closingSoon" : "open", isOpen: true, closeTime: r.close };
    }
  }
  const later = today.find((r) => toMinutes(r.open) > minutes);
  if (later) return { ...base, kind: "opensToday", isOpen: false, openTime: later.open };

  const idx = DAY_ORDER.indexOf(weekday);
  for (let i = 1; i <= 7; i++) {
    const key = DAY_ORDER[(idx + i) % 7];
    const first = HOURS[key][0];
    if (first) {
      return { ...base, kind: today.length ? "closedUntil" : "closedToday", isOpen: false, openTime: first.open, nextDayKey: key, nextDayOffset: i };
    }
  }
  return { ...base, kind: "closedToday", isOpen: false };
}
