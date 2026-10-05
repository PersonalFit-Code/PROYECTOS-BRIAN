"use client";

import { useOpenStatus, useOpenStatusText } from "@/hooks/useOpenStatus";
import { cn } from "@/lib/cn";

/**
 * «Abierto ahora · hasta las 00:00» en vivo, con un anillo que late (verde abierto, oro cerrado).
 * `badge` lo presenta como píldora. Reserva su hueco antes de montar para no saltar.
 */
export default function StatusPill({ className, compact = false, badge = false }: { className?: string; compact?: boolean; badge?: boolean }) {
  const status = useOpenStatus();
  const text = useOpenStatusText(status);
  const open = status?.isOpen ?? false;
  return (
    <span
      role="status"
      className={cn(
        "inline-flex min-h-8 items-center gap-2.5 text-[13px] leading-tight transition-opacity duration-500",
        badge && "rounded-full border border-cream/12 bg-cream/[0.05] py-1.5 pr-4 pl-3",
        text ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <span aria-hidden className="relative flex size-2.5 shrink-0">
        <span className={cn("pulso-anillo absolute inset-0 rounded-full", open ? "bg-emerald-400" : "bg-oro")} />
        <span className={cn("relative size-2.5 rounded-full", open ? "bg-emerald-400" : "bg-oro")} />
      </span>
      <span className="font-semibold text-cream">{text?.label ?? " "}</span>
      {!compact && text?.detail ? <span className="text-cream-muted">· {text.detail}</span> : null}
    </span>
  );
}
