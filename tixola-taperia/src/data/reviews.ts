/**
 * Forma de una reseña. YA NO HAY NINGUNA GUARDADA (ver el comentario de `SOCIAL_STATS`), pero el tipo
 * sigue vivo porque de él cuelga `source`, que es lo que distingue el logotipo de Google del de
 * TripAdvisor en `ReviewCard`, y ese sí se usa: en la banda de enlaces de la portada y en el pie.
 */
export interface Review {
  id: string;
  author: string;
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  text: string;
  date: string;
  source: "TripAdvisor" | "Google";
  highlight?: string;
}

/**
 * Indicadores de la banda "En cifras" de la portada.
 *
 * AQUÍ VIVÍAN CUARENTA RESEÑAS COPIADAS de TripAdvisor y de Google —texto literal, nombre de usuario y
 * ciudad— y se borraron el 13-10-2026 con la sección que las pintaba. El porqué, largo, está en el
 * comentario del bloque 3 de `SocialProof.tsx`; el resumen es que ninguna de las dos plataformas
 * permite reproducir sus reseñas fuera de sus widgets, que el texto es de quien lo escribió y que
 * publicar el nombre de una persona con fin publicitario necesita su permiso expreso.
 *
 * NO LAS VUELVAS A META AQUÍ "solo para tenerlas". El fichero es público: está en el repositorio y
 * viaja en cada despliegue.
 */

import { MENU_ITEMS } from "./menu";

export const SOCIAL_STATS = [
  { id: "reviews", value: 850, suffix: "+", label: "Reseñas de clientes", sub: "en Google" },
  { id: "rating", value: 4.4, suffix: " / 5", label: "Valoración media", sub: "Google · 858 opiniones", decimals: 1 },
  /* Aquí ponía «Nº 1 en zamburiñas de la zona · según nuestros clientes». Fuera el 10-10-2026: nadie
     ha hecho ese ranking. En su sitio, un número de la casa que sí se puede comprobar abriendo /vinos,
     y que además cuenta lo que la tapería es —vinoteca— sin prometer que sean los mejores. */
  { id: "wines", value: 53, suffix: "", label: "Vinos en carta", sub: "gallegos y de fuera" },
  /* Aquí iba «19º Restaurante de Ourense · TripAdvisor». Fuera el 13-10-2026 con el resto de cifras de
     TripAdvisor: sus condiciones de uso no dejan sacar sus valoraciones ni sus clasificaciones de sus
     widgets, y una clasificación citada sin mes y año se queda vieja sin que nadie se entere. En su
     lugar, un número de la casa que se cuenta solo y que no depende de nadie. */
  { id: "platos", value: MENU_ITEMS.length, suffix: "", label: "Platos en la carta", sub: "cocina gallega de siempre" },
] as const;
