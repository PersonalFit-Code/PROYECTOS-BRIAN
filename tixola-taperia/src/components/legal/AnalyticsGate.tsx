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
 *  2. GOOGLE ANALYTICS 4. Instala cookies propias (`_ga`, `_ga_<contenedor>`, dos años) y manda los
 *     datos a Google. GA4 anonimiza la IP por su cuenta y no admite desactivarlo, así que NO se le
 *     pasa `anonymize_ip`: es un parámetro de la versión anterior que hoy solo sirve para aparentar
 *     diligencia en una auditoría.
 *
 *  3. MICROSOFT CLARITY. El más intrusivo de los tres: no cuenta visitas, GRABA SESIONES. Cookies
 *     `_clck` (un año) y `_clsk` (un día). Lo que escriben los clientes en el camarero virtual queda
 *     fuera de esas grabaciones por los `data-clarity-mask` de `ChatWidget.tsx`, y no es un detalle
 *     de estilo: ahí la gente escribe sus alergias, que son datos de salud del art. 9 del RGPD.
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
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      ) : null}

      {MIDE_CON_CLARITY ? (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
        </Script>
      ) : null}
    </>
  );
}
