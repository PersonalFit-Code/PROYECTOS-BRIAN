"use client";

import { Check } from "lucide-react";
import { cx } from "@/lib/formato";

/** Casilla tipo Notion. `estado`: hecho, pendiente, no toca (punto gris) o futuro (vacía, sin clic). */
export function Casilla({
  hecho,
  onClick,
  deshabilitada,
  tamano = "md",
  etiqueta,
  color = "var(--accent)",
}: {
  hecho: boolean;
  onClick?: () => void;
  deshabilitada?: boolean;
  tamano?: "sm" | "md";
  etiqueta: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={hecho}
      aria-label={etiqueta}
      title={etiqueta}
      disabled={deshabilitada}
      onClick={onClick}
      className={cx(
        "grid shrink-0 place-items-center rounded-lg border transition duration-200 active:scale-90 disabled:cursor-default",
        tamano === "sm" ? "size-7" : "size-7",
        hecho ? "border-transparent text-white" : "border-faint/60 hover:bg-hover",
        deshabilitada && !hecho && "opacity-40",
      )}
      style={hecho ? { background: color } : undefined}
    >
      {hecho && <Check className={cx("marcar", tamano === "sm" ? "size-3.5" : "size-4")} strokeWidth={3} />}
    </button>
  );
}
