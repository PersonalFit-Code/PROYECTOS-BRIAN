"use client";

import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/format";

interface Props {
  label: string;
  checked: boolean;
  /** Bloqueado por el límite: sigue siendo enfocable para poder leer el motivo. */
  blocked: boolean;
  blockedText: string;
  role?: "checkbox" | "switch";
  hint?: string;
  aside?: ReactNode;
  swatch?: string;
  onToggle: () => void;
}

/**
 * Casilla con aspecto de tarjeta. Cuando se llega al límite, las no elegidas quedan atenuadas y
 * aria-disabled (no `disabled`, para que el teclado y los lectores lleguen y oigan el porqué), y
 * enseñan el tooltip «Has alcanzado el máximo».
 */
export default function ChoiceChip({ label, checked, blocked, blockedText, role = "checkbox", hint, aside, swatch, onToggle }: Props) {
  const [tip, setTip] = useState(false);
  const show = (v: boolean) => setTip(v && (blocked || Boolean(hint)));
  return (
    <div className="relative">
      <button
        type="button"
        role={role}
        aria-checked={checked}
        aria-disabled={blocked || undefined}
        aria-description={blocked ? blockedText : hint}
        onClick={() => (blocked ? setTip(true) : onToggle())}
        onPointerEnter={() => show(true)}
        onPointerLeave={() => show(false)}
        onFocus={() => show(true)}
        onBlur={() => show(false)}
        className={cn(
          "option card flex w-full items-center gap-3 border-2 px-4 py-4 text-left",
          checked ? "border-brand bg-surface-2" : "hover:border-fg-muted/40",
          blocked && "cursor-not-allowed opacity-40",
        )}
      >
        {role === "switch" ? (
          <span aria-hidden className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200", checked ? "bg-brand" : "bg-surface-2 ring-1 ring-line")}>
            <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-[var(--ease-out)]", checked ? "translate-x-6" : "translate-x-1")} />
          </span>
        ) : (
          <span aria-hidden className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-colors duration-150", checked ? "border-brand bg-brand text-ink" : "border-line")}>
            {checked && <Check className="h-4 w-4" strokeWidth={3} />}
          </span>
        )}
        {swatch && <span aria-hidden className="h-4 w-4 shrink-0 rounded-full ring-2 ring-black/10" style={{ background: swatch }} />}
        <span className="flex-1 font-semibold">{label}</span>
        {aside}
      </button>
      <span role="tooltip" data-open={tip} className="tip card absolute bottom-[calc(100%+6px)] left-1/2 z-10 w-max max-w-60 -translate-x-1/2 px-3 py-2 text-xs font-semibold shadow-lg">
        {blocked ? blockedText : hint}
      </span>
    </div>
  );
}
