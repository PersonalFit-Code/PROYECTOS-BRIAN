"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { Focus, LayoutGrid } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  /** revelado al entrar en pantalla + fundido de las tarjetas que se montan al filtrar */
  animations: boolean;
  onSelect: (id: CategoryFilter) => void;
  /** Abre la ficha del plato; el estado vive arriba, en `CartaExplorer`. */
  onOpenItem: (item: MenuItem, kicker: string) => void;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const REVEAL: Variants = {
  hidden: { opacity: 0, y: 36, transition: { duration: 0 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_OUT_EXPO } },
};

export default function CategorySection({
  category,
  items,
  total,
  dietTags,
  selected,
  highlightedId,
  animations,
  onSelect,
  onOpenItem,
}: CategorySectionProps) {
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
      /* Tamaño RESERVADO mientras la sección está fuera de pantalla y `content-visibility` se ahorra
         pintarla. Era 720 px fijos para todas: con la lista compacta de móvil una categoría de tres
         platos mide ~360, así que la página decía medir el doble de lo que mide y, según se iban
         pintando, el recorrido se encogía bajo el dedo (el scroll "daba saltos"). Ahora se estima de
         lo que hay: la cabecera más una fila por plato, con la rejilla de cada anchura.
         El `auto` de `contain-intrinsic-size` hace que, una vez pintada, mande su medida real: esto
         solo tiene que acertar la PRIMERA vez, y acertar de menos es mejor que de más. */
      style={
        {
          "--cat-size-sm": `${120 + items.length * 84}px`,
          "--cat-size-md": `${190 + Math.ceil(items.length / 2) * 470}px`,
          "--cat-size-xl": `${190 + Math.ceil(items.length / 3) * 470}px`,
        } as CSSProperties
      }
      className={cn(
        "relative scroll-mt-[calc(var(--header-h)+84px)] [content-visibility:auto]",
        "[contain-intrinsic-size:auto_var(--cat-size-sm)] md:[contain-intrinsic-size:auto_var(--cat-size-md)] xl:[contain-intrinsic-size:auto_var(--cat-size-xl)]",
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
      <header className="relative mb-3 flex flex-row items-end justify-between gap-3 md:mb-8">
        <div className="min-w-0 max-w-2xl">
          <p className="mb-1 inline-flex items-center gap-3 font-caps text-[10px] uppercase tracking-[0.3em] text-pimenton-a11y md:mb-2 md:text-[11px]">
            <span aria-hidden className="h-px w-6 bg-pimenton-light/70" />
            {category.kicker}
          </p>
          <h2
            id={headingId}
            className={cn(
              "font-condensed text-3xl uppercase leading-[0.95] tracking-wide text-cream-200 md:text-6xl lg:text-7xl",
              "[text-shadow:0_0_1px_rgba(249,246,240,0.5),0_0_24px_rgba(249,246,240,0.12),0_12px_30px_rgba(0,0,0,0.6)]",
            )}
          >
            {category.label}
            {/* El contador se lee con un `sr-only`: un <span> genérico no admite `aria-label`. */}
            <span aria-hidden className="ml-3 align-top font-sans text-xs font-semibold tracking-[0.2em] text-cream-faint">
              {items.length}/{total}
            </span>
            <span className="sr-only"> ({t(m.carta.sectionCount, { shown: items.length, total })})</span>
          </h2>
          <p className="max-md:hidden mt-3 max-w-xl text-sm leading-relaxed text-cream-muted md:text-base">{category.description}</p>
        </div>

        {/* Solo esta / toda la carta */}
        {selected ? (
          <button
            type="button"
            onClick={() => onSelect("all")}
            aria-label={m.carta.all}
            className="inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-full border border-cream/20 px-3 text-xs font-semibold uppercase tracking-wider text-cream-muted transition-colors hover:border-cream/50 hover:text-cream md:px-4"
          >
            <LayoutGrid size={15} aria-hidden />
            <span className="max-md:hidden">{m.carta.all}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(category.id)}
            aria-label={m.carta.onlyThis}
            className="inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-full border border-cream/15 px-3 text-xs font-semibold uppercase tracking-wider text-cream-faint transition-colors hover:border-pimenton-light/60 hover:text-cream md:px-4"
          >
            <Focus size={15} aria-hidden />
            <span className="max-md:hidden">{m.carta.onlyThis}</span>
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
            enter={animations && settled}
            /* El `kicker` de la categoría viaja con el plato: es lo que la ficha usa como antetítulo
               ("Lonja gallega", "La especialidad de la casa"…) y aquí ya viene traducido. */
            onOpen={(dish) => onOpenItem(dish, category.kicker)}
          />
        ))}
      </ul>
    </motion.section>
  );
}
