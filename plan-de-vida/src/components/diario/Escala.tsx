"use client";

import { Battery, BatteryFull, BatteryLow, BatteryMedium, Frown, Laugh, Meh, Smile, Annoyed, Zap, type LucideIcon } from "lucide-react";
import { cx } from "@/lib/formato";

export const CARAS_ANIMO: LucideIcon[] = [Frown, Annoyed, Meh, Smile, Laugh];
export const CARAS_ENERGIA: LucideIcon[] = [BatteryLow, Battery, BatteryMedium, BatteryFull, Zap];
const COLORES = ["var(--bad)", "var(--warn)", "var(--muted)", "var(--ok)", "var(--accent)"];

/** Selector 1–5 con iconos. Con `name`, viaja en el formulario como input oculto. */
export function Escala({ valor, onChange, caras, name, etiqueta }: { valor: number | null; onChange: (v: number) => void; caras: LucideIcon[]; name?: string; etiqueta: string }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex gap-1">
      {name && <input type="hidden" name={name} value={valor ?? ""} />}
      {caras.map((I, i) => {
        const activo = valor === i + 1;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={activo}
            aria-label={`${etiqueta} ${i + 1}`}
            onClick={() => onChange(i + 1)}
            className={cx("grid size-10 place-items-center rounded-xl transition duration-200 active:scale-90", activo ? "bg-bg/80 shadow-sm ring-1 ring-accent/50" : "text-faint hover:bg-hover hover:text-muted")}
            style={activo ? { color: COLORES[i] } : undefined}
          >
            <I className={cx("size-5", activo && "marcar")} />
          </button>
        );
      })}
    </div>
  );
}
