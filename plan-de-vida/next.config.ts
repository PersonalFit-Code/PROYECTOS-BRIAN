import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/** Supabase para la CSP (login desde el navegador). Sale de la variable de entorno. */
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
 * Lista cerrada de lo que puede cargar la página. La app solo habla con su propio servidor y, para
 * iniciar sesión, con Supabase. Claude y las cotizaciones se llaman desde el servidor, no desde aquí.
 * `'unsafe-inline'` en scripts: Next mete scripts en línea para hidratar. `'unsafe-eval'` y `ws:`
 * solo en desarrollo (recarga en caliente).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${origenesSupabase()}${isDev ? " ws:" : ""}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Datos personales: que ninguna caché intermedia guarde las páginas.
      { source: "/((?!_next/static|icons/).*)", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
};

export default nextConfig;
