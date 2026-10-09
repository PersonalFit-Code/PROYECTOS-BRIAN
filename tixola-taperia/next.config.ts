import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * POLÍTICA DE CONTENIDO (CSP). Lista cerrada de lo que la página puede cargar; si alguien lograra
 * colar un script o un <iframe>, el navegador lo bloquea. Lo que hay fuera de "self" está justificado:
 *  · `'unsafe-inline'` en scripts: Next mete scripts en línea para hidratar las páginas estáticas, más
 *    el JSON-LD y el vigía de revelados de `layout.tsx`. La alternativa (nonces) obliga a renderizar
 *    cada página en el servidor en cada visita — se pierde el HTML estático y la web va más lenta.
 *    Todo el texto que pinta la web pasa por React (que escapa) y el JSON-LD por `serializeJsonLd`.
 *  · `frame-src` Google: el mapa de "Cómo llegar", que solo se monta con consentimiento.
 *  · `'unsafe-eval'` y `ws:` SOLO en desarrollo (recarga en caliente de Next).
 * Si algún día se añade analítica (Plausible, p. ej.), su dominio va en `script-src` y `connect-src`.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/** Cabeceras de seguridad para todas las rutas (páginas, API y estáticos). */
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  /* Solo HTTPS durante dos años, subdominios incluidos. Vercel ya redirige http→https; esto hace que el
     navegador ni lo intente por http la próxima vez. */
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  /* Nadie puede meter la web en un <iframe> ajeno (clickjacking). Duplica `frame-ancestors` para
     navegadores viejos. */
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /* La web no usa cámara, micrófono, ubicación ni pagos: se apagan para ella y para el mapa incrustado. */
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    /* Calidades que el proyecto pide de verdad. Next 16 ya no acepta cualquier valor: solo sirve los
       de esta lista, y lo que no esté aquí lo rebaja a 75 con un aviso en consola. Pasaba con la foto
       de la terraza (82, en la portada y en la sección de experiencia) y con la galería (80 y 88),
       que se estaban sirviendo peor de lo que pedía el código sin que nadie lo notara. */
    qualities: [75, 80, 82, 88],
  },
  /* No anunciar "X-Powered-By: Next.js": no aporta nada y da pistas a quien busque versiones vulnerables. */
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
