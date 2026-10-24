"use client";

import useOpenStatus from "@/hooks/useOpenStatus";
import { statusLabel } from "@/lib/openStatus";
import { cn } from "@/lib/format";

interface Props {
  variant?: "short" | "until";
  className?: string;
}

/** Píldora «🟢 Abierto ahora · cierra a las…» / «🔴 Cerrado · abre a las…», en vivo. */
export default function OpenBadge({ variant = "short", className }: Props) {
  const status = useOpenStatus();
  return (
    <p
      aria-live="polite"
      className={cn("inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-sm font-semibold backdrop-blur", className)}
    >
      {status ? (
        <>
          {/* El emoji del copy, con un latido suave cuando está abierto (decorativo). */}
          <span aria-hidden className={cn("inline-block", status.isOpen && "anim-pulse-dot")}>
            {status.isOpen ? "🟢" : "🔴"}
          </span>
          <span>{statusLabel(status, variant)}</span>
        </>
      ) : (
        <span className="text-fg-muted">Consultando horario…</span>
      )}
    </p>
  );
}
