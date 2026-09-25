"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { Focus, LayoutGrid } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DietTag, MenuCategory, MenuCategoryId, MenuItem } from "@/data/menu";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import MenuItemCard from "./MenuItemCard";
import type { CategoryFilter } from "./useMenuFilters";

/**
 * CategorySection — una categoría de la carta.
 *
 *  - Cabecera "tiza sobre pizarra": kicker en Cinzel rojo, título enorme en Bebas Neue crema con
 *    halo suave, descripción y contador "3 de 5 platos".
 *  - Platos en rejilla responsive: 1 columna en móvil, 2 en md, 3 en xl (sin filas horizontales).
 *  - "Sugerencias" se pinta como una pizarra real: panel con borde de tiza y chincheta.
 *  - Acción de cabecera: "Solo esta" (selecciona la categoría en los chips) o "Toda la carta".
 *  - Revelado al hacer scroll (una sola vez). Las secciones que ya están en pantalla al cargar no se
 *    animan, para que el cambio fallback → cliente no produzca parpadeos.
 *  - `content-visibility: auto` para que el navegador no maquete las secciones fuera de pantalla.
 */

export const categoryAnchorId = (id: MenuCategoryId) => `cat-${id}`;

export interface CategorySectionProps {
  category: MenuCategory;
  items: MenuItem[];
  /** nº de platos de la categoría sin filtrar */
  total: number;
  /** etiquetas dietéticas ya localizadas */
  dietTags: Record<DietTag, string>;
  /** la categoría es la seleccionada en los chips (solo se muestra esta) */
  selected: boolean;
  highlightedId: string | null;
  /** animaciones de revelado / layout (false en tier "low" o reduced motion) */
  animations: boolean;
  onSelect: (id: CategoryFilter) => void;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const REVEAL: Variants = {
  hidden: { opacity: 0, y: 36, transition: { duration: 0 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_OUT_EXPO } },
};

export default function CategorySection({ category, items, total, dietTags, selected, highlightedId, animations, onSelect }: CategorySectionProps) {
  const m = useMessages();
  const t = useFormat();
  const sectionRef = useRef<HTMLElement>(null);
  const chalkboard = category.id === "sugerencias";
  const headingId = `${categoryAnchorId(category.id)}-title`;

  /* ── Revelado: solo se oculta (en el siguiente frame) si la sección está fuera de pantalla ── */
  const [deferred, setDeferred] = useState(false);
  /* Tras el primer frame, las tarjetas que se monten (al filtrar) entran con un fundido. */
  const [settled, setSettled] = useState(false);
  const inView = useInView(sectionRef, { once: true, amount: 0.12 });
  useEffect(() => {
    if (!animations) return;
    const raf = requestAnimationFrame(() => {
      setSettled(true);
      const el = sectionRef.current;
      if (!el) return;
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) setDeferred(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [animations]);
  const revealState = deferred && !inView ? "hidden" : "visible";

  return (
    <motion.section
      ref={sectionRef}
      id={categoryAnchorId(category.id)}
      aria-labelledby={headingId}
      data-category={category.id}
      initial={false}
      animate={revealState}
      variants={REVEAL}
      className={cn(
        "relative scroll-mt-[calc(var(--header-h)+84px)] [contain-intrinsic-size:auto_720px] [content-visibility:auto]",
        chalkboard && "rounded-3xl border-2 border-dashed border-cream/25 bg-iron-900/60 p-5 shadow-card md:p-8 lg:-rotate-[0.3deg] lg:p-10",
      )}
    >
      {chalkboard && (
        <>
          {/* Marco interior de tiza + "chincheta" */}
          <span aria-hidden className="pointer-events-none absolute inset-2 rounded-[1.25rem] border border-cream/10" />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-pimenton-light shadow-[0_0_16px_rgba(216,50,60,0.8),inset_0_-2px_3px_rgba(0,0,0,0.5)]"
          />
        </>
      )}

      {/* ── Cabecera de categoría ── */}
      <header className="relative mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-3 font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">
            <span aria-hidden className="h-px w-6 bg-pimenton-light/70" />
            {category.kicker}
          </p>
          <h2
            id={headingId}
            className={cn(
              "font-condensed text-5xl uppercase leading-[0.92] tracking-wide text-cream-200 md:text-6xl lg:text-7xl",
              "[text-shadow:0_0_1px_rgba(249,246,240,0.5),0_0_24px_rgba(249,246,240,0.12),0_12px_30px_rgba(0,0,0,0.6)]",
            )}
          >
            {category.label}
            <span className="ml-3 align-top font-sans text-xs font-semibold tracking-[0.2em] text-cream-faint" aria-label={t(m.carta.sectionCount, { shown: items.length, total })}>
              {items.length}/{total}
            </span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream-muted md:text-base">{category.description}</p>
        </div>

        {/* Solo esta / toda la carta */}
        {selected ? (
          <button
            type="button"
            onClick={() => onSelect("all")}
            className="inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-full border border-cream/20 px-4 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:border-cream/50 hover:text-cream"
          >
            <LayoutGrid size={15} aria-hidden />
            {m.carta.all}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(category.id)}
            className="inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-full border border-cream/15 px-4 text-xs font-semibold uppercase tracking-wider text-cream-faint transition-colors hover:border-pimenton-light/60 hover:text-cream"
          >
            <Focus size={15} aria-hidden />
            {m.carta.onlyThis}
          </button>
        )}
      </header>

      {/* ── Platos ── */}
      <ul aria-label={category.label} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            dietTags={dietTags}
            variant={chalkboard ? "chalk" : "glass"}
            highlighted={highlightedId === item.id}
            animations={animations}
            enter={animations && settled}
          />
        ))}
      </ul>
    </motion.section>
  );
}
