import { BUSINESS, DAY_LABELS, type DayKey, type TimeRange } from "@/data/business";

export interface OpenStatus {
  isOpen: boolean;
  /** "Abierto ahora" | "Cerrado" | "Abre en 45 min" */
  label: string;
  /** "Cierra a las 16:00" | "Abre a las 20:00" | "Abre el martes a las 12:30" */
  detail: string;
  /** "Ideal para comer" | "Ideal para cenar" | "Ideal para unos vinos" */
  mood: string;
  /** minutos hasta el próximo cambio de estado (para ámbar cuando cierra pronto) */
  minutesToChange: number | null;
  todayKey: DayKey;
  todayRanges: TimeRange[];
}

const DAY_ORDER: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  // "00:00" como hora de cierre significa medianoche
  return h === 0 && m === 0 ? 24 * 60 : h * 60 + m;
}

/** Devuelve la hora local de Ourense a partir de un Date (usa Intl para evitar dependencias). */
export function getLocalParts(date: Date, timeZone = BUSINESS.timezone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = get("weekday").toLowerCase().slice(0, 3) as DayKey;
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  return { weekday, minutes: hour * 60 + minute };
}

function moodFor(minutes: number) {
  if (minutes < 17 * 60) return "Ideal para comer";
  if (minutes < 22 * 60 + 30) return "Ideal para cenar";
  return "Ideal para unos vinos";
}

function fmt(hhmm: string) {
  return hhmm === "00:00" ? "00:00" : hhmm;
}

export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { weekday, minutes } = getLocalParts(now);
  const hours = BUSINESS.hours as Record<DayKey, TimeRange[]>;
  const todayRanges = hours[weekday] ?? [];

  // ¿Abierto ahora?
  for (const r of todayRanges) {
    const o = toMinutes(r.open);
    const c = toMinutes(r.close);
    if (minutes >= o && minutes < c) {
      const left = c - minutes;
      return {
        isOpen: true,
        label: left <= 30 ? "Cierra pronto" : "Abierto ahora",
        detail: `Cierra a las ${fmt(r.close)}`,
        mood: moodFor(minutes),
        minutesToChange: left,
        todayKey: weekday,
        todayRanges,
      };
    }
  }

  // Próxima apertura hoy
  const nextToday = todayRanges.find((r) => toMinutes(r.open) > minutes);
  if (nextToday) {
    const wait = toMinutes(nextToday.open) - minutes;
    return {
      isOpen: false,
      label: wait <= 60 ? `Abre en ${wait} min` : "Cerrado ahora",
      detail: `Abre hoy a las ${fmt(nextToday.open)}`,
      mood: moodFor(toMinutes(nextToday.open)),
      minutesToChange: wait,
      todayKey: weekday,
      todayRanges,
    };
  }

  // Próxima apertura en los días siguientes
  const idx = DAY_ORDER.indexOf(weekday);
  for (let i = 1; i <= 7; i++) {
    const key = DAY_ORDER[(idx + i) % 7];
    const ranges = hours[key];
    if (ranges && ranges.length) {
      const first = ranges[0];
      const dayLabel = i === 1 ? "mañana" : `el ${DAY_LABELS[key].toLowerCase()}`;
      return {
        isOpen: false,
        label: "Cerrado ahora",
        detail: `Abre ${dayLabel} a las ${fmt(first.open)}`,
        mood: moodFor(toMinutes(first.open)),
        minutesToChange: null,
        todayKey: weekday,
        todayRanges,
      };
    }
  }

  return {
    isOpen: false,
    label: "Cerrado",
    detail: "Consulta horarios",
    mood: "",
    minutesToChange: null,
    todayKey: weekday,
    todayRanges,
  };
}

export function formatRanges(ranges: TimeRange[]) {
  if (!ranges.length) return "Cerrado";
  return ranges.map((r) => `${fmt(r.open)}–${fmt(r.close)}`).join(" · ");
}
