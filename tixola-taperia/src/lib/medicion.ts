/**
 * LAS TRES MEDICIONES DE ESTA WEB, EN UN SOLO SITIO.
 *
 * Aquí solo viven los identificadores. Quién los carga y cuándo está en
 * `src/components/legal/AnalyticsGate.tsx`; lo que se le cuenta al visitante sobre ellos, en los
 * tres textos legales de `src/i18n/messages/<idioma>/legal.ts`.
 *
 * POR QUÉ ESTÁN AQUÍ Y NO EN VARIABLES DE ENTORNO. No son secretos: los dos viajan en el HTML de
 * cada página y cualquiera los ve con mirar el código fuente. Ponerlos en Vercel obligaría a
 * acordarse de una casilla más el día que se despliegue en otro sitio, y el fallo silencioso sería
 * el peor posible: la web mide, los textos legales dicen que mide, pero el identificador no está y
 * no llega ni un dato. Aquí se ven en el repositorio y se cambian en el mismo commit que los textos.
 *
 * VACÍO SIGNIFICA APAGADO, Y APAGA TAMBIÉN LOS TEXTOS. `MIDE_CON_GA` y `MIDE_CON_CLARITY` se
 * calculan de estas dos constantes y los usan tanto el cargador como las páginas legales: con la
 * cadena vacía, ni se descarga el script ni la política de cookies nombra esa herramienta. Es el
 * mismo truco que `LEGAL_IDENTITY_PENDING` en `src/data/legal.ts`, y por el mismo motivo: que no
 * pueda existir una web que mide sin decirlo, ni una que lo dice sin medir.
 */

/**
 * Google Analytics 4 — ID de medición del flujo web (analytics.google.com → Administrar → Flujos).
 * Alta: 18-10-2026, propiedad «Tixola», flujo «web tixola» sobre https://tixolataperia.es.
 * Instala cookies propias (`_ga`, `_ga_RPV2JX7ZXW`) y manda los datos a Google.
 */
/* Anotado como `string` a propósito: sin ello TypeScript estrecha el tipo al literal y
   `GA_ID !== ""` deja de compilar («comparación sin solape»), que es justo el interruptor. */
export const GA_ID: string = "G-RPV2JX7ZXW";

/**
 * Microsoft Clarity — ID del proyecto (clarity.microsoft.com → Settings → Overview).
 * PENDIENTE: en cuanto exista, se pega aquí Y se repasan los textos legales del mismo commit.
 *
 * OJO AL ENCENDERLO: Clarity GRABA SESIONES, no solo cuenta visitas. El camarero virtual invita a
 * preguntar por alérgenos, así que la gente escribe cosas como "soy celíaca" — datos de salud, del
 * art. 9 del RGPD. Por eso `ChatWidget.tsx` lleva `data-clarity-mask` en la lista de mensajes y en
 * el campo de texto: Clarity tapa por su cuenta los campos de formulario, pero NO las burbujas ya
 * enviadas, que para una grabación son texto corriente de la página. Si algún día se rehace ese
 * componente, esos dos atributos no son decoración.
 */
export const CLARITY_ID: string = "";

/** `true` si Google Analytics está configurado. Gobierna el script Y lo que dicen los textos legales. */
export const MIDE_CON_GA = GA_ID !== "";

/** `true` si Clarity está configurado. Gobierna el script Y lo que dicen los textos legales. */
export const MIDE_CON_CLARITY = CLARITY_ID !== "";

/** `true` si hay alguna medición de terceros además de la de Vercel (que no instala cookies). */
export const MIDE_CON_TERCEROS = MIDE_CON_GA || MIDE_CON_CLARITY;
