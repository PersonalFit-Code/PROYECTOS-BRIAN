"use client";

import { Analytics } from "@vercel/analytics/next";
import { useConsent } from "@/components/legal/CookieConsent";

/**
 * MEDICIÓN DE VISITAS (Vercel Web Analytics), Y SOLO SI SE HA ACEPTADO.
 *
 * Qué mide: página visitada, de dónde se llega, navegador, sistema, tipo de dispositivo y ciudad
 * aproximada. No instala cookies ni guarda nada en el navegador de quien visita: Vercel identifica la
 * sesión con un hash que calcula en su servidor a partir de la propia petición y lo descarta a las 24
 * horas (vercel.com/docs/analytics/privacy-policy). No hay perfilado ni seguimiento entre webs.
 *
 * POR QUÉ VA DETRÁS DEL CONSENTIMIENTO IGUALMENTE. Sin cookies ni acceso al almacenamiento del
 * terminal, el art. 22.2 de la LSSI no obliga a pedir permiso. Pero el aviso de cookies de esta web
 * YA PROMETE lo contrario: la casilla "Mapa y analítica" dice textualmente que si algún día se
 * instala una herramienta de medición "se regirá por esta misma elección". Prometido está, así que se
 * cumple: sin consentimiento vigente este componente no monta nada y el script ni se descarga.
 *
 * `useConsent()` devuelve `undefined` en servidor y durante la hidratación, `null` si no hay decisión
 * y el estado si la hay: en los dos primeros casos no se pinta, que es lo correcto —medir antes de
 * que la persona decida es justo lo que se quiere evitar.
 *
 * Para que llegue algún dato hace falta ADEMÁS activarlo en el panel de Vercel (Analytics → Enable).
 * Mientras no se active, este script no existe en el despliegue y el componente no hace nada visible.
 */
/**
 * Solo en la web publicada. Vercel rellena esta variable en cada build y vale "production" únicamente
 * en el despliegue de producción. Sin ella, en local y en las previsualizaciones el script se pediría
 * a `/_vercel/insights/script.js`, que allí no existe: llegaría el HTML del 404 y la consola se
 * llenaría de un error de MIME que no significa nada. Y de paso, las pruebas no cuentan como visitas.
 */
const EN_PRODUCCION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export default function AnalyticsGate() {
  const consent = useConsent();
  if (!EN_PRODUCCION || !consent?.analytics) return null;
  return <Analytics />;
}
