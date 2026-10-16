import { Great_Vibes, Jost, Playfair } from "next/font/google";

/**
 * Fuentes de la web, en un módulo aparte porque las cargan DOS raíces distintas:
 * `app/[locale]/layout.tsx` (el layout raíz del sitio) y `app/not-found.tsx` (el 404, que al estar
 * por encima del layout de idioma tiene que pintar su propio `<html>`/`<body>`). Una sola llamada
 * a `next/font` por familia = un solo juego de woff2 y las mismas variables CSS en ambas.
 *
 * Autoalojadas por `next/font`: no se conecta con Google Fonts en ninguna visita (lo dice la
 * política de cookies, así que tiene que seguir siendo verdad).
 */

/* Playfair (la versión 2, variable): los titulares, con el aire del logotipo de VOGUE. Tiene ejes de
   anchura (`wdth`) y tamaño óptico (`opsz`): estrecha y con tamaño óptico de cartel da la didona
   alta, de trazos gruesos y remates de pelo. Los ajustes viven en `--font-display-*` (globals.css). */
const playfair = Playfair({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-playfair",
  display: "swap",
});

/* Jost: la geométrica tipo Futura de las revistas (menú, titulares de sección, botones, texto). */
const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });

/* Great Vibes: la caligrafía del logotipo de Andrea («Andrea Salón · uñas y belleza»). Solo el logo. */
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes", display: "swap" });

/** Clases de variables CSS para el `<html>`. */
export const fontVariables = `${playfair.variable} ${jost.variable} ${greatVibes.variable}`;
