import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Orígenes de Supabase para la CSP. Salen de la variable de entorno para no escribir aquí la
 * referencia del proyecto (cambia entre el de desarrollo y el de producción). Sin la variable
 * (p. ej. construyendo en local sin `.env`), la lista se queda en `'self'` y el panel no podrá
 * hablar con Supabase desde el navegador: es lo que queremos, antes que una CSP abierta de más.
 */
function origenesSupabase(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return "";
  try {
    const u = new URL(raw);
    return ` ${u.origin} wss://${u.host}`;
  } catch {
    return "";
  }
}

/**
 * POLÍTICA DE CONTENIDO (CSP). Lista cerrada de lo que la página puede cargar; si alguien lograra
 * colar un script o un <iframe>, el navegador lo bloquea. Heredada de tixola, con lo que este
 * proyecto necesita de más:
 *  · `connect-src` Supabase: el panel inicia sesión y refresca el token desde el navegador; la web
 *    pública no lo usa (todo pasa por el servidor), pero la cabecera es la misma para todas las rutas.
 *  · `challenges.cloudflare.com` en `script-src` y `frame-src`: el CAPTCHA de la reserva (Turnstile)
 *    carga un script y pinta su casilla en un iframe.
 *  · `form-action` checkout.stripe.com: los bonos se pagan en el Checkout alojado de Stripe
 *    (redirección), así que NO hace falta `js.stripe.com` en `script-src` ni `api.stripe.com` en
 *    `connect-src`. Si algún día se embebe el Payment Element, añadir `https://js.stripe.com` a
 *    `script-src` y `frame-src`, y `https://api.stripe.com` a `connect-src`.
 *  · `blob:` en `img-src`: el escáner de códigos QR del panel pinta la cámara en un <canvas>.
 *  · `media-src 'self'`: el vídeo del recorrido del salón, cuando exista.
 *  · `'unsafe-inline'` en scripts: Next mete scripts en línea para hidratar, más el JSON-LD y el
 *    vigía de revelados del layout. Todo el texto que pinta la web pasa por React y el JSON-LD por
 *    `serializeJsonLd`. `'unsafe-eval'` y `ws:` SOLO en desarrollo (recarga en caliente).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self'${origenesSupabase()}${isDev ? " ws:" : ""}`,
  "frame-src https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/** Cabeceras de seguridad para todas las rutas (páginas, API y estáticos). */
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  /* Solo HTTPS durante dos años, subdominios incluidos (reservar., panel.). */
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  /* Nadie puede meter la web ni el panel en un <iframe> ajeno (clickjacking). */
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /* `camera=(self)`: el escáner de QR del panel usa getUserMedia; con `camera=()` el navegador lo
     niega en silencio y el escáner "no funciona" sin ningún error. `payment=(self)` por lo mismo:
     hoy no hace falta (Checkout corre en Stripe), pero dejarlo cerrado es una trampa para el día en
     que se embeba el pago. Lo demás apagado: la web no lo usa y tampoco el mapa incrustado. */
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=(self), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** El panel es privado: ni índices ni cachés compartidas. */
const panelHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "private, no-store" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    /* Next 16 solo sirve las calidades de esta lista; lo que no esté aquí lo rebaja a 75 con un aviso. */
    qualities: [75, 80, 82, 88],
  },
  /* No anunciar "X-Powered-By: Next.js". */
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/panel", headers: panelHeaders },
      { source: "/panel/:path*", headers: panelHeaders },
    ];
  },
};

export default nextConfig;
