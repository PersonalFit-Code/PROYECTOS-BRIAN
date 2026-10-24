"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/format";

export interface RadioOption<T extends string> {
  value: T;
  title: string;
  description?: string;
  aside?: ReactNode;
  art?: ReactNode;
}

interface Props<T extends string> {
  label: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
  columns?: string;
  big?: boolean;
}

/**
 * Grupo de radio accesible (patrón WAI-ARIA): un solo tabulador para el grupo (tabindex itinerante),
 * flechas para moverse y seleccionar, Espacio/Enter para seleccionar.
 */
export default function RadioCards<T extends string>({ label, value, options, onChange, columns = "sm:grid-cols-2", big }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = options.length;
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + n) % n;
    refs.current[next]?.focus();
    onChange(options[next].value);
  };
  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-4", columns)}>
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "option card relative flex flex-col p-5 text-left",
              big && "min-h-64",
              checked ? "border-2 border-brand bg-surface-2 shadow-[var(--shadow-warm)]" : "border-2 hover:border-fg-muted/40",
            )}
          >
            {o.art && <div className="mb-3 text-fg">{o.art}</div>}
            <span className="flex items-start justify-between gap-3">
              <span className={cn("font-display uppercase leading-none", big ? "text-4xl" : "text-3xl")}>{o.title}</span>
              {o.aside}
            </span>
            {o.description && <span className="mt-2 text-fg-muted">{o.description}</span>}
            <span
              aria-hidden
              className={cn(
                "absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border-2 transition-colors duration-150",
                checked ? "border-brand bg-brand" : "border-line",
              )}
            >
              {checked && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
