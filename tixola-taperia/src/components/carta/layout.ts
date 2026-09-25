/**
 * Constantes de maquetación compartidas por la página /carta.
 * La carta es más ancha que `container-page` (80rem) para que la rejilla de 3 columnas conviva
 * con la tarjeta lateral del camarero virtual en escritorio.
 */

/** Contenedor de la página de la carta (mismo ancho en la barra pegajosa y en el contenido). */
export const CARTA_CONTAINER = "mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-10";

/** id del bloque de resultados (destino del scroll al cambiar de categoría). */
export const RESULTS_ID = "carta-resultados";

/** Altura aproximada (px) de la fila principal de la barra pegajosa, para los `scroll-margin`. */
export const FILTER_BAR_HEIGHT = 64;
