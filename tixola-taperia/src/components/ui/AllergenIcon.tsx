"use client";

import { useMemo } from "react";
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
import { type Allergen, type AllergenId } from "@/data/allergens";
import { localizeAllergenMap } from "@/i18n/data";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
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
  /**
   * El nombre del alérgeno ya está escrito al lado (leyenda, chips de filtro): el badge se marca
   * como decorativo para que el lector de pantalla no lo repita.
   */
  decorative?: boolean;
  className?: string;
}

const SIZES = {
  xs: { box: "h-6 w-6", icon: 12 },
  sm: { box: "h-8 w-8", icon: 15 },
  md: { box: "h-10 w-10", icon: 18 },
};

/**
 * Badge circular de alérgeno con icono lucide y color propio.
 * Etiqueta y descripción salen de `localizeAllergenMap(locale)` y el nombre accesible de
 * `m.dishes.spotlight.allergenContains`: en /en, /gl y /pt el tooltip y el lector de pantalla
 * hablan el idioma de la página. El disco lleva `role="img"` (un `<span>` genérico no admite
 * `aria-label` según ARIA 1.2 y la mayoría de lectores no lo anuncian).
 */
export default function AllergenIcon({ id, size = "sm", withLabel = false, active = false, decorative = false, className }: AllergenIconProps) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const map = useMemo(() => localizeAllergenMap(locale), [locale]);

  const a = map[id];
  const Icon = ICONS[a.icon];
  const s = SIZES[size];
  /* Con etiqueta visible al lado el nombre ya se lee: el disco pasa a ser decorativo. */
  const silent = decorative || withLabel;
  const name = t(m.dishes.spotlight.allergenContains, { label: a.label.toLowerCase() });

  return (
    <span className={cn("inline-flex items-center gap-2", className)} title={`${a.label}: ${a.description}`}>
      <span
        role={silent ? undefined : "img"}
        aria-label={silent ? undefined : name}
        aria-hidden={silent ? true : undefined}
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

/** Fila compacta de badges de alérgenos (textos localizados; `role="group"` para poder nombrarla). */
export function AllergenRow({ ids, size = "xs", className }: { ids: AllergenId[]; size?: "xs" | "sm"; className?: string }) {
  const m = useMessages();
  if (!ids.length) {
    return <span className={cn("text-xs text-cream-faint", className)}>{m.carta.noAllergens}</span>;
  }
  return (
    <span role="group" aria-label={m.carta.allergensAria} className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {ids.map((id) => (
        <AllergenIcon key={id} id={id} size={size} />
      ))}
    </span>
  );
}
