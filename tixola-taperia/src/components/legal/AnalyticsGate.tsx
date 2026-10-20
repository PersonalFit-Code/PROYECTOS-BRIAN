"use client";

import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { useConsent } from "@/components/legal/CookieConsent";
import { CLARITY_ID, GA_ID, MIDE_CON_CLARITY, MIDE_CON_GA } from "@/lib/medicion";

/**
 * LAS TRES MEDICIONES DE LA WEB, Y NINGUNA SIN PERMISO.
 *
 * Este componente es el único sitio por el que entran. Mientras no haya un consentimiento vigente
 * con la casilla de analítica aceptada, no monta nada: los scripts ni se descargan. Eso es el
 * "bloqueo previo" que pide la AEPD, y es más estricto que pedir perdón después con el modo
 * consentimiento de Google.
 *
 * Qué carga, por orden de intromisión:
 *
 *  1. VERCEL WEB ANALYTICS. Página visitada, de dónde se llega, navegador, sistema, dispositivo y
 *     ciudad aproximada. NO instala cookies: Vercel identifica la sesión con un hash que calcula en
 *     su servidor y lo descarta a las 24 horas. Sin perfilado ni seguimiento entre webs.
 *     Sin cookies, el art. 22.2 de la LSSI no obligaría ni a preguntar; se pregunta igual porque el
 *     aviso de esta web lo prometió por escrito antes de que existiera ninguna otra medición.
 *
 *  2. GOOGLE ANALYTICS 4. Instala dos cookies propias en el dominio de la web —`_ga` y
 *     `_ga_<contenedor>`, dos años las dos según Google— y manda los datos a Google. GA4 anonimiza
 *     la IP por su cuenta y no admite desactivarlo, así que NO se le pasa `anonymize_ip`: es un
 *     parámetro de la versión anterior que hoy solo sirve para aparentar diligencia en una
 *     auditoría. Lo que sí se le pasa es el MODO CONSENTIMIENTO con la publicidad DENEGADA (ver
 *     abajo).
 *
 *  3. MICROSOFT CLARITY. El más intrusivo de los tres: no cuenta visitas, GRABA SESIONES. Lo que
 *     escriben los clientes en el camarero virtual queda fuera de esas grabaciones por los
 *     `data-clarity-mask` de `ChatWidget.tsx`, y no es un detalle de estilo: ahí la gente escribe
 *     sus alergias, que son datos de salud del art. 9 del RGPD.
 *
 * EL MODO CONSENTIMIENTO, Y POR QUÉ NO BASTABA CON NO CARGAR EL SCRIPT.
 * Las dos herramientas distinguen entre consentimiento de ANALÍTICA y consentimiento de
 * PUBLICIDAD, y a las dos se les dice lo mismo: analítica sí, publicidad NO. Hace falta por dos
 * motivos distintos y los dos importan.
 *  · Por la verdad del texto legal. Clarity, con la publicidad concedida, instala `MUID`, que su
 *    propia documentación describe como cookie usada «para publicidad, analítica del sitio y otros
 *    fines operativos», y además comparte datos con Microsoft Ads «para mejorar el retargeting, las
 *    conversiones y la eficacia de las campañas». Con `ad_Storage: "denied"` no la instala y no
 *    comparte nada con Microsoft Ads, y la política de cookies puede seguir diciendo —como dice—
 *    que esta web no usa cookies publicitarias. Es la diferencia entre que esa frase sea cierta y
 *    que sea mentira.
 *  · Porque si no, Clarity no mide. Desde el 31-10-2025 Clarity EXIGE una señal de consentimiento
 *    para las visitas del EEE, Reino Unido y Suiza: sin ella funciona en «modo sin consentimiento»,
 *    con un identificador por página vista y sin cookies. Cargar el script solo después de aceptar
 *    —que es lo que hace este componente— es más estricto que lo que Microsoft documenta, pero NO
 *    es una señal: sin la llamada `consentv2`, Clarity daría datos a medias desde Ourense.
 * Las mayúsculas raras de `ad_Storage` / `analytics_Storage` son de Microsoft, no una errata; las
 * de Google van en minúscula. Firmas comprobadas en la documentación de cada uno el 20-10-2026.
 *
 * SOLO EN PRODUCCIÓN. En local y en las previsualizaciones no se monta nada: las pruebas no son
 * visitas y ensuciarían los informes de la casa el primer día. Además, el script de Vercel vive en
 * `/_vercel/insights/script.js`, que fuera de producción no existe y llenaría la consola de un error
 * de MIME que no significa nada.
 *
 * `useConsent()` devuelve `undefined` en servidor y durante la hidratación, `null` si todavía no hay
 * decisión, y el estado si la hay. En los dos primeros casos no se pinta: medir antes de que la
 * persona decida es exactamente lo que se quiere evitar.
 *
 * REVOCAR TAMBIÉN TIENE QUE FUNCIONAR, y no basta con que React desmonte estos `<Script>`: `gtag.js`
 * y `clarity.js` ya estarían cargados y seguirían enviando hasta recargar. De eso se encarga
 * `CookieConsent`, que al pasar la analítica de aceptada a rechazada borra sus cookies y recarga.
 *
 * Para que llegue algún dato hace falta ADEMÁS activarlo en cada panel: Vercel (Analytics → Enable),
 * y las propiedades de Google y Microsoft ya creadas. Los identificadores están en `@/lib/medicion`.
 */
const EN_PRODUCCION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export default function AnalyticsGate() {
  const consent = useConsent();
  if (!EN_PRODUCCION || !consent?.analytics) return null;

  return (
    <>
      <Analytics />

      {MIDE_CON_GA ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {/* El `consent default` va ANTES del `config` a propósito: Google solo lo aplica si llega
                primero. Analítica concedida (si estamos aquí es que la persona dijo que sí) y las tres
                de publicidad denegadas. */}
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});gtag('config','${GA_ID}');`}
          </Script>
        </>
      ) : null}

      {MIDE_CON_CLARITY ? (
        <Script id="clarity-init" strategy="afterInteractive">
          {/* La llamada `consentv2` va justo detrás del cargador y no espera a que el script baje:
              el propio cargador deja una cola (`c[a].q`) y Clarity la vacía al arrancar. */}
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");window.clarity('consentv2',{ad_Storage:"denied",analytics_Storage:"granted"});`}
        </Script>
      ) : null}
    </>
  );
}
