"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * TRANSICIÓN AL CAMBIAR DE PÁGINA.
 *
 * `template.tsx` y no `layout.tsx` porque Next vuelve a montar este componente en cada navegación: es
 * el único sitio donde se puede animar la ENTRADA de una página sin interceptar los enlaces a mano.
 *
 * LA PRIMERA CARGA NO SE ANIMA, Y ESO ES LO IMPORTANTE. Una web que se funde desde la nada cada vez
 * que la abres es una web que parece más lenta, y encima el fundido se solaparía con la animación de
 * la portada. `yaMontado` vive FUERA del componente: sobrevive a las navegaciones de cliente —el
 * módulo no se vuelve a cargar— y arranca en falso en cada carga de verdad. Así que llegas y ves la
 * página al instante; pasas a /carta o a /vinos y entra con un fundido y un filo de luz.
 *
 * No hay desajuste de hidratación: en el servidor el efecto no corre nunca, de modo que `yaMontado`
 * se queda en falso allí y la primera pintura es idéntica en los dos lados.
 *
 * SOLO OPACIDAD, NUNCA `transform` NI `filter` EN ESTE DIV. La barra de navegación y los botones
 * flotantes van `position: fixed`, y cualquiera de esas dos propiedades en un ancestro los
 * convertiría en `absolute` respecto a este contenedor: la barra se quedaría clavada arriba del todo
 * y el botón de WhatsApp se iría al final de la página. La opacidad crea contexto de apilamiento
 * pero no bloque contenedor, así que no les afecta. El "sube al entrar" ya lo ponen los revelados de
 * cada sección. El filo de luz sí se mueve, pero es `fixed` y no tiene hijos: puede hacer lo que
 * quiera.
 *
 * Quien pide menos movimiento no ve nada de esto: las dos animaciones están declaradas dentro de
 * `prefers-reduced-motion: no-preference` en `globals.css`.
 */
let yaMontado = false;

export default function Template({ children }: { children: ReactNode }) {
  /* Inicializador perezoso: se evalúa UNA vez, en el primer render de este montaje, que es justo
     cuando hay que saber si venimos de una navegación o de abrir la web. */
  const [esNavegacion] = useState(() => yaMontado);

  useEffect(() => {
    yaMontado = true;
  }, []);

  if (!esNavegacion) return children;

  return (
    <div className="entrada-pagina">
      {/* Filo de luz que cruza la parte de arriba: dice "ya está" sin tapar nada. */}
      <span aria-hidden className="filo-de-carga" />
      {children}
    </div>
  );
}
