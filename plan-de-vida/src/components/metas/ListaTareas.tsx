"use client";

import { Flag, Target, Trash2 } from "lucide-react";
import { useOptimistic, useRef, useTransition } from "react";
import { borrarTarea, crearTarea, marcarTarea } from "@/app/(app)/metas/acciones";
import { Casilla } from "@/components/habitos/Casilla";
import { Campo } from "@/components/ui/basicos";
import { fechaCorta } from "@/lib/fechas";
import { cx } from "@/lib/formato";
import type { Goal, Task } from "@/lib/tipos";


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
          <li key={t.id} className="group flex items-center gap-3 rounded-xl px-1 py-1.5 transition hover:bg-hover/60">
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
              {t.priority === 1 && <Flag className="mr-1 inline size-3.5 text-bad" aria-label="Prioridad alta" />}
              {t.title}
              {t.goal_id && nombreMeta.get(t.goal_id) && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted">
                  <Target className="size-3" /> {nombreMeta.get(t.goal_id)}
                </span>
              )}
            </span>
            {t.due_date && (
              <span className={cx("text-xs", !t.done && t.due_date < hoy ? "text-bad" : "text-muted")}>{t.due_date === hoy ? "hoy" : fechaCorta(t.due_date)}</span>
            )}
            <button
              aria-label="Borrar tarea"
              className="rounded-lg p-1 text-muted opacity-60 transition hover:bg-hover hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
        className="mt-2 flex flex-wrap gap-2"
      >
        {dia && <input type="hidden" name="due_date" value={dia} />}
        <Campo name="title" placeholder="+ Nueva tarea (Enter)" className="min-w-0 flex-1" />
        {metas.length > 0 && (
          <select name="goal_id" className="max-w-40 rounded-xl border border-line bg-bg/70 px-2 text-xs text-muted" defaultValue="">
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
