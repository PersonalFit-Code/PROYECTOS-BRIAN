"use client";

import { Trash2 } from "lucide-react";
import { useOptimistic, useRef, useTransition } from "react";
import { borrarTarea, crearTarea, marcarTarea } from "@/app/(app)/metas/acciones";
import { Casilla } from "@/components/habitos/Casilla";
import { Campo } from "@/components/ui/basicos";
import { fechaCorta } from "@/lib/fechas";
import { cx } from "@/lib/formato";
import type { Goal, Task } from "@/lib/tipos";

const PRIORIDAD = { 1: "🔴", 2: "", 3: "⚪" } as Record<number, string>;

/** Lista de tareas con alta rápida (Enter). Si se pasa `dia`, las nuevas se apuntan para ese día. */
export function ListaTareas({ tareas, metas = [], dia, hoy }: { tareas: Task[]; metas?: Pick<Goal, "id" | "title">[]; dia?: string; hoy: string }) {
  const [, start] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  const [lista, aplicar] = useOptimistic(tareas, (actual, c: { id: string; done?: boolean; borrar?: boolean }) =>
    c.borrar ? actual.filter((t) => t.id !== c.id) : actual.map((t) => (t.id === c.id ? { ...t, done: c.done ?? t.done } : t)),
  );
  const nombreMeta = new Map(metas.map((m) => [m.id, m.title]));

  return (
    <div>
      <ul>
        {lista.map((t) => (
          <li key={t.id} className="group flex items-center gap-3 rounded-md px-1 py-1.5 hover:bg-hover">
            <Casilla
              hecho={t.done}
              etiqueta={t.title}
              onClick={() =>
                start(async () => {
                  aplicar({ id: t.id, done: !t.done });
                  await marcarTarea(t.id, !t.done);
                })
              }
            />
            <span className={cx("flex-1 truncate", t.done && "text-muted line-through decoration-faint")}>
              {PRIORIDAD[t.priority] && <span className="mr-1">{PRIORIDAD[t.priority]}</span>}
              {t.title}
              {t.goal_id && nombreMeta.get(t.goal_id) && <span className="ml-2 text-xs text-muted">🎯 {nombreMeta.get(t.goal_id)}</span>}
            </span>
            {t.due_date && (
              <span className={cx("text-xs", !t.done && t.due_date < hoy ? "text-bad" : "text-muted")}>{t.due_date === hoy ? "hoy" : fechaCorta(t.due_date)}</span>
            )}
            <button
              aria-label="Borrar tarea"
              className="rounded p-1 text-muted opacity-0 hover:bg-hover group-hover:opacity-100"
              onClick={() =>
                start(async () => {
                  aplicar({ id: t.id, borrar: true });
                  await borrarTarea(t.id);
                })
              }
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form
        ref={form}
        action={async (f) => {
          await crearTarea(f);
          form.current?.reset();
        }}
        className="mt-1 flex gap-2"
      >
        {dia && <input type="hidden" name="due_date" value={dia} />}
        <Campo name="title" placeholder="+ Nueva tarea (Enter)" className="border-transparent bg-transparent hover:border-line" />
        {metas.length > 0 && (
          <select name="goal_id" className="max-w-36 rounded-md border border-line bg-bg px-1 text-xs text-muted" defaultValue="">
            <option value="">Sin meta</option>
            {metas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        )}
      </form>
    </div>
  );
}
