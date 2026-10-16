"use client";

import Image from "next/image";
import { useRef } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import type { GaleriaItem } from "@/data/galeria";
import { cn } from "@/lib/utils";

const ASPECT = { square: "aspect-square", portrait: "aspect-[4/5]", landscape: "aspect-[4/3] sm:col-span-2" } as const;

/**
 * Rejilla de la galería con revelados escalonados. Es la galería «de verdad» mientras el morph
 * controlado por scroll (plan §2) no esté: si el morph se atasca, esto se queda. Con
 * `prefers-reduced-motion` el morph futuro cae también a esta rejilla.
 */
export default function GaleriaGrid({ items }: { items: readonly GaleriaItem[] }) {
  const m = useMessages();
  const ref = useRef<HTMLUListElement>(null);
  useReveal(ref, { stagger: 0.06 });
  return (
    <ul ref={ref} aria-label={m.galeria.gridAria} className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((g) => (
        <li key={g.id} data-reveal className={cn("glass-alta relative overflow-hidden rounded-2xl", ASPECT[g.aspect])}>
          <Image src={g.src} alt={g.alt} fill unoptimized={g.src.endsWith(".svg")} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
          {g.pendiente ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-carmin ring-1 ring-carmin/15">{m.galeria.placeholder}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
