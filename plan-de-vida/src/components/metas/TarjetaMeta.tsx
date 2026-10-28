"use client";

import { Check, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { avanzarMeta, borrarMeta, estadoMeta } from "@/app/(app)/metas/acciones";
import { Progreso, Tag } from "@/components/ui/basicos";
import { fechaCorta } from "@/lib/fechas";
import { cx } from "@/lib/formato";
import { n, type Goal } from "@/lib/tipos";

const PERIODO = (g: Goal) => (g.period === "trimestral" ? `T${g.quarter} ${g.year}` : g.period === "mensual" ? `${g.month}/${g.year}` : `${g.year}`);

export function TarjetaMeta({ meta, color, tareas }: { meta: Goal; color: string; tareas: { hechas: number; total: number } }) {
  const [menu, setMenu] = useState(false);
  const [avance, setAvance] = useState("");
  const [pendiente, start] = useTransition();
  const conMetrica = meta.target_value != null;
  const pct = n(meta.progress_pct);

  return (
    <li className={cx("rounded-lg border border-line bg-card p-3", meta.status !== "activa" && "opacity-60", pendiente && "animate-pulse")}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className={cx("font-medium", meta.status === "hecha" && "line-through decoration-faint")}>{meta.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <Tag color={color}>{PERIODO(meta)}</Tag>
            {meta.status === "hecha" && <Tag color="green">Hecha</Tag>}
            {meta.status === "pausada" && <Tag>En pausa</Tag>}
            {meta.due_date && <span>· hasta {fechaCorta(meta.due_date)}</span>}
            {tareas.total > 0 && (
              <span>
                · {tareas.hechas}/{tareas.total} tareas
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <button aria-label="Opciones" onClick={() => setMenu((v) => !v)} className="rounded p-1 text-muted hover:bg-hover">
            <MoreHorizontal className="size-4" />
          </button>
          {menu && (
            <div className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-line bg-bg p-1 text-sm shadow-lg" onMouseLeave={() => setMenu(false)}>
              {meta.status !== "hecha" && (
                <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-hover" onClick={() => start(() => estadoMeta(meta.id, "hecha"))}>
                  <Check className="size-4" /> Marcar hecha
                </button>
              )}
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-hover"
                onClick={() => start(() => estadoMeta(meta.id, meta.status === "activa" ? "pausada" : "activa"))}
              >
                {meta.status === "activa" ? <Pause className="size-4" /> : <Play className="size-4" />}
                {meta.status === "activa" ? "Pausar" : "Reactivar"}
              </button>
              <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-bad hover:bg-hover" onClick={() => confirm(`¿Borrar "${meta.title}"?`) && start(() => borrarMeta(meta.id))}>
                <Trash2 className="size-4" /> Borrar
              </button>
            </div>
          )}
        </div>
      </div>
      {meta.description && <p className="mt-2 text-sm text-muted">{meta.description}</p>}
      <div className="mt-3 flex items-center gap-2">
        <Progreso valor={pct} color={`var(--tag-${color}-fg)`} />
        <span className="w-10 text-right text-xs tabular-nums text-muted">{Math.round(pct)}%</span>
      </div>
      {meta.status === "activa" && (
        <form
          className="mt-2 flex items-center gap-2 text-xs text-muted"
          onSubmit={(e) => {
            e.preventDefault();
            const v = Number(avance.replace(",", "."));
            if (Number.isFinite(v)) start(() => avanzarMeta(meta.id, v));
            setAvance("");
          }}
        >
          {conMetrica ? (
            <span>
              {n(meta.current_value ?? meta.start_value)} → {n(meta.target_value)} {meta.unit}
            </span>
          ) : (
            <span>Avance manual</span>
          )}
          <input
            value={avance}
            onChange={(e) => setAvance(e.target.value)}
            inputMode="decimal"
            placeholder={conMetrica ? "valor actual" : "%"}
            aria-label="Actualizar avance"
            className="ml-auto w-24 rounded border border-line bg-bg px-1.5 py-0.5 text-right"
          />
        </form>
      )}
    </li>
  );
}
