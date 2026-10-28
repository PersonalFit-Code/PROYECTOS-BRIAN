"use client";

import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { darFeedback } from "@/app/(app)/finanzas/inversion/acciones";
import { Tag } from "@/components/ui/basicos";
import { cx } from "@/lib/formato";
import type { Recommendation } from "@/lib/tipos";

const COLOR: Record<string, string> = { aportar: "green", mantener: "blue", reducir: "red", vigilar: "yellow" };
const TEXTO: Record<string, string> = { aportar: "Aportar", mantener: "Mantener", reducir: "Reducir", vigilar: "Vigilar" };

export function TarjetaRecomendacion({ rec, nombre, nombreSenal }: { rec: Recommendation; nombre: string; nombreSenal: string }) {
  const [, start] = useTransition();
  const [estado, aplicar] = useOptimistic(rec, (r, c: Partial<Recommendation>) => ({ ...r, ...c }));

  function cambiar(c: { feedback?: "util" | "no_util" | null; followed?: boolean | null }) {
    start(async () => {
      aplicar(c);
      await darFeedback(rec.id, c);
    });
  }

  return (
    <li className="rounded-lg border border-line bg-card p-3">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Tag color={COLOR[rec.action]}>{TEXTO[rec.action]}</Tag>
        <span className="font-medium">{nombre}</span>
        <span className="text-xs text-muted">{rec.symbol}</span>
        <span className="ml-auto text-xs text-muted" title="Confianza">
          {"●".repeat(rec.confidence)}
          <span className="text-faint">{"●".repeat(5 - rec.confidence)}</span>
        </span>
      </div>
      <p className="text-sm">{rec.thesis}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted">
        <span>
          {nombreSenal} · {rec.sleeve} · {rec.horizon_days} días
        </span>
        <span className="ml-auto flex gap-1">
          <button
            onClick={() => cambiar({ followed: !estado.followed })}
            className={cx("inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-hover", estado.followed && "bg-hover font-medium text-fg")}
          >
            <Check className="size-3.5" /> La seguí
          </button>
          <button aria-label="Me sirve" onClick={() => cambiar({ feedback: estado.feedback === "util" ? null : "util" })} className={cx("rounded p-1 hover:bg-hover", estado.feedback === "util" && "text-ok")}>
            <ThumbsUp className="size-4" />
          </button>
          <button aria-label="No me sirve" onClick={() => cambiar({ feedback: estado.feedback === "no_util" ? null : "no_util" })} className={cx("rounded p-1 hover:bg-hover", estado.feedback === "no_util" && "text-bad")}>
            <ThumbsDown className="size-4" />
          </button>
        </span>
      </div>
    </li>
  );
}
