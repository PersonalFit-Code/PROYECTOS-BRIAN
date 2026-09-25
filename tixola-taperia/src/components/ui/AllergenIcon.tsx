"use client";

import {
  Wheat,
  Shell,
  Egg,
  Fish,
  Nut,
  Bean,
  Milk,
  TreeDeciduous,
  Leaf,
  Flame,
  CircleDot,
  Wine,
  Sprout,
  Snail,
  type LucideProps,
} from "lucide-react";
import { ALLERGEN_MAP, type Allergen, type AllergenId } from "@/data/allergens";
import { cn } from "@/lib/utils";

const ICONS: Record<Allergen["icon"], React.ComponentType<LucideProps>> = {
  Wheat,
  Shell,
  Egg,
  Fish,
  Nut,
  Bean,
  Milk,
  TreeDeciduous,
  Leaf,
  Flame,
  CircleDot,
  Wine,
  Sprout,
  Snail,
};

interface AllergenIconProps {
  id: AllergenId;
  size?: "xs" | "sm" | "md";
  /** muestra la etiqueta de texto junto al icono */
  withLabel?: boolean;
  /** resaltado (p. ej. filtro activo) */
  active?: boolean;
  className?: string;
}

const SIZES = {
  xs: { box: "h-6 w-6", icon: 12 },
  sm: { box: "h-8 w-8", icon: 15 },
  md: { box: "h-10 w-10", icon: 18 },
};

/**
 * Badge circular de alérgeno con icono lucide y color propio.
 * Accesible: `title` + `aria-label` con el nombre completo.
 */
export default function AllergenIcon({ id, size = "sm", withLabel = false, active = false, className }: AllergenIconProps) {
  const a = ALLERGEN_MAP[id];
  const Icon = ICONS[a.icon];
  const s = SIZES[size];
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      title={`${a.label}: ${a.description}`}
      aria-label={`Contiene ${a.label.toLowerCase()}`}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border transition-all duration-300",
          s.box,
          active ? "scale-105" : "",
        )}
        style={{
          color: a.color,
          borderColor: active ? a.color : `${a.color}55`,
          background: active ? `${a.color}33` : `${a.color}14`,
          boxShadow: active ? `0 0 16px ${a.color}66` : undefined,
        }}
      >
        <Icon size={s.icon} strokeWidth={2.2} aria-hidden />
      </span>
      {withLabel && <span className="text-sm text-cream-muted">{a.label}</span>}
    </span>
  );
}

/** Fila compacta de badges de alérgenos. */
export function AllergenRow({ ids, size = "xs", className }: { ids: AllergenId[]; size?: "xs" | "sm"; className?: string }) {
  if (!ids.length) {
    return <span className={cn("text-xs text-cream-faint", className)}>Sin alérgenos declarados</span>;
  }
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)} aria-label="Alérgenos">
      {ids.map((id) => (
        <AllergenIcon key={id} id={id} size={size} />
      ))}
    </span>
  );
}
