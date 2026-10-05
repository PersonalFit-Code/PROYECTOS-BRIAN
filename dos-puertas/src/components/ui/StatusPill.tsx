"use client";

import { useOpenStatus, useOpenStatusText } from "@/hooks/useOpenStatus";
import { cn } from "@/lib/cn";

/** «Abierto ahora · hasta las 00:00» en vivo. Reserva su hueco antes de montar para no saltar. */
export default function StatusPill({ className, compact = false }: { className?: string; compact?: boolean }) {
  const status = useOpenStatus();
  const text = useOpenStatusText(status);
  const open = status?.isOpen ?? false;
  return (
    <span
      role="status"
      className={cn(
        "inline-flex min-h-8 items-center gap-2 rounded-full text-[13px] leading-tight transition-opacity duration-500",
        text ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <span aria-hidden className="relative flex size-2.5 shrink-0">
        {open ? <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70 motion-reduce:hidden" /> : null}
        <span className={cn("relative size-2.5 rounded-full", open ? "bg-emerald-400" : "bg-oro-dark")} />
      </span>
      <span className="font-semibold text-cream">{text?.label ?? " "}</span>
      {!compact && text?.detail ? <span className="text-cream-muted">· {text.detail}</span> : null}
    </span>
  );
}
