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
 * VACÍO SIGNIFICA APAGADO. `MIDE_CON_GA` y `MIDE_CON_CLARITY` se calculan de estas dos constantes
 * y gobiernan el cargador y la CSP: con la cadena vacía no se descarga el script ni se permite su
 * dominio. Es el mismo truco que `LEGAL_IDENTITY_PENDING` en `src/data/legal.ts`.
 *
 * APAGAR UNA HERRAMIENTA OBLIGA A TOCAR LOS TEXTOS A MANO, y conviene no descubrirlo tarde. Los
 * textos legales la nombran siempre, no condicionalmente: una política de cookies con `if` dentro
 * se vuelve ilegible, y además los cuatro idiomas se escriben a mano y tienen que decir lo mismo.
 * Así que si algún día se vacía uno de estos identificadores, en el MISMO commit hay que quitar esa
 * herramienta de:
 *   · `src/i18n/messages/<idioma>/legal.ts` → `banner.analyticsDesc`, la tabla de cookies, el
 *     apartado «La medición» y los destinatarios de la política de privacidad (los cuatro idiomas);
 *   · `src/data/legal.ts` → `LEGAL_UPDATED_AT`;
 *   · `src/lib/consent.ts` → subir `CONSENT_VERSION`, porque cambia lo que pasa al aceptar.
 * `npm run check:legal` comprueba que los cuatro idiomas sigan teniendo la misma forma.
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
 * Alta: 18-10-2026, proyecto «Tixola» sobre https://tixolataperia.es, sector «Restaurantes y comida».
 *
 * OJO AL ENCENDERLO: Clarity GRABA SESIONES, no solo cuenta visitas. El camarero virtual invita a
 * preguntar por alérgenos, así que la gente escribe cosas como "soy celíaca" — datos de salud, del
 * art. 9 del RGPD. Por eso `ChatWidget.tsx` lleva `data-clarity-mask` en la lista de mensajes y en
 * el campo de texto: Clarity tapa por su cuenta los campos de formulario, pero NO las burbujas ya
 * enviadas, que para una grabación son texto corriente de la página. Si algún día se rehace ese
 * componente, esos dos atributos no son decoración.
 */
export const CLARITY_ID: string = "yztythcjsa";

/**
 * EL SEGURO, ya levantado. Existía porque el código de medición y los textos que lo declaran se
 * escribieron en commits distintos, y entre uno y otro había una ventana en la que la web PODRÍA
 * haber medido sin decirlo — justo la infracción que se quería evitar. Mientras estuvo en `false`,
 * este fichero se desplegó con los identificadores puestos sin que cambiara nada de la web.
 *
 * Pasó a `true` el 20-10-2026, en el mismo commit que trae los textos legales reescritos en los
 * cuatro idiomas: banner, política de privacidad y política de cookies declarando Google Analytics 4
 * y Microsoft Clarity con lo que hace cada uno, quién es cada quién y cuánto guarda. Ese mismo
 * commit sube `CONSENT_VERSION` a 3, de modo que quien había aceptado un banner que decía «medimos
 * de forma agregada (sin cookies)» vuelve a decidir con la información nueva delante.
 *
 * Se queda como interruptor general: ponerlo en `false` apaga las dos herramientas de golpe sin
 * tocar nada más del código (los textos, eso sí, hay que repasarlos — ver arriba).
 */
const MEDICION_DECLARADA_EN_LOS_TEXTOS = true;

/** `true` si Google Analytics está configurado Y declarado. Gobierna el script, la CSP y los textos. */
export const MIDE_CON_GA = MEDICION_DECLARADA_EN_LOS_TEXTOS && GA_ID !== "";

/** `true` si Clarity está configurado Y declarado. Gobierna el script, la CSP y los textos. */
export const MIDE_CON_CLARITY = MEDICION_DECLARADA_EN_LOS_TEXTOS && CLARITY_ID !== "";

/** `true` si hay alguna medición de terceros además de la de Vercel (que no instala cookies). */
export const MIDE_CON_TERCEROS = MIDE_CON_GA || MIDE_CON_CLARITY;

/**
 * Nombres de cookie que dejan GA4 y Clarity. `_ga` lleva sufijo de contenedor (`_ga_RPV2JX7ZXW`),
 * de ahí el prefijo en vez de la lista cerrada.
 */
const COOKIES_DE_MEDICION = /^(_ga|_clck$|_clsk$|CLID$|MUID$)/;

/**
 * BORRA LAS COOKIES DE MEDICIÓN DEL NAVEGADOR DE QUIEN REVOCA.
 *
 * Desmontar los `<script>` no basta: `gtag.js` y `clarity.js` ya están cargados y siguen enviando
 * hasta que se recargue la página, y sus cookies se quedarían puestas dos años. Revocar tiene que
 * revocar de verdad, así que `CookieConsent` llama a esto y recarga.
 *
 * Se intenta borrar con y sin punto delante del dominio porque GA4 las pone en el dominio padre
 * (`.tixolataperia.es`) y una cookie solo se borra desde el mismo dominio y ruta con que se puso.
 * Lo que no se consiga borrar caduca solo; lo que importa —que deje de medirse— lo garantiza la
 * recarga, porque sin consentimiento el cargador ya no monta nada.
 */
export function borrarCookiesDeMedicion(): void {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const partes = host.split(".");
  const dominios = new Set([host, `.${host}`, `.${partes.slice(-2).join(".")}`]);

  for (const trozo of document.cookie.split(";")) {
    const nombre = trozo.split("=")[0]?.trim();
    if (!nombre || !COOKIES_DE_MEDICION.test(nombre)) continue;
    document.cookie = `${nombre}=; Max-Age=0; path=/`;
    for (const dominio of dominios) {
      document.cookie = `${nombre}=; Max-Age=0; path=/; domain=${dominio}`;
    }
  }
}
