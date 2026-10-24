import { BUSINESS, HOURS, type DayKey } from "@/content";

/* Adaptado de dos-puertas/src/lib/openStatus.ts: el estado se calcula con la hora de Madrid,
   no con la del navegador, para que no mienta a quien mira la web desde fuera. */

export interface OpenStatus {
  isOpen: boolean;
  /** Hora de cierre del tramo actual (si está abierto). */
  closeTime: string | null;
  /** Próxima apertura (si está cerrado). */
  openTime: string | null;
  /** Día de la próxima apertura si no es hoy; null si es hoy. */
  nextDay: DayKey | null;
  today: DayKey;
}

const DAY_ORDER: readonly DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toMinutes(hhmm: string, isClose = false) {
  const [h, m] = hhmm.split(":").map(Number);
  const v = h * 60 + m;
  return isClose && v === 0 ? 24 * 60 : v;
}

export function getLocalParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: BUSINESS.timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { weekday: get("weekday").toLowerCase().slice(0, 3) as DayKey, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { weekday, minutes } = getLocalParts(now);
  const base = { today: weekday, closeTime: null, openTime: null, nextDay: null };
  for (const r of HOURS[weekday]) {
    if (minutes >= toMinutes(r.open) && minutes < toMinutes(r.close, true)) return { ...base, isOpen: true, closeTime: r.close };
  }
  const later = HOURS[weekday].find((r) => toMinutes(r.open) > minutes);
  if (later) return { ...base, isOpen: false, openTime: later.open };
  const idx = DAY_ORDER.indexOf(weekday);
  for (let i = 1; i <= 7; i++) {
    const key = DAY_ORDER[(idx + i) % 7];
    const first = HOURS[key][0];
    if (first) return { ...base, isOpen: false, openTime: first.open, nextDay: key };
  }
  return { ...base, isOpen: false };
}

const DAY_SHORT: Record<DayKey, string> = { mon: "el lunes", tue: "el martes", wed: "el miércoles", thu: "el jueves", fri: "el viernes", sat: "el sábado", sun: "el domingo" };

/** "🟢 Abierto ahora · cierra a las 16:30" / "🔴 Cerrado · abre a las 20:00" */
export function statusLabel(s: OpenStatus, variant: "short" | "until" = "short"): string {
  if (s.isOpen) return variant === "until" ? `Abierto hasta las ${s.closeTime}` : `Abierto ahora · cierra a las ${s.closeTime}`;
  if (!s.openTime) return "Cerrado";
  const when = s.nextDay && DAY_ORDER.indexOf(s.nextDay) !== (DAY_ORDER.indexOf(s.today) + 1) % 7 ? `${DAY_SHORT[s.nextDay]} ` : s.nextDay ? "mañana " : "";
  return `Cerrado · abre ${when}a las ${s.openTime}`;
}
