"use client";

import { motion } from "framer-motion";
import { Flame, Leaf, Sparkles, Sprout, Star, WheatOff, Wine, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { AllergenRow } from "@/components/ui/AllergenIcon";
import { DIET_TAG_LABELS, formatPrice, type DietTag, type MenuItem } from "@/data/menu";
import { cn } from "@/lib/utils";

/**
 * MenuItemCard — tarjeta de plato inspirada en la carta de RavioXO:
 * nombre grande en Bebas Neue mayúsculas, descripción ligera, precio enorme en rojo pimentón,
 * variantes, chips dietéticos, fila de alérgenos y maridaje. El emoji del plato se usa como
 * glifo decorativo desvanecido.
 *
 *  - `id={item.id}` para enlaces profundos `/carta#tix-chistorra-huevos` (con `scroll-margin-top`).
 *  - `highlighted` dispara un anillo rojo pulsante (llegada por enlace profundo).
 *  - `variant="chalk"` → estilo tiza sobre pizarra (sección "Sugerencias").
 *  - `layout` (framer-motion) anima la recolocación cuando cambian los filtros.
 */

export type MenuItemCardVariant = "glass" | "chalk";

export interface MenuItemCardProps {
  item: MenuItem;
  variant?: MenuItemCardVariant;
  highlighted?: boolean;
  /** animaciones de layout al filtrar (desactivar en tier "low") */
  layoutAnimations?: boolean;
  className?: string;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface TagStyle {
  icon: ComponentType<LucideProps>;
  /** clases del chip */
  chip: string;
}

/** Colores por etiqueta: hoja verde (vegano), trigo tachado (sin gluten), llama (picante), estrella dorada… */
const TAG_STYLES: Record<DietTag, TagStyle> = {
  vegano: { icon: Leaf, chip: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  vegetariano: { icon: Sprout, chip: "border-lime-400/40 bg-lime-400/10 text-lime-300" },
  "sin-gluten": { icon: WheatOff, chip: "border-gold/40 bg-gold/10 text-gold" },
  picante: { icon: Flame, chip: "border-ember/50 bg-ember/10 text-ember" },
  estrella: { icon: Star, chip: "border-gold/60 bg-gold/15 text-gold" },
  nuevo: { icon: Sparkles, chip: "border-cream/40 bg-cream/10 text-cream" },
};

/** Orden de pintado de los chips (la estrella primero, que es la que más vende). */
const TAG_ORDER: DietTag[] = ["estrella", "nuevo", "vegano", "vegetariano", "sin-gluten", "picante"];

export default function MenuItemCard({ item, variant = "glass", highlighted = false, layoutAnimations = true, className }: MenuItemCardProps) {
  const chalk = variant === "chalk";
  const tags = TAG_ORDER.filter((t) => item.tags.includes(t));
  const titleId = `carta-item-${item.id}-title`;

  return (
    <motion.li
      id={item.id}
      layout={layoutAnimations ? "position" : false}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
      className={cn(
        "carta-card group relative list-none scroll-mt-[calc(var(--header-h)+128px)] lg:scroll-mt-[calc(var(--header-h)+40px)]",
        "lg:w-[440px] lg:shrink-0 lg:snap-start xl:w-[480px]",
        className,
      )}
    >
      <article
        aria-labelledby={titleId}
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl p-5 transition-all duration-500 ease-[var(--ease-out-expo)] md:p-6",
          chalk
            ? "border border-dashed border-cream/25 bg-iron-900/55 hover:border-cream/50 hover:bg-iron-900/70"
            : "glass-smoke hover:-translate-y-1 hover:border-pimenton-light/60 hover:shadow-[0_0_0_1px_rgba(216,50,60,0.35),0_24px_60px_-24px_rgba(178,30,39,0.6)]",
        )}
      >
        {/* Anillo de resalte para el enlace profundo */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          initial={false}
          animate={
            highlighted
              ? {
                  opacity: [0, 1, 1, 0],
                  boxShadow: [
                    "0 0 0 0px rgba(216,50,60,0), 0 0 0px rgba(216,50,60,0)",
                    "0 0 0 3px rgba(216,50,60,0.95), 0 0 48px rgba(216,50,60,0.6)",
                    "0 0 0 3px rgba(216,50,60,0.7), 0 0 36px rgba(216,50,60,0.4)",
                    "0 0 0 0px rgba(216,50,60,0), 0 0 0px rgba(216,50,60,0)",
                  ],
                }
              : { opacity: 0 }
          }
          transition={{ duration: 2.4, ease: "easeInOut", times: [0, 0.15, 0.7, 1] }}
        />

        {/* Glifo decorativo: el emoji del plato, enorme y desvanecido */}
        <span
          aria-hidden
          className={cn(
            "carta-emoji pointer-events-none absolute -right-3 -top-4 select-none text-[6.5rem] leading-none transition-all duration-700 ease-[var(--ease-out-expo)] md:text-[7.5rem]",
            chalk ? "opacity-[0.08] grayscale" : "opacity-[0.09] group-hover:-rotate-6 group-hover:scale-110 group-hover:opacity-[0.16]",
          )}
        >
          {item.emoji}
        </span>

        {/* Nombre + precio */}
        <div className="relative flex items-start justify-between gap-4">
          <h3
            id={titleId}
            className={cn(
              "font-condensed text-3xl uppercase leading-[0.95] tracking-wide text-cream md:text-4xl",
              chalk && "[text-shadow:0_0_1px_rgba(249,246,240,0.55),0_0_12px_rgba(249,246,240,0.18)]",
            )}
          >
            {item.name}
          </h3>
          <p className="flex shrink-0 flex-col items-end leading-none">
            <span
              className={cn(
                "carta-price font-condensed text-4xl tracking-wide md:text-5xl",
                chalk ? "text-gold [text-shadow:0_0_14px_rgba(232,194,122,0.35)]" : "text-pimenton-light text-glow-red",
              )}
            >
              {formatPrice(item.price)}
            </span>
            {item.unit && <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cream-faint">{item.unit}</span>}
          </p>
        </div>

        {/* Descripción */}
        <p className="relative mt-3 max-w-prose text-sm leading-relaxed text-cream-muted md:text-[15px]">{item.description}</p>

        {/* Variantes: "Media (4 uds) 5,50 € · Ración (8 uds) 9,50 €" */}
        {item.variants && item.variants.length > 0 && (
          <p className="relative mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-cream-400">
            {item.variants.map((v, i) => (
              <span key={v.label} className="inline-flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-cream-faint">·</span>}
                <span>
                  {v.label}{" "}
                  <span className={cn("font-condensed text-base tracking-wide", chalk ? "text-gold" : "text-pimenton-light")}>{formatPrice(v.price)}</span>
                </span>
              </span>
            ))}
          </p>
        )}

        {/* Chips dietéticos */}
        {tags.length > 0 && (
          <ul className="relative mt-4 flex flex-wrap gap-1.5" aria-label="Características">
            {tags.map((tag) => {
              const { icon: Icon, chip } = TAG_STYLES[tag];
              return (
                <li
                  key={tag}
                  className={cn("inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-wider", chip)}
                >
                  <Icon size={12} strokeWidth={2.4} aria-hidden />
                  {DIET_TAG_LABELS[tag]}
                </li>
              );
            })}
          </ul>
        )}

        {/* Pie: alérgenos + maridaje */}
        <div className="relative mt-auto flex flex-col gap-3 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <AllergenRow ids={item.allergens} size="xs" />
          </div>
          {item.pairing && (
            <p className="inline-flex items-center gap-2 text-xs text-cream-400">
              <Wine size={14} strokeWidth={2} aria-hidden className={chalk ? "text-gold" : "text-pimenton-light"} />
              <span>
                <span className="text-cream-faint">Marida con:</span> <span className="font-medium text-cream-200">{item.pairing}</span>
              </span>
            </p>
          )}
        </div>

        {/* Línea inferior de brasa que se enciende al pasar el puntero */}
        {!chalk && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-pimenton-light/0 to-transparent transition-all duration-700 group-hover:via-pimenton-light/80"
          />
        )}
      </article>
    </motion.li>
  );
}
