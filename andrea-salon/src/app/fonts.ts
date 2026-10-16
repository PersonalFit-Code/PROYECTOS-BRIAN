import { Inter, Source_Serif_4 } from "next/font/google";

/**
 * Fuentes de la web, en un módulo aparte porque las cargan DOS raíces distintas:
 * `app/[locale]/layout.tsx` (el layout raíz del sitio) y `app/not-found.tsx` (el 404, que al estar
 * por encima del layout de idioma tiene que pintar su propio `<html>`/`<body>`). Una sola llamada
 * a `next/font` por familia = un solo juego de woff2 y las mismas variables CSS en ambas.
 *
 * Autoalojadas por `next/font`: no se conecta con Google Fonts en ninguna visita (lo dice la
 * política de cookies, así que tiene que seguir siendo verdad).
 */

/* Source Serif 4: titulares. Es lo más cercano a la Charter de la propuesta en PDF que Andrea ya ha
   visto. Tres pesos y la itálica, que es la que acentúa una palabra del titular. */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

/* Inter: texto corrido, botones y formularios de la reserva. */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/** Clases de variables CSS para el `<html>`: `${sourceSerif.variable} ${inter.variable}`. */
export const fontVariables = `${sourceSerif.variable} ${inter.variable}`;
