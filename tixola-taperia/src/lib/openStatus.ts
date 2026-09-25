import { BUSINESS, DAY_LABELS, type DayKey, type TimeRange } from "@/data/business";

/**
 * Estado de apertura de Tixola calculado a partir de `BUSINESS.hours` (hora local de Ourense).
 *
 * Devuelve DATOS ESTRUCTURADOS (sin textos): la interfaz elige la etiqueta en el idioma activo
 * a partir de `kind`, `minutesToChange`, `closeTime`, `openTime`, `nextDayKey` y `mood`
 * (`m.common.status.*` / `m.common.days.*`).
 *
 * Por compatibilidad con consumidores que aún no están localizados (conocimiento del chat,
 * instantáneas serializadas) se mantienen `label` y `detail` en español, marcados como
 * obsoletos. La hora HH:MM de `detail` coincide siempre con `closeTime` / `openTime`.
 */

/** Situación actual respecto al horario. */
export type OpenStatusKind =
  /** abierto, quedan más de `CLOSING_SOON_MINUTES` para cerrar */
  | "open"
  /** abierto, cierra en ≤ `CLOSING_SOON_MINUTES` */
  | "closingSoon"
  /** cerrado, pero vuelve a abrir hoy (`minutesToChange` = espera en minutos) */
  | "opensIn"
  /** hoy no hay servicio (día de descanso); abre en `nextDayKey` a las `openTime` */
  | "closedToday"
  /** el servicio de hoy ha terminado (o no hay horario); abre en `nextDayKey` a las `openTime` */
  | "closedUntil";

/** Momento del día que sugerimos ("ideal para comer / cenar / unos vinos"). */
export type OpenStatusMood = "lunch" | "dinner" | "wine";

export interface OpenStatus {
  isOpen: boolean;
  kind: OpenStatusKind;
  /** minutos hasta el próximo cambio de estado (cierre si está abierto, apertura si abre hoy); null si no es hoy */
  minutesToChange: number | null;
  /** "HH:MM" a la que cierra el turno actual (solo si está abierto) */
  closeTime: string | null;
  /** "HH:MM" de la próxima apertura (hoy o en `nextDayKey`) */
  openTime: string | null;
  /** día de la próxima apertura cuando no es hoy; null si abre hoy, está abierto o no hay horario */
  nextDayKey: DayKey | null;
  /** días hasta `nextDayKey` (1 = mañana); null en los mismos casos que `nextDayKey` */
  nextDayOffset: number | null;
  /** franja sugerida según la hora actual (o la de la próxima apertura si está cerrado) */
  mood: OpenStatusMood;
  todayKey: DayKey;
  todayRanges: TimeRange[];
  /** @deprecated Texto en español; usa `kind` + `m.common.status.*`. */
  label: string;
  /** @deprecated Texto en español; usa `closeTime` / `openTime` / `nextDayKey` + `m.common.status.*`. */
  detail: string;
}

/** Umbral (minutos) por debajo del cual el estado pasa a "cierra pronto". */
export const CLOSING_SOON_MINUTES = 30;

/** Umbral (minutos) por debajo del cual la interfaz muestra "abre en X min" en vez de "cerrado ahora". */
export const OPENS_SOON_MINUTES = 60;

const DAY_ORDER: readonly DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const HOURS = BUSINESS.hours as Record<DayKey, TimeRange[]>;

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

/** Franja sugerida: comidas hasta las 17:00, cenas hasta las 22:30 y vinos a partir de ahí. */
export function moodFor(minutes: number): OpenStatusMood {
  if (minutes < 17 * 60) return "lunch";
  if (minutes < 22 * 60 + 30) return "dinner";
  return "wine";
}

/** Próximo día con horario a partir de mañana; `offset` en días (1 = mañana). */
export function nextOpenDay(todayKey: DayKey): { key: DayKey; ranges: TimeRange[]; offset: number } | null {
  const idx = DAY_ORDER.indexOf(todayKey);
  for (let i = 1; i <= 7; i++) {
    const key = DAY_ORDER[(idx + i) % 7];
    const ranges = HOURS[key];
    if (ranges && ranges.length) return { key, ranges, offset: i };
  }
  return null;
}

/* ────────────────────────────────────────────────────────────
   Textos obsoletos en español (compatibilidad)
   ──────────────────────────────────────────────────────────── */
type StatusCore = Omit<OpenStatus, "label" | "detail">;

function legacyLabel(s: StatusCore): string {
  switch (s.kind) {
    case "open":
      return "Abierto ahora";
    case "closingSoon":
      return "Cierra pronto";
    case "opensIn":
      return s.minutesToChange !== null && s.minutesToChange <= OPENS_SOON_MINUTES ? `Abre en ${s.minutesToChange} min` : "Cerrado ahora";
    case "closedToday":
    case "closedUntil":
      return s.nextDayKey ? "Cerrado ahora" : "Cerrado";
  }
}

function legacyDetail(s: StatusCore): string {
  if (s.kind === "open" || s.kind === "closingSoon") return `Cierra a las ${s.closeTime}`;
  if (s.kind === "opensIn") return `Abre hoy a las ${s.openTime}`;
  if (!s.nextDayKey || !s.openTime) return "Consulta horarios";
  const day = s.nextDayOffset === 1 ? "mañana" : `el ${DAY_LABELS[s.nextDayKey].toLowerCase()}`;
  return `Abre ${day} a las ${s.openTime}`;
}

/** Completa el estado con los textos obsoletos en español. */
function finish(core: StatusCore): OpenStatus {
  return { ...core, label: legacyLabel(core), detail: legacyDetail(core) };
}

/* ────────────────────────────────────────────────────────────
   Cálculo principal
   ──────────────────────────────────────────────────────────── */
export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { weekday, minutes } = getLocalParts(now);
  const todayRanges = HOURS[weekday] ?? [];
  const yesterdayKey = DAY_ORDER[(DAY_ORDER.indexOf(weekday) + 6) % 7];
  const yesterdayRanges = HOURS[yesterdayKey] ?? [];

  const openNow = (closeTime: string, left: number): OpenStatus =>
    finish({
      isOpen: true,
      kind: left <= CLOSING_SOON_MINUTES ? "closingSoon" : "open",
      minutesToChange: left,
      closeTime,
      openTime: null,
      nextDayKey: null,
      nextDayOffset: null,
      mood: moodFor(minutes),
      todayKey: weekday,
      todayRanges,
    });

  // ¿Seguimos dentro de un turno de ayer que cruzó la medianoche (p. ej. 22:00–01:00)?
  for (const r of yesterdayRanges) {
    if (coversAfterMidnight(r, minutes)) return openNow(r.close, toMinutes(r.close) - minutes);
  }

  // ¿Abierto ahora, dentro de un turno de hoy (incluido uno que acaba de empezar y cruzará medianoche)?
  for (const r of todayRanges) {
    if (coversFromStart(r, minutes)) return openNow(r.close, minutesUntilClose(r, minutes));
  }

  // Próxima apertura hoy
  const nextToday = todayRanges.find((r) => toMinutes(r.open) > minutes);
  if (nextToday) {
    return finish({
      isOpen: false,
      kind: "opensIn",
      minutesToChange: toMinutes(nextToday.open) - minutes,
      closeTime: null,
      openTime: nextToday.open,
      nextDayKey: null,
      nextDayOffset: null,
      mood: moodFor(toMinutes(nextToday.open)),
      todayKey: weekday,
      todayRanges,
    });
  }

  // Próxima apertura en los días siguientes
  const next = nextOpenDay(weekday);
  const first = next?.ranges[0] ?? null;
  return finish({
    isOpen: false,
    kind: todayRanges.length === 0 ? "closedToday" : "closedUntil",
    minutesToChange: null,
    closeTime: null,
    openTime: first?.open ?? null,
    nextDayKey: next?.key ?? null,
    nextDayOffset: next?.offset ?? null,
    mood: first ? moodFor(toMinutes(first.open)) : "dinner",
    todayKey: weekday,
    todayRanges,
  });
}

/**
 * "12:00–16:00 · 20:00–00:00". `closedLabel` permite localizar el texto de los días sin servicio
 * (por defecto "Cerrado", para los consumidores aún en español).
 */
export function formatRanges(ranges: TimeRange[], closedLabel = "Cerrado") {
  if (!ranges.length) return closedLabel;
  return ranges.map((r) => `${r.open}–${r.close}`).join(" · ");
}
