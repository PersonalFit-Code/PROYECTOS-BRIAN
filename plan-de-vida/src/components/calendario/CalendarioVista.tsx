"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import { ChevronRight, ClipboardCheck, Flag, ListTodo, Wallet } from "lucide-react";
import { useMemo } from "react";
import { ListaTareas } from "@/components/metas/ListaTareas";
import { FullScreenCalendar, type CalendarData, type CalendarEvent } from "@/components/ui/fullscreen-calendar";
import type { Goal, Task } from "@/lib/tipos";

export interface Cita {
  id: string;
  dia: string;
  nombre: string;
  detalle?: string;
  tipo: "pago" | "cobro" | "limite" | "revision";
  href: string;
}

const COLOR: Record<Cita["tipo"] | "tarea", string> = {
  tarea: "var(--accent)",
  pago: "var(--bad)",
  cobro: "var(--ok)",
  limite: "var(--warn)",
  revision: "var(--faint)",
};

const GRUPOS: { tipos: Cita["tipo"][]; titulo: string; icono: typeof Wallet }[] = [
  { tipos: ["pago", "cobro"], titulo: "Pagos y cobros", icono: Wallet },
  { tipos: ["limite"], titulo: "Fechas límite", icono: Flag },
  { tipos: ["revision"], titulo: "Revisión", icono: ClipboardCheck },
];

/** Junta tareas y citas por día para el calendario y pinta el detalle del día elegido. */
export function CalendarioVista({ tareas, sinFecha, citas, metas, hoy }: { tareas: Task[]; sinFecha: Task[]; citas: Cita[]; metas: Pick<Goal, "id" | "title">[]; hoy: string }) {
  const data = useMemo<CalendarData[]>(() => {
    const porDia = new Map<string, CalendarEvent[]>();
    const meter = (dia: string, e: CalendarEvent) => porDia.set(dia, [...(porDia.get(dia) ?? []), e]);
    for (const t of tareas) meter(t.due_date!, { id: `tarea-${t.id}`, name: t.title, datetime: t.due_date!, color: COLOR.tarea, done: t.done });
    for (const c of citas) meter(c.dia, { id: c.id, name: c.nombre, time: c.detalle, datetime: c.dia, color: COLOR[c.tipo] });
    return [...porDia].map(([dia, events]) => ({ day: parseISO(dia), events }));
  }, [tareas, citas]);

  return (
    <FullScreenCalendar
      data={data}
      today={parseISO(hoy)}
      detalle={(fecha) => {
        const dia = format(fecha, "yyyy-MM-dd");
        const delDia = tareas.filter((t) => t.due_date === dia);
        const otras = citas.filter((c) => c.dia === dia);
        return (
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted">
                <ListTodo className="size-3.5" /> Tareas
              </div>
              <ListaTareas key={dia} tareas={delDia} metas={metas} dia={dia} hoy={hoy} />
              {dia === hoy && sinFecha.length > 0 && (
                <p className="mt-1 text-xs text-muted">
                  Tienes {sinFecha.length} {sinFecha.length === 1 ? "tarea" : "tareas"} sin fecha en{" "}
                  <Link href="/hoy" className="text-accent underline">
                    Hoy
                  </Link>
                  .
                </p>
              )}
            </div>
            {GRUPOS.map((g) => {
              const lista = otras.filter((c) => g.tipos.includes(c.tipo));
              if (!lista.length) return null;
              return (
                <div key={g.titulo}>
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted">
                    <g.icono className="size-3.5" /> {g.titulo}
                  </div>
                  <ul>
                    {lista.map((c) => (
                      <li key={c.id}>
                        <Link href={c.href} className="flex items-center gap-3 rounded-xl px-1 py-1.5 text-sm transition hover:bg-hover/60">
                          <span className="size-2 shrink-0 rounded-full" style={{ background: COLOR[c.tipo] }} />
                          <span className="min-w-0 flex-1 truncate">{c.nombre}</span>
                          {c.detalle && <span className="shrink-0 text-xs tabular-nums text-muted">{c.detalle}</span>}
                          <ChevronRight className="size-4 shrink-0 text-faint" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        );
      }}
    />
  );
}
