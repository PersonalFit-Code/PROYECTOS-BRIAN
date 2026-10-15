"use client";

import { useEffect, type RefObject } from "react";

/**
 * Mientras `active` es true, marca como `inert` todo lo que NO está en el camino de los elementos
 * indicados en `exempt` (el propio diálogo/overlay y, si aplica, cualquier cabecera que aloje su
 * control de apertura/cierre).
 *
 * `inert` saca esos nodos del árbol de accesibilidad y del orden de tabulación —a diferencia de una
 * simple transformación CSS o de `aria-hidden` sin más—, así que un lector de pantalla en modo
 * "explorar" (cursor virtual, no Tab) no puede alcanzar el contenido de fondo mientras un diálogo
 * modal está abierto, tal y como exige el patrón ARIA de diálogo modal.
 *
 * SE RECORRE EL CAMINO, NO LOS HIJOS DE `<body>`. Antes esto miraba solo los hijos DIRECTOS del
 * `<body>` y exoneraba los que fueran, por identidad, uno de los `exempt`. Funcionaba al abrir la web
 * y dejaba de funcionar en cuanto el visitante navegaba a otra página: `template.tsx` solo envuelve
 * el contenido en su `div.entrada-pagina` cuando la navegación es de cliente (la primera carga no se
 * anima a propósito), así que a partir de ese momento el panel YA NO era hijo de `<body>` sino nieto.
 * Ninguno de los `exempt` coincidía, ese `div` se marcaba `inert` — y con él la cabecera, el panel y
 * su botón de cerrar. El menú se veía perfectamente y no respondía a nada, con el scroll ya
 * bloqueado: la página quedaba muerta hasta recargarla. Lo mismo le pasaba a la ficha de plato, a la
 * de vino, al visor de fotos y a la leyenda de alérgenos.
 *
 * Ahora se sube desde cada elemento exento hasta el `<body>` anotando sus ancestros, y se apaga nivel
 * a nivel a los HERMANOS de ese camino. Así da igual cuántos envoltorios haya en medio, hoy o mañana:
 * el fondo sigue quedando inert y lo exento sigue vivo.
 *
 * Restaura el `inert` previo de cada nodo (si ya lo tenía) al desactivarse.
 */
export function useInertBackground(active: boolean, exempt: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    const keep = exempt.map((ref) => ref.current).filter((el): el is HTMLElement => el !== null);
    /* Sin nada que proteger no se apaga nada: apagar el documento entero dejaría la web muerta, que
       es exactamente el fallo que este hook tiene que dejar de provocar. */
    if (!keep.length) return;

    /* Ancestros de los elementos exentos (sin incluir el <body>): por ahí hay que BAJAR, no apagar. */
    const path = new Set<HTMLElement>();
    for (const el of keep) {
      let node: HTMLElement | null = el.parentElement;
      while (node && node !== document.body) {
        path.add(node);
        node = node.parentElement;
      }
    }

    const touched: { el: HTMLElement; hadInert: boolean }[] = [];
    const apagarHermanos = (parent: HTMLElement) => {
      for (const child of Array.from(parent.children)) {
        if (!(child instanceof HTMLElement)) continue;
        /* El propio elemento exento se queda intacto con todo lo que lleva dentro. */
        if (keep.includes(child)) continue;
        /* Ancestro de algo exento: no se apaga, se baja un nivel. */
        if (path.has(child)) {
          apagarHermanos(child);
          continue;
        }
        touched.push({ el: child, hadInert: child.hasAttribute("inert") });
        child.setAttribute("inert", "");
      }
    };
    apagarHermanos(document.body);

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
