"use client";

import * as React from "react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cx } from "@/lib/formato";

/*
 * Calendario de mes a pantalla completa (adaptado del FullScreenCalendar de shadcn/21st.dev a los
 * estilos de la app: cristal, tokens propios y sin dependencias de shadcn). En español, la semana
 * empieza en lunes. En escritorio cada día muestra sus primeros eventos; en el móvil, puntos de color.
 * Debajo, el detalle del día elegido (lo pinta quien usa el calendario).
 */

export interface CalendarEvent {
  id: string | number;
  name: string;
  /** texto corto a la derecha: hora, importe… */
  time?: string;
  datetime: string;
  /** color del punto (una variable CSS como "var(--ok)") */
  color?: string;
  done?: boolean;
}

export interface CalendarData {
  day: Date;
  events: CalendarEvent[];
}

interface FullScreenCalendarProps {
  data: CalendarData[];
  /** botones a la derecha de la cabecera, para el día elegido (p. ej. «Nueva tarea») */
  acciones?: (dia: Date) => React.ReactNode;
  /** lo que se muestra debajo del calendario para el día elegido */
  detalle?: (dia: Date, eventos: CalendarEvent[]) => React.ReactNode;
  /** «hoy» desde fuera (p. ej. en hora de Madrid) para que servidor y navegador coincidan */
  today?: Date;
}

const OPCIONES = { locale: es, weekStartsOn: 1 } as const;
const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

export function FullScreenCalendar({ data, acciones, detalle, today = startOfToday() }: FullScreenCalendarProps) {
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [mes, setMes] = React.useState(startOfMonth(today));

  const days = eachDayOfInterval({ start: startOfWeek(mes, OPCIONES), end: endOfWeek(endOfMonth(mes), OPCIONES) });
  const eventosDe = (dia: Date) => data.filter((d) => isSameDay(d.day, dia)).flatMap((d) => d.events);
  const delDia = eventosDe(selectedDay);

  function irAMes(delta: number) {
    const nuevo = add(mes, { months: delta });
    setMes(nuevo);
    setSelectedDay(isSameMonth(today, nuevo) ? today : nuevo);
  }

  function irAHoy() {
    setMes(startOfMonth(today));
    setSelectedDay(today);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Cabecera */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden w-16 flex-col items-center rounded-2xl border border-line/60 bg-bg/50 p-0.5 md:flex">
            <span className="p-1 text-[11px] uppercase text-muted">{format(today, "MMM", OPCIONES)}</span>
            <span className="flex w-full items-center justify-center rounded-xl bg-bg/80 py-0.5 text-lg font-bold">{format(today, "d")}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold first-letter:uppercase">{format(mes, "MMMM yyyy", OPCIONES)}</h2>
            <p className="text-sm text-muted">
              {format(mes, "d MMM", OPCIONES)} – {format(endOfMonth(mes), "d MMM yyyy", OPCIONES)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="glass inline-flex flex-1 overflow-hidden rounded-2xl md:flex-none">
            <button type="button" onClick={() => irAMes(-1)} aria-label="Mes anterior" className="px-3 py-2 transition hover:bg-hover">
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={irAHoy} className="flex-1 border-x border-line/50 px-4 py-2 text-sm font-medium transition hover:bg-hover md:flex-none">
              Hoy
            </button>
            <button type="button" onClick={() => irAMes(1)} aria-label="Mes siguiente" className="px-3 py-2 transition hover:bg-hover">
              <ChevronRightIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
          {acciones?.(selectedDay)}
        </div>
      </div>

      {/* Rejilla */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="grid grid-cols-7 border-b border-line/60 text-center text-xs font-semibold text-muted">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const eventos = eventosDe(day);
            const elegido = isSameDay(day, selectedDay);
            const hoy = isSameDay(day, today);
            const delMes = isSameMonth(day, mes);
            return (
              <button
                key={format(day, "yyyy-MM-dd")}
                type="button"
                onClick={() => setSelectedDay(day)}
                aria-label={format(day, "EEEE d 'de' MMMM", OPCIONES) + (eventos.length ? `, ${eventos.length} ${eventos.length === 1 ? "cosa" : "cosas"}` : "")}
                aria-pressed={elegido}
                className={cx(
                  "flex min-h-14 flex-col border-r border-b border-line/40 p-1.5 text-left text-xs transition hover:bg-hover/70 md:min-h-28 md:p-2 [&:nth-child(7n)]:border-r-0",
                  !delMes && "bg-bg/30 text-faint",
                  elegido && "bg-accent/10",
                )}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cx(
                    "ml-auto flex size-6 items-center justify-center rounded-full tabular-nums md:ml-0",
                    elegido && "bg-accent font-semibold text-accent-fg",
                    !elegido && hoy && "font-semibold text-accent ring-1 ring-accent",
                  )}
                >
                  {format(day, "d")}
                </time>

                {/* móvil: puntos */}
                {eventos.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-0.5 md:hidden">
                    {eventos.slice(0, 6).map((e) => (
                      <span key={e.id} className={cx("size-1.5 rounded-full", e.done && "opacity-40")} style={{ background: e.color ?? "var(--muted)" }} />
                    ))}
                  </div>
                )}

                {/* escritorio: los dos primeros */}
                <div className="mt-1 hidden w-full space-y-1 md:block">
                  {eventos.slice(0, 2).map((e) => (
                    <div key={e.id} className={cx("flex items-center gap-1 truncate rounded-md bg-bg/60 px-1.5 py-0.5 leading-tight", e.done && "text-faint line-through")}>
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: e.color ?? "var(--muted)" }} />
                      <span className="truncate">{e.name}</span>
                    </div>
                  ))}
                  {eventos.length > 2 && <div className="text-muted">+ {eventos.length - 2} más</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Día elegido */}
      {detalle && (
        <section className="glass rounded-2xl p-4">
          <h3 className="mb-2 font-semibold first-letter:uppercase">{format(selectedDay, "EEEE d 'de' MMMM", OPCIONES)}</h3>
          {detalle(selectedDay, delDia)}
        </section>
      )}
    </div>
  );
}
