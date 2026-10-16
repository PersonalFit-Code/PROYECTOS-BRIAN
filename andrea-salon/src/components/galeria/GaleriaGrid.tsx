"use client";

import { useRef } from "react";
import FotoEditorial from "@/components/ui/FotoEditorial";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import type { GaleriaItem } from "@/data/galeria";

/**
 * Galería en cuadrícula limpia (tipo Paintbox): cuadrados iguales, separación mínima, sin bordes
 * redondos ni sombras; la foto manda. Mientras no lleguen las fotos se enseñan solo seis marcos
 * (veinte huecos vacíos hacían la página interminable y vacía).
 */
export default function GaleriaGrid({ items }: { items: readonly GaleriaItem[] }) {
  const m = useMessages();
  const ref = useRef<HTMLUListElement>(null);
  useReveal(ref, { stagger: 0.05 });
  const reales = items.filter((g) => !g.pendiente);
  const lista = reales.length > 0 ? reales : items.slice(0, 6);
  return (
    <ul ref={ref} aria-label={m.galeria.gridAria} className="grid grid-cols-2 gap-[2px] sm:grid-cols-3">
      {lista.map((g) => (
        <li key={g.id} data-reveal className="group relative">
          <FotoEditorial
            foto={{ src: g.src, alt: g.alt, ancho: 1200, alto: 1200, pendiente: g.pendiente }}
            sizes="(min-width: 640px) 33vw, 50vw"
            rotulo={g.pendiente ? m.galeria.placeholder : undefined}
            className="aspect-square w-full"
          />
        </li>
      ))}
    </ul>
  );
}
