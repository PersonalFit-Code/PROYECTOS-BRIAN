"use client";

import { cx } from "@/lib/formato";

export const CARAS_ANIMO = ["😞", "🙁", "😐", "🙂", "😄"];
export const CARAS_ENERGIA = ["🪫", "😴", "⚡", "⚡⚡", "🚀"];

/** Selector 1–5 con emojis. Con `name`, viaja en el formulario como input oculto. */
export function Escala({ valor, onChange, caras, name, etiqueta }: { valor: number | null; onChange: (v: number) => void; caras: string[]; name?: string; etiqueta: string }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex gap-1">
      {name && <input type="hidden" name={name} value={valor ?? ""} />}
      {caras.map((c, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={valor === i + 1}
          aria-label={`${etiqueta} ${i + 1}`}
          onClick={() => onChange(i + 1)}
          className={cx("grid size-9 place-items-center rounded-md text-lg transition", valor === i + 1 ? "bg-hover ring-1 ring-accent" : "opacity-60 hover:bg-hover hover:opacity-100")}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
