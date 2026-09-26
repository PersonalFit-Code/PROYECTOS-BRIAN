"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Flame, Leaf, MessageCircleQuestion, Sparkles, Sprout, Star, WheatOff, Wine, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { useChat } from "@/components/chat/ChatProvider";
import { DishIcon } from "@/components/icons/DishIcons";
import { AllergenRow } from "@/components/ui/AllergenIcon";
import { formatPrice, type DietTag, type MenuItem } from "@/data/menu";
import { PHOTOS, type Photo } from "@/data/photos";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * MenuItemCard — tarjeta de plato.
 *
 *  - Con foto (`item.image`): imagen 4:3 arriba (next/image, `object-position` del manifiesto de
 *    fotos) con el icono del plato en un disco de hierro sobre la esquina.
 *  - Sin foto: cabecera fina con el icono del plato (DishIcon) en dorado sobre un disco de hierro.
 *  - Nombre en Bebas Neue mayúsculas, descripción, precio grande en rojo pimentón + unidad, variantes
 *    en línea, chips dietéticos (lucide), fila de alérgenos, maridaje ("Marida con: …") y un botón
 *    fantasma "Preguntar al camarero" que abre el chat con una pregunta sobre el plato.
 *  - `id={item.id}` para enlaces profundos `/carta#tix-chistorra-huevos` (con `scroll-margin-top`);
 *    `highlighted` dispara el anillo rojo de llegada.
 *  - `layout` (framer-motion) anima la recolocación cuando cambian los filtros (desactivable).
 *  - `glass` (solo tier "high") decide entre cristal ahumado y hierro opaco: con 49 tarjetas el
 *    `backdrop-filter` es lo más caro que puede pintar un móvil mientras se hace scroll.
 */

export type MenuItemCardVariant = "glass" | "chalk";

export interface MenuItemCardProps {
  item: MenuItem;
  /** etiquetas dietéticas ya localizadas (`localizeDietTags(locale)`) */
  dietTags: Record<DietTag, string>;
  variant?: MenuItemCardVariant;
  highlighted?: boolean;
  /** animación de layout (recolocación) al filtrar; desactivar en tier "low" / reduced motion */
  animations?: boolean;
  /**
   * Cristal ahumado (`backdrop-filter`) en la tarjeta. Solo en tier "high": la carta pinta ~49
   * tarjetas y en un móvil siempre hay varias en pantalla, cada una obligando a releer y
   * desenfocar el fondo en cada fotograma de scroll (misma regla que `ReviewMarquee`).
   */
  glass?: boolean;
  /**
   * Fundido de entrada al montarse. La sección lo activa solo para tarjetas que aparecen DESPUÉS
   * del primer frame (al filtrar): así el HTML estático y el árbol interactivo no parpadean.
   */
  enter?: boolean;
  className?: string;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface TagStyle {
  icon: ComponentType<LucideProps>;
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

/** Foto del manifiesto por ruta (para el `object-position`). */
const PHOTO_BY_SRC: ReadonlyMap<string, Photo> = new Map(PHOTOS.map((p) => [p.src, p]));

/** Anchos reales de la columna de la rejilla (1 col móvil · 2 cols md · 3 cols xl junto al camarero). */
const IMAGE_SIZES = "(min-width: 1280px) 300px, (min-width: 768px) 45vw, calc(100vw - 32px)";

export default function MenuItemCard({
  item,
  dietTags,
  variant = "glass",
  highlighted = false,
  animations = true,
  glass = false,
  enter = false,
  className,
}: MenuItemCardProps) {
  const m = useMessages();
  const t = useFormat();
  const locale = useLocale();
  const chat = useChat();

  const chalk = variant === "chalk";
  const tags = TAG_ORDER.filter((tag) => item.tags.includes(tag));
  const titleId = `carta-item-${item.id}-title`;
  const photo = item.image ? PHOTO_BY_SRC.get(item.image) : undefined;

  const askWaiter = () => chat.open({ prefill: t(m.carta.askAboutDish, { name: item.name }), page: "carta" });

  return (
    <motion.li
      id={item.id}
      layout={animations ? "position" : false}
      initial={enter ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
      className={cn("carta-card group relative flex list-none scroll-mt-[calc(var(--header-h)+92px)]", className)}
    >
      <article
        aria-labelledby={titleId}
        className={cn(
          "relative flex w-full flex-col overflow-hidden rounded-2xl transition-all duration-500 ease-[var(--ease-out-expo)]",
          chalk
            ? "border border-dashed border-cream/25 bg-iron-900/55 hover:border-cream/50 hover:bg-iron-900/70"
            : cn(
                glass ? "glass-smoke" : "border border-cream/10 bg-iron-800/90 shadow-card",
                "hover:-translate-y-1 hover:border-pimenton-light/60 hover:shadow-[0_0_0_1px_rgba(216,50,60,0.35),0_24px_60px_-24px_rgba(178,30,39,0.6)]",
              ),
        )}
      >
        {/* Anillo de resalte para el enlace profundo */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
          initial={false}
          animate={
            highlighted
              ? {
                  opacity: [0, 1, 1, 0],
                  boxShadow: [
                    "inset 0 0 0 0px rgba(216,50,60,0), 0 0 0px rgba(216,50,60,0)",
                    "inset 0 0 0 3px rgba(216,50,60,0.95), 0 0 48px rgba(216,50,60,0.6)",
                    "inset 0 0 0 3px rgba(216,50,60,0.7), 0 0 36px rgba(216,50,60,0.4)",
                    "inset 0 0 0 0px rgba(216,50,60,0), 0 0 0px rgba(216,50,60,0)",
                  ],
                }
              : { opacity: 0 }
          }
          transition={{ duration: 2.4, ease: "easeInOut", times: [0, 0.15, 0.7, 1] }}
        />

        {/* ── Cabecera: foto 4:3 o disco con el icono del plato ── */}
        {item.image ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-iron-800">
            <Image
              src={item.image}
              alt={t(m.carta.photoOf, { name: item.name })}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
              style={{ objectPosition: photo?.focus ?? "50% 50%" }}
            />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-iron-900/90 via-iron-900/30 to-transparent" />
            <span
              aria-hidden
              className="absolute bottom-3 left-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 bg-iron/90 text-gold shadow-[0_8px_20px_-8px_rgba(0,0,0,0.9)]"
            >
              <DishIcon iconKey={item.emoji} size={22} />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-5 pt-5 md:px-6">
            <span
              aria-hidden
              className={cn(
                "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-gold",
                chalk
                  ? "border-cream/20 bg-iron-900/70"
                  : "border-cream/10 bg-[radial-gradient(circle_at_30%_30%,#2e2e2e,#121212_75%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_-10px_rgba(0,0,0,0.9)]",
              )}
            >
              <DishIcon iconKey={item.emoji} size={30} strokeWidth={1.5} />
            </span>
            <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-cream/15 to-transparent" />
          </div>
        )}

        {/* ── Cuerpo ── */}
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <h3
            id={titleId}
            className={cn(
              "font-condensed text-2xl uppercase leading-[0.95] tracking-wide text-cream md:text-[1.75rem]",
              chalk && "[text-shadow:0_0_1px_rgba(249,246,240,0.55),0_0_12px_rgba(249,246,240,0.18)]",
            )}
          >
            {item.name}
          </h3>

          <p className="mt-2.5 text-sm leading-relaxed text-cream-muted">{item.description}</p>

          {/* Precio + unidad */}
          <p className="mt-4 flex items-baseline gap-2 leading-none">
            <span
              className={cn(
                "font-condensed text-4xl tracking-wide",
                chalk ? "text-gold [text-shadow:0_0_14px_rgba(232,194,122,0.35)]" : "text-pimenton-light text-glow-red",
              )}
            >
              {formatPrice(item.price, locale)}
            </span>
            {item.unit && <span className="font-caps text-[10px] uppercase tracking-[0.22em] text-cream-faint">{item.unit}</span>}
          </p>

          {/* Variantes: "Media (4 uds) 5,50 € · Ración (8 uds) 9,50 €" */}
          {item.variants && item.variants.length > 0 && (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-cream-400" aria-label={m.carta.variants}>
              {item.variants.map((v, i) => (
                <span key={v.label} className="inline-flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden className="text-cream-faint">
                      ·
                    </span>
                  )}
                  <span>
                    {v.label}{" "}
                    <span className={cn("font-condensed text-base tracking-wide", chalk ? "text-gold" : "text-pimenton-light")}>{formatPrice(v.price, locale)}</span>
                  </span>
                </span>
              ))}
            </p>
          )}

          {/* Chips dietéticos */}
          {tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={m.carta.tagsAria}>
              {tags.map((tag) => {
                const { icon: Icon, chip } = TAG_STYLES[tag];
                return (
                  <li key={tag} className={cn("inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-wider", chip)}>
                    <Icon size={12} strokeWidth={2.4} aria-hidden />
                    {dietTags[tag]}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Pie: alérgenos + maridaje + camarero */}
          <div className="mt-auto flex flex-col gap-3 pt-5">
            {item.allergens.length > 0 ? (
              <AllergenRow ids={item.allergens} size="xs" />
            ) : (
              <span className="text-xs text-cream-faint">{m.carta.noAllergens}</span>
            )}

            {item.pairing && (
              <p className="inline-flex items-start gap-2 text-xs text-cream-400">
                <Wine size={14} strokeWidth={2} aria-hidden className={cn("mt-0.5 shrink-0", chalk ? "text-gold" : "text-pimenton-light")} />
                <span>
                  <span className="text-cream-faint">{m.carta.pairing}:</span> <span className="font-medium text-cream-200">{item.pairing}</span>
                </span>
              </p>
            )}

            <button
              type="button"
              onClick={askWaiter}
              aria-label={t(m.carta.askAboutDishAria, { name: item.name })}
              className="-ml-3 inline-flex h-11 w-fit items-center gap-2 rounded-full px-3 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <MessageCircleQuestion size={16} strokeWidth={2.2} aria-hidden className="text-pimenton-light" />
              {m.carta.askAboutDishCta}
            </button>
          </div>
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
