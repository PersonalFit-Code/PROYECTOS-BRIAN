"use client";

import { useEffect, useState } from "react";

/**
 * Qué sección de la página está mirando el visitante, de una lista de `id`s.
 *
 * Devuelve el ÚLTIMO id (en orden de documento) que cruza la franja central del viewport, igual que
 * el criterio del carril de capítulos de escritorio: cuando un capítulo se desliza sobre la portada
 * anclada, gana el de encima, que es el que se está leyendo.
 *
 * Es un `IntersectionObserver` y no una escucha de scroll a propósito: la home ya tiene a Lenis, el
 * pin de la portada y los scrubs de los capítulos compitiendo por cada fotograma, y un `scroll` más
 * que midiera posiciones en cada tic es justo lo que haría ir a tirones a un móvil de gama media.
 * El observador no cuesta nada mientras nada cruza el umbral.
 *
 * `null` mientras no haya ninguna a la vista (la portada, el pie) o si los elementos aún no existen.
 */
export function useSectionInView(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  /* La clave es el CONTENIDO de la lista, no su identidad: quien llame puede pasar un literal nuevo
     en cada render sin rearmar el observador en cada uno. */
  const key = ids.join("|");

  useEffect(() => {
    const order = key ? key.split("|") : [];
    const targets = order.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        let next: string | null = null;
        for (const id of order) if (visible.has(id)) next = id;
        setActive(next);
      },
      /* Misma franja central que usan la Navbar y el carril de capítulos: una sección cuenta como
         "la que se está mirando" cuando ocupa el centro de la pantalla, no cuando asoma por el borde. */
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return active;
}
