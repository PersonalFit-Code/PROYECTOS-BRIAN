"use client";

import { useOpenStatus, useOpenStatusText } from "@/hooks/useOpenStatus";
import { cn } from "@/lib/utils";

/**
 * «Abierto ahora · hasta las 19:30» en vivo, con un anillo que late (verde abierto, carmín suave
 * cerrado). `badge` lo presenta como píldora. Reserva su hueco antes de montar para no saltar: el
 * servidor no sabe qué hora es donde está quien mira, así que el texto aparece al hidratar.
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
        badge && "rounded-full border border-carmin/12 bg-white/70 py-1.5 pr-4 pl-3",
        text ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <span aria-hidden className="relative flex size-2.5 shrink-0">
        <span className={cn("pulso-anillo absolute inset-0 rounded-full", open ? "bg-emerald-500" : "bg-carmin-suave")} />
        <span className={cn("relative size-2.5 rounded-full", open ? "bg-emerald-500" : "bg-carmin-suave")} />
      </span>
      <span className="font-semibold text-tinta">{text?.label ?? " "}</span>
      {!compact && text?.detail ? <span className="text-gris">· {text.detail}</span> : null}
    </span>
  );
}
