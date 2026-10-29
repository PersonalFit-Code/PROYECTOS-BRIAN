"use client";

import { Check, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { avanzarMeta, borrarMeta, estadoMeta } from "@/app/(app)/metas/acciones";
import { PreguntarCoach } from "@/components/coach/PreguntarCoach";
import { Progreso, Tag } from "@/components/ui/basicos";
import { fechaCorta } from "@/lib/fechas";
import { cx, euros } from "@/lib/formato";
import type { EstadoAuto } from "@/lib/metas/auto";
import { n, type Goal } from "@/lib/tipos";

const PERIODO = (g: Goal) => (g.period === "trimestral" ? `T${g.quarter} ${g.year}` : g.period === "mensual" ? `${g.month}/${g.year}` : `${g.year}`);

export function TarjetaMeta({ meta, color, tareas, auto }: { meta: Goal; color: string; tareas: { hechas: number; total: number }; auto?: EstadoAuto }) {
  const [menu, setMenu] = useState(false);
  const [avance, setAvance] = useState("");
  const [pendiente, start] = useTransition();
  const conMetrica = meta.target_value != null;
  const pct = n(meta.progress_pct);

  return (
    <li className={cx("entrar rounded-2xl border border-line/70 bg-bg/50 p-3", meta.status !== "activa" && "opacity-60", pendiente && "animate-pulse")}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className={cx("font-medium", meta.status === "hecha" && "line-through decoration-faint")}>{meta.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <Tag color={color}>{PERIODO(meta)}</Tag>
            {meta.status === "hecha" && <Tag color="green">Hecha</Tag>}
            {meta.status === "pausada" && <Tag>En pausa</Tag>}
            {meta.due_date && <span>· hasta {fechaCorta(meta.due_date)}{meta.due_date.slice(0, 4) !== String(meta.year) ? ` ${meta.due_date.slice(0, 4)}` : ""}</span>}
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
            <div className="glass-strong absolute right-0 z-10 mt-1 w-44 rounded-2xl p-1 text-sm" onMouseLeave={() => setMenu(false)}>
              {meta.status !== "hecha" && (
                <button className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-hover" onClick={() => start(() => estadoMeta(meta.id, "hecha"))}>
                  <Check className="size-4" /> Marcar hecha
                </button>
              )}
              <button
                className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-hover"
                onClick={() => start(() => estadoMeta(meta.id, meta.status === "activa" ? "pausada" : "activa"))}
              >
                {meta.status === "activa" ? <Pause className="size-4" /> : <Play className="size-4" />}
                {meta.status === "activa" ? "Pausar" : "Reactivar"}
              </button>
              <button className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-bad hover:bg-hover" onClick={() => confirm(`¿Borrar "${meta.title}"?`) && start(() => borrarMeta(meta.id))}>
                <Trash2 className="size-4" /> Borrar
              </button>
            </div>
          )}
        </div>
      </div>
      {(meta.start_text || meta.target_text) && (
        <dl className="mt-2 grid gap-1 text-sm">
          {meta.start_text && (
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-xs leading-5 text-muted">Ahora</dt>
              <dd className="min-w-0 whitespace-pre-wrap">{meta.start_text}</dd>
            </div>
          )}
          {meta.target_text && (
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 text-xs leading-5 text-muted">Quiero</dt>
              <dd className="min-w-0 whitespace-pre-wrap font-medium">{meta.target_text}</dd>
            </div>
          )}
        </dl>
      )}
      {meta.description && <p className="mt-2 text-sm text-muted">{meta.description}</p>}
      <div className="mt-3 flex items-center gap-2">
        <Progreso valor={pct} color={`var(--tag-${color}-fg)`} />
        <span className="w-10 text-right text-xs tabular-nums text-muted">{Math.round(pct)}%</span>
      </div>
      {auto && (
        <div className="mt-2 space-y-0.5 text-xs text-muted">
          <div className="flex flex-wrap justify-between gap-x-3">
            <span>
              Este mes: <span className="font-semibold text-fg tabular-nums">{euros(auto.valor, false)}</span> de {euros(n(meta.target_value), false)}
            </span>
            {auto.ritmo != null && (
              <span className="tabular-nums" style={{ color: auto.valor >= auto.ritmo ? "var(--ok)" : "var(--bad)" }}>
                Ritmo: {euros(auto.ritmo, false)} ({auto.valor >= auto.ritmo ? "+" : "−"}
                {euros(Math.abs(auto.valor - auto.ritmo), false)})
              </span>
            )}
          </div>
          <div>
            Fijos {euros(auto.fijos, false)} · apuntado {euros(auto.apuntado, false)}
            {auto.falta > 0 && <> · faltan {euros(auto.falta, false)}</>}
          </div>
        </div>
      )}
      {meta.status === "activa" && (
        <PreguntarCoach
          className="mt-3 px-2.5 py-1 text-xs"
          pregunta={auto ? `¿Qué hago este mes para avanzar en mi meta «${meta.title}»? Dame ideas de negocio con números.` : `Ayúdame a avanzar en mi meta «${meta.title}»: ¿cuál es el siguiente paso concreto?`}
        >
          {auto ? "Ideas para esta meta" : "Siguiente paso"}
        </PreguntarCoach>
      )}
      {meta.status === "activa" && !auto && !conMetrica && (
        <label className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span className="shrink-0">Cuánto llevas</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            defaultValue={Math.round(pct)}
            aria-label="Avance de la meta en %"
            onPointerUp={(e) => start(() => avanzarMeta(meta.id, Number((e.target as HTMLInputElement).value)))}
            onKeyUp={(e) => start(() => avanzarMeta(meta.id, Number((e.target as HTMLInputElement).value)))}
            className="flex-1 accent-[var(--accent)]"
          />
        </label>
      )}
      {meta.status === "activa" && !auto && conMetrica && (
        <form
          className="mt-2 flex items-center gap-2 text-xs text-muted"
          onSubmit={(e) => {
            e.preventDefault();
            const v = Number(avance.replace(",", "."));
            if (Number.isFinite(v)) start(() => avanzarMeta(meta.id, v));
            setAvance("");
          }}
        >
          <span>
            {n(meta.current_value ?? meta.start_value)} → {n(meta.target_value)} {meta.unit}
          </span>
          <input
            value={avance}
            onChange={(e) => setAvance(e.target.value)}
            inputMode="decimal"
            placeholder="valor actual"
            aria-label="Actualizar avance"
            className="ml-auto w-28 rounded-xl border border-line bg-bg/70 px-2 py-1 text-right"
          />
        </form>
      )}
    </li>
  );
}
