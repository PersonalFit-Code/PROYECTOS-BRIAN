/**
 * Bloqueo de scroll del documento, CONTADO y compartido.
 *
 * Existe porque cinco paneles a pantalla completa (menú de la cabecera, modal de reserva, detalle de
 * plato, visor de la galería y leyenda de alérgenos) escribían y borraban el estado cada uno por su
 * cuenta, sin contador. Mientras no se solapen eso funciona; en cuanto dos coinciden, el interior borra
 * `data-scroll-lock` al cerrarse y el exterior se queda abierto SIN bloqueo: Lenis se rearranca y
 * `HeroCanvas` vuelve a animar sus capas detrás de un panel opaco a pantalla completa. Y la leyenda de
 * alérgenos ni siquiera escribía el atributo, así que con ella abierta la portada seguía animando siempre.
 *
 * El contrato son dos cosas y las dos las mira el resto de la web:
 *  · `overflow: hidden` en el <body>, que es lo que de verdad congela el scroll;
 *  · `data-scroll-lock` en el <html>, que es lo que consultan `SmoothScrollProvider` (para parar Lenis) y
 *    `HeroCanvas` (para dejar de pintar). Se lee un atributo y no `getComputedStyle` a propósito: el
 *    estilo calculado fuerza un recálculo síncrono del documento entero, y esto se dispara en el mismo
 *    clic con el que el usuario espera que el panel aparezca al instante.
 *
 * El `padding-right` compensa la barra de desplazamiento al ocultarla. Con `scrollbar-gutter: stable` en
 * el <html> (globals.css) el hueco ya está reservado y esto sale 0; se mantiene para los navegadores que
 * no lo soportan todavía.
 */

/** Paneles que tienen el scroll bloqueado ahora mismo. */
let depth = 0;
/** Valores del <body> ANTES del primer bloqueo: solo el más exterior los guarda y los restaura. */
let previousOverflow = "";
let previousPaddingRight = "";

/**
 * Bloquea el scroll y devuelve la función que lo suelta. El bloqueo real solo se aplica con el primer
 * panel y solo se levanta con el último. Cada liberación es idempotente: llamarla dos veces (React puede
 * ejecutar la limpieza de un efecto más de una vez en desarrollo) no descuenta dos paneles.
 */
export function lockScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  const { body } = document;
  const html = document.documentElement;

  depth += 1;
  if (depth === 1) {
    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;
    const scrollbarGap = window.innerWidth - html.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;
    html.dataset.scrollLock = "";
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    depth = Math.max(0, depth - 1);
    if (depth > 0) return;
    body.style.overflow = previousOverflow;
    body.style.paddingRight = previousPaddingRight;
    delete html.dataset.scrollLock;
  };
}
