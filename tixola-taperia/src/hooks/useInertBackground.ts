"use client";

import { useEffect, type RefObject } from "react";

/**
 * Mientras `active` es true, marca como `inert` todos los hijos directos de `<body>`
 * salvo los indicados en `exempt` (el propio diálogo/overlay y, si aplica, cualquier
 * cabecera que alojе su propio control de apertura/cierre).
 *
 * `inert` saca esos nodos del árbol de accesibilidad y del orden de tabulación —a
 * diferencia de una simple transformación CSS o de `aria-hidden` sin más—, así que un
 * lector de pantalla en modo "explorar" (cursor virtual, no Tab) no puede alcanzar el
 * contenido de fondo mientras un diálogo modal está abierto, tal y como exige el patrón
 * ARIA de diálogo modal.
 *
 * Restaura el `inert` previo de cada nodo (si ya lo tenía) al desactivarse.
 */
export function useInertBackground(active: boolean, exempt: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const keep = new Set(exempt.map((ref) => ref.current).filter((el): el is HTMLElement => el !== null));
    const touched: { el: HTMLElement; hadInert: boolean }[] = [];
    for (const child of Array.from(document.body.children)) {
      if (!(child instanceof HTMLElement) || keep.has(child)) continue;
      touched.push({ el: child, hadInert: child.hasAttribute("inert") });
      child.setAttribute("inert", "");
    }
    return () => {
      for (const { el, hadInert } of touched) {
        if (!hadInert) el.removeAttribute("inert");
      }
    };
    // `exempt` contiene refs estables (identidad constante entre renders); solo `active`
    // debe disparar de nuevo el efecto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
