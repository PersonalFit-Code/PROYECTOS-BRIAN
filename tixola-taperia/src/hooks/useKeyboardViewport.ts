"use client";

import { useEffect, useRef } from "react";

/**
 * Ancla un panel al VIEWPORT VISIBLE del móvil, ese que el teclado deja libre.
 *
 * El problema, contado por el cliente: "entro al chat y me sale el teclado, entonces se me sube todo
 * el chat para arriba; no ves lo que estás escribiendo por culpa del teclado". Es el comportamiento
 * de serie: en iOS el teclado NO encoge el viewport de maqueta (ni `100vh` ni `100svh` ni `100dvh`
 * se enteran), solo el VISUAL. Un panel anclado al pie del documento se queda, literalmente, debajo
 * del teclado, y el navegador arrastra la página hacia arriba para enseñar el cursor.
 *
 * `window.visualViewport` sí sabe qué se ve: `height` es lo que queda libre y `offsetTop` cuánto ha
 * empujado el navegador. Se publican como variables CSS en el propio panel y las lee su maqueta:
 * el panel ocupa exactamente el hueco visible, así que el cuadro de texto queda pegado encima del
 * teclado y la conversación se desplaza por detrás, como en cualquier app de mensajería.
 *
 * Detalles que importan:
 *  · Se escriben con `style.setProperty` y no con estado de React: esto se dispara en cada fotograma
 *    mientras el teclado sube, y un `setState` por fotograma volvería a renderizar la conversación
 *    entera (con sus burbujas y su Markdown) justo en el momento más delicado.
 *  · `scroll` además de `resize`: al desplazar con el teclado abierto cambia `offsetTop`, no la altura.
 *  · Sin `visualViewport` (navegadores viejos) las variables no se escriben y la maqueta usa su
 *    respaldo `100dvh`, que es el comportamiento de antes: se degrada, no se rompe.
 */
export function useKeyboardViewport(el: HTMLElement | null, active: boolean, onResize?: () => void): void {
  /* La reacción al cambio de tamaño se lee de una referencia: así cambiar de función (cada render
     trae una nueva) no vuelve a suscribir y desuscribir los eventos del viewport. Se actualiza en un
     efecto y no en el cuerpo del render, que es donde una referencia todavía no se puede tocar. */
  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    const vv = typeof window === "undefined" ? null : window.visualViewport;
    if (!el || !active || !vv) return;

    let alto = -1;
    const apply = () => {
      el.style.setProperty("--kb-height", `${Math.round(vv.height)}px`);
      el.style.setProperty("--kb-top", `${Math.round(vv.offsetTop)}px`);
      /* Solo cuando cambia el ALTO, que es lo que hace el teclado; `scroll` con el teclado abierto
         dispara esto muchas veces y solo mueve `offsetTop`. */
      if (Math.round(vv.height) !== alto) {
        alto = Math.round(vv.height);
        onResizeRef.current?.();
      }
    };
    apply();

    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
      el.style.removeProperty("--kb-height");
      el.style.removeProperty("--kb-top");
    };
  }, [el, active]);
}
