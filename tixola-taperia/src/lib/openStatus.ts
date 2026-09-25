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

/** true si el rango cruza la medianoche (cierra en o después de la apertura del día siguiente). */
function isOvernight(r: TimeRange) {
  return toMinutes(r.close) <= toMinutes(r.open);
}

/** ¿`minutes` cae dentro de `r` contando desde el día en que `r` empieza? (cubre el tramo nocturno hasta 24:00). */
function coversFromStart(r: TimeRange, minutes: number) {
  const o = toMinutes(r.open);
  const c = toMinutes(r.close);
  return isOvernight(r) ? minutes >= o : minutes >= o && minutes < c;
}

/** ¿`minutes` cae en el tramo de `r` que se prolongó después de medianoche desde el día anterior? */
function coversAfterMidnight(r: TimeRange, minutes: number) {
  return isOvernight(r) && minutes < toMinutes(r.close);
}

/** Minutos restantes hasta que cierre `r`, contando desde `minutes` del día en que `r` empieza. */
function minutesUntilClose(r: TimeRange, minutes: number) {
  const c = toMinutes(r.close);
  return isOvernight(r) ? 24 * 60 - minutes + c : c - minutes;
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

export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { weekday, minutes } = getLocalParts(now);
  const hours = BUSINESS.hours as Record<DayKey, TimeRange[]>;
  const todayRanges = hours[weekday] ?? [];
  const yesterdayKey = DAY_ORDER[(DAY_ORDER.indexOf(weekday) + 6) % 7];
  const yesterdayRanges = hours[yesterdayKey] ?? [];

  // ¿Seguimos dentro de un turno de ayer que cruzó la medianoche (p.ej. 22:00–01:00)?
  for (const r of yesterdayRanges) {
    if (coversAfterMidnight(r, minutes)) {
      const left = toMinutes(r.close) - minutes;
      return {
        isOpen: true,
        label: left <= 30 ? "Cierra pronto" : "Abierto ahora",
        detail: `Cierra a las ${r.close}`,
        mood: moodFor(minutes),
        minutesToChange: left,
        todayKey: weekday,
        todayRanges,
      };
    }
  }

  // ¿Abierto ahora, dentro de un turno de hoy (incluido uno que acaba de empezar y cruzará medianoche)?
  for (const r of todayRanges) {
    if (coversFromStart(r, minutes)) {
      const left = minutesUntilClose(r, minutes);
      return {
        isOpen: true,
        label: left <= 30 ? "Cierra pronto" : "Abierto ahora",
        detail: `Cierra a las ${r.close}`,
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
      detail: `Abre hoy a las ${nextToday.open}`,
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
        detail: `Abre ${dayLabel} a las ${first.open}`,
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
  return ranges.map((r) => `${r.open}–${r.close}`).join(" · ");
}
