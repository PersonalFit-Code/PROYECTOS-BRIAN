"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { DayKey } from "@/data/business";
import { CLOSING_SOON_MINUTES, getOpenStatus, nextOpenDay, OPENS_SOON_MINUTES } from "@/lib/openStatus";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/types";

/**
 * ESTADO DE APERTURA, EN EL IDIOMA ACTIVO.
 *
 * `getOpenStatus()` (en `lib/openStatus.ts`) contesta a "¿está abierto?" con datos —booleanos,
 * minutos, claves de día—, nunca con frases: es la única forma de que el mismo cálculo sirva al
 * pie, a la tarjeta de ubicación, a la barra del móvil y al camarero virtual, cada uno en su
 * idioma. Este hook es la otra mitad: convierte esos datos en las dos líneas que se leen en
 * pantalla ("Abierto ahora" / "Cierra a las 16:00").
 *
 * Vivía dentro de `ReservationModal`, que era el único sitio que lo necesitaba el día que se
 * escribió. Cuando el pie empezó a usarlo, el módulo de reservas pasó a ser una dependencia del
 * pie sin tener nada que ver con él; al retirar las reservas —Tixola no las coge— el hook se
 * habría ido por delante. Vive aquí porque el horario no es asunto de las reservas.
 *
 * Solo en cliente, y a propósito: la hora del servidor no es la del visitante, así que pintarlo en
 * el HTML garantizaría un desajuste al hidratar. Devuelve `null` hasta que hidrata, y quien lo usa
 * pinta mientras tanto la etiqueta estática (el horario sí es conocido) y añade el punto de color
 * después.
 */

/** "Cierra a las 16:00" · "Abre mañana a las 19:30" · "Consulta horarios" */
type NextKind = "closes" | "today" | "tomorrow" | "day" | "none";

export interface LocalizedOpenStatus {
  isOpen: boolean;
  closingSoon: boolean;
  /** "Abierto ahora" · "Cierra pronto" · "Abre en 25 min" · "Cerrado ahora" */
  label: string;
  /** "Cierra a las 16:00" · "Abre mañana a las 19:30" · "Consulta horarios" */
  detail: string;
  todayKey: DayKey;
}

/**
 * Instantánea SERIALIZADA del estado. `useSyncExternalStore` compara por identidad, así que
 * devolver un objeto nuevo en cada lectura provocaría un bucle de renders; una cadena con los
 * mismos datos es estable mientras no cambie ninguno. Formato:
 * `isOpen|closingSoon|todayKey|hora|tipo|día|minutos`.
 */
function readSnapshot(): string {
  const s = getOpenStatus();
  const time = /(\d{1,2}:\d{2})/.exec(s.detail)?.[1] ?? "";
  let kind: NextKind = "none";
  let day = "";
  let minutes = "";
  if (s.isOpen) {
    kind = "closes";
  } else if (s.minutesToChange !== null) {
    kind = "today";
    minutes = String(s.minutesToChange);
  } else {
    const next = nextOpenDay(s.todayKey);
    if (next) {
      kind = next.offset === 1 ? "tomorrow" : "day";
      day = next.key;
    }
  }
  const closingSoon = s.isOpen && s.minutesToChange !== null && s.minutesToChange <= CLOSING_SOON_MINUTES;
  return [s.isOpen ? 1 : 0, closingSoon ? 1 : 0, s.todayKey, time, kind, day, minutes].join("|");
}

function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  /* Al volver a la pestaña después de un rato, el intervalo puede llevar minutos sin disparar
     (los navegadores los estrangulan en segundo plano) y el estado estaría caducado. */
  const onVisibility = () => {
    if (document.visibilityState === "visible") onChange();
  };
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

const getServerSnapshot = () => "";

/** Traduce la instantánea a los textos de `m.common.status` / `m.common.days`. */
function localizeSnapshot(
  snapshot: string,
  c: Messages["common"],
  t: (tpl: string, vars?: Record<string, string | number>) => string,
): LocalizedOpenStatus | null {
  if (!snapshot) return null;
  const [open, soon, todayKey, time, kind, day, minutes] = snapshot.split("|");
  const isOpen = open === "1";
  const closingSoon = soon === "1";
  let label: string;
  let detail: string;
  if (isOpen) {
    label = closingSoon ? c.status.closingSoon : c.status.openNow;
    detail = time ? t(c.status.closesAt, { time }) : "";
  } else if (kind === "today") {
    const wait = Number(minutes);
    /* Una cuenta atrás solo dice algo si la espera es corta; "Abre en 240 min" es peor que
       "Cerrado ahora" seguido de la hora exacta. */
    label = wait <= OPENS_SOON_MINUTES ? t(c.status.opensIn, { minutes: wait }) : c.status.closedNow;
    detail = time ? t(c.status.opensTodayAt, { time }) : c.status.checkHours;
  } else if (kind === "tomorrow") {
    label = c.status.closedNow;
    detail = time ? t(c.status.opensTomorrowAt, { time }) : c.status.checkHours;
  } else if (kind === "day") {
    label = c.status.closedNow;
    const dayLabel = c.days[day as DayKey]?.toLocaleLowerCase() ?? day;
    detail = time ? t(c.status.opensOnAt, { day: dayLabel, time }) : c.status.checkHours;
  } else {
    label = c.status.closed;
    detail = c.status.checkHours;
  }
  return { isOpen, closingSoon, label, detail, todayKey: todayKey as DayKey };
}

export function useLocalizedOpenStatus(): LocalizedOpenStatus | null {
  const m = useMessages();
  const t = useFormat();
  const snapshot = useSyncExternalStore(subscribeMinute, readSnapshot, getServerSnapshot);
  return useMemo(() => localizeSnapshot(snapshot, m.common, t), [snapshot, m, t]);
}
